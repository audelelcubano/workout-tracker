import { useEffect, useState } from "react";
import {Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert, Platform, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/components/Auth";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function SavedRoutinesScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------
  // LOAD ROUTINES
  // -------------------------------
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      const ref = collection(db, "users", user.uid, "routines");
      const snap = await getDocs(ref);

      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setRoutines(items);
      setLoading(false);
    };

    load();
  }, [user]);

  // -------------------------------
  // DELETE ROUTINE (WEB + MOBILE)
  // -------------------------------
  const deleteRoutine = async (id: string) => {
    if (!user) return;

    const performDelete = async () => {
      await deleteDoc(doc(db, "users", user.uid, "routines", id));

      // update UI
      setRoutines((prev) => prev.filter((r) => r.id !== id));
    };

    if (Platform.OS === "web") {
      // Web confirm()
      const ok = window.confirm("Are you sure you want to delete this routine?");
      if (ok) performDelete();
      return;
    }

    // Mobile Alert
    Alert.alert("Delete Routine", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: performDelete },
    ]);
  };

  // -------------------------------
  // RENDER
  // -------------------------------
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Saved Routines</Text>

        {routines.length === 0 && (
          <Text style={styles.emptyText}>No routines saved yet.</Text>
        )}

        {routines.map((routine) => (
          <View key={routine.id} style={styles.item}>
            {/* TAP TO OPEN ROUTINE */}
            <Pressable
              style={{ flex: 1 }}
              onPress={() =>
                router.push({
                  pathname: "/saved-routines/[id]",
                  params: { id: routine.id },
                })
              }
            >
              <Text style={styles.routineName}>{routine.name}</Text>
              <Text style={styles.countText}>
                {routine.exercises.length} exercises
              </Text>
            </Pressable>

            {/* DELETE BUTTON */}
            <Pressable
              style={styles.deleteBtn}
              onPress={() => deleteRoutine(routine.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  emptyText: { color: "#777", textAlign: "center", marginTop: 20 },

  item: {
    padding: 16,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  routineName: { fontSize: 18, fontWeight: "700" },
  countText: { color: "#666", marginTop: 4 },

  deleteBtn: {
    backgroundColor: "#ffdddd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteText: { color: "#a00", fontWeight: "700" },
});
