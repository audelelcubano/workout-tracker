import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "expo-router";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/Auth";
import { doc, setDoc, deleteDoc, addDoc, collection, getDocs } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";


/** Convert JS weekday → Day 1..7 (Mon = 1, Sun = 7) */
function getTodayIndex() {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon
  return jsDay === 0 ? 7 : jsDay;
}

const TEMPLATES = {
  buildMuscle: {
    "Push Day": [
      { id: "barbell_bench_press", sets: 4, reps: 8 },
      { id: "shoulder_press", sets: 3, reps: 10 },
      { id: "tricep_pushdown", sets: 3, reps: 12 },
    ],
    "Pull Day": [
      { id: "barbell_row", sets: 4, reps: 8 },
      { id: "lat_pulldown", sets: 3, reps: 10 },
      { id: "bicep_curl", sets: 3, reps: 12 },
    ],
    "Leg Day": [
      { id: "barbell_squat", sets: 4, reps: 6 },
      { id: "leg_press", sets: 3, reps: 10 },
      { id: "leg_curl", sets: 3, reps: 12 },
    ],
    "Upper Hypertrophy": [
      { id: "incline_bench_press", sets: 4, reps: 10 },
      { id: "lateral_raise", sets: 3, reps: 15 },
      { id: "tricep_dip", sets: 3, reps: 12 },
    ],
    "Lower Hypertrophy": [
      { id: "front_squat", sets: 4, reps: 8 },
      { id: "romanian_deadlift", sets: 3, reps: 10 },
      { id: "calf_raise", sets: 3, reps: 15 },
    ],

    /** NEW */
    "Rest / Light Cardio": [
      { id: "walk_treadmill", sets: 1, reps: 20 },
      { id: "stretch_full_body", sets: 1, reps: 10 },
    ],
    "Rest": [
      { id: "stretch_full_body", sets: 1, reps: 10 },
    ]
  },

  loseFat: {
    "Full Body Strength": [
      { id: "barbell_squat", sets: 3, reps: 10 },
      { id: "pushup", sets: 3, reps: 12 },
      { id: "barbell_row", sets: 3, reps: 10 },
    ],
    "Full Body Circuit": [
      { id: "kettlebell_swing", sets: 3, reps: 15 },
      { id: "burpee", sets: 3, reps: 15 },
      { id: "jump_squat", sets: 3, reps: 20 },
    ],
    "Strength + Cardio Mix": [
      { id: "deadlift", sets: 3, reps: 5 },
      { id: "run_treadmill", sets: 1, reps: 20 },
    ],

    /** NEW */
    "HIIT Cardio": [
      { id: "sprint_interval_fast", sets: 10, reps: 30 }, // 30 sec sprint
      { id: "sprint_interval_rest", sets: 10, reps: 60 }, // 60 sec walk
    ],
    "Rest / Walking": [
      { id: "walk_treadmill", sets: 1, reps: 25 },
      { id: "stretch_full_body", sets: 1, reps: 10 },
    ],
    "Low Intensity Cardio": [
      { id: "bike_easy", sets: 1, reps: 20 },
      { id: "elliptical_easy", sets: 1, reps: 15 },
    ],
    "Rest": [
      { id: "stretch_full_body", sets: 1, reps: 10 },
    ],
  },

  endurance: {
    "Strength (Leg Focus)": [
      { id: "barbell_squat", sets: 3, reps: 8 },
      { id: "lunges", sets: 3, reps: 12 },
      { id: "leg_curl", sets: 3, reps: 12 },
    ],

    /** NEW */
    "Training": [
      { id: "run_treadmill", sets: 1, reps: 20 },
      { id: "bike_interval", sets: 1, reps: 15 },
      { id: "stretch_full_body", sets: 1, reps: 10 },
    ],
    "Rest": [
      { id: "stretch_full_body", sets: 1, reps: 10 },
    ]
  }
};


