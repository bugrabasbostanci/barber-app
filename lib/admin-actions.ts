import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { extractTimeString } from '@/lib/utils'

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

    // Get today's unique customers
    const todayUniqueCustomers = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      },
      select: {
        customerId: true,
        manualCustomerPhone: true
      },
      distinct: ['customerId', 'manualCustomerPhone']
    })

    // Get total users count
    const totalUsers = await prisma.user.count({
      where: {
        isActive: true
      }
    })

    // Get total customers count
    const totalCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        isActive: true
      }
    })

    return {
      todayAppointments,
      todayCustomers: todayUniqueCustomers.length,
      totalUsers,
      totalCustomers
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      todayAppointments: 0,
      todayCustomers: 0,
      totalUsers: 0,
      totalCustomers: 0
    }
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
      startTime: extractTimeString(appointment.startTime), // UTC time extracted correctly
      endTime: extractTimeString(appointment.endTime), // UTC time extracted correctly
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
      startTime: extractTimeString(appointment.startTime), // UTC time extracted correctly
      endTime: extractTimeString(appointment.endTime), // UTC time extracted correctly
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

    // If user not found by ID, try to find by email (for demo users)
    if (!dbUser) {
      console.log(`User not found by ID (${user.id}), checking by email (${user.email})`)
      
      dbUser = await prisma.user.findFirst({
        where: { email: user.email },
        select: { role: true, isActive: true }
      })
      
      if (dbUser) {
        console.log(`Found user by email: ${user.email}`)
      } else {
        console.log('User not found in database by email either, attempting to create...')
        
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
          console.log(`Created new user: ${userData.email}`)
        } catch (createError) {
          console.error('Error creating user in database:', createError)
          return null
        }
      }
    }

    return dbUser
  } catch (error) {
    console.error('Error checking user role:', error)
    return null
  }
}