import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cleanup-old-checks
 * Deletes all uptime_checks that are older than today
 * Use this to clean up old individual checks after they've been aggregated
 */
export async function POST() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Get all checks older than today
    const checksRef = db.collection('uptime_checks');
    const snapshot = await checksRef
      .where('createdAt', '<', today.toISOString())
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No old checks to delete'
      });
    }

    // Delete all old checks in batches
    const batchSize = 500;
    let deletedCount = 0;
    let batch = db.batch();

    for (let i = 0; i < snapshot.docs.length; i++) {
      const doc = snapshot.docs[i];
      batch.delete(doc.ref);
      deletedCount++;

      // Execute batch when it reaches the limit or is the last document
      if (deletedCount % batchSize === 0 || i === snapshot.docs.length - 1) {
        await batch.commit();
        batch = db.batch();
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} old uptime checks (before ${todayStr})`
    });
  } catch (error) {
    console.error('Failed to cleanup old checks:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup old checks' },
      { status: 500 }
    );
  }
}
