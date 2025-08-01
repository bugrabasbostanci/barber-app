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
import { logger } from "@/lib/logger";
import { withValidation, commonSchemas, sanitizeString } from "@/lib/middleware/validation";
import { withRateLimit, rateLimiters } from "@/lib/middleware/rate-limit";
import { z } from "zod";

// Validation schema for appointment creation
const createAppointmentSchema = z.object({
  date: commonSchemas.date,
  staffId: commonSchemas.uuid,
  startTime: commonSchemas.time,
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  timezone: z.string().optional().default(TURKEY_TZ),
});

async function createAppointment(
  request: NextRequest, 
  context: { user: AuthenticatedUser; validatedBody: z.infer<typeof createAppointmentSchema> }
) {
  try {
    const user = context.user;
    const { 
      date,
      staffId,
      startTime,
      notes,
      timezone = TURKEY_TZ,
    } = context.validatedBody;

    // Sanitize string inputs
    const sanitizedNotes = notes ? sanitizeString(notes) : null;

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
        notes: sanitizedNotes,
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
    logger.api("Failed to create appointment", {
      method: "POST",
      path: "/api/appointments",
      userId: user.id,
      statusCode: 500,
      error: error instanceof Error ? error : new Error(String(error))
    });
    
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Export protected endpoint with validation and rate limiting
export const POST = withRateLimit(rateLimiters.booking)(
  withAuth(requireCustomer())(
    withValidation({ 
      body: createAppointmentSchema 
    })(createAppointment)
  )
);
