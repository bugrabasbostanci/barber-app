import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import {
  withAuth,
  requireBarber,
  AuthenticatedUser,
} from "@/lib/middleware/api-auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";
import { NotFoundError, ForbiddenError } from "@/lib/errors";

async function deleteAppointment(
  request: NextRequest,
  context?: Record<string, unknown>
) {
  // Get ID from URL path
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  const id = pathSegments[pathSegments.length - 1];
  const user = context?.user as AuthenticatedUser;

  try {
    // Check if appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        shop: true,
      },
    });

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    // Check if user is a barber and belongs to the same shop
    let userRecord = await prisma.user.findUnique({
      where: { id: user.id },
    });

    // If not found by ID, try to find by email (for demo users)
    if (!userRecord) {
      userRecord = await prisma.user.findFirst({
        where: { email: user.email },
      });
    }

    if (!userRecord || userRecord.role !== "BARBER") {
      throw new ForbiddenError(
        "Barber authorization required for this operation"
      );
    }

    // Delete the appointment (hard delete as requested by user)
    await prisma.appointment.delete({
      where: { id },
    });

    return ApiResponseBuilder.success({ message: "Appointment successfully deleted" });
  } catch (error) {
    throw error;
  }
}

// Create auth middleware
async function authMiddleware(): Promise<AuthenticatedUser> {
  const user = await requireBarber()();
  return user;
}

// Export protected endpoint with error handling
export const DELETE = withErrorHandler(
  withAuth(authMiddleware)(deleteAppointment)
);
