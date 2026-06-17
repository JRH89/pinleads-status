import { NextResponse } from 'next/server';
import { aggregateDateRange, getLatestAggregatedDate } from '@/lib/aggregateDailyUptime';

export const dynamic = 'force-dynamic';

/**
 * POST /api/aggregate-daily
 * Cron job endpoint that aggregates all missing days and deletes old checks
 * This is called by Vercel cron at 00:05 UTC daily
 */
export async function POST() {
  try {
    // Get the latest aggregated date
    const latestAggregated = await getLatestAggregatedDate();
    const startDate = latestAggregated
      ? new Date(latestAggregated)
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago if no data

    // Start from the day after the latest aggregated date
    startDate.setDate(startDate.getDate() + 1);

    const endDate = new Date();
    // Don't aggregate today (it's not complete yet)
    endDate.setDate(endDate.getDate() - 1);

    if (startDate > endDate) {
      return NextResponse.json({
        success: true,
        message: 'No missing days to aggregate'
      });
    }

    // Aggregate all missing days and delete the individual checks
    await aggregateDateRange(startDate, endDate, true);

    return NextResponse.json({
      success: true,
      message: `Aggregated all missing days from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]} and deleted old checks`
    });
  } catch (error) {
    console.error('Failed to aggregate daily uptime data:', error);
    return NextResponse.json(
      { error: 'Failed to aggregate daily uptime data' },
      { status: 500 }
    );
  }
}
