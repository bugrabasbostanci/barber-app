import { NextResponse } from 'next/server';
import { getSecondaryDashboardData } from '@/lib/utils';

export async function GET() {
  try {
    const data = await getSecondaryDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching secondary dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}