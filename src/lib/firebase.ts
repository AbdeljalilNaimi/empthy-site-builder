import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
// Note: Firebase API keys are safe for client-side use - they are protected
// by Firebase Security Rules, not by keeping them secret.
// See: https://firebase.google.com/docs/projects/api-keys
const firebaseConfig = {
  apiKey: "AIzaSyDo8AhKuuXiH2yC9MhgCZr9TxaouBvEyWU",
  authDomain: "cityhealth-ec7e7.firebaseapp.com",
  projectId: "cityhealth-ec7e7",
  storageBucket: "cityhealth-ec7e7.firebasestorage.app",
  messagingSenderId: "817879071839",
  appId: "1:817879071839:web:cfe80f4a74f3db14bbafea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
