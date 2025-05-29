import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDykdPiJ6LacR6DRYflz4Mz8Euclobh8HE",
  authDomain: "weddingsite-48f69.firebaseapp.com",
  projectId: "weddingsite-48f69",
  storageBucket: "weddingsite-48f69.firebasestorage.app",
  messagingSenderId: "495104582788",
  appId: "1:495104582788:web:d654eb2adcda8d9c880ed1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 