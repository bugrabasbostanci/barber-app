import { getAvailableTimeSlots } from "@/lib/seed-data";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const staffId = searchParams.get("staffId");

    if (!date || !staffId) {
      return NextResponse.json(
        {
          error: "Date and staffId are required",
        },
        { status: 400 }
      );
    }

    const availableSlots = await getAvailableTimeSlots(date, staffId);

    return NextResponse.json(availableSlots);
  } catch (error) {
    logger.api("Failed to fetch available time slots", {
      method: "GET",
      path: "/api/time-slots",
      statusCode: 500,
      error: error instanceof Error ? error : new Error(String(error))
    });
    
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
