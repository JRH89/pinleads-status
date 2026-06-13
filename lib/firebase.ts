import admin from 'firebase-admin';

if (!admin.apps.length) {
  // Try to use SERVICE_ACCOUNT_KEY if available (full JSON)
  if (process.env.SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error('Failed to parse SERVICE_ACCOUNT_KEY:', error);
    }
  } else {
    // Fall back to individual environment variables
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  }
}

export const db = admin.firestore();
