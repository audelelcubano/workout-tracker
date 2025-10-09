import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
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
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  // ✅ Load workouts from "history" key every time tab gains focus
  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        const stored = await AsyncStorage.getItem("history");
        if (stored) setWorkouts(JSON.parse(stored));
        else setWorkouts([]);
      };
      loadHistory();
    }, [])
  );

  const deleteWorkout = async (id: string) => {
    Alert.alert("Delete Workout", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = workouts.filter((w) => w.id !== id);
          setWorkouts(updated);
          await AsyncStorage.setItem("history", JSON.stringify(updated));
        },
      },
    ]);
  };

  const clearAll = async () => {
    Alert.alert("Clear All Workouts", "This cannot be undone!", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("history");
          setWorkouts([]);
        },
      },
    ]);
  };

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
                {item.exercise} — {item.weight} lbs × {item.reps} reps × {item.sets} sets
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
