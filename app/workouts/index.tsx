import { useEffect, useState, useRef } from "react";
import { Button, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View, Alert, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Timer } from "@data/Timer";
import { useAuth } from "@/components/Auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, writeBatch } from "firebase/firestore";
import { EXERCISES } from "@/data/exercises";
import { MuscleGroupPicker } from "@/components/MuscleGroupPicker";
import { ExercisePicker } from "@/components/ExercisePicker";





export default function WorkoutsScreen() {
  const { user } = useAuth();

  const [exerciseId, setExerciseId] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<Timer | null>(null);
  const selectedExercise = EXERCISES.find(e => e.id === exerciseId);
  const [groupPickerVisible, setGroupPickerVisible] = useState(false);
  const [exercisePickerVisible, setExercisePickerVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");



  

  // Create the Timer instance only once
  useEffect(() => {
    timerRef.current = new Timer(0, (seconds) => {
      setTimerSeconds(seconds);
    });
  }, []);

 
  const handleSave = async () => {
    if (!exerciseId || !weight || !reps || !sets) {
      return;
    }

    if (!user) {
      console.error("User should exist here — auth state issue");
      return;
    }

    const newWorkout = {
      id: Date.now().toString(),
      exerciseId,
      weight,
      reps,
      sets,
      date: new Date().toISOString(),
    };

    setWorkouts((prev) => [...prev, newWorkout]);
    
    // Save to sessionWorkouts in Firestore
    try {
      const sessionCol = collection(db, "users", user.uid, "sessionWorkouts");
      await addDoc(sessionCol, newWorkout);
    } catch (err) {
      console.error("Failed to save session workout", err);
    }



    // Save to Firestore history for this user (used by History screen)
    try {
      const historyCol = collection(db, "users", user.uid, "history");
      await addDoc(historyCol, {
        ...newWorkout,
        type: "manual"
        
      });
    } catch (err) {
      console.error("Failed to save workout to history", err);
      Alert.alert(
        "Save error",
        "Could not sync this workout to your account. It is still saved locally."
      );
    }

    // Reset input fields
    setExerciseId("");
    setWeight("");
    setReps("");
    setSets("");

    // Show the timer modal after saving a workout
    setTimerSeconds(0);
    setTimerModalVisible(true);
    timerRef.current?.reset();
    timerRef.current?.start();
  };

    // Clear only current-session workouts
  const clearWorkouts = async () => {
    console.log("CLEAR SESSION: firing"); 
    if (!user) return;

    try {
      const sessionCol = collection(db, "users", user.uid, "sessionWorkouts");
       const snapshot = await getDocs(sessionCol);

      const batch = writeBatch(db);
      snapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();

      setWorkouts([]);
      console.log("Session cleared");
    } catch (err) {
      console.error("Failed to clear session workouts", err);
    }
  };


  

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.title}>Log a Workout</Text>

          <Text style={styles.label}>Exercise</Text>
          <Pressable style={styles.select} onPress={() => setGroupPickerVisible(true)}>
            <Text style={[styles.selectText, !exerciseId && styles.placeholder]}>
              {selectedExercise?.name || "Select an exercise..."}

            </Text>
            <Text style={styles.chevron}>▾</Text>
          </Pressable>



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

          {/* Show the active-session list */}
          {workouts.length > 0 && (
            <>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.subTitle}>Current Session:</Text>
                {workouts.map((w) => (
                  <View key={w.id} style={styles.entry}>
                    <Text style={styles.entryText}>
                      {EXERCISES.find(e => e.id === w.exerciseId)?.name || "Unknown"} — 
                      {w.weight} lbs × {w.reps} reps × {w.sets} sets
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

      {groupPickerVisible && (
        <MuscleGroupPicker
          visible={groupPickerVisible}
          onClose={() => setGroupPickerVisible(false)}
          onSelect={(group) => {
            setSelectedGroup(group);
            setGroupPickerVisible(false);
            setExercisePickerVisible(true);
          }}
        />
      )}


      {exercisePickerVisible && (
        <ExercisePicker
          visible={exercisePickerVisible}
          group={selectedGroup}
          onClose={() => setExercisePickerVisible(false)}
          onSelect={(id) => {
            setExerciseId(id);
            setExercisePickerVisible(false);
          }}
        />
      )}




      {/* Timer */}
      <Modal visible={timerModalVisible} transparent animationType="fade">
        <View style={styles.timerOverlay}>
          <View style={styles.timerContent}>
            <Text style={styles.timerText}>Great work! Take a rest:</Text>
            <Text style={styles.timerText}>{timerSeconds}s</Text>
            <Button
              title="End Rest"
              onPress={() => {
                timerRef.current?.pause();
                setTimerModalVisible(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
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
  timerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  timerContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  timerText: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
});
