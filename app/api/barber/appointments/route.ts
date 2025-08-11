import { prisma } from '@/lib/prisma';
import { AppointmentStatus } from '@prisma/client';
import { NextRequest } from "next/server";
import { localDateToUTC, createUTCTime, extractTimeString, utcToLocalDate } from "@/lib/utils";
import { withAuth, requireBarber } from "@/lib/middleware/api-auth";
import { withValidation, commonSchemas, sanitizeString } from "@/lib/middleware/validation";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { withRateLimit, rateLimiters } from "@/lib/middleware/rate-limit";
import { ApiResponseBuilder } from "@/lib/api/response";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { validateAppointmentCreation } from "@/lib/business-rules";
import { z } from "zod";

// Validation schemas
const getAppointmentsQuerySchema = z.object({
  startDate: commonSchemas.date.optional(),
  endDate: commonSchemas.date.optional(),
}).refine(
  (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
  { message: 'Start date must be before or equal to end date' }
);

const createManualAppointmentSchema = z.object({
  customerType: z.enum(['new', 'existing']),
  existingCustomerId: commonSchemas.uuid.optional(),
  customerName: z.string().max(100, 'Customer name too long').optional(),
  customerPhone: commonSchemas.phone.optional(),
  date: commonSchemas.date,
  staffId: commonSchemas.uuid,
  startTime: commonSchemas.time, 
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
}).refine(
  (data) => {
    if (data.customerType === 'new') {
      return data.customerName?.trim() && data.customerPhone?.trim();
    }
    if (data.customerType === 'existing') {
      return data.existingCustomerId;
    }
    return true;
  },
  {
    message: 'For new customers, name and phone are required. For existing customers, customer ID is required.',
  }
);

// GET - Fetch appointments for barber dashboard
async function getAppointments(
  request: NextRequest, 
  context: Record<string, unknown>
) {
  try {
    const { startDate, endDate } = context.validatedQuery as z.infer<typeof getAppointmentsQuerySchema>;

    // Build where clause
    const whereClause: {
      status: { notIn: AppointmentStatus[] };
      date?: { gte: Date; lte: Date };
    } = {
      status: {
        notIn: [AppointmentStatus.CANCELLED],
      },
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      // Create date range that covers the entire day in UTC
      const startUTC = new Date(startDate + 'T00:00:00.000Z');
      const endUTC = new Date(endDate + 'T23:59:59.999Z');
      
      whereClause.date = {
        gte: startUTC,
        lte: endUTC,
      };
    }

    // Get appointments
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
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
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // Format the response
    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      date: utcToLocalDate(appointment.date),
      startTime: extractTimeString(appointment.startTime),
      endTime: extractTimeString(appointment.endTime),
      status: appointment.status,
      notes: appointment.notes,
      customer: appointment.customer,
      manualCustomerName: appointment.manualCustomerName,
      manualCustomerPhone: appointment.manualCustomerPhone,
      staff: appointment.staff,
      shop: appointment.shop,
      createdAt: appointment.createdAt.toISOString(),
    }));

    return ApiResponseBuilder.success(formattedAppointments);
  } catch (error) {
    throw error;
  }
}

// POST - Create manual appointment for barber
async function createManualAppointment(
  request: NextRequest, 
  context: Record<string, unknown>
) {
  const user = context.user as { id: string; email: string; role: string };
  try {
    const {
      customerType,
      existingCustomerId,
      customerName,
      customerPhone,
      date,
      staffId,
      startTime,
      notes,
    } = context.validatedBody as z.infer<typeof createManualAppointmentSchema>;

    // Sanitize string inputs (customerName could be undefined for existing customers)
    const sanitizedCustomerName = customerName ? sanitizeString(customerName) : null;
    const sanitizedNotes = notes ? sanitizeString(notes) : null;

    // Validate business rules before proceeding
    validateAppointmentCreation({ date, startTime });

    // Get default shop
    const shop = await prisma.shop.findFirst();
    if (!shop) {
      throw new NotFoundError("No shop found");
    }

    // Calculate end time (45 minutes later) using native Date
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date(2000, 0, 1, hours, minutes);
    const endDate = new Date(startDate.getTime() + 45 * 60 * 1000); // +45 minutes
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

    // Check if time slot is still available
    // Only consider active appointments (exclude CANCELLED and NO_SHOW)
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        staffId,
        date: localDateToUTC(date),
        startTime: createUTCTime(startTime),
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'], // Allow booking on cancelled/no-show slots
        },
      },
    });

    if (existingAppointment) {
      throw new ConflictError("This time slot is no longer available");
    }

    let customerId = null;

    if (customerType === "existing") {
      // Use existing customer
      customerId = existingCustomerId;
    } else {
      // For new customers, we'll store the info in manual fields
      customerId = null;
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        shopId: shop.id,
        customerId: customerId,
        staffId,
        date: localDateToUTC(date),
        startTime: createUTCTime(startTime),
        endTime: createUTCTime(endTime),
        status: "CONFIRMED", // Manual appointments are auto-confirmed
        notes: sanitizedNotes,
        manualCustomerName: customerType === "new" ? sanitizedCustomerName : null,
        manualCustomerPhone: customerType === "new" ? customerPhone : null,
        createdById: user.id, // Track who created the appointment (the barber)
      },
      include: {
        customer:
          customerType === "existing"
            ? {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              }
            : undefined,
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

    const responseData = {
      id: appointment.id,
      date: utcToLocalDate(appointment.date),
      startTime: extractTimeString(appointment.startTime),
      endTime: extractTimeString(appointment.endTime),
      status: appointment.status,
      customerName:
        appointment.manualCustomerName ||
        (appointment.customer
          ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
          : null),
      customerPhone:
        appointment.manualCustomerPhone || appointment.customer?.phone,
      staff: appointment.staff,
      shop: appointment.shop,
      notes: appointment.notes,
    };

    return ApiResponseBuilder.success(responseData);
  } catch (error) {
    throw error;
  }
}

// Export protected endpoints with error handling, validation and rate limiting
export const GET = withErrorHandler(
  withRateLimit(rateLimiters.api)(
    withAuth(requireBarber())(
      withValidation({ 
        query: getAppointmentsQuerySchema 
      })(getAppointments)
    )
  )
);

export const POST = withErrorHandler(
  withRateLimit(rateLimiters.booking)(
    withAuth(requireBarber())(
      withValidation({ 
        body: createManualAppointmentSchema 
      })(createManualAppointment)
    )
  )
);