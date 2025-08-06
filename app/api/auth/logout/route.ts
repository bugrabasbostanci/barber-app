import { createClient } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";

// POST - User logout
async function logoutHandler() {
  const supabase = await createClient();

  // Sign out from Supabase Auth
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    // Don't throw error, just log it and return success
    // Client should clear local state regardless
  }

  return ApiResponseBuilder.success({
    message: "Başarıyla çıkış yapıldı",
  });
}

export const POST = withErrorHandler(logoutHandler);
