import { PrismaClient } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {
  localDateToUTC,
  localDateTimeToUTC,
  createUTCTime,
  extractTimeString,
  utcToLocalDate,
  TURKEY_TZ,
} from "@/lib/date-time";
// Luxon replaced with native Date

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      date,
      staffId,
      startTime,
      notes,
      timezone = TURKEY_TZ,
    } = await request.json();

    if (!date || !staffId || !startTime) {
      return NextResponse.json(
        {
          error: "Date, staffId, and startTime are required",
        },
        { status: 400 }
      );
    }

    // Get default shop
    const shop = await prisma.shop.findFirst();
    if (!shop) {
      return NextResponse.json(
        {
          error: "No shop found",
        },
        { status: 500 }
      );
    }

    // Calculate end time (45 minutes later)
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = Math.floor((minutes + 45) / 60) + hours;
    const endMinutes = (minutes + 45) % 60;
    const endTime = `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;

    // Check if user exists in our database
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          firstName: user.user_metadata?.first_name || "",
          lastName: user.user_metadata?.last_name || "",
          phone: user.user_metadata?.phone || null,
          role: "CUSTOMER",
        },
      });
    }

    // Convert local date/time to UTC for storage
    const appointmentDateUTC = localDateToUTC(date);
    const appointmentStartDateTime = localDateTimeToUTC(date, startTime);
    const appointmentEndDateTime = localDateTimeToUTC(date, endTime);

    // Check if time slot is still available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        staffId,
        date: appointmentDateUTC,
        startTime: createUTCTime(startTime),
        status: {
          notIn: ["CANCELLED"],
        },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        {
          error: "This time slot is no longer available",
        },
        { status: 409 }
      );
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        shopId: shop.id,
        customerId: dbUser.id,
        staffId,
        date: appointmentDateUTC,
        startTime: createUTCTime(startTime),
        endTime: createUTCTime(endTime),
        status: "SCHEDULED",
        notes: notes || null,
        createdById: dbUser.id,
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        staff: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        shop: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });

    // Convert back to local time for response
    const responseAppointment = {
      ...appointment,
      date: utcToLocalDate(appointment.date),
      startTime: extractTimeString(appointment.startTime),
      endTime: extractTimeString(appointment.endTime),
      // ISO string for frontend date handling
      dateISO: appointment.date.toISOString(),
      timezone: timezone,
    };

    return NextResponse.json({
      success: true,
      message: "Appointment created successfully",
      appointment: responseAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
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
