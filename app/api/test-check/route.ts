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
