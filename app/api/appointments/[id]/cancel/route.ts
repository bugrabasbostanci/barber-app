// app/api/appointments/[id]/cancel/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import {
  utcToLocalDate,
  extractTimeString,
  getHoursDifference,
} from "@/lib/date-time";
import { BUSINESS_RULES } from "@/lib/constants";
import { withAuth, requireCustomer, AuthenticatedUser } from "@/lib/middleware/api-auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/errors";


async function cancelAppointmentHandler(
  request: NextRequest,
  context: Record<string, unknown>
) {
  const user = context.user as AuthenticatedUser;
  const { params } = context as { params: { id: string } };
  const { id } = params;
  
  try {

    // Find the appointment and verify ownership
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    // Verify the user owns this appointment
    if (appointment.customerId !== user.id) {
      throw new ForbiddenError("You can only cancel your own appointments");
    }

    // Check if appointment can be cancelled (within business rules)
    const now = new Date();
    const appointmentDateTime = appointment.date; // Already in UTC
    const hoursDiff = getHoursDifference(appointmentDateTime, now);

    if (hoursDiff < BUSINESS_RULES.CANCELLATION_HOURS) {
      throw new ValidationError([{
        code: 'cancellation_deadline',
        message: `Appointments can only be cancelled at least ${BUSINESS_RULES.CANCELLATION_HOURS} hours in advance`
      }]);
    }

    // Check if appointment is in a cancellable state
    if (!["SCHEDULED", "CONFIRMED"].includes(appointment.status)) {
      throw new ValidationError([{
        code: 'invalid_status',
        message: "This appointment cannot be cancelled"
      }]);
    }

    // Update the appointment status to CANCELLED
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
      include: {
        staff: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        shop: {
          select: {
            name: true,
          },
        },
      },
    });

    return ApiResponseBuilder.success({
      message: "Appointment cancelled successfully",
      appointment: {
        id: updatedAppointment.id,
        date: utcToLocalDate(updatedAppointment.date),
        startTime: extractTimeString(updatedAppointment.startTime),
        endTime: extractTimeString(updatedAppointment.endTime),
        status: updatedAppointment.status,
        staff: updatedAppointment.staff,
        shop: updatedAppointment.shop,
      },
    });
  } catch (error) {
    throw error;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const handler = withErrorHandler(
    withAuth(requireCustomer())(
      (req, context) => cancelAppointmentHandler(req, { ...context, params: resolvedParams })
    )
  );
  
  return handler(request);
}
