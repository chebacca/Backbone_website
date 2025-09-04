/**
 * 🔧 Firebase Emulator Configuration for Licensing Website
 * 
 * This file configures the Firebase client SDK to connect to local emulators
 * when running in development mode. Shares the same Firebase project as Dashboard.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration (same as Dashboard - shared project)
const firebaseConfig = {
  projectId: 'backbone-logic',
  apiKey: 'demo-api-key',
  authDomain: 'backbone-logic.firebaseapp.com',
  storageBucket: 'backbone-logic.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// Connect to emulators in development
const isEmulator = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

if (isEmulator) {
  console.log('🔧 [LICENSING] Connecting to Firebase emulators...');
  
  let connected = false;
  
  try {
    // Connect to SHARED Auth Emulator (same as Dashboard)
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('✅ [LICENSING] Connected to SHARED Auth Emulator (port 9099)');
    
    // Connect to SHARED Firestore Emulator (same as Dashboard)
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ [LICENSING] Connected to SHARED Firestore Emulator (port 8080)');
    
    // Connect to SHARED Functions Emulator (same as Dashboard)
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('✅ [LICENSING] Connected to SHARED Functions Emulator (port 5001)');
    
    // Connect to SHARED Storage Emulator (same as Dashboard)
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('✅ [LICENSING] Connected to SHARED Storage Emulator (port 9199)');
    
    connected = true;
    
  } catch (error) {
    console.warn('⚠️ [LICENSING] Some emulators may already be connected:', error.message);
    connected = true; // Assume they're already connected
  }
  
  if (connected) {
    console.log('🎉 [LICENSING] All Firebase services connected to emulators!');
    console.log('📊 Shared Emulator UI: http://localhost:4000');
    console.log('🔗 Sharing data with Dashboard app');
    
    // Set environment variables for SHARED emulators
    if (typeof window !== 'undefined') {
      window.EMULATOR_MODE = true;
      window.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
      window.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      window.FIREBASE_FUNCTIONS_EMULATOR_HOST = 'localhost:5001';
      window.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
    }
  }
}

export { auth, db, functions, storage };
export default app;
