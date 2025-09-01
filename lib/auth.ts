import { createClient } from "@/lib/supabase/client";
import { Role } from "@prisma/client";

// Auth error messages in English
function getAuthErrorMessage(error: { message?: string } | null): string {
  if (!error) return "";

  const errorMessage = error.message?.toLowerCase() || "";

  // Common Supabase auth errors
  if (errorMessage.includes("invalid login credentials")) {
    return "Invalid email address or password. Please check your credentials.";
  }

  if (errorMessage.includes("email not confirmed")) {
    return "You need to verify your email address. Please check your inbox.";
  }

  if (errorMessage.includes("user not found")) {
    return "No account found with this email address.";
  }

  if (
    errorMessage.includes("email already registered") ||
    errorMessage.includes("user already registered")
  ) {
    return "This email address is already registered. Try signing in.";
  }

  if (errorMessage.includes("password")) {
    if (errorMessage.includes("weak") || errorMessage.includes("short")) {
      return "Your password must be at least 6 characters long.";
    }
    return "A problem occurred with the password. Please try again.";
  }

  if (
    errorMessage.includes("rate limit") ||
    errorMessage.includes("too many")
  ) {
    return "Too many attempts. Please wait a few minutes.";
  }

  if (errorMessage.includes("network") || errorMessage.includes("connection")) {
    return "Check your internet connection and try again.";
  }

  // Default message
  return "An error occurred. Please try again later.";
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

  // Return English error message
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

  // Return English error message
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

  // Return English error message
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

  // Return English error message
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

  // Return English error message
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

  // Get current user to ensure they are authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { data: null, error: { message: "User not found" } };
  }

  // For security, we should validate current password on backend
  // But for now, we'll use Supabase's secure password update
  // The user must be authenticated to reach this function
  
  try {
    // Verify current password safely without affecting current session
    // Use a separate API call to verify password
    const response = await fetch('/api/auth/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword })
    });

    if (!response.ok) {
      return { data: null, error: { message: "Current password is incorrect" } };
    }

    // Update to new password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    // Return English error message
    return {
      data,
      error: error ? { ...error, message: getAuthErrorMessage(error) } : null,
    };
  } catch {
    return { 
      data: null, 
      error: { message: "Error occurred while changing password" } 
    };
  }
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
