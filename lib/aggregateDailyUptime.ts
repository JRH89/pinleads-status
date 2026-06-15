import { db } from '@/lib/firebase';

export interface DailyUptimeStats {
  date: string;
  uptime: number;
  totalChecks: number;
  upChecks: number;
  downChecks: number;
  aggregatedAt: string;
}

/**
 * Aggregates uptime checks for a specific date and stores the result
 * in the daily_uptime collection
 * 
 * @param date - Date to aggregate (YYYY-MM-DD format)
 * @param deleteOldChecks - If true, deletes individual checks after aggregation (default: false)
 */
export async function aggregateDailyUptime(date: string, deleteOldChecks: boolean = false): Promise<DailyUptimeStats> {
  // Fetch all checks for the specific date by filtering on the date string
  const checksRef = db.collection('uptime_checks');
  const snapshot = await checksRef
    .where('createdAt', '>=', new Date(date).toISOString())
    .where('createdAt', '<', new Date(date + 'T23:59:59.999Z').toISOString())
    .get();

  const checks = snapshot.docs.map(doc => doc.data());

  // Filter to only include checks that match the date string (handles timezone)
  const filteredChecks = checks.filter((check: any) => {
    const checkDate = new Date(check.createdAt).toISOString().split('T')[0];
    return checkDate === date;
  });

  console.log(`Found ${filteredChecks.length} checks for ${date} (after timezone filter)`);
  
  // If no data for this day, create a "fake" 100% uptime entry
  if (filteredChecks.length === 0) {
    console.log(`No checks found for ${date}, creating 100% uptime entry`);
    const fakeStats: DailyUptimeStats = {
      date,
      uptime: 100,
      totalChecks: 0,
      upChecks: 0,
      downChecks: 0,
      aggregatedAt: new Date().toISOString(),
    };
    
    await db.collection('daily_uptime').doc(date).set(fakeStats);
    return fakeStats;
  }

  if (filteredChecks.length > 0) {
    console.log('Sample check:', filteredChecks[0]);
    console.log('Status values:', filteredChecks.map((c: any) => c.status));
  }

  // Calculate statistics
  const totalChecks = filteredChecks.length;
  const upChecks = filteredChecks.filter((c: any) => c.status === 'up').length;
  const downChecks = filteredChecks.filter((c: any) => c.status === 'down').length;
  const uptime = totalChecks > 0 ? (upChecks / totalChecks) * 100 : 0;

  const dailyStats: DailyUptimeStats = {
    date,
    uptime: Math.round(uptime * 100) / 100,
    totalChecks,
    upChecks,
    downChecks,
    aggregatedAt: new Date().toISOString(),
  };

  // Store or update the aggregated data
  await db.collection('daily_uptime').doc(date).set(dailyStats);

  console.log(`Aggregated uptime for ${date}: ${dailyStats.uptime.toFixed(2)}% (${totalChecks} checks)`);

  // Delete individual checks if requested
  if (deleteOldChecks && filteredChecks.length > 0) {
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      const checkDate = new Date(doc.data().createdAt).toISOString().split('T')[0];
      if (checkDate === date) {
        batch.delete(doc.ref);
      }
    });
    await batch.commit();
    console.log(`Deleted ${snapshot.docs.length} individual checks for ${date}`);
  }
  
  return dailyStats;
}

/**
 * Aggregates uptime for all dates from start date to end date
 * 
 * @param startDate - Start date for aggregation
 * @param endDate - End date for aggregation
 * @param deleteOldChecks - If true, deletes individual checks after aggregation (default: false)
 */
export async function aggregateDateRange(startDate: Date, endDate: Date, deleteOldChecks: boolean = false): Promise<void> {
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    await aggregateDailyUptime(dateStr, deleteOldChecks);
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

/**
 * Gets the latest date that has been aggregated
 */
export async function getLatestAggregatedDate(): Promise<string | null> {
  const snapshot = await db
    .collection('daily_uptime')
    .orderBy('date', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].id;
}
