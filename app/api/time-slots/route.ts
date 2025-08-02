import { getAvailableTimeSlots } from "@/lib/seed-data";
import { NextRequest } from "next/server";
import { commonSchemas } from "@/lib/middleware/validation";
import { withRateLimit, rateLimiters } from "@/lib/middleware/rate-limit";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { ApiResponseBuilder } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";

// Validation schema for time slots query
const timeSlotsQuerySchema = z.object({
  date: commonSchemas.date,
  staffId: commonSchemas.uuid,
});

async function getTimeSlots(request: NextRequest) {
  // Manual validation
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const staffId = searchParams.get('staffId');
  
  if (!date || !staffId) {
    throw new ValidationError([{
      code: 'missing_parameters',
      message: 'Missing required parameters: date and staffId'
    }]);
  }
  
  const validation = timeSlotsQuerySchema.safeParse({ date, staffId });
  if (!validation.success) {
    throw new ValidationError(validation.error.issues);
  }

  const availableSlots = await getAvailableTimeSlots(date, staffId);
  return ApiResponseBuilder.success(availableSlots);
}

// Export with error handling and rate limiting
export const GET = withErrorHandler(
  withRateLimit(rateLimiters.api)(getTimeSlots)
);
