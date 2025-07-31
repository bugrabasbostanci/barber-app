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

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

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
        totalUsers: allUsers.length,
      },
      shops,
      users: allUsers,
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