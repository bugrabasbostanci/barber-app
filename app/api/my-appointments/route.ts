import { prisma } from '@/lib/prisma';
import { createClient } from "@/lib/supabase/server";
import { extractTimeString, utcToLocalDate } from "@/lib/date-time";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";


async function getMyAppointmentsHandler() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError();
  }

  // Check if user exists and has CUSTOMER role
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || dbUser.role !== 'CUSTOMER') {
    throw new ForbiddenError("Bu işlemi gerçekleştirmek için müşteri hesabınız olmalı");
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

  return ApiResponseBuilder.success(formattedAppointments);
}

export const GET = withErrorHandler(getMyAppointmentsHandler);
