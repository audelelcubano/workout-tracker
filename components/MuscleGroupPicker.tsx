import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";

type MuscleGroupPickerProps = {
  visible: boolean;
  onSelect: (group: string) => void;
  onClose: () => void;
};


const GROUPS = ["chest", "back", "legs", "shoulders", "arms", "core"];

export function MuscleGroupPicker({ visible, onSelect, onClose }: MuscleGroupPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Select Muscle Group</Text>

          <ScrollView>
            {GROUPS.map((group) => (
              <Pressable
                key={group}
                style={styles.option}
                onPress={() => onSelect(group)}
              >
                <Text style={styles.optionText}>{group.toUpperCase()}</Text>
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
  optionText: { fontSize: 16, textTransform: "capitalize" },
  cancel: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
  },
  cancelText: { fontSize: 16, fontWeight: "600", color: "#333" },
});
