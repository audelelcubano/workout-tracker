import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { EXERCISES } from "@/data/exercises";

export default function SelectExercisesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Safe parse of groups
  const rawGroups = params.groups;
  const selectedGroups: string[] =
    typeof rawGroups === "string" ? JSON.parse(rawGroups) : [];

  // State + hooks MUST come before any conditional return
  const normalizedGroups = selectedGroups.map((g) =>
    g.trim().toLowerCase()
    );

  const filteredExercises = useMemo(() => {
    return EXERCISES.filter((ex) =>
        normalizedGroups.includes(ex.muscleGroup)
    );
}, [normalizedGroups]);


  const [selected, setSelected] = useState<
    { id: string; sets: string; reps: string }[]
  >([]);

  // ---- CONDITIONAL RETURN GOES *AFTER* HOOKS ----
  if (selectedGroups.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Select Exercises</Text>
          <Text style={styles.subtitle}>
            No muscle groups selected. Please start from &quot;Select Muscle Groups&quot;.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const toggleExercise = (exerciseId: string) => {
    const exists = selected.find((s) => s.id === exerciseId);

    if (exists) {
      setSelected((prev) => prev.filter((x) => x.id !== exerciseId));
    } else {
      setSelected((prev) => [...prev, { id: exerciseId, sets: "3", reps: "8" }]);
    }
  };

  const updateField = (id: string, field: "sets" | "reps", value: string) => {
    setSelected((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const goNext = () => {
    if (selected.length === 0) return;

    router.push({
      pathname: "/create-routine/summary",
      params: {
        groups: JSON.stringify(selectedGroups),
        exercises: JSON.stringify(selected),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Select Exercises</Text>
        <Text style={styles.subtitle}>Based on your chosen muscle groups</Text>

        {filteredExercises.map((exercise) => {
          const isSelected = selected.some((s) => s.id === exercise.id);

          return (
            <View key={exercise.id} style={styles.item}>
              <Pressable
                onPress={() => toggleExercise(exercise.id)}
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.groupText}>
                  {exercise.muscles.join(", ")}
                </Text>
              </View>

              {isSelected && (
                <View style={styles.inputs}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={selected.find((s) => s.id === exercise.id)?.sets || ""}
                    onChangeText={(v) => updateField(exercise.id, "sets", v)}
                    placeholder="Sets"
                  />

                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={selected.find((s) => s.id === exercise.id)?.reps || ""}
                    onChangeText={(v) => updateField(exercise.id, "reps", v)}
                    placeholder="Reps"
                  />
                </View>
              )}
            </View>
          );
        })}

        <Pressable
          style={[
            styles.continueBtn,
            selected.length === 0 && styles.disabledBtn,
          ]}
          onPress={goNext}
          disabled={selected.length === 0}
        >
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20, paddingBottom: 120 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#444", marginBottom: 20 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: "#555",
    borderRadius: 4,
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: "#555",
  },
  exerciseName: { fontSize: 16, fontWeight: "600" },
  groupText: { fontSize: 12, color: "#888" },
  inputs: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 55,
  },
  continueBtn: {
    marginTop: 25,
    padding: 15,
    backgroundColor: "#222",
    borderRadius: 10,
    alignItems: "center",
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledBtn: {
    backgroundColor: "#aaa",
  },
});
