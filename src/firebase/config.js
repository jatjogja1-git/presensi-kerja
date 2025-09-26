// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Salin dan tempel konfigurasi Anda di sini
const firebaseConfig = {
    apiKey: "AIzaSyDGa_9wR2WISxDQciiaABFom5Z2Q9OvqNg",
    authDomain: "aplikasi-presensi-bkad.firebaseapp.com",
    projectId: "aplikasi-presensi-bkad",
    storageBucket: "aplikasi-presensi-bkad.firebasestorage.app",
    messagingSenderId: "803874857669",
    appId: "1:803874857669:web:449149494d80ce0e19c6ac"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };