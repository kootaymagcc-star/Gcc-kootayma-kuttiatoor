import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBK1C-MTmXnfKeq7CdvZPwH6tIlb_O0XHI",
  authDomain: "gcc-kootaayma.firebaseapp.com",
  projectId: "gcc-kootaayma",
  storageBucket: "gcc-kootaayma.firebasestorage.app",
  messagingSenderId: "1085988586229",
  appId: "1:1085988586229:web:b8783d964ed9c48763bbbc",
  measurementId: "G-YQWQWQ957E"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
storage.maxUploadRetryTime = 3000; // fail quickly if permissions or bucket are missing
export const auth = getAuth(app);
