import { getStaffMembers } from "@/lib/seed-data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const staff = await getStaffMembers();

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
