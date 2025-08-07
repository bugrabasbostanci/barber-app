import { prisma } from '@/lib/prisma';
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { withCSRFProtection } from "@/lib/middleware/csrf";
import { ApiResponseBuilder } from "@/lib/api/response";
import { UnauthorizedError, ValidationError } from "@/lib/errors";


async function updateRoleHandler(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError();
  }

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

export const POST = withErrorHandler(
  withCSRFProtection()(updateRoleHandler)
);
