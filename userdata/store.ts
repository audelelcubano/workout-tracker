import type { Workout } from './types';
// store is for user workout data
export interface Store {
  listWorkouts(uid: string): Promise<Workout[]>;
}
