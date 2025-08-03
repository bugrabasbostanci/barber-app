import { NextResponse } from 'next/server'
import { checkUserRole } from '@/lib/admin-actions'

export async function GET() {
  try {
    const userRole = await checkUserRole()
    
    if (!userRole) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      role: userRole.role,
      isActive: userRole.isActive
    })

  } catch (error) {
    console.error('Error in check-role API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}