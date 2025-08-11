import { prisma } from '@/lib/prisma';
import { NextRequest } from "next/server";
import { localDateToUTC, createUTCTime, extractTimeString } from "@/lib/utils";
import { withAuth, requireBarber } from "@/lib/middleware/api-auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { withValidation, commonSchemas } from "@/lib/middleware/validation";
import { ApiResponseBuilder } from "@/lib/api/response";
import { NotFoundError } from "@/lib/errors";
import { z } from "zod";

// GET - Fetch time blocks
async function getTimeBlocksHandler(
  request: NextRequest
) {
  const { searchParams } = new URL(request.url);
  const staffId = searchParams.get("staffId");
  const date = searchParams.get("date");

  const whereClause: Record<string, string | Date> = {};

  if (staffId) {
    whereClause.staffId = staffId;
  }

  if (date) {
    whereClause.date = localDateToUTC(date);
  }

  const timeBlocks = await prisma.employeeUnavailableTime.findMany({
    where: whereClause,
    include: {
      staff: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
  });

  // Format the response
  const formattedBlocks = timeBlocks.map((block) => ({
    id: block.id,
    date: block.date.toISOString().split('T')[0], // YYYY-MM-DD format
    startTime: block.startTime
      ? extractTimeString(block.startTime)
      : null,
    endTime: block.endTime
      ? extractTimeString(block.endTime)
      : null,
    reason: block.reason,
    isFullDay: !block.startTime || !block.endTime,
    staffId: block.staffId,
    staff: block.staff,
  }));

  return ApiResponseBuilder.success(formattedBlocks);
}

export const GET = withErrorHandler(
  withAuth(requireBarber())(getTimeBlocksHandler)
);

// Validation schema for time block creation
const createTimeBlockSchema = z.object({
  date: commonSchemas.date,
  staffId: commonSchemas.uuid,
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  reason: z.string().min(1, "Reason is required").max(200, "Reason must be under 200 characters"),
  isFullDay: z.boolean().default(false),
}).refine((data) => {
  // If not full day, start and end times are required
  if (!data.isFullDay) {
    return data.startTime && data.endTime;
  }
  return true;
}, {
  message: "Start time and end time are required for time range blocks",
  path: ["startTime"]
});

// POST - Create time block
async function createTimeBlockHandler(
  request: NextRequest,
  context?: Record<string, unknown>
) {
  const { date, staffId, startTime, endTime, reason, isFullDay } = 
    context?.validatedBody as z.infer<typeof createTimeBlockSchema>;

  // Verify staff exists
  const staff = await prisma.user.findUnique({
    where: { id: staffId },
    select: { id: true, firstName: true, lastName: true, role: true },
  });

  if (!staff || !["EMPLOYEE", "BARBER", "ADMIN"].includes(staff.role)) {
    throw new NotFoundError("Invalid staff member");
  }

  // Create the time block
  const timeBlock = await prisma.employeeUnavailableTime.create({
    data: {
      staffId,
      date: localDateToUTC(date),
      startTime: isFullDay ? null : createUTCTime(startTime!),
      endTime: isFullDay ? null : createUTCTime(endTime!),
      reason,
    },
    include: {
      staff: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const responseData = {
    id: timeBlock.id,
    date: timeBlock.date.toISOString().split('T')[0], // YYYY-MM-DD format
    startTime: timeBlock.startTime
      ? extractTimeString(timeBlock.startTime)
      : null,
    endTime: timeBlock.endTime
      ? extractTimeString(timeBlock.endTime)
      : null,
    reason: timeBlock.reason,
    isFullDay: !timeBlock.startTime || !timeBlock.endTime,
    staffId: timeBlock.staffId,
    staff: timeBlock.staff,
  };

  return ApiResponseBuilder.success(responseData);
}

export const POST = withErrorHandler(
  withAuth(requireBarber())(
    withValidation({
      body: createTimeBlockSchema
    })(createTimeBlockHandler)
  )
);
