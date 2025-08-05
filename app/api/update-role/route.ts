import { prisma } from '@/lib/prisma';
import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors";
import { withAuth, requireAuth, AuthenticatedUser } from "@/lib/middleware/api-auth";


async function updateRoleHandler(request: NextRequest, context?: { user: AuthenticatedUser }) {
  if (!context?.user) {
    throw new ValidationError([{ code: 'unauthorized', message: 'Unauthorized' }]);
  }
  const { user } = context;
  const { role } = await request.json();

  if (!["CUSTOMER", "EMPLOYEE", "BARBER", "ADMIN"].includes(role)) {
    throw new ValidationError([{
      code: 'invalid_role', 
      message: 'Invalid role'
    }]);
  }

  // Update user role in database
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { role },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  return ApiResponseBuilder.success({
    message: `Role updated to ${role}`,
    user: updatedUser,
  });
}

export const POST = withErrorHandler(withAuth(requireAuth())(updateRoleHandler));
