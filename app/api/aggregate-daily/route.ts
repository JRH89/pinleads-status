import { NextResponse } from 'next/server';
import { aggregateDailyUptime } from '@/lib/aggregateDailyUptime';

export const dynamic = 'force-dynamic';

/**
 * POST /api/aggregate-daily
 * Cron job endpoint that aggregates yesterday's data and deletes old checks
 * This is called by Vercel cron at 00:05 UTC daily
 */
export async function POST() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Aggregate yesterday's data and delete the individual checks
    const stats = await aggregateDailyUptime(yesterdayStr, true);

    return NextResponse.json({
      success: true,
      message: `Aggregated data for ${yesterdayStr} and deleted old checks`,
      stats
    });
  } catch (error) {
    console.error('Failed to aggregate daily uptime data:', error);
    return NextResponse.json(
      { error: 'Failed to aggregate daily uptime data' },
      { status: 500 }
    );
  }
}
