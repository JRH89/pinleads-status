import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch aggregated daily data for the last 90 days
    const dailyUptimeRef = db.collection('daily_uptime');
    const dailySnapshot = await dailyUptimeRef
      .where('date', '>=', ninetyDaysAgo.toISOString().split('T')[0])
      .where('date', '<', today) // Exclude today (not complete yet)
      .orderBy('date', 'asc')
      .get();
    
    const dailyData = dailySnapshot.docs.map(doc => doc.data());
    
    // Calculate overall uptime from aggregated data
    let totalChecks = 0;
    let totalUpChecks = 0;
    
    dailyData.forEach((day: any) => {
      totalChecks += day.totalChecks;
      totalUpChecks += day.upChecks;
    });
    
    // Fetch individual checks for today only (current day is not aggregated yet)
    const checksRef = db.collection('uptime_checks');
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    
    const todaySnapshot = await checksRef
      .where('createdAt', '>=', startOfToday.toISOString())
      .orderBy('createdAt', 'asc')
      .get();
    
    const todayChecks = todaySnapshot.docs.map(doc => doc.data());
    
    // Add today's checks to the totals
    if (todayChecks.length > 0) {
      const todayUpChecks = todayChecks.filter((c: any) => c.status === 'up').length;
      totalChecks += todayChecks.length;
      totalUpChecks += todayUpChecks;
      
      // Calculate today's stats for display
      const todayStats = {
        date: today,
        uptime: (todayUpChecks / todayChecks.length) * 100,
        totalChecks: todayChecks.length,
        downChecks: todayChecks.length - todayUpChecks,
      };
      
      dailyData.push(todayStats);
    }
    
    const overallUptime = totalChecks > 0 ? (totalUpChecks / totalChecks) * 100 : 0;
    
    // Get the last check (most recent individual check)
    const lastCheck = todayChecks.length > 0 
      ? todayChecks[todayChecks.length - 1] 
      : dailyData.length > 0 
        ? await getLastCheckBeforeToday(today)
        : null;
    
    return NextResponse.json({
      overallUptime: Math.round(overallUptime * 100) / 100,
      dailyData,
      totalChecks,
      lastCheck,
    });
  } catch (error) {
    console.error('Failed to fetch uptime data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uptime data' },
      { status: 500 }
    );
  }
}

async function getLastCheckBeforeToday(today: string) {
  const checksRef = db.collection('uptime_checks');
  const snapshot = await checksRef
    .where('createdAt', '<', today)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}
