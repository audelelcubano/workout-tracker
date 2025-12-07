import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function CreateRoutineScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <Text style={styles.title}>Create a Routine</Text>
        <Text style={styles.subtitle}>
          Build a custom routine by picking exercises and organizing your training days.
        </Text>

        {/* Step 1 — pick muscle groups */}
        <Link href="/create-routine/select-muscle-groups" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Select Muscle Groups</Text>
          </Pressable>
        </Link>

        {/* Step 2 — pick exercises */}
        <Link href="/create-routine/select-exercises" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Choose Exercises</Text>
          </Pressable>
        </Link>

        {/* Step 3 — finalize */}
        <Link href="/create-routine/summary" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Review & Save Routine</Text>
          </Pressable>
        </Link>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#333", marginBottom: 25 },
  button: {
    padding: 15,
    backgroundColor: "#e9e9e9",
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
});
