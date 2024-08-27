import React from "react";
import { StyleSheet, Text, View,TouchableOpacity} from "react-native";

export default function  NavigationView(){
    return (
  <View style={styles.container}>
    <TouchableOpacity style={styles.button}>
      <Text>Go Back</Text>
    </TouchableOpacity>
  </View>)
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  button: {
    fontSize: 20,
  },
});

