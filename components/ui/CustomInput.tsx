import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

type Props = {
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
};

export default function CustomInput({ placeholder, secureTextEntry, value, onChangeText }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  input: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#444",
    padding: 12,
    borderRadius: 10,
    color: "#fff",
  },
});
