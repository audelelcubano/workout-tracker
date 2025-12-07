import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/components/Auth";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";

// Helper to convert "day1" → "Monday", etc.
function formatDay(raw: string) {
  const map: any = {
    day1: "Monday",
    day2: "Tuesday",
    day3: "Wednesday",
    day4: "Thursday",
    day5: "Friday",
    day6: "Saturday",
    day7: "Sunday",
  };
  return map[raw] || raw;
}

export default function PickRoutineScreen() {
  const { day } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [routines, setRoutines] = useState<any[]>([]);

  // Load routines once user is available
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const ref = collection(db, "users", user.uid, "routines");
      const snap = await getDocs(ref);
      setRoutines(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    load();
  }, [user]);

  const selectRoutine = async (routine: any) => {
    if (!user || !day) return;

    const ref = doc(db, "users", user.uid, "schedule", day as string);

    await setDoc(ref, {
      day: day,
      routineId: routine.id,
      routineName: routine.name,
      assignedAt: new Date().toISOString(),
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          Select Routine for {formatDay(day as string)}
        </Text>

        {routines.map((r) => (
          <Pressable
            key={r.id}
            style={styles.item}
            onPress={() => selectRoutine(r)}
          >
            <Text style={styles.name}>{r.name}</Text>
            <Text style={styles.sub}>{r.exercises?.length} exercises</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  item: {
    padding: 16,
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: "600" },
  sub: { fontSize: 14, color: "#666" },
});
