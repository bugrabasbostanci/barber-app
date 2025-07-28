import { createClient } from "@/lib/supabase/server";
import { createUserInDatabase } from "@/lib/user-actions";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and has admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, let's sync the current logged-in user
    const userData = {
      email: user.email!,
      firstName: user.user_metadata?.first_name || "",
      lastName: user.user_metadata?.last_name || "",
      phone: user.user_metadata?.phone || undefined,
    };

    const result = await createUserInDatabase(user.id, userData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "User synced successfully",
        user: result.user,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
