import { PrismaClient } from '@prisma/client';
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { extractTimeString, utcToLocalDate } from "@/lib/date-time";
// Luxon replaced with native Date

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

    // Check if user exists and has CUSTOMER role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || dbUser.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: "Bu işlemi gerçekleştirmek için müşteri hesabınız olmalı" },
        { status: 403 }
      );
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
      date: utcToLocalDate(appointment.date), // YYYY-MM-DD format in local timezone
      startTime: extractTimeString(appointment.startTime), // HH:MM format
      endTime: extractTimeString(appointment.endTime), // HH:MM format
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
