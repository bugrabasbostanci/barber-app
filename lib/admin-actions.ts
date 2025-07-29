import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    // Get today's appointments
    const todayAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      }
    })

    // Get active staff count (include both EMPLOYEE and BARBER roles)
    const activeStaff = await prisma.user.count({
      where: {
        role: {
          in: ['EMPLOYEE', 'BARBER']
        },
        isActive: true
      }
    })

    // Calculate capacity usage (simplified for now)
    const totalSlots = 24 // Example: 24 slots per day (45min each from 9:30-21:30)
    const capacityUsage = Math.round((todayAppointments / totalSlots) * 100)

    return {
      todayAppointments,
      activeStaff,
      capacityUsage
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      todayAppointments: 0,
      activeStaff: 0,
      capacityUsage: 0
    }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getTodayAppointments() {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        staff: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // Format the data to match the component interface
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      date: appointment.date,
      startTime: appointment.startTime.toTimeString().substring(0, 5), // HH:MM format
      endTime: appointment.endTime.toTimeString().substring(0, 5), // HH:MM format
      status: appointment.status,
      notes: appointment.notes,
      manualCustomerName: appointment.manualCustomerName,
      manualCustomerPhone: appointment.manualCustomerPhone,
      customer: appointment.customer,
      staff: appointment.staff,
      createdAt: appointment.createdAt
    }))

    return formattedAppointments
  } catch (error) {
    console.error('Error fetching today appointments:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

export async function getRecentAppointments(limit = 10) {
  try {
    const appointments = await prisma.appointment.findMany({
      take: limit,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        staff: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the data to match the component interface
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      date: appointment.date,
      startTime: appointment.startTime.toTimeString().substring(0, 5), // HH:MM format
      endTime: appointment.endTime.toTimeString().substring(0, 5), // HH:MM format
      status: appointment.status,
      notes: appointment.notes,
      manualCustomerName: appointment.manualCustomerName,
      manualCustomerPhone: appointment.manualCustomerPhone,
      customer: appointment.customer,
      staff: appointment.staff,
      createdAt: appointment.createdAt
    }))

    return formattedAppointments
  } catch (error) {
    console.error('Error fetching recent appointments:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

export async function checkUserRole() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, isActive: true }
    })

    // If user not found in database, try to create them
    if (!dbUser) {
      console.log('User not found in database, attempting to create...')
      
      const userData = {
        email: user.email!,
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || undefined
      }
      
      try {
        const newUser = await prisma.user.create({
          data: {
            id: user.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            role: 'CUSTOMER'
          },
          select: { role: true, isActive: true }
        })
        
        dbUser = newUser
      } catch (createError) {
        console.error('Error creating user in database:', createError)
        return null
      }
    }

    return dbUser
  } catch (error) {
    console.error('Error checking user role:', error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}