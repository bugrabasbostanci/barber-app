import { prisma } from '@/lib/prisma';
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      currentUser: {
        supabaseId: user.id,
        email: user.email,
        dbUser: dbUser,
      },
      database: {
        totalAppointments,
        activeAppointments,
        totalShops: shops.length,
      },
      dateInfo: {
        serverTime: new Date().toISOString(),
        todayStr,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        queryParams: { startDate, endDate },
      },
      appointments: allAppointments.map(apt => ({
        ...apt,
        date: apt.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        startTime: apt.startTime.toISOString().split('T')[1].slice(0, 5), // Format as HH:MM
        endTime: apt.endTime.toISOString().split('T')[1].slice(0, 5),
      })),
      filteredAppointments: startDate && endDate ? filteredAppointments.map(apt => ({
        ...apt,
        date: apt.date.toISOString().split('T')[0],
        startTime: apt.startTime.toISOString().split('T')[1].slice(0, 5),
        endTime: apt.endTime.toISOString().split('T')[1].slice(0, 5),
      })) : null,
      shops,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}