import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/Auth";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export default function CardioScreen() {
  const { user } = useAuth();

  const [speed, setSpeed] = useState("5"); // mph input
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  const [completed, setCompleted] = useState(false);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);

  /** Timer */
  useEffect(() => {
    let interval: any = null;

    if (running) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!running) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [running]);

  /** Save session into Firestore history */
  const saveCardioSession = async (durationSeconds: number, mph: number) => {
    if (!user) return;

    const miles = (durationSeconds / 3600) * mph;
    const cals = miles * 100; // basic formula

    await addDoc(collection(db, "users", user.uid, "history"), {
      type: "cardio",
      speed: mph,
      duration: durationSeconds,
      distance: miles,
      calories: cals,
      createdAt: new Date(),
      date: new Date().toISOString(),
    });
  };

  /** Handle Start/Stop button */
  const handlePress = async () => {
    if (running) {
      // Stop timer
      setRunning(false);

      const mph = parseFloat(speed) || 0;
      const miles = (seconds / 3600) * mph;
      const cals = miles * 100;

      setDistance(miles);
      setCalories(cals);
      setCompleted(true);

      await saveCardioSession(seconds, mph);

      return;
    }

    // Reset + start
    setSeconds(0);
    setCompleted(false);
    setRunning(true);
  };

  /** Format timer display */
  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ImageBackground
      source={require("../../assets/images/R.png")} // adjust path to your image
      style={styles.background}
      resizeMode="cover"
    >
      {/* Overlay for readability */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Cardio Session</Text>

          {/* Speed Input */}
          <Text style={styles.label}>Estimated Running Speed (mph):</Text>
          <TextInput
            value={speed}
            onChangeText={setSpeed}
            keyboardType="numeric"
            style={styles.input}
          />

          {/* Timer */}
          <Text style={styles.timer}>{formatTime()}</Text>

          {/* Start / Stop Button */}
          <Pressable
            onPress={handlePress}
            style={[styles.button, running ? styles.stopBtn : styles.startBtn]}
          >
            <Text style={styles.buttonText}>
              {running ? "Stop" : "Start"}
            </Text>
          </Pressable>

          {/* COMPLETED SUMMARY */}
          {completed && (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Session Complete 🎉</Text>

              <Text style={styles.summaryText}>
                Duration: {Math.floor(seconds / 60)} min {seconds % 60}s
              </Text>

              <Text style={styles.summaryText}>
                Estimated Distance: {distance.toFixed(2)} miles
              </Text>

              <Text style={styles.summaryText}>
                Estimated Calories Burned: {calories.toFixed(0)} kcal
              </Text>

              {/* Placeholder for future image */}
              <View style={styles.imagePlaceholder}>
                <Text style={{ color: "#888" }}>Track Image Placeholder</Text>
              </View>
            </View>
          )}
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
  container: { padding: 20, flex: 1 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: "#fff" },
  label: { fontSize: 16, marginBottom: 6, color: "#eee" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.8)", // semi-transparent for readability
  },
  timer: {
    fontSize: 48,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 20,
    color: "#fff",
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  startBtn: { backgroundColor: "#22c55e" },
  stopBtn: { backgroundColor: "#ef4444" },
  buttonText: { fontSize: 18, fontWeight: "700", color: "#fff" },
  summaryBox: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1f7c4",
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    color: "#000",
  },
  summaryText: { fontSize: 16, marginBottom: 6, color: "#333" },
  imagePlaceholder: {
    marginTop: 20,
    height: 150,
    backgroundColor: "#eee",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});