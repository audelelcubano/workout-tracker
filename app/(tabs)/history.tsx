import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  getDocs,
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
import { Ionicons } from "@expo/vector-icons";

async function clearSessionWorkoutsForUser(uid: string) {
  const col = collection(db, "users", uid, "sessionWorkouts");
  const snap = await getDocs(col);
  const batch = writeBatch(db);
  snap.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

interface WorkoutEntry {
  id: string;
  exercise?: string;
  sets?: string;
  reps?: string;
  weight?: string;

  date: string;
  type?: string; // routine, normal, cardio
  _ref: any;

  routineName?: string;
  speed?: number;
  duration?: number;
  distance?: number;
  calories?: number;
  createdAt?: any;

  timeoutId?: number;
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [lastDeleted, setLastDeleted] = useState<WorkoutEntry | null>(null);
  const [undoVisible, setUndoVisible] = useState(false);

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
        const q = query(historyCol);
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
          return db - da;
        });

        setWorkouts(rows);
      };

      loadHistory();
      return () => setWorkouts([]);
    }, [user])
  );

  const clearAll = () => {
    if (!user) return;

    const onConfirm = async () => {
      const batch = writeBatch(db);
      workouts.forEach((w) => batch.delete(w._ref));
      await batch.commit();
      await clearSessionWorkoutsForUser(user.uid);
      setWorkouts([]);
    };

    if (Platform.OS === "web") return onConfirm();

    Alert.alert("Clear All Workouts", "This cannot be undone!", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: onConfirm },
    ]);
  };

  const deleteWorkout = async (id: string) => {
    const target = workouts.find((w) => w.id === id);
    if (!user || !target) return;

    // Remove visually
    setWorkouts((prev) => prev.filter((w) => w.id !== id));

    // Save backup
    setLastDeleted(target);
    setUndoVisible(true);

    // Delay real deletion
    const timeoutId = window.setTimeout(async () => {
      // If undo still visible → user hasn’t undone yet
      if (undoVisible) return;

      await deleteDoc(target._ref);
      setLastDeleted(null);
    }, 5000);

    target.timeoutId = timeoutId;
  };

  const confirmDelete = (id: string) => {
    if (Platform.OS === "web") return deleteWorkout(id);

    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this workout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteWorkout(id) },
      ]
    );
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
            const isRoutineChild =
              !isRoutine && !isCardio && !!item.routineName;

            return (
              <View style={styles.row}>
                {/* MAIN ENTRY */}
                <Pressable
                  style={[
                    styles.item,
                    (isRoutine || isRoutineChild) && styles.routineItem,
                    isCardio && styles.cardioItem,
                  ]}
                  onLongPress={() => confirmDelete(item.id)}
                >
                  {/* ROUTINE */}
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

                  {/* CARDIO */}
                  {isCardio && (
                    <>
                      <Text style={styles.itemText}>🏃 Cardio Session</Text>
                      <Text style={styles.itemSub}>
                        Speed: {item.speed ?? 0} mph
                      </Text>
                      <Text style={styles.itemSub}>
                        Duration:{" "}
                        {Math.floor((item.duration ?? 0) / 60)}m{" "}
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
                          (item.createdAt?.seconds ?? 0) * 1000
                        ).toLocaleString()}
                      </Text>
                    </>
                  )}

                  {/* LIFTING */}
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

                {/* TRASH BUTTON */}
                <Pressable
                  style={styles.trashBtn}
                  onPress={() => confirmDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#cc0000" />
                </Pressable>
              </View>
            );
          }}
        />

        {/* ANALYTICS BUTTON */}
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

      {/* UNDO SNACKBAR */}
      {undoVisible && (
        <View style={styles.undoBox}>
          <Text style={styles.undoText}>Workout deleted</Text>

          <Pressable
            onPress={() => {
              if (lastDeleted) {
                clearTimeout(lastDeleted.timeoutId);
                setWorkouts((prev) => [lastDeleted, ...prev]);
              }
              setUndoVisible(false);
              setLastDeleted(null);
            }}
          >
            <Text style={styles.undoButtonText}>UNDO</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

/* -------------------------------- STYLES -------------------------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  item: {
    flex: 1,
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

  trashBtn: {
    padding: 10,
    marginLeft: 8,
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

  undoBox: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  undoText: { color: "#fff", fontSize: 16 },
  undoButtonText: {
    color: "#4DB6FF",
    fontWeight: "700",
    fontSize: 16,
  },
});
