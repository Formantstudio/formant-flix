import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDsvg-Bz3o2qf2r_zrXuSLfMQJ8u67tG2k",
  authDomain: "formant-flix.firebaseapp.com",
  projectId: "formant-flix",
  storageBucket: "formant-flix.firebasestorage.app",
  messagingSenderId: "232649287099",
  appId: "1:232649287099:web:93f23bc0cdbb34241d109e",
  measurementId: "G-DL0GX10BZL",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();
