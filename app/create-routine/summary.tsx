import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/Auth";
import { collection, addDoc } from "firebase/firestore";
import { EXERCISES } from "@/data/exercises";

export default function SummaryScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const params = useLocalSearchParams();

  // --- SAFE PARAM PARSING ---
  const parsedGroups = useMemo(() => {
    if (typeof params.groups === "string") {
      try {
        return JSON.parse(params.groups);
      } catch {
        return [];
      }
    }
    return [];
  }, [params.groups]);

  const parsedExercises = useMemo(() => {
    if (typeof params.exercises === "string") {
      try {
        return JSON.parse(params.exercises);
      } catch {
        return [];
      }
    }
    return [];
  }, [params.exercises]);

  // --- GUARD SCREEN ---
  if (parsedGroups.length === 0 || parsedExercises.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Routine Summary</Text>
          <Text style={styles.sectionTitle}>
            Missing routine data. Please restart the routine creation process.
          </Text>

          <Pressable
            style={styles.saveBtn}
            onPress={() => router.push("/create-routine/select-muscle-groups")}
          >
            <Text style={styles.saveText}>Start Over</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Routine Name state
  const [routineName, setRoutineName] = useState("");

  const saveRoutine = async () => {
    if (!user) return;

    if (routineName.trim() === "") {
      Alert.alert("Name required", "Please enter a name for your routine.");
      return;
    }

    try {
      const ref = collection(db, "users", user.uid, "routines");

      await addDoc(ref, {
        name: routineName,
        groups: parsedGroups,
        exercises: parsedExercises,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Saved!", "Your routine has been saved.");
      router.push("../saved-routines");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not save routine.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Routine Summary</Text>

        {/* Routine Name Input */}
        <Text style={styles.label}>Routine Name</Text>
        <TextInput
          style={styles.input}
          value={routineName}
          onChangeText={setRoutineName}
          placeholder="e.g. Push Day, Full Body A"
        />

        {/* Muscle Groups */}
        <Text style={styles.sectionTitle}>Muscle Groups</Text>
        <View style={styles.box}>
          {parsedGroups.map((g: string, idx: number) => (
            <Text key={idx} style={styles.itemText}>
              • {g}
            </Text>
          ))}
        </View>

        {/* Exercises */}
        <Text style={styles.sectionTitle}>Exercises</Text>
        <View style={styles.box}>
          {parsedExercises.map((ex: any, idx: number) => {
            const info = EXERCISES.find((e) => e.id === ex.id);

            return (
              <View key={idx} style={styles.exerciseBlock}>
                <Text style={styles.exerciseName}>{info?.name}</Text>
                <Text style={styles.setsReps}>
                  {ex.sets} sets × {ex.reps} reps
                </Text>
              </View>
            );
          })}
        </View>

        {/* Save Button */}
        <Pressable style={styles.saveBtn} onPress={saveRoutine}>
          <Text style={styles.saveText}>Save Routine</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20, paddingBottom: 120 },

  title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },

  label: { fontSize: 16, fontWeight: "600", marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    padding: 12, marginBottom: 20, fontSize: 16,
  },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginVertical: 10 },
  box: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  itemText: { fontSize: 16, marginBottom: 4 },

  exerciseBlock: { marginBottom: 10 },
  exerciseName: { fontSize: 16, fontWeight: "600" },
  setsReps: { fontSize: 14, color: "#666" },

  saveBtn: {
    padding: 15,
    backgroundColor: "#222",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
