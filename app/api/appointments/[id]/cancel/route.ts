import { PrismaClient } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: appointmentId } = await params;

    // Find the appointment and verify ownership
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        {
          error: "Appointment not found",
        },
        { status: 404 }
      );
    }

    // Verify the user owns this appointment
    if (appointment.customerId !== user.id) {
      return NextResponse.json(
        {
          error: "You can only cancel your own appointments",
        },
        { status: 403 }
      );
    }

    // Check if appointment can be cancelled (within business rules)
    const appointmentDateTime = new Date(
      `${appointment.date.toISOString().split("T")[0]}T${appointment.startTime
        .toTimeString()
        .substring(0, 8)}`
    );
    const now = new Date();
    const hoursDiff =
      (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 2) {
      // BUSINESS_RULES.CANCELLATION_HOURS = 2
      return NextResponse.json(
        {
          error:
            "Appointments can only be cancelled at least 2 hours in advance",
        },
        { status: 400 }
      );
    }

    // Check if appointment is in a cancellable state
    if (!["SCHEDULED", "CONFIRMED"].includes(appointment.status)) {
      return NextResponse.json(
        {
          error: "This appointment cannot be cancelled",
        },
        { status: 400 }
      );
    }

    // Update the appointment status to CANCELLED
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
      include: {
        staff: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        shop: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment: {
        id: updatedAppointment.id,
        date: updatedAppointment.date.toISOString().split("T")[0],
        startTime: updatedAppointment.startTime.toTimeString().substring(0, 5),
        endTime: updatedAppointment.endTime.toTimeString().substring(0, 5),
        status: updatedAppointment.status,
        staff: updatedAppointment.staff,
        shop: updatedAppointment.shop,
      },
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
