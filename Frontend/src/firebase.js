import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyDWyAqVqZdlm9nwRMTMnFhwAhW_BldqTb8",
  authDomain: "fbstore-8d925.firebaseapp.com",
  projectId: "fbstore-8d925",
  storageBucket: "fbstore-8d925.firebasestorage.app",
  messagingSenderId: "440287796338",
  appId: "1:440287796338:web:446b3c3a64f9dd350036eb",
  measurementId: "G-RC8PT3SX63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);