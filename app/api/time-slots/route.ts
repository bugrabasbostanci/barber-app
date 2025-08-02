import { getAvailableTimeSlots } from "@/lib/seed-data";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { withValidation, commonSchemas } from "@/lib/middleware/validation";
import { withRateLimit, rateLimiters } from "@/lib/middleware/rate-limit";
import { z } from "zod";

// Validation schema for time slots query
const timeSlotsQuerySchema = z.object({
  date: commonSchemas.date,
  staffId: commonSchemas.uuid,
});

async function getTimeSlots(request: NextRequest) {
  try {
    // Manual validation
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const staffId = searchParams.get('staffId');
    
    if (!date || !staffId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: date and staffId' },
        { status: 400 }
      );
    }
    
    const validation = timeSlotsQuerySchema.safeParse({ date, staffId });
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', details: validation.error.issues },
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

// Export with rate limiting
export const GET = withRateLimit(rateLimiters.api)(getTimeSlots);
