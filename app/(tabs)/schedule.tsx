import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Button, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScheduledWorkout {
  id: string;
  day: string;
  exercise: string;
}

export default function ScheduleScreen() {
  const [day, setDay] = useState("");
  const [exercise, setExercise] = useState("");
  const [schedule, setSchedule] = useState<ScheduledWorkout[]>([]);

  const saveSchedule = async () => {
    if (!day || !exercise) return;
    const newEntry = { id: Date.now().toString(), day, exercise };
    const updatedSchedule = [...schedule, newEntry];
    setSchedule(updatedSchedule);

    // Save to local storage
    await AsyncStorage.setItem("schedule", JSON.stringify(updatedSchedule));

    // Reset fields
    setDay("");
    setExercise("");
  };

  const loadSchedule = async () => {
    const stored = await AsyncStorage.getItem("schedule");
    if (stored) setSchedule(JSON.parse(stored));
  };

  // Load data on screen mount
  useState(() => {
    loadSchedule();
  });

  const clearSchedule = async () => {
    await AsyncStorage.removeItem("schedule");
    setSchedule([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🗓️ Weekly Schedule</Text>
     
      <TextInput
        placeholder="Day (e.g., Monday)"
        style={styles.input}
        value={day}
        onChangeText={setDay}
      />
      <TextInput
        placeholder="Exercise (e.g., Bench Press)"
        style={styles.input}
        value={exercise}
        onChangeText={setExercise}
      />

      <Button title="Add to Schedule" onPress={saveSchedule} />

      <FlatList
        data={schedule}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              {item.day}: {item.exercise}
            </Text>
          </View>
        )}
      />

      {schedule.length > 0 && (
        <Pressable onPress={clearSchedule} style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear Schedule</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  item: {
    padding: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  itemText: { fontSize: 16 },
  clearBtn: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    alignItems: "center",
  },
  clearText: { color: "#444", fontWeight: "600" },
});
