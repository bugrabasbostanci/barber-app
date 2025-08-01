import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from "next/server";
import { localDateToUTC, createUTCTime, extractTimeString, utcToLocalDate } from "@/lib/date-time";
import { withAuth, requireBarber, AuthenticatedUser } from "@/lib/middleware/api-auth";

// GET - Fetch appointments for barber dashboard
async function getAppointments(request: NextRequest, user: AuthenticatedUser) {
  try {
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
      // Create date range that covers the entire day in UTC
      const startUTC = new Date(startDate + 'T00:00:00.000Z');
      const endUTC = new Date(endDate + 'T23:59:59.999Z');
      
      whereClause.date = {
        gte: startUTC,
        lte: endUTC,
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

    return NextResponse.json({
      success: true,
      data: formattedAppointments
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// POST - Create manual appointment for barber
async function createManualAppointment(request: NextRequest, user: AuthenticatedUser) {
  try {
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
          success: false,
          error: "Date, staffId, and startTime are required",
        },
        { status: 400 }
      );
    }

    if (customerType === "new" && (!customerName?.trim() || !customerPhone?.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer name and phone are required for new customers",
        },
        { status: 400 }
      );
    }

    if (customerType === "existing" && !existingCustomerId) {
      return NextResponse.json(
        {
          success: false,
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
          success: false,
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
          success: false,
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
      data: {
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
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Export protected endpoints
export const GET = withAuth(requireBarber())(getAppointments);
export const POST = withAuth(requireBarber())(createManualAppointment);