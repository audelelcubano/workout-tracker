import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React from "react";
import { useAuth } from "@/components/Auth";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOutUser } = useAuth();

  const name =
    user?.displayName ||
    (user?.email ? user.email.split("@")[0] : "Athlete");

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Image
        source={require("@/assets/images/homeBackground.png")}
        style={styles.backgroundImage}
        blurRadius={1} 
      />

      <Text style={styles.title}>🏋️ Workout Tracker Home</Text>
      <Text style={styles.subtitle}>Welcome Back, {name}</Text>

      <View style={styles.buttons}>
        <Pressable
          style={styles.btn}
          onPress={() => router.push("/routines")}
        >
          <Text style={styles.btnText}>Go to Routines</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, { backgroundColor: "#e74c3c" }]}
          onPress={signOutUser}
        >
          <Text style={styles.btnText}>Log Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0.3, // makes it translucent
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  buttons: {
    marginTop: 30,
    width: "80%",
    gap: 12,
  },
  btn: {
    padding: 14,
    backgroundColor: "#222",
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
