// app/api/appointments/[id]/cancel/route.ts

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {
  utcToLocalDate,
  extractTimeString,
  getHoursDifference,
} from "@/lib/date-time";
// Luxon replaced with native Date
import { BUSINESS_RULES } from "@/lib/constants";


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

    // Check if user has CUSTOMER role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || dbUser.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: "Bu işlemi gerçekleştirmek için müşteri hesabınız olmalı" },
        { status: 403 }
      );
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
    const now = new Date();
    const appointmentDateTime = appointment.date; // Already in UTC
    const hoursDiff = getHoursDifference(appointmentDateTime, now);

    if (hoursDiff < BUSINESS_RULES.CANCELLATION_HOURS) {
      return NextResponse.json(
        {
          error: `Appointments can only be cancelled at least ${BUSINESS_RULES.CANCELLATION_HOURS} hours in advance`,
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

    // Parse request body safely for future extensibility
    try {
      const bodyText = await request.text();
      if (bodyText.trim()) {
        JSON.parse(bodyText);
      }
    } catch (error) {
      // Ignore JSON parse errors for empty or invalid bodies
      console.log('Could not parse request body:', error);
    }

    return NextResponse.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment: {
        id: updatedAppointment.id,
        date: utcToLocalDate(updatedAppointment.date),
        startTime: extractTimeString(updatedAppointment.startTime),
        endTime: extractTimeString(updatedAppointment.endTime),
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
  }
}
