import { getStaffMembers } from "@/lib/seed-data";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";


export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists in database and has proper role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    // Only authenticated users can view staff list (needed for appointment booking)
    if (!dbUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const staff = await getStaffMembers();

    return NextResponse.json(staff);
  } catch (error) {
    logger.api("Failed to fetch staff members", {
      method: "GET",
      path: "/api/staff",
      statusCode: 500,
      error: error instanceof Error ? error : new Error(String(error))
    });
    
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
