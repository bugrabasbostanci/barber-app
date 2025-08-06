import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors";

// POST - Reset password with token
async function resetPasswordHandler(request: NextRequest) {
  const { password, confirmPassword } = await request.json();

  // Validate required fields
  if (!password || !confirmPassword) {
    throw new ValidationError([{
      code: 'required_fields',
      message: 'Şifre ve şifre onayı gereklidir'
    }]);
  }

  // Validate passwords match
  if (password !== confirmPassword) {
    throw new ValidationError([{
      code: 'password_mismatch',
      message: 'Şifreler eşleşmiyor'
    }]);
  }

  // Validate password strength
  if (password.length < 6) {
    throw new ValidationError([{
      code: 'weak_password',
      message: 'Şifre en az 6 karakter olmalıdır'
    }]);
  }

  const supabase = await createClient();

  // Update password via Supabase
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    throw new ValidationError([{
      code: 'reset_failed',
      message: 'Şifre sıfırlama başarısız. Lütfen tekrar deneyin.'
    }]);
  }

  return ApiResponseBuilder.success({
    message: 'Şifreniz başarıyla güncellendi'
  });
}

export const POST = withErrorHandler(resetPasswordHandler);