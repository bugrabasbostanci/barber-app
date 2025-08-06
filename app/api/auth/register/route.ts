import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

// POST - User registration with email and password
async function registerHandler(request: NextRequest) {
  const { email, password, firstName, lastName, phone } = await request.json();

  // Validate required fields
  if (!email || !password) {
    throw new ValidationError([{
      code: 'required_fields',
      message: 'Email ve şifre gereklidir'
    }]);
  }

  if (!firstName || !lastName) {
    throw new ValidationError([{
      code: 'required_fields',
      message: 'Ad ve soyad gereklidir'
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

  // Check if user already exists in our database
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ValidationError([{
      code: 'user_exists',
      message: 'Bu email adresi ile kayıtlı bir hesap zaten var'
    }]);
  }

  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      }
    }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      throw new ValidationError([{
        code: 'user_exists',
        message: 'Bu email adresi ile kayıtlı bir hesap zaten var'
      }]);
    }
    
    throw new ValidationError([{
      code: 'registration_failed',
      message: authError.message || 'Kayıt işlemi başarısız'
    }]);
  }

  if (!authData.user) {
    throw new ValidationError([{
      code: 'registration_failed',
      message: 'Kayıt işlemi başarısız'
    }]);
  }

  // Create user in our database
  const user = await prisma.user.create({
    data: {
      id: authData.user.id,
      email: authData.user.email!,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() || null,
      role: "CUSTOMER", // Default role for new users
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

  return ApiResponseBuilder.success({
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
    },
    message: authData.user.email_confirmed_at 
      ? 'Kayıt başarılı! Giriş yapabilirsiniz.'
      : 'Kayıt başarılı! Email adresinizi kontrol edin ve doğrulama linkine tıklayın.'
  });
}

export const POST = withErrorHandler(registerHandler);