import { localDateToUTC, createUTCTime } from "@/lib/utils";
import { BUSINESS_RULES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

export async function seedTestData() {
  try {
    console.log('🏪 Creating demo shop...');
    
    // Create a professional demo shop
    let shop = await prisma.shop.findFirst();

    if (!shop) {
      shop = await prisma.shop.create({
        data: {
          name: "BarberApp Studio",
          slug: "barberapp-studio",
          description: "Premium men's barber services and grooming. Traditional straight razor shaving, modern haircuts, and specialized care services.",
          address: "Downtown Business District, Main Street 125/A, City Center",
        },
      });
      console.log('✓ Demo shop created');
    }

    console.log('👥 Creating demo staff members...');
    
    // Create professional staff members
    const staffMembers = [
      {
        email: "michael.johnson@barberapp.com",
        firstName: "Michael",
        lastName: "Johnson",
        phone: "+1 (555) 123-4567",
        role: "BARBER" as const,
      },
      {
        email: "david.smith@barberapp.com",
        firstName: "David",
        lastName: "Smith",
        phone: "+1 (555) 234-5678",
        role: "BARBER" as const,
      },
      {
        email: "alex.brown@barberapp.com",
        firstName: "Alex",
        lastName: "Brown",
        phone: "+1 (555) 345-6789",
        role: "EMPLOYEE" as const,
      },
    ];

    const createdStaff = [];
    for (const member of staffMembers) {
      const existingMember = await prisma.user.findUnique({
        where: { email: member.email },
      });

      if (!existingMember) {
        const newMember = await prisma.user.create({
          data: member,
        });
        createdStaff.push(newMember);
        console.log(`✓ Created staff: ${member.firstName} ${member.lastName}`);
      } else {
        createdStaff.push(existingMember);
        console.log(`✓ Staff exists: ${member.firstName} ${member.lastName}`);
      }
    }

    console.log('👥 Creating demo customers...');
    
    // Create demo customers
    const customers = [
      {
        email: "john.wilson@gmail.com",
        firstName: "John",
        lastName: "Wilson",
        phone: "+1 (555) 456-7890",
        role: "CUSTOMER" as const,
      },
      {
        email: "robert.davis@outlook.com",
        firstName: "Robert",
        lastName: "Davis",
        phone: "+1 (555) 567-8901",
        role: "CUSTOMER" as const,
      },
      {
        email: "james.miller@yahoo.com",
        firstName: "James",
        lastName: "Miller",
        phone: "+1 (555) 678-9012",
        role: "CUSTOMER" as const,
      },
      {
        email: "william.garcia@hotmail.com",
        firstName: "William",
        lastName: "Garcia",
        phone: "+1 (555) 789-0123",
        role: "CUSTOMER" as const,
      },
    ];

    const createdCustomers = [];
    for (const customer of customers) {
      const existing = await prisma.user.findUnique({
        where: { email: customer.email },
      });

      if (!existing) {
        const newCustomer = await prisma.user.create({
          data: customer,
        });
        createdCustomers.push(newCustomer);
        console.log(`✓ Created customer: ${customer.firstName} ${customer.lastName}`);
      } else {
        createdCustomers.push(existing);
        console.log(`✓ Customer exists: ${customer.firstName} ${customer.lastName}`);
      }
    }

    console.log('📅 Creating demo appointments...');
    
    // Create realistic appointments for the next few days
    const today = new Date();
    const appointments = [];
    
    // Create appointments for today, tomorrow, and day after tomorrow
    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const appointmentDate = new Date(today);
      appointmentDate.setDate(today.getDate() + dayOffset);
      
      // Skip Sundays (business rule)
      if (appointmentDate.getDay() === 0) continue;
      
      const dateUTC = localDateToUTC(appointmentDate.toLocaleDateString('en-CA'));
      
      // Create some appointments for each day
      const dayAppointments = [
        {
          staffId: createdStaff[0].id, // Michael
          customerId: createdCustomers[0].id, // John
          startTime: "10:00",
          status: dayOffset === 0 ? AppointmentStatus.COMPLETED : AppointmentStatus.CONFIRMED,
          notes: dayOffset === 0 ? "Haircut and beard trim completed successfully." : "Haircut + beard trim"
        },
        {
          staffId: createdStaff[0].id, // Michael
          customerId: createdCustomers[1].id, // Robert
          startTime: "11:00",
          status: dayOffset === 0 ? AppointmentStatus.COMPLETED : AppointmentStatus.SCHEDULED,
          notes: "Classic straight razor shave"
        },
        {
          staffId: createdStaff[1].id, // David
          customerId: createdCustomers[2].id, // James
          startTime: "14:30",
          status: dayOffset === 0 ? AppointmentStatus.COMPLETED : AppointmentStatus.CONFIRMED,
          notes: "Modern haircut and styling"
        },
        {
          staffId: createdStaff[2].id, // Alex
          customerId: createdCustomers[3].id, // William
          startTime: "16:15",
          status: dayOffset === 1 ? AppointmentStatus.SCHEDULED : AppointmentStatus.CONFIRMED,
          notes: "Hair wash + cut + styling"
        },
        {
          staffId: createdStaff[1].id, // David
          customerId: null, // Manual appointment
          manualCustomerName: "Thomas Anderson",
          manualCustomerPhone: "+1 (555) 890-1234",
          startTime: "18:00",
          status: AppointmentStatus.SCHEDULED,
          notes: "Haircut (walk-in appointment)"
        }
      ];
      
      for (const apt of dayAppointments) {
        try {
          const startTimeUTC = createUTCTime(apt.startTime);
          const endTimeUTC = new Date(startTimeUTC.getTime() + BUSINESS_RULES.APPOINTMENT_DURATION * 60000);
          
          const appointment = await prisma.appointment.create({
            data: {
              shopId: shop.id,
              customerId: apt.customerId,
              staffId: apt.staffId,
              date: dateUTC,
              startTime: startTimeUTC,
              endTime: endTimeUTC,
              status: apt.status,
              notes: apt.notes,
              manualCustomerName: apt.manualCustomerName || null,
              manualCustomerPhone: apt.manualCustomerPhone || null,
            },
          });
          appointments.push(appointment);
        } catch (error) {
          console.warn(`Could not create appointment for ${apt.startTime} on day ${dayOffset}:`, error);
        }
      }
    }
    
    console.log(`✓ Created ${appointments.length} demo appointments`);

    console.log('⏰ Creating demo blocked times...');
    
    // Create some blocked times to show the feature
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (tomorrow.getDay() !== 0) { // Not Sunday
      const tomorrowUTC = localDateToUTC(tomorrow.toLocaleDateString('en-CA'));
      
      await prisma.employeeUnavailableTime.create({
        data: {
          staffId: createdStaff[0].id, // Michael
          date: tomorrowUTC,
          startTime: createUTCTime('13:00'),
          endTime: createUTCTime('14:00'),
          reason: 'Lunch break'
        }
      });
      
      console.log('✓ Created demo blocked time');
    }

    console.log('✅ Demo data created successfully!');
    return { 
      success: true, 
      shop, 
      staff: createdStaff,
      customers: createdCustomers,
      appointmentsCount: appointments.length
    };
  } catch (error) {
    console.error('❌ Error creating demo data:', error);
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
