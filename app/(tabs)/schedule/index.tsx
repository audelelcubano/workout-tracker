import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/Auth";
import { collection, getDocs } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";


/** Convert JS weekday → Day 1..7 (Mon = 1, Sun = 7) */
function getTodayIndex() {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon
  return jsDay === 0 ? 7 : jsDay;
}

export default function ScheduleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();
  const [assigned, setAssigned] = useState<any>({});
  const [weeklyPlan, setWeeklyPlan] = useState<any[]>([]);
  const [actionDay, setActionDay] = useState<string | null>(null);
  const [actionRoutine, setActionRoutine] = useState<{ name: string; id: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);


  /** Load assigned day routines from Firestore */
  useEffect(() => {
    if (!user) return;
    const loadAssigned = async () => {
      const ref = collection(db, "users", user.uid, "schedule");
      const snap = await getDocs(ref);

      const map: any = {};
      snap.forEach((doc) => (map[doc.id] = doc.data()));
      setAssigned(map);
    };
    loadAssigned();
  }, [user]);

  // Re-run when user returns to this screen (AFTER useEffect)
  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const loadAssigned = async () => {
        const ref = collection(db, "users", user.uid, "schedule");
        const snap = await getDocs(ref);

        const map: any = {};
        snap.forEach((doc) => (map[doc.id] = doc.data()));
        setAssigned(map);
      };

      loadAssigned();
    }, [user])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }





  /** Generate recommended training plan */
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
    }

    setWeeklyPlan(plan);
  };






  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>Your Training Schedule</Text>

        {/* Profile Details */}
        <View style={styles.profileBox}>
          <Text style={styles.profileLabel}>Goal:</Text>
          <Text style={styles.profileValue}>{profile?.goal || "Not set"}</Text>

          <Text style={styles.profileLabel}>Experience:</Text>
          <Text style={styles.profileValue}>{profile?.experience || "Not set"}</Text>
        </View>

        {/* ======================== */}
        {/* REAL 7-DAY SCHEDULER    */}
        {/* ======================== */}
        <Text style={styles.sectionTitle}>Your Weekly Schedule</Text>

        <View style={styles.planBox}>
          {[1, 2, 3, 4, 5, 6, 7].map((num) => {
            const dayKey = `day${num}`;
            const stored = assigned[dayKey];
            const assignedRoutine = stored?.routineName;
            const routineId = stored?.routineId;
            const isToday = getTodayIndex() === num;

            return (
              <Pressable
                key={num}
                style={[
                  styles.dayBox,
                  isToday && { backgroundColor: "#e7f3ff", borderRadius: 8, padding: 12 }
                ]}
                onPress={() => {
                  if (assignedRoutine && routineId) {
                    setActionDay(dayKey);
                    setActionRoutine({ name: assignedRoutine, id: routineId });
                    setModalVisible(true);
                  } else {
                    router.push(`/schedule/pick-routine?day=${dayKey}`);
                  }
                }}
              >
                <Text style={styles.dayTitle}>
                  Day {num} {isToday && <Text style={{ fontWeight: "bold" }}>(Today)</Text>}
                </Text>

                {assignedRoutine ? (
                  <Text style={{ color: "#444" }}>Assigned: {assignedRoutine}</Text>
                ) : (
                  <Text style={{ color: "#888" }}>Tap to assign a routine</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ======================== */}
        {/* RECOMMENDED PLAN BELOW  */}
        {/* ======================== */}
        <Text style={styles.sectionTitle}>Suggested Plan (Optional)</Text>

        {weeklyPlan.length === 0 ? (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>
              No suggested plan generated yet.{"\n"}You can press “Generate Plan” to view trainer suggestions.
            </Text>

            <Pressable style={styles.generateBtn} onPress={generatePlan}>
              <Text style={styles.generateText}>Generate Plan</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.planBox}>
            {weeklyPlan.map((day, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: "700" }}>Suggested Day {index + 1}</Text>
                <Text style={{ color: "#444" }}>{day.name}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
      {/* Action Modal */}
      {modalVisible && actionDay && actionRoutine && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Choose an action</Text>
            <Text style={styles.modalSubtitle}>
              Day: {actionDay} {"\n"}
              Routine: {actionRoutine.name}
            </Text>

            {/* Start workout */}
            <Pressable
              style={styles.modalBtn}
              onPress={() => {
                setModalVisible(false);
                router.push({
                  pathname: "/workouts/[routineId]",
                  params: { routineId: actionRoutine.id },
                });
              }}
            >
              <Text style={styles.modalBtnText}>Start Workout</Text>
            </Pressable>

            {/* Change routine */}
            <Pressable
              style={styles.modalBtn}
              onPress={() => {
                setModalVisible(false);
                router.push(`/schedule/pick-routine?day=${actionDay}`);
              }}
            >
              <Text style={styles.modalBtnText}>Change Assigned Routine</Text>
            </Pressable>

            {/* Cancel */}
            <Pressable
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

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

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalSubtitle: {
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  modalBtn: {
    backgroundColor: "#e7f3ff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  modalBtnText: {
    fontWeight: "600",
    color: "#0A3B8A",
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    marginTop: 4,
  },
  modalCancelText: {
    color: "#333",
    fontWeight: "600",
  },

});
