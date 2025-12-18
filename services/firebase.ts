import { initializeApp, getApps, getApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";

// Read Firebase configuration from environment variables defined in Vite
const configStr = process.env.FIREBASE_CONFIG;
let firebaseConfig = null;

if (configStr) {
  try {
    firebaseConfig = JSON.parse(configStr);
  } catch (e) {
    console.error("Firebase config parsing error", e);
  }
}

/**
 * Initialize Firebase app instance or reuse existing one to prevent multi-initialization errors.
 * Using modern modular SDK pattern with named exports.
 */
// Fix: Use named exports from "@firebase/app" directly to resolve 'no exported member' errors in certain environments where the wrapper package exports are not properly indexed.
export const app = firebaseConfig 
  ? (getApps().length === 0 
      ? initializeApp(firebaseConfig) 
      : getApp()) 
  : null;

// Fix: Use corresponding direct package imports for Auth and Firestore to ensure consistency across the initialization layer.
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export const isDemoMode = !app;