import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "@/components/Auth";
import { usePathname, useRouter } from "expo-router";

import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

async function clearSessionWorkoutsForUser(uid: string) {
  const sessionCol = collection(db, "users", uid, "sessionWorkouts");
  const snapshot = await getDocs(sessionCol);
  const batch = writeBatch(db);

  snapshot.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

interface WorkoutEntry {
  id: string;

  // Lifting Workout Fields
  exercise?: string;
  sets?: string;
  reps?: string;
  weight?: string;

  // Common Fields
  date: string;
  type?: string; // "routine", "normal", or "cardio"
  _ref: any;

  // Routine Fields
  routineName?: string;

  // Cardio Fields
  speed?: number;
  duration?: number;
  distance?: number;
  calories?: number;
  createdAt?: any;
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  useEffect(() => {
    if (pathname !== "/(tabs)/history") {
      setWorkouts([]);
    }
  }, [pathname]);

  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        if (!user) {
          setWorkouts([]);
          return;
        }

        const historyCol = collection(db, "users", user.uid, "history");
        const q = query(historyCol); // no orderBy

        const snap = await getDocs(q);

        const rows = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          _ref: d.ref,
        })) as WorkoutEntry[];

        rows.sort((a, b) => {
          const da = a.createdAt?.seconds
            ? a.createdAt.seconds * 1000
            : new Date(a.date).getTime();

          const db = b.createdAt?.seconds
            ? b.createdAt.seconds * 1000
            : new Date(b.date).getTime();

          return db - da; // newest first
        });

        setWorkouts(rows);
      };

      loadHistory();
      return () => setWorkouts([]);
    }, [user])
  );

  const clearAll = async () => {
    if (!user) return;

    if (Platform.OS === "web") {
      confirmClearAll();
      return;
    }

    Alert.alert("Clear All Workouts", "This cannot be undone!", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => confirmClearAll() },
    ]);
  };

  const confirmClearAll = async () => {
    if (!user) return;

    try {
      const batch = writeBatch(db);

      workouts.forEach((w) => batch.delete(w._ref));
      await batch.commit();
      await clearSessionWorkoutsForUser(user.uid);

      setWorkouts([]);
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  const deleteWorkout = async (id: string) => {
    const target = workouts.find((w) => w.id === id);
    if (!user || !target) return;

    await deleteDoc(target._ref);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.empty}>Sign in to view your workout history.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Workout History</Text>

        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <Text style={styles.empty}>No workouts logged yet.</Text>
          }
          renderItem={({ item }) => {
            const isRoutine = item.type === "routine";
            const isCardio = item.type === "cardio";
            const isRoutineChild = !isRoutine && !isCardio && !!item.routineName;

            return (
              <Pressable
                style={[
                  styles.item,
                  (isRoutine || isRoutineChild) && styles.routineItem,
                  isCardio && styles.cardioItem,
                ]}
                onLongPress={() => deleteWorkout(item.id)}
              >
                {/* ROUTINE ENTRY */}
                {isRoutine && (
                  <>
                    <Text style={styles.itemText}>
                      📝 Routine: {item.routineName}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(item.date).toLocaleString()}
                    </Text>
                  </>
                )}

                {/* CARDIO ENTRY */}
                {isCardio && (
                  <>
                    <Text style={styles.itemText}>🏃 Cardio Session</Text>
                    <Text style={styles.itemSub}>
                      Speed: {item.speed ?? 0} mph
                    </Text>
                    <Text style={styles.itemSub}>
                      Duration: {Math.floor((item.duration ?? 0) / 60)}m{" "}
                      {(item.duration ?? 0) % 60}s
                    </Text>
                    <Text style={styles.itemSub}>
                      Distance: {(item.distance ?? 0).toFixed(2)} miles
                    </Text>
                    <Text style={styles.itemSub}>
                      Calories Burned: {(item.calories ?? 0).toFixed(0)} kcal
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(
                        (item.createdAt?.seconds ?? 0) * 1000 || item.date
                      ).toLocaleString()}
                    </Text>
                  </>
                )}

                {/* NORMAL LIFTING ENTRY */}
                {!isRoutine && !isCardio && (
                  <>
                    <Text style={styles.itemText}>
                      {item.exercise} — {item.weight} lbs × {item.reps} reps
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(item.date).toLocaleString()}
                    </Text>
                  </>
                )}
              </Pressable>
            );
          }}
        />

        {/* VIEW ANALYTICS BUTTON */}
        <Pressable
          style={styles.analyticsBtn}
          onPress={() => router.push("/analytics")}
        >
          <Text style={styles.analyticsText}>📊 View Analytics</Text>
        </Pressable>

        {workouts.length > 0 && (
          <Pressable style={styles.clearBtn} onPress={clearAll}>
            <Text style={styles.clearText}>Clear All</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  item: {
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },

  routineItem: {
    backgroundColor: "#e7f3ff",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 14,
    marginVertical: 4,
  },

  cardioItem: {
    backgroundColor: "#e7ffe7",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 14,
    marginVertical: 4,
  },

  itemText: { fontSize: 16, color: "#333" },
  itemSub: { fontSize: 15, color: "#555" },
  dateText: { fontSize: 14, color: "#777", marginTop: 3 },

  empty: {
    marginTop: 20,
    textAlign: "center",
    color: "#777",
    fontSize: 16,
  },

  analyticsBtn: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#dce9ff",
    borderRadius: 8,
    alignItems: "center",
  },
  analyticsText: {
    color: "#0A3B8A",
    fontWeight: "700",
    fontSize: 16,
  },

  clearBtn: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    alignItems: "center",
  },
  clearText: { color: "#444", fontWeight: "600" },
});
