import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SuccessModal = ({ visible, message = "Success!", onClose }: {visible: boolean, message: string, onClose: () => void}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>🎉</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SuccessModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "75%",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 4,
  },
  title: {
    fontSize: 40,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
