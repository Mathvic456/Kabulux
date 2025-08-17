import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
    style?: object;
};

export default function CustomButton({ title, onPress, style }: Props) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fcbf24",
    padding: 14,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  text: { fontSize: 16, fontWeight: "bold", color: "#000" },
});
