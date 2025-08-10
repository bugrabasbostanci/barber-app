import { localDateToUTC, createUTCTime } from "@/lib/date-time";
import { BUSINESS_RULES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

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
  }
}

export async function getAvailableTimeSlots(
  dateStr: string,
  staffId: string,
  timezone: string = "Europe/Istanbul"
): Promise<string[]> {
  try {
    // Convert local date to UTC for database query
    const dateUTC = localDateToUTC(dateStr);

    // Get all appointments for this staff member on this date
    const appointments = await prisma.appointment.findMany({
      where: {
        staffId,
        date: dateUTC,
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
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
      // Get current Turkish time properly
      const now = new Date();
      const turkeyTime = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Istanbul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).formatToParts(now);

      const currentHour = parseInt(turkeyTime.find(part => part.type === 'hour')?.value || '0');
      const currentMinute = parseInt(turkeyTime.find(part => part.type === 'minute')?.value || '0');

      console.log(`DEBUG: Current Turkish time: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
      console.log(`DEBUG: Requested date: ${dateStr}, Today: ${todayStr}`);
      console.log(`DEBUG: Total available slots before filtering: ${availableSlots.length}`);

      // Filter slots: show only slots that are at least 1 hour from now
      const filteredSlots = availableSlots.filter((slot) => {
        const [slotHour, slotMinute] = slot.split(":").map(Number);
        
        // Convert times to minutes for easier comparison
        const slotTimeInMinutes = slotHour * 60 + slotMinute;
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const oneHourFromNowInMinutes = currentTimeInMinutes + 60; // 1 hour buffer
        
        const isAvailable = slotTimeInMinutes >= oneHourFromNowInMinutes;
        
        console.log(`DEBUG: Slot ${slot} (${slotHour}:${slotMinute.toString().padStart(2, '0')} = ${slotTimeInMinutes} min) vs Current+1hour (${Math.floor(oneHourFromNowInMinutes/60)}:${(oneHourFromNowInMinutes%60).toString().padStart(2, '0')} = ${oneHourFromNowInMinutes} min) = ${isAvailable ? 'KEEP' : 'FILTER'}`);
        
        return isAvailable;
      });

      console.log(`DEBUG: Filtered slots count: ${filteredSlots.length}`);
      console.log(`DEBUG: Kept slots:`, filteredSlots);
      return filteredSlots;
    }

    console.log(`DEBUG: Final available slots for ${dateStr}:`, availableSlots);
    return availableSlots;
  } catch (error) {
    console.error("Error getting available time slots:", error);
    return [];
  }
}

export async function getStaffMembers() {
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
  }
}
