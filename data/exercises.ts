export interface Exercise {
  id: string;
  name: string;
  muscleGroup: "chest" | "back" | "legs" | "shoulders" | "arms" | "core";
  muscles: string[];
  equipment: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  goalTags: ("strength" | "hypertrophy" | "fat_loss" | "endurance")[];
  type: "compound" | "isolation";
}

export const EXERCISES: Exercise[] = [
  // -------- CHEST --------
  {
    id: "bench_press",
    name: "Bench Press",
    muscleGroup: "chest",
    muscles: ["chest", "triceps", "shoulders"],
    equipment: "barbell",
    difficulty: "intermediate",
    goalTags: ["strength", "hypertrophy"],
    type: "compound"
  },
  {
    id: "incline_bench_press",
    name: "Incline Bench Press",
    muscleGroup: "chest",
    muscles: ["upper chest", "triceps", "shoulders"],
    equipment: "barbell",
    difficulty: "intermediate",
    goalTags: ["hypertrophy"],
    type: "compound"
  },
  {
    id: "dumbbell_bench_press",
    name: "Dumbbell Bench Press",
    muscleGroup: "chest",
    muscles: ["chest", "triceps"],
    equipment: "dumbbell",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "compound"
  },
  {
    id: "incline_dumbbell_press",
    name: "Incline Dumbbell Press",
    muscleGroup: "chest",
    muscles: ["chest", "shoulders"],
    equipment: "dumbbell",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "compound"
  },
  {
    id: "push_up",
    name: "Push-Up",
    muscleGroup: "chest",
    muscles: ["chest", "triceps"],
    equipment: "bodyweight",
    difficulty: "beginner",
    goalTags: ["fat_loss", "endurance"],
    type: "compound"
  },
  {
    id: "chest_fly",
    name: "Chest Fly",
    muscleGroup: "chest",
    muscles: ["chest"],
    equipment: "machine",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "cable_fly",
    name: "Cable Fly",
    muscleGroup: "chest",
    muscles: ["chest"],
    equipment: "cable",
    difficulty: "intermediate",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "decline_bench",
    name: "Decline Bench Press",
    muscleGroup: "chest",
    muscles: ["lower chest", "triceps"],
    equipment: "barbell",
    difficulty: "intermediate",
    goalTags: ["strength"],
    type: "compound"
  },
  {
    id: "pec_deck",
    name: "Pec Deck Machine",
    muscleGroup: "chest",
    muscles: ["chest"],
    equipment: "machine",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "dips_chest",
    name: "Chest Dips",
    muscleGroup: "chest",
    muscles: ["chest", "triceps", "shoulders"],
    equipment: "bodyweight",
    difficulty: "advanced",
    goalTags: ["strength", "hypertrophy"],
    type: "compound"
  },

  // -------- BACK --------
  {
    id: "deadlift",
    name: "Deadlift",
    muscleGroup: "back",
    muscles: ["back", "glutes", "hamstrings"],
    equipment: "barbell",
    difficulty: "advanced",
    goalTags: ["strength"],
    type: "compound"
  },
  {
    id: "pull_up",
    name: "Pull-Up",
    muscleGroup: "back",
    muscles: ["lats", "biceps"],
    equipment: "bodyweight",
    difficulty: "intermediate",
    goalTags: ["strength", "hypertrophy"],
    type: "compound"
  },
  {
    id: "lat_pulldown",
    name: "Lat Pulldown",
    muscleGroup: "back",
    muscles: ["lats"],
    equipment: "machine",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "compound"
  },
  {
    id: "barbell_row",
    name: "Barbell Row",
    muscleGroup: "back",
    muscles: ["lats", "upper back"],
    equipment: "barbell",
    difficulty: "intermediate",
    goalTags: ["strength"],
    type: "compound"
  },
  {
    id: "seated_cable_row",
    name: "Seated Cable Row",
    muscleGroup: "back",
    muscles: ["back", "biceps"],
    equipment: "cable",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "compound"
  },
  {
    id: "t_bar_row",
    name: "T-Bar Row",
    muscleGroup: "back",
    muscles: ["lats", "mid back"],
    equipment: "machine",
    difficulty: "intermediate",
    goalTags: ["hypertrophy"],
    type: "compound"
  },
  {
    id: "single_arm_db_row",
    name: "Single-Arm Dumbbell Row",
    muscleGroup: "back",
    muscles: ["lats", "back"],
    equipment: "dumbbell",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "compound"
  },
  {
    id: "face_pull",
    name: "Face Pull",
    muscleGroup: "back",
    muscles: ["rear delts", "upper back"],
    equipment: "cable",
    difficulty: "beginner",
    goalTags: ["endurance", "hypertrophy"],
    type: "isolation"
  },
  {
    id: "back_extension",
    name: "Back Extension",
    muscleGroup: "back",
    muscles: ["lower back", "glutes"],
    equipment: "machine",
    difficulty: "beginner",
    goalTags: ["strength"],
    type: "isolation"
  },
  {
    id: "chin_up",
    name: "Chin-Up",
    muscleGroup: "back",
    muscles: ["lats", "biceps"],
    equipment: "bodyweight",
    difficulty: "intermediate",
    goalTags: ["strength", "hypertrophy"],
    type: "compound"
  },

  // -------- LEGS --------
  {
    id: "squat",
    name: "Squat",
    muscleGroup: "legs",
    muscles: ["quads", "glutes", "core"],
    equipment: "barbell",
    difficulty: "intermediate",
    goalTags: ["strength"],
    type: "compound"
  },
  {
    id: "leg_press",
    name: "Leg Press",
    muscleGroup: "legs",
    muscles: ["quads", "glutes"],
    equipment: "machine",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "compound"
  },
  {
    id: "lunges",
    name: "Lunges",
    muscleGroup: "legs",
    muscles: ["quads", "glutes"],
    equipment: "bodyweight",
    difficulty: "beginner",
    goalTags: ["endurance", "fat_loss"],
    type: "compound"
  },
  {
    id: "romanian_deadlift",
    name: "Romanian Deadlift (RDL)",
    muscleGroup: "legs",
    muscles: ["hamstrings", "glutes"],
    equipment: "barbell",
    difficulty: "intermediate",
    goalTags: ["strength", "hypertrophy"],
    type: "compound"
  },
  {
    id: "hamstring_curl",
    name: "Hamstring Curl",
    muscleGroup: "legs",
    muscles: ["hamstrings"],
    equipment: "machine",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "leg_extension",
    name: "Leg Extension",
    muscleGroup: "legs",
    muscles: ["quads"],
    equipment: "machine",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "calf_raise",
    name: "Calf Raise",
    muscleGroup: "legs",
    muscles: ["calves"],
    equipment: "machine",
    difficulty: "beginner",
    goalTags: ["endurance"],
    type: "isolation"
  },
  {
    id: "bulgarian_split_squat",
    name: "Bulgarian Split Squat",
    muscleGroup: "legs",
    muscles: ["glutes", "quads"],
    equipment: "dumbbell",
    difficulty: "advanced",
    goalTags: ["hypertrophy"],
    type: "compound"
  },
  {
    id: "goblet_squat",
    name: "Goblet Squat",
    muscleGroup: "legs",
    muscles: ["quads", "glutes"],
    equipment: "dumbbell",
    difficulty: "beginner",
    goalTags: ["fat_loss", "hypertrophy"],
    type: "compound"
  },
  {
    id: "hip_thrust",
    name: "Hip Thrust",
    muscleGroup: "legs",
    muscles: ["glutes"],
    equipment: "barbell",
    difficulty: "intermediate",
    goalTags: ["hypertrophy"],
    type: "compound"
  },

  // -------- SHOULDERS --------
  {
    id: "overhead_press",
    name: "Overhead Press",
    muscleGroup: "shoulders",
    muscles: ["shoulders", "triceps"],
    equipment: "barbell",
    difficulty: "intermediate",
    goalTags: ["strength"],
    type: "compound"
  },
  {
    id: "lateral_raise",
    name: "Lateral Raise",
    muscleGroup: "shoulders",
    muscles: ["side delts"],
    equipment: "dumbbell",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "front_raise",
    name: "Front Raise",
    muscleGroup: "shoulders",
    muscles: ["front delts"],
    equipment: "dumbbell",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "rear_delt_fly",
    name: "Rear Delt Fly",
    muscleGroup: "shoulders",
    muscles: ["rear delts"],
    equipment: "machine",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "arnold_press",
    name: "Arnold Press",
    muscleGroup: "shoulders",
    muscles: ["delts"],
    equipment: "dumbbell",
    difficulty: "intermediate",
    goalTags: ["hypertrophy"],
    type: "compound"
  },
  {
    id: "upright_row",
    name: "Upright Row",
    muscleGroup: "shoulders",
    muscles: ["side delts", "traps"],
    equipment: "barbell",
    difficulty: "intermediate",
    goalTags: ["hypertrophy"],
    type: "compound"
  },
  {
    id: "machine_shoulder_press",
    name: "Machine Shoulder Press",
    muscleGroup: "shoulders",
    muscles: ["shoulders"],
    equipment: "machine",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "compound"
  },
  {
    id: "cable_lateral_raise",
    name: "Cable Lateral Raise",
    muscleGroup: "shoulders",
    muscles: ["side delts"],
    equipment: "cable",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "db_shoulder_press",
    name: "Dumbbell Shoulder Press",
    muscleGroup: "shoulders",
    muscles: ["shoulders", "triceps"],
    equipment: "dumbbell",
    difficulty: "beginner",
    goalTags: ["hypertrophy", "strength"],
    type: "compound"
  },
  {
    id: "machine_shrug",
    name: "Machine Shrug",
    muscleGroup: "shoulders",
    muscles: ["traps"],
    equipment: "machine",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },

  // -------- ARMS --------
  {
    id: "bicep_curl",
    name: "Bicep Curl",
    muscleGroup: "arms",
    muscles: ["biceps"],
    equipment: "dumbbell",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "hammer_curl",
    name: "Hammer Curl",
    muscleGroup: "arms",
    muscles: ["biceps"],
    equipment: "dumbbell",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "tricep_pushdown",
    name: "Tricep Pushdown",
    muscleGroup: "arms",
    muscles: ["triceps"],
    equipment: "cable",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "skull_crusher",
    name: "Skull Crushers",
    muscleGroup: "arms",
    muscles: ["triceps"],
    equipment: "barbell",
    difficulty: "intermediate",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "concentration_curl",
    name: "Concentration Curl",
    muscleGroup: "arms",
    muscles: ["biceps"],
    equipment: "dumbbell",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "cable_kickback",
    name: "Cable Kickback",
    muscleGroup: "arms",
    muscles: ["triceps"],
    equipment: "cable",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "preacher_curl",
    name: "Preacher Curl",
    muscleGroup: "arms",
    muscles: ["biceps"],
    equipment: "machine",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "reverse_curl",
    name: "Reverse Curl",
    muscleGroup: "arms",
    muscles: ["brachialis", "forearms"],
    equipment: "barbell",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "close_grip_bench",
    name: "Close-Grip Bench Press",
    muscleGroup: "arms",
    muscles: ["triceps", "chest"],
    equipment: "barbell",
    difficulty: "intermediate",
    goalTags: ["strength"],
    type: "compound"
  },
  {
    id: "cable_curl",
    name: "Cable Curl",
    muscleGroup: "arms",
    muscles: ["biceps"],
    equipment: "cable",
    difficulty: "beginner",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },

  // -------- CORE --------
  {
    id: "plank",
    name: "Plank",
    muscleGroup: "core",
    muscles: ["core"],
    equipment: "bodyweight",
    difficulty: "beginner",
    goalTags: ["endurance"],
    type: "isolation"
  },
  {
    id: "crunch",
    name: "Crunch",
    muscleGroup: "core",
    muscles: ["abs"],
    equipment: "bodyweight",
    difficulty: "beginner",
    goalTags: ["hypertrophy", "fat_loss"],
    type: "isolation"
  },
  {
    id: "hanging_leg_raise",
    name: "Hanging Leg Raise",
    muscleGroup: "core",
    muscles: ["abs", "hip flexors"],
    equipment: "bodyweight",
    difficulty: "advanced",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "russian_twist",
    name: "Russian Twist",
    muscleGroup: "core",
    muscles: ["obliques"],
    equipment: "bodyweight",
    difficulty: "beginner",
    goalTags: ["fat_loss", "endurance"],
    type: "isolation"
  },
  {
    id: "cable_crunch",
    name: "Cable Crunch",
    muscleGroup: "core",
    muscles: ["abs"],
    equipment: "cable",
    difficulty: "intermediate",
    goalTags: ["hypertrophy"],
    type: "isolation"
  },
  {
    id: "leg_raises",
    name: "Leg Raises",
    muscleGroup: "core",
    muscles: ["abs"],
    equipment: "bodyweight",
    difficulty: "beginner",
    goalTags: ["endurance"],
    type: "isolation"
  },
  {
    id: "mountain_climber",
    name: "Mountain Climbers",
    muscleGroup: "core",
    muscles: ["core", "hip flexors"],
    equipment: "bodyweight",
    difficulty: "beginner",
    goalTags: ["fat_loss", "endurance"],
    type: "compound"
  },
  {
    id: "sit_up",
    name: "Sit-Up",
    muscleGroup: "core",
    muscles: ["abs"],
    equipment: "bodyweight",
    difficulty: "beginner",
    goalTags: ["endurance"],
    type: "isolation"
  },
  {
    id: "bicycle_crunch",
    name: "Bicycle Crunch",
    muscleGroup: "core",
    muscles: ["abs", "obliques"],
    equipment: "bodyweight",
    difficulty: "beginner",
    goalTags: ["fat_loss"],
    type: "isolation"
  },
  {
    id: "flutter_kick",
    name: "Flutter Kick",
    muscleGroup: "core",
    muscles: ["lower abs"],
    equipment: "bodyweight",
    difficulty: "beginner",
    goalTags: ["endurance"],
    type: "isolation"
  }
];
