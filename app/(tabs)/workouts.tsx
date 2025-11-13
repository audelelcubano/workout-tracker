import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "@/components/Auth";


import {
  Button,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EXERCISES = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Overhead Press",
  "Barbell Row",
  "Pull-Up",
  "Bicep Curl",
  "Tricep Extension",
  "Leg Press",
  "Lateral Raise",
];

export default function WorkoutsScreen() {
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const { user } = useAuth(); //current firebase user id

  // 🧠 Load current-session workouts only (NOT history)
  useEffect(() => {
    const loadCurrent = async () => {
      const stored = await AsyncStorage.getItem("workouts");
      if (stored) setWorkouts(JSON.parse(stored));
    };
    loadCurrent();
  }, []);

  // 💾 Save workout to both "workouts" and "history"
  const handleSave = async () => {
    if (!exercise || !weight || !reps || !sets) return;

    const newWorkout = {
      id: Date.now().toString(),
      exercise,
      weight,
      reps,
      sets,
      date: new Date().toISOString(),
    };

    const updatedWorkouts = [...workouts, newWorkout];
    setWorkouts(updatedWorkouts);

    // Save current session list
    await AsyncStorage.setItem("workouts", JSON.stringify(updatedWorkouts));

    // Append to long-term history (kept separate)
    const storedHistory = await AsyncStorage.getItem("history");
    const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
    const updatedHistory = [...parsedHistory, newWorkout];
    await AsyncStorage.setItem("history", JSON.stringify(updatedHistory));

if (user) {
    const historyCol = collection(db, "users", user.uid, "history");
    await addDoc(historyCol, {
      exercise: newWorkout.exercise,
      weight: newWorkout.weight,
      reps: newWorkout.reps,
      sets: newWorkout.sets,
      date: newWorkout.date,
    });
  }//firebase data retainment for history screen

    // Reset input fields
    setExercise("");
    setWeight("");
    setReps("");
    setSets("");
  };

  // 🚮 Clear only current-session workouts
  const clearWorkouts = async () => {
    await AsyncStorage.removeItem("workouts");
    setWorkouts([]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.title}>📋 Log a Workout</Text>

          <Text style={styles.label}>Exercise</Text>
          <Pressable style={styles.select} onPress={() => setShowPicker(true)}>
            <Text style={[styles.selectText, !exercise && styles.placeholder]}>
              {exercise || "Select an exercise..."}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </Pressable>

          {/* Modal Dropdown */}
          <Modal
            visible={showPicker}
            animationType="slide"
            transparent
            onRequestClose={() => setShowPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <Text style={styles.modalTitle}>Select Exercise</Text>
                <ScrollView>
                  {EXERCISES.map((name) => (
                    <Pressable
                      key={name}
                      style={styles.option}
                      onPress={() => {
                        setExercise(name);
                        setShowPicker(false);
                      }}
                    >
                      <Text style={styles.optionText}>{name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => setShowPicker(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <TextInput
            style={styles.input}
            placeholder="Weight (lbs)"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
          <TextInput
            style={styles.input}
            placeholder="Reps"
            keyboardType="numeric"
            value={reps}
            onChangeText={setReps}
          />
          <TextInput
            style={styles.input}
            placeholder="Sets"
            keyboardType="numeric"
            value={sets}
            onChangeText={setSets}
          />

          <Button title="Save Workout" onPress={handleSave} />

          {/* ✅ Show the active-session list */}
          {workouts.length > 0 && (
            <>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.subTitle}>Current Session:</Text>
                {workouts.map((w) => (
                  <View key={w.id} style={styles.entry}>
                    <Text style={styles.entryText}>
                      {w.exercise} — {w.weight} lbs × {w.reps} reps × {w.sets} sets
                    </Text>
                  </View>
                ))}
              </View>

              <Pressable onPress={clearWorkouts} style={styles.clearBtn}>
                <Text style={styles.clearText}>Clear Current Workouts</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  subTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 5 },
  select: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { fontSize: 16, color: "#000" },
  placeholder: { color: "#999" },
  chevron: { fontSize: 16, color: "#666", marginLeft: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  entry: {
    paddingVertical: 8,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  entryText: { fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  option: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  optionText: { fontSize: 16 },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
  },
  cancelText: { fontSize: 16, fontWeight: "600", color: "#333" },
  clearBtn: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    alignItems: "center",
  },
  clearText: { color: "#444", fontWeight: "600" },
});
