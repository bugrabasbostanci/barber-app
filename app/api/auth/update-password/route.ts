import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withAuth, requireAuth, AuthenticatedUser } from "@/lib/middleware/api-auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { withValidation } from "@/lib/middleware/validation";
import { ApiResponseBuilder } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"]
});

// POST - Update password for authenticated user
async function updatePasswordHandler(
  request: NextRequest,
  context: Record<string, unknown>
) {
  const user = context.user as AuthenticatedUser;
  const { currentPassword, newPassword } = context.validatedBody as z.infer<typeof updatePasswordSchema>;

  const supabase = await createClient();

  // Verify current password by attempting to sign in
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword
  });

  if (verifyError) {
    throw new ValidationError([{
      code: 'invalid_current_password',
      message: 'Mevcut şifre hatalı'
    }]);
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    throw new ValidationError([{
      code: 'update_failed',
      message: 'Şifre güncelleme başarısız. Lütfen tekrar deneyin.'
    }]);
  }

  return ApiResponseBuilder.success({ 
    message: 'Şifreniz başarıyla güncellendi' 
  });
}

export const POST = withErrorHandler(
  withAuth(requireAuth())(
    withValidation({
      body: updatePasswordSchema
    })(updatePasswordHandler)
  )
);