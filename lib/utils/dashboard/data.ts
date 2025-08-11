import { prisma } from "@/lib/prisma";
import { extractTimeString } from "@/lib/utils";

// Priority 1: Critical data - Today's appointment count (fastest query)
export async function getCriticalDashboardData() {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    // Only today's appointments count - most critical for barbers
    const todayAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
      },
    });

    return { todayAppointments };
  } catch (error) {
    console.error("Error fetching critical dashboard data:", error);
    return { todayAppointments: 0 };
  }
}

// Priority 2: Important data - Today's customers and recent appointments
export async function getImportantDashboardData() {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    const [todayUniqueCustomers, recentAppointments] = await Promise.all([
      // Today's unique customers
      prisma.appointment.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: ["SCHEDULED", "CONFIRMED"],
          },
        },
        select: {
          customerId: true,
          manualCustomerPhone: true,
        },
        distinct: ["customerId", "manualCustomerPhone"],
      }),

      // Recent appointments (limited for performance)
      prisma.appointment.findMany({
        take: 3,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    // Format recent appointments
    const formattedRecentAppointments = recentAppointments.map(
      (appointment) => ({
        id: appointment.id,
        date: appointment.date,
        startTime: extractTimeString(appointment.startTime),
        status: appointment.status,
        customerName: appointment.customer
          ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
          : appointment.manualCustomerName || "Bilinmeyen",
        customerPhone:
          appointment.customer?.phone || appointment.manualCustomerPhone,
      })
    );

    return {
      todayCustomers: todayUniqueCustomers.length,
      recentAppointments: formattedRecentAppointments,
    };
  } catch (error) {
    console.error("Error fetching important dashboard data:", error);
    return {
      todayCustomers: 0,
      recentAppointments: [],
    };
  }
}

// Priority 3: Secondary data - Total statistics (slower queries)
export async function getSecondaryDashboardData() {
  try {
    const [totalUsers, totalCustomers] = await Promise.all([
      prisma.user.count({
        where: {
          isActive: true,
        },
      }),
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          isActive: true,
        },
      }),
    ]);

    return {
      totalUsers,
      totalCustomers,
    };
  } catch (error) {
    console.error("Error fetching secondary dashboard data:", error);
    return {
      totalUsers: 0,
      totalCustomers: 0,
    };
  }
}
