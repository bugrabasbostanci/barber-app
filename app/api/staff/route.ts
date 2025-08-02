import { getStaffMembers } from "@/lib/seed-data";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";
import { UnauthorizedError, NotFoundError } from "@/lib/errors";


async function getStaffHandler() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError();
  }

  // Check if user exists in database and has proper role
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  // Only authenticated users can view staff list (needed for appointment booking)
  if (!dbUser) {
    throw new NotFoundError("Kullanıcı bulunamadı");
  }

  const staff = await getStaffMembers();
  return ApiResponseBuilder.success(staff);
}

export const GET = withErrorHandler(getStaffHandler);
