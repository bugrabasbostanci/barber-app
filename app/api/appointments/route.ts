import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  localDateToUTC,
  createUTCTime,
  extractTimeString,
  utcToLocalDate,
  TURKEY_TZ,
} from "@/lib/date-time";
import { withAuth, requireCustomer, AuthenticatedUser } from "@/lib/middleware/api-auth";

async function createAppointment(request: NextRequest, user: AuthenticatedUser) {
  try {

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

    // Only CUSTOMER role users can create appointments
    if (dbUser.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: "Bu işlemi gerçekleştirmek için müşteri hesabınız olmalı" },
        { status: 403 }
      );
    }

    // Convert local date/time to UTC for storage
    const appointmentDateUTC = localDateToUTC(date);

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
        customerId: user.id, // Use authenticated user ID
        staffId,
        date: appointmentDateUTC,
        startTime: createUTCTime(startTime),
        endTime: createUTCTime(endTime),
        status: "SCHEDULED",
        notes: notes || null,
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
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Export protected endpoint
export const POST = withAuth(requireCustomer())(createAppointment);
