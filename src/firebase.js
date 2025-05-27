// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY_PROD,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN_PROD,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID_PROD,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_PROD,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID_PROD,
  appId: process.env.REACT_APP_FIREBASE_APP_ID_PROD,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID_PROD,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };
