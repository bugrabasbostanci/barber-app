import { seedTestData } from "@/lib/seed-data";
import { NextResponse } from "next/server";

// export const runtime = "edge";
export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await seedTestData();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test data seeded successfully",
        data: result,
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
    console.error("Error in seed API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
