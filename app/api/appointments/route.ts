import { PrismaClient } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date, staffId, startTime, notes } = await request.json()
    
    if (!date || !staffId || !startTime) {
      return NextResponse.json({ 
        error: 'Date, staffId, and startTime are required' 
      }, { status: 400 })
    }

    // Get default shop
    const shop = await prisma.shop.findFirst()
    if (!shop) {
      return NextResponse.json({ 
        error: 'No shop found' 
      }, { status: 500 })
    }

    // Calculate end time (45 minutes later)
    const startDateTime = new Date(`2000-01-01T${startTime}:00`)
    const endDateTime = new Date(startDateTime.getTime() + 45 * 60000) // Add 45 minutes
    const endTime = endDateTime.toTimeString().substring(0, 5)

    // Check if user exists in our database
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          phone: user.user_metadata?.phone || null,
          role: 'CUSTOMER'
        }
      })
    }

    // Check if time slot is still available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        staffId,
        date: new Date(date),
        startTime: new Date(`2000-01-01T${startTime}:00`)
      }
    })

    if (existingAppointment) {
      return NextResponse.json({ 
        error: 'This time slot is no longer available' 
      }, { status: 409 })
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        shopId: shop.id,
        customerId: dbUser.id,
        staffId,
        date: new Date(date),
        startTime: new Date(`2000-01-01T${startTime}:00`),
        endTime: new Date(`2000-01-01T${endTime}:00`),
        status: 'SCHEDULED',
        notes: notes || null,
        createdById: dbUser.id
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
        },
        shop: {
          select: {
            name: true,
            address: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Appointment created successfully',
      appointment 
    })
    
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}