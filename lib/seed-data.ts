import { PrismaClient } from "@prisma/client";
import { localDateToUTC, createUTCTime } from "@/lib/date-time";
import { BUSINESS_RULES } from "@/lib/constants";

const prisma = new PrismaClient();

export async function seedTestData() {
  try {
    // First, let's create a default shop
    let shop = await prisma.shop.findFirst();

    if (!shop) {
      shop = await prisma.shop.create({
        data: {
          name: "BerberApp Salon",
          slug: "berberapp-salon",
          description: "Modern berber salonu",
          address: "Çankaya, Ankara",
        },
      });
    }

    // Create staff members
    const staffMembers = [
      {
        email: "deniz.akbulut@berberapp.com",
        firstName: "Deniz",
        lastName: "Akbulut",
        phone: "0532 123 45 67",
        role: "BARBER" as const,
      },
      {
        email: "mert.kara@berberapp.com",
        firstName: "Mert",
        lastName: "Kara",
        phone: "0532 765 43 21",
        role: "EMPLOYEE" as const,
      },
    ];

    for (const member of staffMembers) {
      const existingMember = await prisma.user.findUnique({
        where: { email: member.email },
      });

      if (!existingMember) {
        const newMember = await prisma.user.create({
          data: member,
        });
        console.log(
          `Created staff member: ${member.firstName} ${member.lastName} with ID: ${newMember.id}`
        );
      } else {
        console.log(
          `Staff member already exists: ${member.firstName} ${member.lastName}`
        );
      }
    }

    console.log("Seed data completed successfully!");
    return { success: true, shop, staffMembers };
  } catch (error) {
    console.error("Error seeding data:", error);
    return { success: false, error };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAvailableTimeSlots(
  dateStr: string,
  staffId: string,
  timezone: string = "Europe/Istanbul"
): Promise<string[]> {
  const prisma = new PrismaClient();

  try {
    // Convert local date to UTC for database query
    const dateUTC = localDateToUTC(dateStr);

    // Get all appointments for this staff member on this date
    const appointments = await prisma.appointment.findMany({
      where: {
        staffId,
        date: dateUTC,
        status: {
          notIn: ["CANCELLED"],
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });


    // Get unavailable times for this staff member
    const unavailableTimes = await prisma.employeeUnavailableTime.findMany({
      where: {
        staffId,
        date: dateUTC,
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate all possible time slots
    const allSlots: string[] = [];

    // Parse working hours properly
    const [startHour, startMinute] = BUSINESS_RULES.WORKING_HOURS.start
      .split(":")
      .map(Number);
    const [endHour, endMinute] = BUSINESS_RULES.WORKING_HOURS.end
      .split(":")
      .map(Number);

    // Convert to minutes from midnight for easier calculation
    const startMinutes = startHour * 60 + startMinute; // 09:30 = 570 minutes
    const endMinutes = endHour * 60 + endMinute; // 21:30 = 1290 minutes

    // Generate slots from start time
    for (
      let currentMinutes = startMinutes;
      currentMinutes < endMinutes;
      currentMinutes += BUSINESS_RULES.APPOINTMENT_DURATION
    ) {
      // Check if slot + duration fits within working hours
      const slotEndMinutes =
        currentMinutes + BUSINESS_RULES.APPOINTMENT_DURATION;

      if (slotEndMinutes <= endMinutes) {
        const hour = Math.floor(currentMinutes / 60);
        const minute = currentMinutes % 60;
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        allSlots.push(timeStr);
      }
    }

    // Filter out booked slots
    const availableSlots = allSlots.filter((slot) => {
      const slotTimeUTC = createUTCTime(slot);

      // Check appointments
      const isBooked = appointments.some((apt) => {
        const aptStartTime = apt.startTime.getTime();
        const aptEndTime = apt.endTime.getTime();
        const slotTime = slotTimeUTC.getTime();

        return slotTime >= aptStartTime && slotTime < aptEndTime;
      });

      if (isBooked) return false;

      // Check unavailable times
      const isUnavailable = unavailableTimes.some((block) => {
        if (!block.startTime || !block.endTime) {
          // Full day block
          return true;
        }

        const blockStartTime = block.startTime.getTime();
        const blockEndTime = block.endTime.getTime();
        const slotTime = slotTimeUTC.getTime();

        return slotTime >= blockStartTime && slotTime < blockEndTime;
      });

      return !isUnavailable;
    });

    // For current date, also filter out past times
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-CA", { timeZone: timezone }); // YYYY-MM-DD format

    if (dateStr === todayStr) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      return availableSlots.filter((slot) => {
        const [slotHour, slotMinute] = slot.split(":").map(Number);
        return (
          slotHour > currentHour ||
          (slotHour === currentHour && slotMinute > currentMinute)
        );
      });
    }

    return availableSlots;
  } catch (error) {
    console.error("Error getting available time slots:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export async function getStaffMembers() {
  const prisma = new PrismaClient();

  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: ["EMPLOYEE", "BARBER"],
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: {
        firstName: "asc",
      },
    });

    return staff;
  } catch (error) {
    console.error("Error fetching staff members:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}
