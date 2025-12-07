import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/components/Auth";
import { EXERCISES } from "@/data/exercises";

export default function RoutineDetailScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const routineId = params.id as string;

  const [routine, setRoutine] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

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

      setRoutine({ id: snap.id, ...snap.data() });
      setLoading(false);
    };

    loadRoutine();
  }, [user, routineId]);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <Text style={styles.title}>{routine.name}</Text>

        {/* Muscle groups */}
        <Text style={styles.sectionTitle}>Muscle Groups</Text>
        <View style={styles.groupBox}>
          {routine.groups.map((g: string) => (
            <Text key={g} style={styles.groupText}>
              • {g}
            </Text>
          ))}
        </View>

        {/* Exercises */}
        <Text style={styles.sectionTitle}>Exercises</Text>
        <View style={styles.exercisesBox}>
          {routine.exercises.map((item: any) => {
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

        {/* Edit Routine - coming later */}
        <Pressable style={styles.editBtn}>
          <Text style={styles.editText}>Edit Routine (coming soon)</Text>
        </Pressable>

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
});
