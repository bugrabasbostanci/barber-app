import { createClient } from "@/lib/supabase/client";
import { Role } from "@prisma/client";

// Auth error messages in Turkish
function getAuthErrorMessage(error: { message?: string } | null): string {
  if (!error) return "";

  const errorMessage = error.message?.toLowerCase() || "";

  // Common Supabase auth errors
  if (errorMessage.includes("invalid login credentials")) {
    return "E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.";
  }

  if (errorMessage.includes("email not confirmed")) {
    return "E-posta adresinizi doğrulamanız gerekiyor. Gelen kutunuzu kontrol edin.";
  }

  if (errorMessage.includes("user not found")) {
    return "Bu e-posta adresi ile kayıtlı bir hesap bulunamadı.";
  }

  if (
    errorMessage.includes("email already registered") ||
    errorMessage.includes("user already registered")
  ) {
    return "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.";
  }

  if (errorMessage.includes("password")) {
    if (errorMessage.includes("weak") || errorMessage.includes("short")) {
      return "Şifreniz en az 6 karakter olmalıdır.";
    }
    return "Şifre ile ilgili bir sorun oluştu. Lütfen tekrar deneyin.";
  }

  if (
    errorMessage.includes("rate limit") ||
    errorMessage.includes("too many")
  ) {
    return "Çok fazla deneme yaptınız. Lütfen birkaç dakika bekleyin.";
  }

  if (errorMessage.includes("network") || errorMessage.includes("connection")) {
    return "İnternet bağlantınızı kontrol edin ve tekrar deneyin.";
  }

  // Default message
  return "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
}

// Re-export the centralized type for backward compatibility
export type { DatabaseUser as AuthUser } from "@/lib/types/auth";

// Client-side auth functions only
export async function signUp(
  email: string,
  password: string,
  userData: {
    firstName: string;
    lastName: string;
    phone?: string;
  }
) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        role: "CUSTOMER",
      },
    },
  });

  // Return Turkish error message
  return {
    data,
    error: error ? { ...error, message: getAuthErrorMessage(error) } : null,
  };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Return Turkish error message
  return {
    data,
    error: error ? { ...error, message: getAuthErrorMessage(error) } : null,
  };
}

export async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function signInWithGoogle(redirectTo?: string) {
  const supabase = createClient();

  const callbackUrl = redirectTo
    ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
        redirectTo
      )}`
    : `${window.location.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
    },
  });

  // Return Turkish error message
  return {
    data,
    error: error ? { ...error, message: getAuthErrorMessage(error) } : null,
  };
}

export async function resetPassword(email: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
  });

  // Return Turkish error message
  return {
    data,
    error: error ? { ...error, message: getAuthErrorMessage(error) } : null,
  };
}

export async function updatePassword(password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.updateUser({
    password: password,
  });

  // Return Turkish error message
  return {
    data,
    error: error ? { ...error, message: getAuthErrorMessage(error) } : null,
  };
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const supabase = createClient();

  // First, verify current password by trying to sign in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { data: null, error: { message: "Kullanıcı bulunamadı" } };
  }

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { data: null, error: { message: "Mevcut şifre yanlış" } };
  }

  // Update to new password
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  // Return Turkish error message
  return {
    data,
    error: error ? { ...error, message: getAuthErrorMessage(error) } : null,
  };
}

export async function getUser() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
}

// Role checking utilities
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy = {
    CUSTOMER: 0,
    EMPLOYEE: 1,
    BARBER: 2,
    ADMIN: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function isCustomer(role: Role): boolean {
  return role === "CUSTOMER";
}

export function isStaff(role: Role): boolean {
  return ["EMPLOYEE", "BARBER", "ADMIN"].includes(role);
}

export function isBarber(role: Role): boolean {
  return ["BARBER", "ADMIN"].includes(role);
}

export function isAdmin(role: Role): boolean {
  return role === "ADMIN";
}
