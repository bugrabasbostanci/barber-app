import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedTestData() {
  try {
    // First, let's create a default shop
    let shop = await prisma.shop.findFirst()
    
    if (!shop) {
      shop = await prisma.shop.create({
        data: {
          name: 'BerberApp Salon',
          slug: 'berberapp-salon',
          description: 'Modern berber salonu',
          address: 'Çankaya, Ankara'
        }
      })
    }

    // Create staff members
    const staffMembers = [
      {
        email: 'deniz.akbulut@berberapp.com',
        firstName: 'Deniz',
        lastName: 'Akbulut',
        phone: '0532 123 45 67',
        role: 'BARBER' as const
      },
      {
        email: 'mert.kara@berberapp.com', 
        firstName: 'Mert',
        lastName: 'Kara',
        phone: '0532 765 43 21',
        role: 'EMPLOYEE' as const
      }
    ]

    for (const member of staffMembers) {
      const existingMember = await prisma.user.findUnique({
        where: { email: member.email }
      })

      if (!existingMember) {
        const newMember = await prisma.user.create({
          data: member
        })
        console.log(`Created staff member: ${member.firstName} ${member.lastName} with ID: ${newMember.id}`)
      } else {
        console.log(`Staff member already exists: ${member.firstName} ${member.lastName}`)
      }
    }

    console.log('Seed data completed successfully!')
    return { success: true, shop, staffMembers }

  } catch (error) {
    console.error('Error seeding data:', error)
    return { success: false, error }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getStaffMembers() {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: ['EMPLOYEE', 'BARBER']
        },
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true
      },
      orderBy: [
        { role: 'desc' }, // BARBER first
        { firstName: 'asc' }
      ]
    })

    return staff
  } catch (error) {
    console.error('Error fetching staff members:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

export async function getAvailableTimeSlots(date: string, staffId: string) {
  try {
    // Get existing appointments for this staff and date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        staffId,
        date: new Date(date)
      },
      select: {
        startTime: true,
        endTime: true
      }
    })

    // Get unavailable times for this staff and date
    const unavailableTimes = await prisma.employeeUnavailableTime.findMany({
      where: {
        staffId,
        date: new Date(date)
      }
    })

    // Generate all possible time slots (09:30 - 21:30, 45 min intervals)
    const allSlots: string[] = []
    const currentTime = new Date(`2000-01-01T09:30:00`)
    const endTime = new Date(`2000-01-01T21:30:00`)

    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().substring(0, 5)
      allSlots.push(timeString)
      currentTime.setMinutes(currentTime.getMinutes() + 45)
    }

    // Filter out unavailable slots
    const availableSlots = allSlots.filter(slot => {
      // Check against existing appointments
      const isBooked = existingAppointments.some(apt => {
        const aptStart = apt.startTime.toTimeString().substring(0, 5)
        return aptStart === slot
      })

      // Check against unavailable times
      const isUnavailable = unavailableTimes.some(unavail => {
        if (!unavail.startTime || !unavail.endTime) {
          // Full day unavailable
          return true
        }
        
        const unavailStart = unavail.startTime.toTimeString().substring(0, 5)
        const unavailEnd = unavail.endTime.toTimeString().substring(0, 5)
        
        return slot >= unavailStart && slot < unavailEnd
      })

      return !isBooked && !isUnavailable
    })

    return availableSlots
  } catch (error) {
    console.error('Error fetching available time slots:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}