import { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, StyleSheet, View, Dimensions } from "react-native";
import { useAuth } from "@/components/Auth";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

// Charts
import { BarChart, LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

// ---------------- PR TYPES ----------------
type PRKey = "bench_press" | "squat" | "deadlift";
type PRState = Record<PRKey, number | null>;

/**
 * Map exerciseId → PR category.
 * Anytime you add a new PR exercise, update this map.
 */
const PR_EXERCISE_MAP: Record<string, PRKey> = {
  bench_press: "bench_press",
  barbell_bench_press: "bench_press",
  incline_bench_press: "bench_press",

  squat: "squat",
  barbell_squat: "squat",
  back_squat: "squat",
  front_squat: "squat",

  deadlift: "deadlift",
  barbell_deadlift: "deadlift",
  deadlift_conventional: "deadlift",
  deadlift_sumo: "deadlift",
};

export default function AnalyticsScreen() {
  const { user } = useAuth();

  const [exerciseFreq, setExerciseFreq] = useState<any[]>([]);
  const [routineFreq, setRoutineFreq] = useState<any[]>([]);
  const [cardioWeekly, setCardioWeekly] = useState<any[]>([]);
  const [prs, setPrs] = useState<PRState>({
    bench_press: null,
    squat: null,
    deadlift: null,
  });

  /** ---------------- LOAD HISTORY ---------------- */
  const loadHistory = useCallback(async () => {
    if (!user) return;

    const historyCol = collection(db, "users", user.uid, "history");
    const q = query(historyCol, orderBy("date", "desc"));
    const snap = await getDocs(q);

    const rows = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    computeExerciseFrequency(rows);
    computeRoutineFrequency(rows);
    computeWeeklyCardio(rows);
    computePRs(rows);
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  /** ---------------- EXERCISE FREQUENCY ---------------- */
  const computeExerciseFrequency = (rows: any[]) => {
    const map: Record<string, number> = {};

    rows.forEach((w) => {
      if ((w.type === "normal" || w.type === "routine_child") && w.exercise) {
        map[w.exercise] = (map[w.exercise] || 0) + 1;
      }
    });

    setExerciseFreq(
      Object.entries(map).map(([exercise, count]) => ({
        exercise,
        count,
      }))
    );
  };

  /** ---------------- ROUTINE FREQUENCY ---------------- */
  const computeRoutineFrequency = (rows: any[]) => {
    const map: Record<string, number> = {};

    rows.forEach((w) => {
      if (w.type === "routine" && w.routineName) {
        map[w.routineName] = (map[w.routineName] || 0) + 1;
      }
    });

    setRoutineFreq(
      Object.entries(map).map(([routine, count]) => ({
        routine,
        count,
      }))
    );
  };

  /** ---------------- CARDIO WEEKLY ---------------- */
  const computeWeeklyCardio = (rows: any[]) => {
    const weekly: Record<string, number> = {};

    rows.forEach((w) => {
      if (w.type === "cardio") {
        const d = new Date(w.date);
        const key = `${d.getMonth() + 1}/${d.getDate()}`;
        weekly[key] = (weekly[key] || 0) + (w.distance || 0);
      }
    });

    setCardioWeekly(
      Object.entries(weekly).map(([date, miles]) => ({
        date,
        miles,
      }))
    );
  };

  /** ---------------- PRs USING exerciseId ---------------- */
  const computePRs = (rows: any[]) => {
    const map: PRState = {
      bench_press: null,
      squat: null,
      deadlift: null,
    };

    rows.forEach((w) => {
      const exerciseId = w.exerciseId;
      const weight = Number(w.weight);

      if (!exerciseId || !weight) return;

      const category = PR_EXERCISE_MAP[exerciseId];
      if (!category) return;

      if (map[category] == null || weight > map[category]!) {
        map[category] = weight;
      }
    });

    setPrs(map);
  };

  const formatPR = (val: number | null) => (val ? `${val} lbs` : "—");

  /** ---------------- UI ---------------- */

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ textAlign: "center", marginTop: 40 }}>
          Sign in to view analytics.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Training Analytics</Text>

        {/* ---------------- Exercises Chart ---------------- */}
        <Text style={styles.sectionTitle}>Most Performed Exercises</Text>
        {exerciseFreq.length === 0 ? (
          <Text style={styles.empty}>No exercise data.</Text>
        ) : (
          <BarChart
            data={{
              labels: exerciseFreq.map((e) => e.exercise),
              datasets: [{ data: exerciseFreq.map((e) => e.count) }],
            }}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#eef2ff",
              backgroundGradientTo: "#eef2ff",
              decimalPlaces: 0,
              color: () => "#6366f1",
              labelColor: () => "#333",
            }}
            style={{ borderRadius: 12 }}
          />
        )}

        {/* ---------------- Routines Chart ---------------- */}
        <Text style={styles.sectionTitle}>Most Used Routines</Text>
        {routineFreq.length === 0 ? (
          <Text style={styles.empty}>No routine data.</Text>
        ) : (
          <BarChart
            data={{
              labels: routineFreq.map((r) => r.routine),
              datasets: [{ data: routineFreq.map((r) => r.count) }],
            }}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#e0f7ff",
              backgroundGradientTo: "#e0f7ff",
              decimalPlaces: 0,
              color: () => "#0ea5e9",
              labelColor: () => "#333",
            }}
            style={{ borderRadius: 12 }}
          />
        )}

        {/* ---------------- Cardio Graph ---------------- */}
        <Text style={styles.sectionTitle}>Cardio Distance Over Time</Text>
        {cardioWeekly.length === 0 ? (
          <Text style={styles.empty}>No cardio sessions.</Text>
        ) : (
          <LineChart
            data={{
              labels: cardioWeekly.map((c) => c.date),
              datasets: [{ data: cardioWeekly.map((c) => c.miles) }],
            }}
            width={screenWidth - 40}
            height={240}
            yAxisLabel=""
            yAxisSuffix=" mi"
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#ecfdf5",
              backgroundGradientTo: "#ecfdf5",
              decimalPlaces: 2,
              color: () => "#16a34a",
              labelColor: () => "#333",
            }}
            style={{ borderRadius: 12 }}
          />
        )}

        {/* ---------------- PRs ---------------- */}
        <Text style={styles.sectionTitle}>Personal Records (PRs)</Text>

        <View style={styles.prBox}>
          <Text style={styles.prText}>
            Bench Press: {formatPR(prs.bench_press)}
          </Text>
          <Text style={styles.prText}>Squat: {formatPR(prs.squat)}</Text>
          <Text style={styles.prText}>Deadlift: {formatPR(prs.deadlift)}</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20, paddingBottom: 80 },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },

  empty: {
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
  },

  prBox: {
    backgroundColor: "#e5e7eb",
    padding: 16,
    borderRadius: 10,
  },
  prText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
});
