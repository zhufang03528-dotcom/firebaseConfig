
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const configStr = process.env.FIREBASE_CONFIG;
let firebaseConfig = null;

if (configStr) {
  try {
    firebaseConfig = JSON.parse(configStr);
  } catch (e) {
    console.error("Firebase config parsing error", e);
  }
}

// 如果沒有配置，則進入 Demo 模式（透過 null check 處理）
export const app = firebaseConfig ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export const isDemoMode = !app;
