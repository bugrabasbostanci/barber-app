import { PrismaClient } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const prisma = new PrismaClient();

// GET - Fetch time blocks
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");
    const date = searchParams.get("date");

    const whereClause: Record<string, string | Date> = {};

    if (staffId) {
      whereClause.staffId = staffId;
    }

    if (date) {
      whereClause.date = new Date(date);
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
      date: block.date.toISOString().split("T")[0],
      startTime: block.startTime
        ? block.startTime.toTimeString().substring(0, 5)
        : null,
      endTime: block.endTime
        ? block.endTime.toTimeString().substring(0, 5)
        : null,
      reason: block.reason,
      isFullDay: !block.startTime || !block.endTime,
      staffId: block.staffId,
      staff: block.staff,
    }));

    return NextResponse.json(formattedBlocks);
  } catch (error) {
    console.error("Error fetching time blocks:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create time block
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has BARBER or ADMIN role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || !["BARBER", "ADMIN"].includes(dbUser.role)) {
      return NextResponse.json(
        {
          error: "Only barbers and admins can block time",
        },
        { status: 403 }
      );
    }

    const { date, staffId, startTime, endTime, reason, isFullDay } =
      await request.json();

    if (!date || !staffId || !reason) {
      return NextResponse.json(
        {
          error: "Date, staffId, and reason are required",
        },
        { status: 400 }
      );
    }

    if (!isFullDay && (!startTime || !endTime)) {
      return NextResponse.json(
        {
          error: "Start time and end time are required for time range blocks",
        },
        { status: 400 }
      );
    }

    // Verify staff exists
    const staff = await prisma.user.findUnique({
      where: { id: staffId },
      select: { id: true, firstName: true, lastName: true, role: true },
    });

    if (!staff || !["EMPLOYEE", "BARBER"].includes(staff.role)) {
      return NextResponse.json(
        {
          error: "Invalid staff member",
        },
        { status: 400 }
      );
    }

    // Create the time block
    const timeBlock = await prisma.employeeUnavailableTime.create({
      data: {
        staffId,
        date: new Date(date),
        startTime: isFullDay ? null : new Date(`2000-01-01T${startTime}:00`),
        endTime: isFullDay ? null : new Date(`2000-01-01T${endTime}:00`),
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

    return NextResponse.json({
      success: true,
      message: "Time block created successfully",
      timeBlock: {
        id: timeBlock.id,
        date: timeBlock.date.toISOString().split("T")[0],
        startTime: timeBlock.startTime
          ? timeBlock.startTime.toTimeString().substring(0, 5)
          : null,
        endTime: timeBlock.endTime
          ? timeBlock.endTime.toTimeString().substring(0, 5)
          : null,
        reason: timeBlock.reason,
        isFullDay: !timeBlock.startTime || !timeBlock.endTime,
        staffId: timeBlock.staffId,
        staff: timeBlock.staff,
      },
    });
  } catch (error) {
    console.error("Error creating time block:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
