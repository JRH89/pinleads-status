import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Get all documents in daily_uptime collection
    const snapshot = await db.collection('daily_uptime').get();
    
    // Delete all documents
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${snapshot.docs.length} aggregated daily uptime documents` 
    });
  } catch (error) {
    console.error('Failed to clear aggregated data:', error);
    return NextResponse.json(
      { error: 'Failed to clear aggregated data' },
      { status: 500 }
    );
  }
}
