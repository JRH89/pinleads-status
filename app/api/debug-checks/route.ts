import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const checksRef = db.collection('uptime_checks');
    const snapshot = await checksRef
      .where('createdAt', '>=', startOfDay.toISOString())
      .where('createdAt', '<=', endOfDay.toISOString())
      .limit(10)
      .get();

    const checks = snapshot.docs.map(doc => doc.data());

    // Get a sample of all checks to see status values
    const allSnapshot = await checksRef
      .where('createdAt', '>=', startOfDay.toISOString())
      .where('createdAt', '<=', endOfDay.toISOString())
      .get();

    const allChecks = allSnapshot.docs.map(doc => doc.data());
    const statusCounts = allChecks.reduce((acc: any, check: any) => {
      acc[check.status] = (acc[check.status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      date,
      totalChecks: allChecks.length,
      statusCounts,
      sampleChecks: checks,
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Failed to debug checks' },
      { status: 500 }
    );
  }
}
