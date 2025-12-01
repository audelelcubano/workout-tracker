import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/components/Auth";
import { EXERCISES } from "@/data/exercises";

export default function WorkoutFromRoutineScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const routineId = params.routineId as string;

  const [routine, setRoutine] = useState<any | null>(null);

  useEffect(() => {
    if (!user || !routineId) return;

    const load = async () => {
      const ref = doc(db, "users", user.uid, "routines", routineId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        // Build logging structure:
        const logged = data.exercises.map((item: any) => {
          return {
            id: item.id,
            name: EXERCISES.find((ex) => ex.id === item.id)?.name || "Unknown",
            sets: [
              {
                weight: "",
                reps: "",
              },
            ],
          };
        });

        setRoutine({ id: snap.id, ...data, logged });
      }
    };

    load();
  }, [user, routineId]);

  if (!routine) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loadingText}>Loading routine...</Text>
      </SafeAreaView>
    );
  }

  // Add a set to an exercise
  const addSet = (idx: number) => {
    const updated = [...routine.logged];
    updated[idx].sets.push({ weight: "", reps: "" });
    setRoutine({ ...routine, logged: updated });
  };

  // Update weight/reps
  const updateSet = (exIdx: number, setIdx: number, field: "weight" | "reps", value: string) => {
    const updated = [...routine.logged];
    updated[exIdx].sets[setIdx][field] = value;
    setRoutine({ ...routine, logged: updated });
  };

  // Remove a set
  const removeSet = (exIdx: number, setIdx: number) => {
    const updated = [...routine.logged];
    updated[exIdx].sets.splice(setIdx, 1);
    if (updated[exIdx].sets.length === 0) {
      updated[exIdx].sets.push({ weight: "", reps: "" });
    }
    setRoutine({ ...routine, logged: updated });
  };

  // Finish workout → summary screen
  const finishWorkout = () => {
    router.push({
      pathname: "/workouts/summary",
      params: {
        routineName: routine.name,
        loggedData: JSON.stringify(routine.logged),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{routine.name}</Text>

        {routine.logged.map((exercise: any, exIdx: number) => (
          <View key={exercise.id} style={styles.exerciseBox}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>

            {/* Sets */}
            {exercise.sets.map((set: any, setIdx: number) => (
              <View key={setIdx} style={styles.setRow}>
                <Text style={styles.setNumber}>Set {setIdx + 1}</Text>

                <TextInput
                  style={styles.input}
                  placeholder="lbs"
                  keyboardType="numeric"
                  value={set.weight}
                  onChangeText={(v) => updateSet(exIdx, setIdx, "weight", v)}
                />

                <TextInput
                  style={styles.input}
                  placeholder="reps"
                  keyboardType="numeric"
                  value={set.reps}
                  onChangeText={(v) => updateSet(exIdx, setIdx, "reps", v)}
                />

                <Pressable
                  style={styles.removeBtn}
                  onPress={() => removeSet(exIdx, setIdx)}
                >
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              </View>
            ))}

            <Pressable style={styles.addSetBtn} onPress={() => addSet(exIdx)}>
              <Text style={styles.addSetText}>+ Add Set</Text>
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.finishBtn} onPress={finishWorkout}>
          <Text style={styles.finishText}>Finish Workout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  loadingText: { textAlign: "center", marginTop: 40, color: "#666" },

  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },

  exerciseBox: {
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  setNumber: { width: 55, fontWeight: "600" },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    width: 65,
    textAlign: "center",
  },

  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ddd",
    borderRadius: 6,
  },
  removeText: { fontWeight: "700", color: "#900" },

  addSetBtn: {
    marginTop: 10,
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  addSetText: { fontWeight: "600" },

  finishBtn: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  finishText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
