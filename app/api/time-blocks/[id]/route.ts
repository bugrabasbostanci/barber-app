import { prisma } from '@/lib/prisma';
import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/middleware/api-auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";
import { NotFoundError, UnauthorizedError, ForbiddenError } from "@/lib/errors";

// DELETE - Remove time block
async function deleteTimeBlockHandler(
  request: NextRequest,
  context?: { params?: { id: string } }
) {
  // Get authenticated user
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new UnauthorizedError("Authentication required");
  }

  // Check if user has barber permissions
  if (!["BARBER", "ADMIN"].includes(user.role)) {
    throw new ForbiddenError("Only barbers and admins can delete time blocks");
  }

  const timeBlockId = context?.params?.id;
  if (!timeBlockId) {
    throw new NotFoundError("Time block ID is required");
  }

  // Find the time block
  const timeBlock = await prisma.employeeUnavailableTime.findUnique({
    where: { id: timeBlockId },
  });

  if (!timeBlock) {
    throw new NotFoundError("Time block not found");
  }

  // Delete the time block
  await prisma.employeeUnavailableTime.delete({
    where: { id: timeBlockId },
  });

  return ApiResponseBuilder.success({
    message: "Time block deleted successfully"
  });
}

// Handle dynamic route properly
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  
  return withErrorHandler(async () => {
    return await deleteTimeBlockHandler(request, { params: resolvedParams });
  })();
}
