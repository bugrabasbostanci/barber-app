import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

    if (customerType === "new" && (!customerName || !customerPhone)) {
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

    // Calculate end time (45 minutes later)
    const startDateTime = new Date(`2000-01-01T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 45 * 60000); // Add 45 minutes
    const endTime = endDateTime.toTimeString().substring(0, 5);

    // Check if time slot is still available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        staffId,
        date: new Date(date),
        startTime: new Date(`2000-01-01T${startTime}:00`),
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
        date: new Date(date),
        startTime: new Date(`2000-01-01T${startTime}:00`),
        endTime: new Date(`2000-01-01T${endTime}:00`),
        status: "CONFIRMED", // Manual appointments are auto-confirmed
        notes: notes || null,
        manualCustomerName: customerType === "new" ? customerName : null,
        manualCustomerPhone: customerType === "new" ? customerPhone : null,
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
        date: appointment.date.toISOString().split("T")[0],
        startTime: appointment.startTime.toTimeString().substring(0, 5),
        endTime: appointment.endTime.toTimeString().substring(0, 5),
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
