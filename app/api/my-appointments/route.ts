import { prisma } from '@/lib/prisma';
import { NextRequest } from "next/server";
import { extractTimeString, utcToLocalDate } from "@/lib/date-time";
import { withAuth, requireCustomer, AuthenticatedUser } from "@/lib/middleware/api-auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { withRateLimit, rateLimiters } from "@/lib/middleware/rate-limit";
import { ApiResponseBuilder } from "@/lib/api/response";


async function getMyAppointmentsHandler(
  request: NextRequest, 
  context: Record<string, unknown> = {}
) {
  const user = context.user as AuthenticatedUser;

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

  return ApiResponseBuilder.success(formattedAppointments);
}

export const GET = withErrorHandler(
  withRateLimit(rateLimiters.api)(
    withAuth(requireCustomer())(getMyAppointmentsHandler)
  )
);
