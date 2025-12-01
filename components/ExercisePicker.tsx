import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { EXERCISES } from "@/data/exercises";

type ExercisePickerProps = {
  visible: boolean;
  group: string;
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
};


export function ExercisePicker({ visible, group, onSelect, onClose }: ExercisePickerProps) {
  const filtered = EXERCISES.filter(e => e.muscleGroup === group);


  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Select Exercise</Text>

          <ScrollView>
            {filtered.map((ex) => (
              <Pressable
                key={ex.id}
                style={styles.option}
                onPress={() => onSelect(ex.id)}
              >
                <Text style={styles.optionText}>{ex.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  optionText: { fontSize: 16 },
  cancel: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
  },
  cancelText: { fontSize: 16, fontWeight: "600", color: "#333" },
});
