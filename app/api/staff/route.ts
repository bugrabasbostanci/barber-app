import { getStaffMembers } from "@/lib/seed-data";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";
import { withAuth, requireAuth } from "@/lib/middleware/api-auth";


async function getStaffHandler() {
  const staff = await getStaffMembers();
  return ApiResponseBuilder.success(staff);
}

export const GET = withErrorHandler(withAuth(requireAuth())(getStaffHandler));
