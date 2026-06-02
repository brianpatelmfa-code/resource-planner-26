import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// PASTE YOUR CONFIG FROM FIREBASE HERE:
const firebaseConfig = {
  apiKey: "AIzaSyAzg1naYlZFvofT0z5Qrl-4PItkLJlfbNw",
  authDomain: "resource-planner-2026.firebaseapp.com",
  projectId: "resource-planner-2026",
  storageBucket: "resource-planner-2026.firebasestorage.app",
  messagingSenderId: "683013949161",
  appId: "1:683013949161:web:83de551de5694284555278"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);