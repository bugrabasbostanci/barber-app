import { createClient } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { NextResponse } from "next/server";

// POST - User logout
async function logoutHandler() {
  const supabase = await createClient();

  console.log("Server-side logout: Starting...");

  // Sign out from Supabase Auth - this clears server-side session
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Server logout error:", error);
    // Don't throw error, just log it and continue
  }

  console.log("Server-side logout: Completed");

  // Clear authentication cookies explicitly
  const cookieOptions = {
    path: "/",
    expires: new Date(0), // Expire immediately
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };

  // Create redirect response
  const response = NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
  );

  // Clear common Supabase auth cookies
  response.cookies.set("sb-access-token", "", cookieOptions);
  response.cookies.set("sb-refresh-token", "", cookieOptions);

  // Clear any other auth-related cookies that might exist
  const authCookieNames = [
    "supabase-auth-token",
    "supabase.auth.token",
    "sb-auth-token",
    "auth-token",
  ];

  authCookieNames.forEach((name) => {
    response.cookies.set(name, "", cookieOptions);
  });

  return response;
}

export const POST = withErrorHandler(logoutHandler);
