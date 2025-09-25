import { EXERCISES } from "../data/exercises";


import { useState } from "react";
import {
    Button,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";


export default function WorkoutsScreen() {
  const [exercise, setExercise] = useState<string>("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const handleSave = () => {
    console.log("Workout saved:", { exercise, weight, reps, sets });
    setWeight("");
    setReps("");
    setSets("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>📋 Log a Workout</Text>

      <Text style={styles.label}>Exercise</Text>
      <Pressable style={styles.select} onPress={() => setShowPicker(true)}>
        <Text style={[styles.selectText, !exercise && styles.placeholder]}>
          {exercise || "Select an exercise..."}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      {/* Modal dropdown */}
      <Modal
        visible={showPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Exercise</Text>
            <ScrollView>
              {EXERCISES.map((name) => (
                <Pressable
                  key={name}
                  style={styles.option}
                  onPress={() => {
                    setExercise(name);
                    setShowPicker(false);
                  }}
                >
                  <Text style={styles.optionText}>{name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable style={styles.cancelBtn} onPress={() => setShowPicker(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <TextInput
        style={styles.input}
        placeholder="Weight (lbs)"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        returnKeyType="done"
      />

      <TextInput
        style={styles.input}
        placeholder="Reps"
        keyboardType="numeric"
        value={reps}
        onChangeText={setReps}
        returnKeyType="done"
      />

      <TextInput
        style={styles.input}
        placeholder="Sets"
        keyboardType="numeric"
        value={sets}
        onChangeText={setSets}
        returnKeyType="done"
      />

      <Button title="Save Workout" onPress={handleSave} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 5 },

  // custom "picker" field
  select: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { fontSize: 16, color: "#000" },
  placeholder: { color: "#999" },
  chevron: { fontSize: 16, color: "#666", marginLeft: 8 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },

  // modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  option: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  optionText: { fontSize: 16 },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
  },
  cancelText: { fontSize: 16, fontWeight: "600", color: "#333" },
});
