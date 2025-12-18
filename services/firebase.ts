import * as firebaseApp from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
 * Using namespaced import (import * as firebaseApp) to bypass potential named export resolution issues 
 * in the build environment while still using the modular SDK pattern.
 */
export const app = firebaseConfig 
  ? (firebaseApp.getApps().length === 0 
      ? firebaseApp.initializeApp(firebaseConfig) 
      : firebaseApp.getApp()) 
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export const isDemoMode = !app;