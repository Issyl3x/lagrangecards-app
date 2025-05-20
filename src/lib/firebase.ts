// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // We can add this later if you need authentication

// TODO: Replace the following with your app's Firebase project configuration
// This object should come from your Firebase project settings
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID_HERE", // e.g., "estateflow-wpzo2" if that's your project ID
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE",
  // measurementId: "YOUR_MEASUREMENT_ID_HERE" // Optional: if you have Google Analytics
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // If already initialized, use that app
}

const db = getFirestore(app);
// const auth = getAuth(app); // We can initialize and export auth later

export { app, db /*, auth */ };
