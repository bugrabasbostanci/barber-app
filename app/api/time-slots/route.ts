import { getAvailableTimeSlots } from '@/lib/seed-data'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const staffId = searchParams.get('staffId')
    
    if (!date || !staffId) {
      return NextResponse.json({ 
        error: 'Date and staffId are required' 
      }, { status: 400 })
    }
    
    const availableSlots = await getAvailableTimeSlots(date, staffId)
    
    return NextResponse.json(availableSlots)
    
  } catch (error) {
    console.error('Error fetching time slots:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}