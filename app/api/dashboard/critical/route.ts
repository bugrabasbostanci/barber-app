import { NextResponse } from 'next/server';
import { getCriticalDashboardData } from '@/lib/dashboard-data';

export async function GET() {
  try {
    const data = await getCriticalDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching critical dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}