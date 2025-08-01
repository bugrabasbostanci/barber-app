import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from "next/server";
import { localDateToUTC } from "@/lib/date-time";
import { logger } from "@/lib/logger";


// GET - Fetch blocked dates for customers (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const whereClause: {
      staffId?: string;
      date?: {
        gte: Date;
        lte: Date;
      };
    } = {};

    if (staffId) {
      whereClause.staffId = staffId;
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      whereClause.date = {
        gte: localDateToUTC(startDate),
        lte: localDateToUTC(endDate),
      };
    }

    const blockedTimes = await prisma.employeeUnavailableTime.findMany({
      where: whereClause,
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        reason: true,
        staffId: true,
        staff: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    // Format the response - only return necessary info for customers
    const formattedBlocks = blockedTimes.map((block) => ({
      date: block.date.toISOString().split('T')[0], // YYYY-MM-DD format
      isFullDay: !block.startTime || !block.endTime,
      startTime: block.startTime ? block.startTime.toTimeString().slice(0, 5) : null,
      endTime: block.endTime ? block.endTime.toTimeString().slice(0, 5) : null,
      staffId: block.staffId,
      reason: block.reason, // Customers can see the reason (e.g., "Hasta", "İzin")
    }));

    return NextResponse.json(formattedBlocks);
  } catch (error) {
    logger.api("Failed to fetch blocked dates", {
      method: "GET",
      path: "/api/blocked-dates",
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