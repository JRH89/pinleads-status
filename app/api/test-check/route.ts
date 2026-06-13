import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { checkUptime } from '@/lib/uptimeChecker';

export const dynamic = 'force-dynamic';

export async function GET() {
  const targetUrl = process.env.TARGET_URL || 'https://pinleads.org';
  
  try {
    const result = await checkUptime(targetUrl);
    
    // Store the check result in Firestore
    const checksRef = db.collection('uptime_checks');
    await checksRef.add({
      ...result,
      url: targetUrl,
      createdAt: new Date(result.timestamp).toISOString(),
    });
    
    // Clean up old checks (older than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const oldChecks = await checksRef
      .where('createdAt', '<', ninetyDaysAgo.toISOString())
      .limit(500)
      .get();
    
    if (!oldChecks.empty) {
      const batch = db.batch();
      oldChecks.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }
    
    return NextResponse.json({ 
      success: true, 
      status: result.status,
      responseTime: result.responseTime,
      httpStatus: result.error || 'N/A',
    });
  } catch (error) {
    console.error('Uptime check failed:', error);
    return NextResponse.json(
      { error: 'Uptime check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
