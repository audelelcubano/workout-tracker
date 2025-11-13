import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
} from 'firebase/firestore';
import type { Store } from './store';
import type { Workout } from './types';

const userDoc = (uid: string) => doc(db, 'users', uid);

export const FirebaseStore: Store = {
  async listWorkouts(uid: string): Promise<Workout[]> {
    const col = collection(userDoc(uid), 'workouts');
    const q = query(col, orderBy('dateISO', 'desc'));
    const snap = await getDocs(q);

    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Workout, 'id'>),
    }));
  },
};