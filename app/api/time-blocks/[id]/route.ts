import { PrismaClient } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// DELETE - Remove time block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
          error: "Only barbers and admins can delete time blocks",
        },
        { status: 403 }
      );
    }

    const { id: timeBlockId } = await params;

    // Find the time block
    const timeBlock = await prisma.employeeUnavailableTime.findUnique({
      where: { id: timeBlockId },
    });

    if (!timeBlock) {
      return NextResponse.json(
        {
          error: "Time block not found",
        },
        { status: 404 }
      );
    }

    // Delete the time block
    await prisma.employeeUnavailableTime.delete({
      where: { id: timeBlockId },
    });

    return NextResponse.json({
      success: true,
      message: "Time block deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting time block:", error);
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
