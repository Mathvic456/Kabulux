import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PaymentModal({ paymentModalVisible, setPaymentModalVisible, setSelectedPaymentMethod }) {
    return (
        <Modal
            visible={paymentModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setPaymentModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Payment Method</Text>

                    {["Cash", "Wallet"].map((method, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.modalOption}
                            onPress={() => {
                                setSelectedPaymentMethod(method.toLowerCase());
                                setPaymentModalVisible(false);
                            }}
                        >
                            <Text style={styles.modalOptionText}>{`Pay with ${method}`}</Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setPaymentModalVisible(false)}>
                        <Text style={styles.modalCloseText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        // backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        alignItems: "center",
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
    modalOption: {
        padding: 5,
        paddingVertical: 15,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        marginVertical: 8,
        width: "100%",
        alignItems: "center",
    },
    modalOptionText: { fontSize: 16, color: "#333" },
    modalCloseButton: {
        marginTop: 15,
        padding: 5,
        paddingVertical: 15,
        backgroundColor: "#f6a623",
        borderRadius: 10,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    modalCloseText: { color: "white", fontWeight: "bold" },
});