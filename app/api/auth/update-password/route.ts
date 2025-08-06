import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors";

// POST - Update password for authenticated user
async function updatePasswordHandler(request: NextRequest) {
  const { currentPassword, newPassword, confirmPassword } = await request.json();

  // Validate required fields
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ValidationError([{
      code: 'required_fields',
      message: 'Mevcut şifre, yeni şifre ve şifre onayı gereklidir'
    }]);
  }

  // Validate new passwords match
  if (newPassword !== confirmPassword) {
    throw new ValidationError([{
      code: 'password_mismatch',
      message: 'Yeni şifreler eşleşmiyor'
    }]);
  }

  // Validate new password strength
  if (newPassword.length < 6) {
    throw new ValidationError([{
      code: 'weak_password',
      message: 'Yeni şifre en az 6 karakter olmalıdır'
    }]);
  }

  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new ValidationError([{
      code: 'unauthorized',
      message: 'Kimlik doğrulama gerekli'
    }]);
  }

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

export const POST = withErrorHandler(updatePasswordHandler);