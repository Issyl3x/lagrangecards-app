
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // We can add this later if you need authentication

// TODO: Replace the following with your app's Firebase project configuration
// This object should come from your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyDRd2RVLSDBL71iV5qonAnkCq4SMk-kSy4",
  authDomain: "estateflow-wpzo2.firebaseapp.com",
  projectId: "estateflow-wpzo2", 
  storageBucket: "estateflow-wpzo2.appspot.com",
  messagingSenderId: "598192894174",
  appId: "1:598192894174:web:d8c17b66215408f43c02c6",
  measurementId: "G-H3V411NFEG" 
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
