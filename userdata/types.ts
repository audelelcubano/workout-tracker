//

export type ExerciseEntry = 
{ name: string; sets: number; reps?: number; weight?: number };

export type Workout = {
  id: string;  //firebase document id
  dateISO: string;        
  durationMin?: number;
  totalSets?: number;
  exercises: ExerciseEntry[];
};
