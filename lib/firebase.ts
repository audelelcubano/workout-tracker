import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBJzqaA55bFOuOF8KVdE3p16I2EPzdQl4k",
  authDomain: "workout-tracker-7a34a.firebaseapp.com",
  projectId: "workout-tracker-7a34a",
  storageBucket: "workout-tracker-7a34a.firebasestorage.app",
  messagingSenderId: "31267288869",
  appId: "1:31267288869:web:f34b43c76cb60b52e68ccc"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
