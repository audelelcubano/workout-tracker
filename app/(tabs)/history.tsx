import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {collection, deleteDoc, doc, getDocs, orderBy, query, writeBatch,} from "firebase/firestore";
import { useAuth } from "@/components/Auth";
import { usePathname } from "expo-router";

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

// Helper: clear session workouts too
async function clearSessionWorkoutsForUser(uid: string) {
  const sessionCol = collection(db, "users", uid, "sessionWorkouts");
  const snapshot = await getDocs(sessionCol);
  const batch = writeBatch(db);

  snapshot.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// Workout entry structure
interface WorkoutEntry {
  id: string;       // Firestore doc ID
  exercise: string;
  sets: string;
  reps: string;
  weight: string;
  date: string;
  _ref: any;        // Firebase doc reference (for deletion)
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const pathname = usePathname();

  // WEB: clear state when leaving page
  useEffect(() => {
    if (pathname !== "/(tabs)/history") {
      setWorkouts([]);
    }
  }, [pathname]);

  // Load history when focused
  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        if (!user) {
          setWorkouts([]);
          return;
        }

        const historyCol = collection(db, "users", user.uid, "history");
        const q = query(historyCol, orderBy("date", "desc"));
        const snap = await getDocs(q);

        const rows = snap.docs.map((d) => ({
          id: d.id,       // REAL FIREBASE DOC ID
          ...d.data(),
          _ref: d.ref,    // SAVE DOC REF FOR PROPER DELETE
        })) as WorkoutEntry[];

        setWorkouts(rows);
      };

      loadHistory();

      return () => {
        setWorkouts([]);
      };
    }, [user])
  );

  // Clear ALL history workouts
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

      // Delete using REAL Firestore doc refs
      workouts.forEach((w) => {
        batch.delete(w._ref);
      });

      await batch.commit();
      await clearSessionWorkoutsForUser(user.uid);

      setWorkouts([]);
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  // Delete a single item
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
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={styles.empty}>No workouts logged yet.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.item}
              onLongPress={() => deleteWorkout(item.id)}
            >
              <Text style={styles.itemText}>
                {item.exercise} — {item.weight} lbs × {item.reps} reps ×{" "}
                {item.sets} sets
              </Text>
              <Text style={styles.dateText}>
                {new Date(item.date).toLocaleString()}
              </Text>
            </Pressable>
          )}
        />

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
  itemText: { fontSize: 16, color: "#333" },
  dateText: {
    fontSize: 14,
    color: "#777",
    marginTop: 3,
  },
  empty: {
    marginTop: 20,
    textAlign: "center",
    color: "#777",
    fontSize: 16,
  },
  clearBtn: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    alignItems: "center",
  },
  clearText: { color: "#444", fontWeight: "600" },
});
