import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "local-development-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "local-development.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "local-development",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "local-development.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:local-development",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
