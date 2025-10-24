// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Salin dan tempel konfigurasi Anda di sini
const firebaseConfig = {
  apiKey: "AIzaSyA7DSLwbd1ouRTHhL5V2-2NrzqiWHbt_IM",
  authDomain: "klarifikasi-bphtb1.firebaseapp.com",
  projectId: "klarifikasi-bphtb1",
  storageBucket: "klarifikasi-bphtb1.firebasestorage.app",
  messagingSenderId: "509890878115",
  appId: "1:509890878115:web:18703b4ea3d01d7f303d16"};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };