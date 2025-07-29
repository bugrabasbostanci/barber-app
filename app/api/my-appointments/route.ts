import { PrismaClient } from '@prisma/client';
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        customerId: user.id,
      },
      include: {
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        shop: {
          select: {
            name: true,
            address: true,
          },
        },
      },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    });

    // Format the response to match the expected interface
    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      date: appointment.date.toISOString().split("T")[0], // YYYY-MM-DD format
      startTime: appointment.startTime.toTimeString().substring(0, 5), // HH:MM format
      endTime: appointment.endTime.toTimeString().substring(0, 5), // HH:MM format
      status: appointment.status,
      notes: appointment.notes,
      staff: {
        id: appointment.staff.id,
        firstName: appointment.staff.firstName,
        lastName: appointment.staff.lastName,
        role: appointment.staff.role,
      },
      shop: {
        name: appointment.shop.name,
        address: appointment.shop.address,
      },
      createdAt: appointment.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
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
