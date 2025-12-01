import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/Auth";
import { collection, getDocs } from "firebase/firestore";

export default function ScheduleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();

  const [assigned, setAssigned] = useState<any>({});
  const [weeklyPlan, setWeeklyPlan] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadAssigned = async () => {
      const ref = collection(db, "users", user.uid, "schedule");
      const snap = await getDocs(ref);

      const map: any = {};
      snap.forEach((doc) => {
        map[doc.id] = doc.data();
      });

      setAssigned(map);
    };

    loadAssigned();
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const generatePlan = () => {
    if (!profile?.goal) return;

    let plan: any[] = [];

    switch (profile.goal) {
      case "Build Muscle":
        plan = [
          { name: "Push Day (Chest, Shoulders, Triceps)" },
          { name: "Pull Day (Back, Biceps)" },
          { name: "Leg Day" },
          { name: "Rest / Light Cardio" },
          { name: "Upper Hypertrophy" },
          { name: "Lower Hypertrophy" },
          { name: "Rest" },
        ];
        break;

      case "Lose Fat":
        plan = [
          { name: "Full Body Strength" },
          { name: "HIIT Cardio" },
          { name: "Rest / Walking" },
          { name: "Full Body Circuit" },
          { name: "Low Intensity Steady Cardio" },
          { name: "Strength + Cardio Mix" },
          { name: "Rest" },
        ];
        break;

      case "Increase Endurance":
        plan = [
          { name: "Long Run" },
          { name: "Cross-Training" },
          { name: "Rest / Stretching" },
          { name: "Tempo Run" },
          { name: "Strength (Leg Focus)" },
          { name: "Light Jog" },
          { name: "Rest" },
        ];
        break;

      case "Gain Strength":
        plan = [
          { name: "Upper Strength (Low Rep)" },
          { name: "Lower Strength (Low Rep)" },
          { name: "Rest" },
          { name: "Upper Strength (Heavy)" },
          { name: "Lower Strength (Heavy)" },
          { name: "Conditioning" },
          { name: "Rest" },
        ];
        break;

      case "Improve Overall Health":
        plan = [
          { name: "Full Body Training" },
          { name: "Light Cardio" },
          { name: "Stretch + Core" },
          { name: "Full Body Training" },
          { name: "Walk / Jog" },
          { name: "Active Recovery" },
          { name: "Rest" },
        ];
        break;

      default:
        plan = [];
        break;
    }

    setWeeklyPlan(plan);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your Training Schedule</Text>

        <View style={styles.profileBox}>
          <Text style={styles.profileLabel}>Goal:</Text>
          <Text style={styles.profileValue}>{profile?.goal || "Not set"}</Text>

          <Text style={styles.profileLabel}>Experience:</Text>
          <Text style={styles.profileValue}>{profile?.experience || "Not set"}</Text>
        </View>

        <Text style={styles.sectionTitle}>Recommended Plan (Based on Your Goal)</Text>

        {weeklyPlan.length === 0 && (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>
              No schedule created yet.{"\n"}Press “Generate Plan” to begin.
            </Text>

            <Pressable style={styles.generateBtn} onPress={generatePlan}>
              <Text style={styles.generateText}>Generate Plan</Text>
            </Pressable>
          </View>
        )}

        {weeklyPlan.length > 0 && (
          <View style={styles.planBox}>
            {weeklyPlan.map((day, index) => {
              const dayKey = `day${index + 1}`;
              const assignedRoutine = assigned[dayKey]?.routineName;

              return (
                <Pressable
                  key={index}
                  style={styles.dayBox}
                  onPress={() => router.push(`/schedule/pick-routine?day=${dayKey}`)}
                >
                  <Text style={styles.dayTitle}>Day {index + 1}</Text>
                  <Text>{day.name}</Text>

                  {assignedRoutine && (
                    <Text style={{ color: "#444", marginTop: 4 }}>
                      Assigned: {assignedRoutine}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20, flexGrow: 1, paddingBottom: 80 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  profileBox: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  profileLabel: { fontWeight: "600" },
  profileValue: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10,
  },
  placeholderBox: {
    padding: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 20,
  },
  placeholderText: { textAlign: "center", color: "#888" },
  generateBtn: {
    padding: 14,
    backgroundColor: "#e9e9e9",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  generateText: { fontSize: 16, fontWeight: "600" },
  planBox: { marginTop: 20 },
  dayBox: {
    paddingVertical: 12,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  dayTitle: { fontSize: 16, fontWeight: "700" },
});
