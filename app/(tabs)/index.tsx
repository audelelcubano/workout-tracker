import { StyleSheet, Text, View } from "react-native";
import React from 'react';
import { useAuth } from '@/components/Auth';

export default function HomeScreen() {
    const {user} = useAuth();
      const name = user?.displayName || 
        (user?.email ? user.email.split('@')[0] : 'Athlete');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏋️ Workout Tracker Home</Text>
      <Text style={styles.subtitle}>Welcome Back, {name} </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
