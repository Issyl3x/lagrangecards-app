
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // We can add this later if you need authentication

// This object should come from your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyBxEtvWs5GZ1k_Nf_oreHwUdZ1cXTRtYHk",
  authDomain: "estateflow-wpzo2.firebaseapp.com",
  projectId: "estateflow-wpzo2",
  storageBucket: "estateflow-wpzo2.firebasestorage.app",
  messagingSenderId: "369828497940",
  appId: "1:369828497940:web:748d7478c950fb52cc7501"
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
