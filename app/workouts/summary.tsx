import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/components/Auth";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function WorkoutSummaryScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const params = useLocalSearchParams();
  const routineName = params.routineName as string;

  // We still show loggedData visually, but we DO NOT save it
  const loggedData = JSON.parse(params.loggedData as string);

  const saveWorkout = async () => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "history");

    await addDoc(ref, {
      type: "routine",
      routineName,
      date: new Date().toISOString(),
    });

    router.replace("/(tabs)/history");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Workout Summary</Text>
        <Text style={styles.subtitle}>{routineName}</Text>

        {/* Visual-only summary */}
        {loggedData.map((entry: any) => (
          <View key={entry.id} style={styles.exerciseBox}>
            <Text style={styles.exerciseName}>{entry.name}</Text>

            {entry.sets.map((set: any, i: number) => (
              <Text key={i} style={styles.setLine}>
                Set {i + 1}: {set.weight} lbs × {set.reps} reps
              </Text>
            ))}
          </View>
        ))}

        <Pressable style={styles.saveBtn} onPress={saveWorkout}>
          <Text style={styles.saveText}>Save Workout</Text>
        </Pressable>

        <Pressable
          style={styles.discardBtn}
          onPress={() => router.replace("/(tabs)/routines")}
        >
          <Text style={styles.discardText}>Discard Workout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 5 },
  subtitle: { fontSize: 18, color: "#666", marginBottom: 20 },

  exerciseBox: {
    padding: 15,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginBottom: 15,
  },
  exerciseName: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  setLine: { fontSize: 14, color: "#444", marginVertical: 2 },

  saveBtn: {
    marginTop: 20,
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  discardBtn: {
    marginTop: 10,
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  discardText: { color: "#444" },
});
