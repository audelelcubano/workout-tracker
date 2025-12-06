import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface WorkoutEntry {
  id: string;
  exercise: string;
  sets: string;
  reps: string;
  weight: string;
  date: string;
}
//script functions
var count1 = 5;
var count2 = 3;
var count3 = 7;
var count4 = 2;





let workouts =
[
    count1,
    count2,
    count3,
    count4
]
let workoutNames =
[
  "Chest",
  "Upper Chest",
  "Triceps",
  "Shoulders"
]
let workoutCodes =
[
    0,1,2,3
]
//These Contain the names of the individual workouts.
// Each workout will be assigned to one of these categories
//If a workout has multiple categories, just put it into the category that makes the most sense
let chestNames =
[
    "ChestTest1",
    "ChestTest2"
]
let UpperchestNames =
[
    "UpperTest1",
    "UpperTest2"
]
let tricepsNames =
[
    "TricepTest1",
    "TricepTest2"
]
let shouldersNames =
[
    "ShoulderTest1",
    "ShoulderTest"
]
//This is the example for assigning the counts of the muscle groups.
//This assumes that these values are stored in the user's info and updated when they
//complete workouts.
function setCounts()
{
  /*
  count1 = /User's chest count/;
  count2 = /User's upper chest count/;
  count3 = /User's triceps count/;
  count4 = /User's shoulders count/;
  */
}

function workoutSort()
{
    let tempName = "";
    var tempNo;
    var tempCode;

    for (var j = 0; j <= workouts.length; j++)
    {
        for (var i = 0; i <= workouts.length; i++)
        {
            var holderA = workouts[i];
            var holderB = workouts[i+1];
            
            if(holderA > holderB)
            {
                

                tempNo = workouts[i + 1];
                tempName = workoutNames[i + 1];
                tempCode = workoutCodes[i+1]

                workouts[i + 1] = workouts[i];
                workoutNames[i + 1] = workoutNames[i];
                workoutCodes[i + 1] = workoutCodes[i];

                workouts[i] = tempNo;
                workoutNames[i] = tempName;
                workoutCodes[i] = tempCode;
            }
        }
    }
}
function getType(i: number)
{
  var result;
  workoutSort();
  result = workoutNames[i];
  return result;
}
function getWorkout(i: number, j: number)
{
    let workoutName = "";
    if(i ==0)
    {
        workoutName = chestNames[j];
    }
    else if(i == 1)
    {
        workoutName = UpperchestNames[j];
    }
    else if(i == 2)
    {
        workoutName = tricepsNames[j];
    }
    else if (i == 3)
    {
        workoutName = shouldersNames[j];
    }
    return workoutName;
}


export default function RecommendationScreen() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  // ✅ Load workouts from "history" key every time tab gains focus
  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        const stored = await AsyncStorage.getItem("history");
        if (stored) setWorkouts(JSON.parse(stored));
        else setWorkouts([]);
      };
      loadHistory();
    }, [])
  );





  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}> Workout Recommendations </Text>
        


                
              <Text style={styles.itemText}>
                Muscle Group : {getType(0)}
              </Text>
              <Text style={styles.dateText}>
                {getWorkout(workoutCodes[0],0)}  
              </Text>
              <Text style={styles.dateText}>
                {getWorkout(workoutCodes[0],1)}  
              </Text>

                
              <Text style={styles.itemText}>
                Muscle Group : {getType(1)}
              </Text>
              <Text style={styles.dateText}>
                {getWorkout(workoutCodes[1],0)}
              </Text>
              <Text style={styles.dateText}>
                {getWorkout(workoutCodes[1],1)}
              </Text>

                
              <Text style={styles.itemText}>
                Muscle Group : {getType(2)}
              </Text>
              <Text style={styles.dateText}>
                {getWorkout(workoutCodes[2],0)}
              </Text>
              <Text style={styles.dateText}>
                {getWorkout(workoutCodes[2],1)}
              </Text>
            
            
  
        
        
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  item: {
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  itemText: { fontSize: 24, color: "#333" },
  dateText: {
    fontSize: 14,
    color: "#333",
    marginTop: 3,
  },
  empty: {
    marginTop: 20,
    textAlign: "center",
    color: "#777",
    fontSize: 16,
  },

});
