import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAuth, requireAuth, AuthenticatedUser } from "@/lib/middleware/api-auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { withRateLimit, rateLimiters } from "@/lib/middleware/rate-limit";
import { withValidation } from "@/lib/middleware/validation";
import { ApiResponseBuilder } from "@/lib/api/response";
import { ValidationError, UnauthorizedError } from "@/lib/errors";
import { z } from "zod";

const verifyPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
});

async function verifyPasswordHandler(
  request: NextRequest,
  context: Record<string, unknown>
) {
  const user = context.user as AuthenticatedUser;
  const { currentPassword } = context.validatedBody as z.infer<typeof verifyPasswordSchema>;

  if (!user.email) {
    throw new UnauthorizedError("User email not found");
  }

  // Create a new client instance for password verification
  // This won't affect the current session
  const verificationSupabase = await createClient();
  
  const { error: signInError } = await verificationSupabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    throw new ValidationError([{
      code: 'invalid_password',
      message: 'Mevcut şifre yanlış'
    }]);
  }

  // Immediately sign out the verification session to prevent session conflicts
  await verificationSupabase.auth.signOut();

  return ApiResponseBuilder.success({ valid: true });
}

export const POST = withErrorHandler(
  withRateLimit(rateLimiters.auth)(
    withAuth(requireAuth())(
      withValidation({
        body: verifyPasswordSchema
      })(verifyPasswordHandler)
    )
  )
);