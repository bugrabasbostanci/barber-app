import { PrismaClient } from '@prisma/client';
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { localDateToUTC, createUTCTime, extractTimeString, utcToLocalDate } from "@/lib/date-time";
// Luxon replaced with native Date

const prisma = new PrismaClient();

// GET - Fetch appointments for barber dashboard
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

    // Check if user has BARBER or ADMIN role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || !["BARBER", "ADMIN"].includes(dbUser.role)) {
      return NextResponse.json(
        {
          error: "Only barbers and admins can view appointments",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      status: {
        notIn: ["CANCELLED" as const],
      },
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      whereClause.date = {
        gte: localDateToUTC(startDate),
        lte: localDateToUTC(endDate),
      };
    }

    // Get appointments
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        shop: {
          select: {
            name: true,
            address: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // Format the response
    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      date: utcToLocalDate(appointment.date),
      startTime: extractTimeString(appointment.startTime),
      endTime: extractTimeString(appointment.endTime),
      status: appointment.status,
      notes: appointment.notes,
      customer: appointment.customer,
      manualCustomerName: appointment.manualCustomerName,
      manualCustomerPhone: appointment.manualCustomerPhone,
      staff: appointment.staff,
      shop: appointment.shop,
      createdAt: appointment.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

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
          error: "Only barbers and admins can create manual appointments",
        },
        { status: 403 }
      );
    }

    const {
      date,
      staffId,
      startTime,
      customerType,
      customerName,
      customerPhone,
      existingCustomerId,
      notes,
    } = await request.json();

    if (!date || !staffId || !startTime) {
      return NextResponse.json(
        {
          error: "Date, staffId, and startTime are required",
        },
        { status: 400 }
      );
    }

    if (customerType === "new" && (!customerName?.trim() || !customerPhone?.trim())) {
      return NextResponse.json(
        {
          error: "Customer name and phone are required for new customers",
        },
        { status: 400 }
      );
    }

    if (customerType === "existing" && !existingCustomerId) {
      return NextResponse.json(
        {
          error: "Customer ID is required for existing customers",
        },
        { status: 400 }
      );
    }

    // Get default shop
    const shop = await prisma.shop.findFirst();
    if (!shop) {
      return NextResponse.json(
        {
          error: "No shop found",
        },
        { status: 500 }
      );
    }

    // Calculate end time (45 minutes later) using native Date
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date(2000, 0, 1, hours, minutes);
    const endDate = new Date(startDate.getTime() + 45 * 60 * 1000); // +45 minutes
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

    // Check if time slot is still available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        staffId,
        date: localDateToUTC(date),
        startTime: createUTCTime(startTime),
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        {
          error: "This time slot is no longer available",
        },
        { status: 409 }
      );
    }

    let customerId = null;

    if (customerType === "existing") {
      // Use existing customer
      customerId = existingCustomerId;
    } else {
      // For new customers, we'll store the info in manual fields
      customerId = null;
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        shopId: shop.id,
        customerId: customerId,
        staffId,
        date: localDateToUTC(date),
        startTime: createUTCTime(startTime),
        endTime: createUTCTime(endTime),
        status: "CONFIRMED", // Manual appointments are auto-confirmed
        notes: notes?.trim() || null,
        manualCustomerName: customerType === "new" ? customerName?.trim() : null,
        manualCustomerPhone: customerType === "new" ? customerPhone?.trim() : null,
      },
      include: {
        customer:
          customerType === "existing"
            ? {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              }
            : undefined,
        staff: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        shop: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Manual appointment created successfully",
      appointment: {
        id: appointment.id,
        date: utcToLocalDate(appointment.date), // YYYY-MM-DD format in local timezone
        startTime: extractTimeString(appointment.startTime),
        endTime: extractTimeString(appointment.endTime),
        status: appointment.status,
        customerName:
          appointment.manualCustomerName ||
          (appointment.customer
            ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
            : null),
        customerPhone:
          appointment.manualCustomerPhone || appointment.customer?.phone,
        staff: appointment.staff,
        shop: appointment.shop,
        notes: appointment.notes,
      },
    });
  } catch (error) {
    console.error("Error creating manual appointment:", error);
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
