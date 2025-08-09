import { getStaffMembers } from "@/lib/seed-data";
import { withAuth, requireAuth } from "@/lib/middleware/api-auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";

async function getStaffHandler() {
  // Authentication handled by middleware

  const staff = await getStaffMembers();
  return ApiResponseBuilder.success(staff);
}

export const GET = withErrorHandler(
  withAuth(requireAuth())(getStaffHandler)
);