export default function ScheduleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();
  const [assigned, setAssigned] = useState<any>({});
  const [weeklyPlan, setWeeklyPlan] = useState<any[]>([]);
  const [actionDay, setActionDay] = useState<string | null>(null);
  const [actionRoutine, setActionRoutine] = useState<{ name: string; id: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [hasGeneratedPlan, setHasGeneratedPlan] = useState(false);
  const replacingPlanRef = useRef(false);


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

  /** Clear suggested plan whenever user updates their fitness goal */
  useEffect(() => {
    setWeeklyPlan([]);
  }, [profile?.goal]);


  // Re-run when user returns to this screen (AFTER useEffect)
  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const loadData = async () => {
        // Load assigned routines
        const ref = collection(db, "users", user.uid, "schedule");
        const snap = await getDocs(ref);

        const map: any = {};
        snap.forEach((doc) => (map[doc.id] = doc.data()));
        setAssigned(map);

        // Check if auto-generated routines already exist
        const routineRef = collection(db, "users", user.uid, "routines");
        const routineSnap = await getDocs(routineRef);

        let foundGenerated = false;

        routineSnap.forEach((docSnap) => {
          if (docSnap.data().generated === true) {
            foundGenerated = true;
          }
        });

        setHasGeneratedPlan(foundGenerated);
      };

      loadData();
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

    // If the user already has a generated plan → show modal
    if (hasGeneratedPlan) {
      setPlanModalVisible(true);
      return;
    }

    // Otherwise generate immediately
    handleCreateNewPlan();
  };



  // Actually creates routines and assigns them
  const handleCreateNewPlan = async () => {
    if (!user || !profile?.goal) return;

    let plan: any[] = [];

    switch (profile.goal) {
      case "Build Muscle":
        plan = [
          "Push Day",
          "Pull Day",
          "Leg Day",
          "Rest / Light Cardio",
          "Upper Hypertrophy",
          "Lower Hypertrophy",
          "Rest",
        ];
        break;

      case "Lose Fat":
        plan = [
          "Full Body Strength",
          "HIIT Cardio",
          "Rest / Walking",
          "Full Body Circuit",
          "Low Intensity Cardio",
          "Strength + Cardio Mix",
          "Rest",
        ];
        break;

      default:
        plan = ["Training", "Training", "Training", "Rest", "Training", "Training", "Rest"];
    }

    // Clear old generated routines (only if replace mode)
    if (hasGeneratedPlan && replacingPlanRef.current) {
      const ref = collection(db, "users", user.uid, "routines");
      const snap = await getDocs(ref);

      snap.forEach(async (docSnap) => {
        if (docSnap.data().generated === true) {
          await deleteDoc(doc(db, "users", user.uid, "routines", docSnap.id));
        }
      });
    }

    // Create new routines
    const createdRoutines = [];

    for (const name of plan) {
      const ref = collection(db, "users", user.uid, "routines");
      // pick template category
      let templateCategory = "buildMuscle";
      if (profile.goal === "Lose Fat") templateCategory = "loseFat";
      if (profile.goal === "Increase Endurance" || profile.goal === "Endurance") {
        templateCategory = "endurance";
      }

      // find exercises for this routine name
      const exerciseTemplate =
        (TEMPLATES as any)[templateCategory][name] || [];

      const newDoc = await addDoc(ref, {
        name,
        groups: [],
        exercises: exerciseTemplate,
        generated: true,
      });
      createdRoutines.push({ id: newDoc.id, name: name.trim() });
    }

    // Assign to schedule (day1..day7)
    for (let i = 0; i < 7; i++) {
      const routine = createdRoutines[i];

      const ref = doc(db, "users", user.uid, "schedule", `day${i + 1}`);
      await setDoc(ref, {
        routineName: routine.name,
        routineId: routine.id,
      });
    }

    setWeeklyPlan([]);

    setPlanModalVisible(false);
    setHasGeneratedPlan(true);
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

            <Pressable
              style={styles.generateBtn}
              onPress={handleCreateNewPlan}
            >
              <Text style={styles.generateText}>Save Suggested Plan to My Routines</Text>
            </Pressable>

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

      {planModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Generate New Plan?</Text>
            <Text style={styles.modalSubtitle}>
              You already have an auto-generated plan.{"\n"}
              Do you want to replace it?
            </Text>

            <Pressable
              style={styles.modalBtn}
              onPress={() => {
                replacingPlanRef.current = true;
                handleCreateNewPlan();
              }}
            >
              <Text style={styles.modalBtnText}>Replace Plan</Text>
            </Pressable>

            <Pressable
              style={styles.modalBtn}
              onPress={() => {
                replacingPlanRef.current = false;
                handleCreateNewPlan();
              }}
            >
              <Text style={styles.modalBtnText}>Keep Both</Text>
            </Pressable>

            <Pressable
              style={styles.modalCancel}
              onPress={() => setPlanModalVisible(false)}
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
