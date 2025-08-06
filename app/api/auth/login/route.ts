import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

// POST - User login with email and password
async function loginHandler(request: NextRequest) {
  const { email, password } = await request.json();

  // Validate required fields
  if (!email || !password) {
    throw new ValidationError([{
      code: 'required_fields',
      message: 'Email ve şifre gereklidir'
    }]);
  }

  const supabase = await createClient();

  // Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    throw new ValidationError([{
      code: 'invalid_credentials',
      message: 'Geçersiz email veya şifre'
    }]);
  }

  // Get or create user in our database
  let user = await prisma.user.findUnique({
    where: { id: authData.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  // If user doesn't exist in our database, create them
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: authData.user.email!,
        firstName: authData.user.user_metadata?.first_name || "",
        lastName: authData.user.user_metadata?.last_name || "",
        phone: authData.user.phone || null,
        role: "CUSTOMER", // Default role
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  // Check if user account is active
  if (!user.isActive) {
    throw new ValidationError([{
      code: 'account_inactive',
      message: 'Hesabınız devre dışı bırakılmış'
    }]);
  }

  return ApiResponseBuilder.success({
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
    }
  });
}

export const POST = withErrorHandler(loginHandler);