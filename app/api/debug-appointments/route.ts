import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from "next/server";
import { withAuth, requireAdmin, AuthenticatedUser } from "@/lib/middleware/api-auth";
import { logger } from "@/lib/logger";

async function debugAppointments(request: NextRequest, user: AuthenticatedUser) {
  try {
    // Production security: Only allow in development or for admin users
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        success: false, 
        error: "Debug endpoints are disabled in production for security" 
      }, { status: 403 });
    }

    // Get query parameters to simulate calendar request
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    // Get total appointment count
    const totalAppointments = await prisma.appointment.count();
    
    // Get non-cancelled appointments
    const activeAppointments = await prisma.appointment.count({
      where: {
        status: {
          notIn: ["CANCELLED"],
        },
      },
    });

    // Get all shops
    const shops = await prisma.shop.findMany();

    // Get all appointments with details
    const allAppointments = await prisma.appointment.findMany({
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        manualCustomerName: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        staff: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // Get today's date for comparison
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // If date range is provided, test the same filtering logic
    let filteredAppointments = allAppointments;
    if (startDate && endDate) {
      const { localDateToUTC } = await import("@/lib/date-time");
      const startUTC = localDateToUTC(startDate);
      const endUTC = localDateToUTC(endDate);
      
      filteredAppointments = await prisma.appointment.findMany({
        where: {
          status: {
            notIn: ["CANCELLED"],
          },
          date: {
            gte: startUTC,
            lte: endUTC,
          },
        },
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
          manualCustomerName: true,
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          staff: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      });
    }

    // Sanitize sensitive appointment data
    const sanitizeAppointments = (appointments: typeof allAppointments) => 
      appointments.slice(0, 10).map(apt => ({ // Limit to 10 records
        id: apt.id.slice(0, 8) + "...", // Partial ID
        date: apt.date.toISOString().split('T')[0],
        startTime: apt.startTime.toISOString().split('T')[1].slice(0, 5),
        endTime: apt.endTime.toISOString().split('T')[1].slice(0, 5),
        status: apt.status,
        customerName: apt.customer ? 
          apt.customer.firstName?.charAt(0) + "***" : 
          apt.manualCustomerName?.charAt(0) + "***" || "Anonymous",
        staffName: apt.staff ? 
          apt.staff.firstName?.charAt(0) + "***" : "Unknown",
      }));

    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      currentUser: {
        role: user.role,
        email: user.email.replace(/(.{2}).*@/, "$1***@"),
      },
      statistics: {
        totalAppointments,
        activeAppointments,
        totalShops: shops.length,
      },
      dateInfo: {
        serverTime: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        queryParams: { startDate, endDate },
      },
      sampleAppointments: sanitizeAppointments(allAppointments),
      sampleFiltered: startDate && endDate ? 
        sanitizeAppointments(filteredAppointments) : null,
      note: "Showing sanitized sample data for debugging. Full data access restricted.",
    });
  } catch (error) {
    logger.api("Debug appointments endpoint failed", {
      method: "GET",
      path: "/api/debug-appointments",
      userId: user.id,
      statusCode: 500,
      error: error instanceof Error ? error : new Error(String(error))
    });
    
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Export protected endpoint - admin only
export const GET = withAuth(requireAdmin())(debugAppointments);