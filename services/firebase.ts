import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Fix: Read Firebase configuration from environment variables defined in Vite
const configStr = process.env.FIREBASE_CONFIG;
let firebaseConfig = null;

if (configStr) {
  try {
    firebaseConfig = JSON.parse(configStr);
  } catch (e) {
    console.error("Firebase config parsing error", e);
  }
}

// Fix: Initialize Firebase app instance or reuse existing one to prevent multi-initialization errors
export const app = firebaseConfig ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export const isDemoMode = !app;