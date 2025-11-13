
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "@/components/Auth";

//Orignally everything was stored in AsyncStorage, its now in firebase.
// data is stored under users/{uid}/history in firebase
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface WorkoutEntry {
  id: string;
  exercise: string;
  sets: string;
  reps: string;
  weight: string;
  date: string;
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  useFocusEffect(
    //focus effect reloads the history so that
    // the data is refreshed after tabs are switched
    useCallback(() => {
      const loadHistory = async () => {
        if (!user) {
          setWorkouts([]);
          return;
        }

        const historyCol = collection(db, "users", user.uid, "history");
        const q = query(historyCol, orderBy("date", "desc"));
        const snap = await getDocs(q);

        const rows: WorkoutEntry[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<WorkoutEntry, "id">),
        }));

        setWorkouts(rows);
      };

      loadHistory();
    }, [user])
  );

  const deleteWorkout = async (id: string) => {
    if (!user) return;
    Alert.alert("Delete Workout", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "users", user.uid, "history", id));
          setWorkouts((prev) => prev.filter((w) => w.id !== id));
        },
      },
    ]);
  };

  const clearAll = async () => {
    if (!user) return;
    Alert.alert("Clear All Workouts", "This cannot be undone!", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          const batch = writeBatch(db);
          workouts.forEach((w) => {
            batch.delete(doc(db, "users", user.uid, "history", w.id));
          });
          await batch.commit();
          setWorkouts([]);
        },
      },
    ]);
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
        <Text style={styles.title}>📊 Workout History</Text>

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
                📅 {new Date(item.date).toLocaleString()}
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
