import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { withRateLimit, rateLimiters } from "@/lib/middleware/rate-limit";
import { ApiResponseBuilder } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors";

// POST - Send password reset email
async function forgotPasswordHandler(request: NextRequest) {
  const { email } = await request.json();

  // Validate required fields
  if (!email) {
    throw new ValidationError([{
      code: 'required_fields',
      message: 'Email adresi gereklidir'
    }]);
  }

  const supabase = await createClient();

  // Send password reset email via Supabase
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });

  if (error) {
    console.error('Forgot password error:', error);
    // Don't reveal if email exists or not for security
  }

  // Always return success to prevent email enumeration
  return ApiResponseBuilder.success({
    message: 'Eğer bu email adresi ile kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderilmiştir.'
  });
}

export const POST = withErrorHandler(
  withRateLimit(rateLimiters.auth)(forgotPasswordHandler)
);