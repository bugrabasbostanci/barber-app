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

async function getTimeSlots(
  request: NextRequest,
  context: { validatedQuery: z.infer<typeof timeSlotsQuerySchema> }
) {
  try {
    const { date, staffId } = context.validatedQuery;

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

// Export with validation and rate limiting
export const GET = withRateLimit(rateLimiters.api)(
  withValidation({ 
    query: timeSlotsQuerySchema 
  })(getTimeSlots)
);
