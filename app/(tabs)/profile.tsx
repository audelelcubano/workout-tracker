import { useEffect, useState } from "react";
import {View, Text, TextInput, Pressable, StyleSheet, Alert, Modal, ScrollView} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/Auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Image } from "react-native";


const GOAL_OPTIONS = [
  "Build Muscle",
  "Lose Fat",
  "Increase Endurance",
  "Improve Overall Health",
  "Gain Strength",
];

const EXPERIENCE_OPTIONS = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

export default function ProfileScreen() {
  const { user } = useAuth();

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");

  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");

  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showExperiencePicker, setShowExperiencePicker] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  


  // Load existing profile data
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const ref = doc(db, "users", user.uid, "profile", "info");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setWeight(data.weight?.toString() || "");
        setHeight(data.height?.toString() || "");
        setAge(data.age?.toString() || "");
        setGoal(data.goal || "");
        setExperience(data.experience || "");
      }
    };

    loadProfile();
  }, [user]);

  const saveProfile = async () => {
  if (!user) return;

  try {
    const ref = doc(db, "users", user.uid, "profile", "info");

    await setDoc(ref, {
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      goal,
      experience,
      updatedAt: new Date().toISOString(),
    });

    // SUCCESS FEEDBACK
    setSuccessMessage("Profile updated!");
    setTimeout(() => setSuccessMessage(""), 2000);

  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Could not save profile.");
  }
};


    
    


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <Image 
          source={require("@/assets/images/defaultProfile.png")} 
          style={styles.profilePic}
        />

        <Text style={styles.title}>Your Profile</Text>

        {/* Weight */}
        <Text style={styles.label}>Weight (lbs)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />

        {/* Height */}
        <Text style={styles.label}>Height (inches)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />

        {/* Age */}
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        {/* GOAL DROPDOWN */}
        <Text style={styles.label}>Fitness Goal</Text>
        <Pressable
          style={styles.dropdown}
          onPress={() => setShowGoalPicker(true)}
        >
          <Text style={styles.dropdownText}>
            {goal || "Select a fitness goal..."}
          </Text>
          <Text style={styles.chevron}>▾</Text>
        </Pressable>

        {/* EXPERIENCE DROPDOWN */}
        <Text style={styles.label}>Experience Level</Text>
        <Pressable
          style={styles.dropdown}
          onPress={() => setShowExperiencePicker(true)}
        >
          <Text style={styles.dropdownText}>
            {experience || "Select experience level..."}
          </Text>
          <Text style={styles.chevron}>▾</Text>
        </Pressable>

        {/* Save button */}
        <Pressable style={styles.saveBtn} onPress={saveProfile}>
          <Text style={styles.saveText}>Save Profile</Text>
        </Pressable>

        {/* GOAL Modal */}
        <Modal visible={showGoalPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Select Fitness Goal</Text>

              <ScrollView>
                {GOAL_OPTIONS.map((item) => (
                  <Pressable
                    key={item}
                    style={styles.option}
                    onPress={() => {
                      setGoal(item);
                      setShowGoalPicker(false);
                    }}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Pressable
                style={styles.cancelBtn}
                onPress={() => setShowGoalPicker(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* EXPERIENCE Modal */}
        <Modal visible={showExperiencePicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Select Experience Level</Text>

              <ScrollView>
                {EXPERIENCE_OPTIONS.map((item) => (
                  <Pressable
                    key={item}
                    style={styles.option}
                    onPress={() => {
                      setExperience(item);
                      setShowExperiencePicker(false);
                    }}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Pressable
                style={styles.cancelBtn}
                onPress={() => setShowExperiencePicker(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

      </View>
      {successMessage !== "" && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{successMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dropdownText: { fontSize: 16 },
  chevron: { fontSize: 16, color: "#666" },
  saveBtn: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  option: {
    paddingVertical: 14,
    borderBottomColor: "#e5e5e5",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: { fontSize: 16 },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: { fontSize: 16, fontWeight: "600", color: "#333" },

  toast: {
  position: "absolute",
  bottom: 20,
  left: 20,
  right: 20,
  backgroundColor: "#4CAF50",
  padding: 14,
  borderRadius: 8,
  alignItems: "center",
},
toastText: {
  color: "white",
  fontWeight: "600",
  fontSize: 16,
},
profilePic: {
  width: 60,
  height: 60,
  borderRadius: 30,
  position: "absolute",
  top: 10,
  right: 20,
},

});
