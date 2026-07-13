import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD09yHGGhd_cVP1kRYF89dxEHd7uFZxemE",
  authDomain: "huinestfood-be0f5.firebaseapp.com",
  projectId: "huinestfood-be0f5",
  storageBucket: "huinestfood-be0f5.firebasestorage.app",
  messagingSenderId: "242262794996",
  appId: "1:242262794996:web:2263878742c3af058c74a1",
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific custom database ID provisioned for this applet
export const db = getFirestore(app, "(default)");
