import { NextRequest } from 'next/server'
import { withAuth, requireAuth, AuthenticatedUser } from "@/lib/middleware/api-auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";

async function checkRoleHandler(
  request: NextRequest,
  context?: Record<string, unknown>
) {
  const user = context?.user as AuthenticatedUser;

  return ApiResponseBuilder.success({
    role: user.role,
    isActive: user.isActive
  });
}

export const GET = withErrorHandler(
  withAuth(requireAuth())(checkRoleHandler)
);