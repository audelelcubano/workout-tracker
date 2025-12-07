import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function RoutinesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Routines</Text>

        <Text style={styles.subtitle}>
          Manage your workout routines and training structure.
        </Text>

        {/* Start One-Off Workout */}
        <Link href="/workouts" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Start One-Off Workout</Text>
          </Pressable>
        </Link>

        {/* Start Cardio Session */}
        <Link href="/cardio" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Start Cardio Session</Text>
          </Pressable>
        </Link>

        {/* Create New Routine */}
        <Link href="../create-routine" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Create New Routine</Text>
          </Pressable>
        </Link>

        {/* View Saved Routines */}
        <Link href="../saved-routines" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Saved Routines</Text>
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
  subtitle: { fontSize: 16, color: "#333", marginBottom: 20 },

  button: {
    padding: 15,
    backgroundColor: "#e9e9e9",
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
});
