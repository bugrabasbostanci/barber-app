import { prisma } from '@/lib/prisma';
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET - Search customers
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

    // Check user role (only barbers can search customers)
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (!userProfile || userProfile.role !== "BARBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    // Search customers by name or phone
    const customers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        isActive: true,
        OR: [
          {
            firstName: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            phone: {
              contains: query,
            },
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
      take: 10, // Limit results
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error searching customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}