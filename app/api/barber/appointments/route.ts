import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from "next/server";
import { localDateToUTC, createUTCTime, extractTimeString, utcToLocalDate } from "@/lib/date-time";
import { withAuth, requireBarber, AuthenticatedUser } from "@/lib/middleware/api-auth";
import { logger } from "@/lib/logger";
import { withValidation, commonSchemas, sanitizeString } from "@/lib/middleware/validation";
import { withRateLimit, rateLimiters } from "@/lib/middleware/rate-limit";
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
  const user = context.user as AuthenticatedUser;
  try {
    const { startDate, endDate } = context.validatedQuery as z.infer<typeof getAppointmentsQuerySchema>;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      status: {
        notIn: ["CANCELLED" as const],
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

    return NextResponse.json({
      success: true,
      data: formattedAppointments
    });
  } catch (error) {
    logger.api("Failed to fetch barber appointments", {
      method: "GET",
      path: "/api/barber/appointments",
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

// POST - Create manual appointment for barber
async function createManualAppointment(
  request: NextRequest, 
  context: Record<string, unknown>
) {
  const user = context.user as AuthenticatedUser;
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

    // Get default shop
    const shop = await prisma.shop.findFirst();
    if (!shop) {
      return NextResponse.json(
        {
          success: false,
          error: "No shop found",
        },
        { status: 500 }
      );
    }

    // Calculate end time (45 minutes later) using native Date
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date(2000, 0, 1, hours, minutes);
    const endDate = new Date(startDate.getTime() + 45 * 60 * 1000); // +45 minutes
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

    // Check if time slot is still available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        staffId,
        date: localDateToUTC(date),
        startTime: createUTCTime(startTime),
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        {
          success: false,
          error: "This time slot is no longer available",
        },
        { status: 409 }
      );
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

    return NextResponse.json({
      success: true,
      message: "Manual appointment created successfully",
      data: {
        id: appointment.id,
        date: utcToLocalDate(appointment.date), // YYYY-MM-DD format in local timezone
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
      },
    });
  } catch (error) {
    logger.api("Failed to create manual appointment", {
      method: "POST",
      path: "/api/barber/appointments",
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

// Export protected endpoints with validation and rate limiting
export const GET = withRateLimit(rateLimiters.api)(
  withAuth(requireBarber())(
    withValidation({ 
      query: getAppointmentsQuerySchema 
    })(getAppointments)
  )
);

export const POST = withRateLimit(rateLimiters.booking)(
  withAuth(requireBarber())(
    withValidation({ 
      body: createManualAppointmentSchema 
    })(createManualAppointment)
  )
);