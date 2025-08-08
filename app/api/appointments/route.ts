import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import {
  localDateToUTC,
  createUTCTime,
  extractTimeString,
  utcToLocalDate,
  TURKEY_TZ,
} from "@/lib/date-time";
import { withAuth, requireCustomer, AuthenticatedUser } from "@/lib/middleware/api-auth";
import { withValidation, commonSchemas, sanitizeString } from "@/lib/middleware/validation";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";
import { NotFoundError, ConflictError, ForbiddenError } from "@/lib/errors";
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
  context: Record<string, unknown>
) {
  const user = context.user as AuthenticatedUser;
  try {
    const { 
      date,
      staffId,
      startTime,
      notes,
      timezone = TURKEY_TZ,
    } = context.validatedBody as z.infer<typeof createAppointmentSchema>;

    // Sanitize string inputs
    const sanitizedNotes = notes ? sanitizeString(notes) : null;

    // Get default shop
    const shop = await prisma.shop.findFirst();
    if (!shop) {
      throw new NotFoundError("No shop found");
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
          firstName: "",
          lastName: "",
          phone: null,
          role: "CUSTOMER",
        },
      });
    }

    // Only CUSTOMER role users can create appointments
    if (dbUser.role !== 'CUSTOMER') {
      throw new ForbiddenError("Bu işlemi gerçekleştirmek için müşteri hesabınız olmalı");
    }

    // Convert local date/time to UTC for storage
    const appointmentDateUTC = localDateToUTC(date);
    const startTimeUTC = createUTCTime(startTime);
    const endTimeUTC = createUTCTime(endTime);

    // Use atomic transaction to prevent race conditions
    const appointment = await prisma.$transaction(async (tx) => {
      // 1. Check if staff member exists and is available
      const staff = await tx.user.findFirst({
        where: {
          id: staffId,
          role: { in: ["BARBER", "EMPLOYEE"] },
          isActive: true,
        },
      });

      if (!staff) {
        throw new NotFoundError("Selected staff member is not available");
      }

      // 2. Check for time slot conflicts with row-level locking
      const conflictingAppointment = await tx.appointment.findFirst({
        where: {
          staffId,
          date: appointmentDateUTC,
          status: { notIn: ["CANCELLED"] },
          OR: [
            // Exact time match
            { startTime: startTimeUTC },
            // Overlapping appointments
            {
              AND: [
                { startTime: { lt: endTimeUTC } },
                { endTime: { gt: startTimeUTC } },
              ],
            },
          ],
        },
      });

      if (conflictingAppointment) {
        throw new ConflictError("Bu zaman dilimi artık müsait değil");
      }

      // 3. Check for employee unavailable times
      const unavailableTime = await tx.employeeUnavailableTime.findFirst({
        where: {
          staffId,
          date: appointmentDateUTC,
          OR: [
            // Full day block
            {
              AND: [
                { startTime: null },
                { endTime: null },
              ],
            },
            // Time range block that overlaps
            {
              AND: [
                { startTime: { not: null } },
                { endTime: { not: null } },
                { startTime: { lte: startTimeUTC } },
                { endTime: { gt: startTimeUTC } },
              ],
            },
          ],
        },
      });

      if (unavailableTime) {
        throw new ConflictError("Seçilen berber bu zaman diliminde müsait değil");
      }

      // 4. Create the appointment atomically
      return await tx.appointment.create({
        data: {
          shopId: shop.id,
          customerId: user.id,
          staffId,
          date: appointmentDateUTC,
          startTime: startTimeUTC,
          endTime: endTimeUTC,
          status: "SCHEDULED",
          notes: sanitizedNotes,
          createdById: user.id,
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

    return ApiResponseBuilder.success(responseAppointment);
  } catch (error) {
    // Handle specific database constraint errors
    if (error instanceof Error) {
      // Prisma unique constraint violation
      if (error.message.includes('P2002') || error.message.includes('unique constraint')) {
        throw new ConflictError("Bu zaman dilimi artık müsait değil. Lütfen başka bir saat seçin.");
      }
      
      // Transaction timeout or deadlock
      if (error.message.includes('P2034') || error.message.includes('timeout') || error.message.includes('deadlock')) {
        throw new ConflictError("Sistem yoğun, lütfen birkaç saniye sonra tekrar deneyin.");
      }
    }
    
    // Re-throw other errors to be handled by withErrorHandler
    throw error;
  }
}

// Export protected endpoint with validation and error handling
export const POST = withErrorHandler(
  withAuth(requireCustomer())(
    withValidation({ 
      body: createAppointmentSchema 
    })(createAppointment)
  )
);
