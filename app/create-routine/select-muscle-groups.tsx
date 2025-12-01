import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
];

export default function SelectMuscleGroupsScreen() {
  const router = useRouter();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const toggleGroup = (group: string) => {
    setSelectedGroups((prev) =>
      prev.includes(group)
        ? prev.filter((g) => g !== group)
        : [...prev, group]
    );
  };

  const goNext = () => {
    router.push({
      pathname: "/create-routine/select-exercises",
      params: { groups: JSON.stringify(selectedGroups) },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Select Muscle Groups</Text>
        <Text style={styles.subtitle}>Choose all groups for this routine.</Text>

        {MUSCLE_GROUPS.map((group) => {
          const active = selectedGroups.includes(group);

          return (
            <Pressable
              key={group}
              onPress={() => toggleGroup(group)}
              style={[styles.groupBtn, active && styles.groupBtnActive]}
            >
              <Text style={[styles.groupText, active && styles.groupTextActive]}>
                {group}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          style={[
            styles.nextBtn,
            selectedGroups.length === 0 && { opacity: 0.4 },
          ]}
          disabled={selectedGroups.length === 0}
          onPress={goNext}
        >
          <Text style={styles.nextText}>Next: Select Exercises</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20, color: "#555" },

  groupBtn: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  groupBtnActive: {
    backgroundColor: "#e0e0e0",
    borderColor: "#999",
  },
  groupText: {
    fontSize: 16,
  },
  groupTextActive: {
    fontWeight: "700",
  },

  nextBtn: {
    marginTop: 30,
    padding: 16,
    backgroundColor: "#000",
    borderRadius: 10,
    alignItems: "center",
  },
  nextText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
