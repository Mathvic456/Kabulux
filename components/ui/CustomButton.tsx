import React from "react";
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  loading?: boolean;
  disabled?: boolean;
};

export default function CustomButton({ title, onPress, style, textStyle, loading = false, disabled = false }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, style, (loading || disabled) && styles.disabled]}
      onPress={onPress}
      disabled={loading || disabled} 
    >
      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
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
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  disabled: {
    opacity: 0.7,
  },
});
