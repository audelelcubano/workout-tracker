import { View, Text, StyleSheet, Pressable, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function RoutinesScreen() {
  return (
    <ImageBackground
      source={require("../../assets/images/routine.png")} // go up two levels from app/(tabs)
      style={styles.background}
      resizeMode="cover"
    >
      {/* Overlay for readability */}
      <View style={styles.overlay} />

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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)", // darkens background slightly
  },
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    color: "#fff", // white for contrast
  },
  subtitle: {
    fontSize: 16,
    color: "#eee", // light gray for readability
    marginBottom: 20,
  },
  button: {
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.85)", // semi-transparent white
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#000" },
});