import { NextResponse } from 'next/server';
import { getImportantDashboardData } from '@/lib/utils';

export async function GET() {
  try {
    const data = await getImportantDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching important dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}