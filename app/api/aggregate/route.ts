import { NextResponse } from 'next/server';
import { aggregateDailyUptime, aggregateDateRange, getLatestAggregatedDate } from '@/lib/aggregateDailyUptime';

export const dynamic = 'force-dynamic';

/**
 * POST /api/aggregate
 * Triggers aggregation of uptime data
 *
 * Query params:
 * - date: specific date to aggregate (YYYY-MM-DD)
 * - startDate: start date for range aggregation (YYYY-MM-DD)
 * - endDate: end date for range aggregation (YYYY-MM-DD)
 * - all: if true, aggregates all missing days up to today
 * - delete: if true, deletes individual checks after aggregation (default: false)
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const all = searchParams.get('all') === 'true';
    const deleteOldChecks = searchParams.get('delete') === 'true';

    if (date) {
      // Aggregate specific date
      const stats = await aggregateDailyUptime(date, deleteOldChecks);
      return NextResponse.json({
        success: true,
        message: `Aggregated data for ${date}${deleteOldChecks ? ' (deleted old checks)' : ''}`,
        stats
      });
    }

    if (startDate && endDate) {
      // Aggregate date range
      await aggregateDateRange(new Date(startDate), new Date(endDate), deleteOldChecks);
      return NextResponse.json({
        success: true,
        message: `Aggregated data from ${startDate} to ${endDate}${deleteOldChecks ? ' (deleted old checks)' : ''}`
      });
    }

    if (all) {
      // Aggregate all missing days from the last aggregated date to today
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

      await aggregateDateRange(startDate, endDate, deleteOldChecks);
      return NextResponse.json({
        success: true,
        message: `Aggregated all missing days from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}${deleteOldChecks ? ' (deleted old checks)' : ''}`
      });
    }

    // Default: aggregate yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const stats = await aggregateDailyUptime(yesterdayStr, deleteOldChecks);
    return NextResponse.json({
      success: true,
      message: `Aggregated data for ${yesterdayStr}${deleteOldChecks ? ' (deleted old checks)' : ''}`,
      stats
    });
  } catch (error) {
    console.error('Failed to aggregate uptime data:', error);
    return NextResponse.json(
      { error: 'Failed to aggregate uptime data' },
      { status: 500 }
    );
  }
}
