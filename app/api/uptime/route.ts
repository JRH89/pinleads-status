import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const checksRef = db.collection('uptime_checks');
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const snapshot = await checksRef
      .where('createdAt', '>=', ninetyDaysAgo.toISOString())
      .orderBy('createdAt', 'asc')
      .get();
    
    const checks = snapshot.docs.map(doc => doc.data());
    
    // Calculate daily uptime statistics
    const dailyStats = new Map<string, { up: number; down: number; total: number }>();
    
    checks.forEach((check: any) => {
      const date = new Date(check.createdAt).toISOString().split('T')[0];
      const stats = dailyStats.get(date) || { up: 0, down: 0, total: 0 };
      
      if (check.status === 'up') {
        stats.up++;
      } else {
        stats.down++;
      }
      stats.total++;
      
      dailyStats.set(date, stats);
    });
    
    // Convert to array and calculate uptime percentage
    const dailyData = Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      uptime: stats.total > 0 ? (stats.up / stats.total) * 100 : 0,
      totalChecks: stats.total,
      downChecks: stats.down,
    }));
    
    // Calculate overall uptime
    const totalChecks = checks.length;
    const upChecks = checks.filter((c: any) => c.status === 'up').length;
    const overallUptime = totalChecks > 0 ? (upChecks / totalChecks) * 100 : 0;
    
    return NextResponse.json({
      overallUptime: Math.round(overallUptime * 100) / 100,
      dailyData,
      totalChecks,
      lastCheck: checks[checks.length - 1] || null,
    });
  } catch (error) {
    console.error('Failed to fetch uptime data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uptime data' },
      { status: 500 }
    );
  }
}
