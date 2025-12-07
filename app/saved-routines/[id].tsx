import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/components/Auth";
import { EXERCISES } from "@/data/exercises";

// ----------------------------------
// ROUTINE TYPE
// ----------------------------------
type Routine = {
  id: string;
  name: string;
  groups: string[];
  exercises: {
    id: string;
    sets: number;
    reps: number;
  }[];
};

export default function RoutineDetailScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const routineId = params.id as string;

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState<string>("");
  const [editExercises, setEditExercises] = useState<Routine["exercises"]>([]);
  const [addingExercise, setAddingExercise] = useState(false);
  

  // ------------------------
  // LOAD ROUTINE
  // ------------------------
  useEffect(() => {
    if (!user || !routineId) return;

    const loadRoutine = async () => {
      setLoading(true);

      const ref = doc(db, "users", user.uid, "routines", routineId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setRoutine(null);
        setLoading(false);
        return;
      }

      const data = {
        id: snap.id,
        ...snap.data(),
      } as Routine;

      setRoutine(data);
      setEditName(data.name);
      setEditExercises(data.exercises);
      setLoading(false);
    };

    loadRoutine();
  }, [user, routineId]);

  // ------------------------
  // SAVE EDITS
  // ------------------------
  const saveChanges = async () => {
    if (!user || !routine) return;

    const ref = doc(db, "users", user.uid, "routines", routine.id);

    await updateDoc(ref, {
      name: editName,
      exercises: editExercises,
    });

    setRoutine({
      ...routine,
      name: editName,
      exercises: editExercises,
    });

    setEditing(false);
  };

  // ------------------------
  // UI STATES
  // ------------------------
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!routine) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Routine not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ------------------------
  // MAIN VIEW
  // ------------------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* ----------------------------------- */}
        {/* VIEW MODE */}
        {/* ----------------------------------- */}
        {!editing && (
          <>
            <Text style={styles.title}>{routine.name}</Text>

            {/* Muscle groups */}
            <Text style={styles.sectionTitle}>Muscle Groups</Text>
            <View style={styles.groupBox}>
              {routine.groups.map((g) => (
                <Text key={g} style={styles.groupText}>
                  • {g}
                </Text>
              ))}
            </View>

            {/* Exercises */}
            <Text style={styles.sectionTitle}>Exercises</Text>
            <View style={styles.exercisesBox}>
              {routine.exercises.map((item) => {
                const exercise = EXERCISES.find((e) => e.id === item.id);

                return (
                  <View key={item.id} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>
                      {exercise?.name || "Unknown Exercise"}
                    </Text>
                    <Text style={styles.exerciseDetail}>
                      {item.sets} sets × {item.reps} reps
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Start workout */}
            <Pressable
              style={styles.startBtn}
              onPress={() =>
                router.push({
                  pathname: "/workouts/[routineId]",
                  params: { routineId },
                })
              }
            >
              <Text style={styles.startText}>Start Workout</Text>
            </Pressable>

            {/* Switch to edit mode */}
            <Pressable style={styles.editBtn} onPress={() => setEditing(true)}>
              <Text style={styles.editText}>Edit Routine</Text>
            </Pressable>
          </>
        )}

        {/* ----------------------------------- */}
        {/* EDIT MODE */}
        {/* ----------------------------------- */}
        {editing && (
          <>
            <Text style={styles.title}>Edit Routine</Text>

            {/* Edit name */}
            <TextInput
              style={styles.input}
              placeholder="Routine Name"
              value={editName}
              onChangeText={setEditName}
            />

            {/* Edit exercises */}
            <Text style={styles.sectionTitle}>Exercises</Text>

            {editExercises.map((ex, index) => {
              const exercise = EXERCISES.find((e) => e.id === ex.id);

              return (
                <View key={index} style={styles.exerciseEditRow}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>
                      {exercise?.name || "Unknown"}
                    </Text>

                    {/* DELETE BUTTON */}
                    <Pressable
                      onPress={() => {
                        const updated = editExercises.filter((_, i) => i !== index);
                        setEditExercises(updated);
                      }}
                    >
                      <Text style={styles.deleteText}>Remove</Text>
                    </Pressable>
                  </View>

                  <View style={styles.rowInputs}>
                    <TextInput
                      style={styles.smallInput}
                      keyboardType="numeric"
                      value={String(ex.sets)}
                      onChangeText={(v) => {
                        const copy = [...editExercises];
                        copy[index].sets = Number(v);
                        setEditExercises(copy);
                      }}
                    />

                    <TextInput
                      style={styles.smallInput}
                      keyboardType="numeric"
                      value={String(ex.reps)}
                      onChangeText={(v) => {
                        const copy = [...editExercises];
                        copy[index].reps = Number(v);
                        setEditExercises(copy);
                      }}
                    />
                  </View>
                </View>
              );
            })}

            {/* Add Exercise Button */}
            <Pressable
              style={styles.addExerciseBtn}
              onPress={() => setAddingExercise(true)}
            >
              <Text style={styles.addExerciseText}>+ Add Exercise</Text>
            </Pressable>

            {/* Save + Cancel */}
            <Pressable style={styles.saveBtn} onPress={saveChanges}>
              <Text style={styles.saveText}>Save Changes</Text>
            </Pressable>

            <Pressable style={styles.cancelBtn} onPress={() => setEditing(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            {/* -------------------- ADD EXERCISE MODAL -------------------- */}
            {addingExercise && (
              <View style={styles.addModalOverlay}>
                <View style={styles.addModalBox}>
                  <Text style={styles.modalTitle}>Select an Exercise</Text>

                  <ScrollView style={{ maxHeight: 300 }}>
                    {EXERCISES.map((ex) => (
                      <Pressable
                        key={ex.id}
                        style={styles.exerciseOption}
                        onPress={() => {
                          const updated = [
                            ...editExercises,
                            { id: ex.id, sets: 3, reps: 10 },
                          ];
                          setEditExercises(updated);
                          setAddingExercise(false);
                        }}
                      >
                        <Text style={styles.exerciseOptionText}>{ex.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <Pressable
                    style={styles.modalCancelBtn}
                    onPress={() => setAddingExercise(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red" },

  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 20 },
  groupBox: { marginTop: 8 },
  groupText: { fontSize: 14, color: "#444" },

  exercisesBox: { marginTop: 10 },
  exerciseItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  exerciseName: { fontSize: 16, fontWeight: "600" },
  exerciseDetail: { color: "#666", marginTop: 2 },

  startBtn: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#222",
    borderRadius: 10,
    alignItems: "center",
  },
  startText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  editBtn: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 10,
    alignItems: "center",
  },
  editText: { color: "#444", fontSize: 14 },

  // ----- Edit Mode -----
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },

  exerciseEditRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  rowInputs: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },

  smallInput: {
    width: 70,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    textAlign: "center",
  },

  saveBtn: {
    marginTop: 25,
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  cancelBtn: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
  },
  cancelText: { color: "#777", fontSize: 16 },
  addExerciseBtn: {
    marginTop: 20,
    backgroundColor: "#e3f2fd",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addExerciseText: {
    color: "#0277bd",
    fontSize: 16,
    fontWeight: "600",
  },

  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  deleteText: {
    color: "red",
    fontWeight: "600",
    fontSize: 14,
  },

  addModalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  addModalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  exerciseOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  exerciseOptionText: {
    fontSize: 16,
  },

  modalCancelBtn: {
    marginTop: 15,
    paddingVertical: 10,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },

});
