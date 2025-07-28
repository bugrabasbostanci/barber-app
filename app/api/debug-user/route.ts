import { createClient } from "@/lib/supabase/server";
import { checkUserRole } from "@/lib/admin-actions";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json({ error: "Auth error", details: error.message });
    }

    if (!user) {
      return NextResponse.json({ error: "No user found" });
    }

    // Check database user
    const dbUser = await checkUserRole();

    return NextResponse.json({
      supabaseUser: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
      },
      databaseUser: dbUser,
      success: true,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
