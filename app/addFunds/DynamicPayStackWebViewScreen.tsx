import CentralModal from "@/components/CentralModal";
import { useFundWalletEndPoint } from "@/services/funding.service";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  goBack: () => void;
};

const DynamicPayStackWebViewScreen = ({ goBack }: Props) => {
  const [amount, setAmount] = useState("");
  const [paymentChannel, setPaymentChannel] = useState<
    "card" | "bank_transfer"
  >("card");

  const [paystackUrl, setPaystackUrl] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ visible: false, title: "", message: "" });

  const { mutate: initiateFunding, isPending } = useFundWalletEndPoint();

  const handleAddFunds = () => {
    const num = Number(amount);
    if (!amount || isNaN(num) || num < 100) {
      setModalState({
        visible: true,
        title: "Invalid Amount",
        message: "Minimum amount is ₦100",
      });
      return;
    }

    const defaultEmail = "customer@example.com";

    initiateFunding(
      {
        amount: num,
        channel: paymentChannel,
      },
      {
        onSuccess: (res) => {
          const url = res.data?.authorization_url;
          if (url) {
            console.log("Opening Paystack:", url);
            setPaystackUrl(url);
          } else {
            setModalState({
              visible: true,
              title: "Error",
              message: "No payment link received",
            });
          }
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            err.response?.data?.channel?.[0] ||
            "Failed to start payment";
          setModalState({
            visible: true,
            title: "Payment Error",
            message: msg,
          });
        },
      },
    );
  };

  const handleNavigation = (navState: { url: string }) => {
    const { url } = navState;
    if (url.includes("checkout.paystack.com") && url.includes("close")) {
      const reference = new URL(url).searchParams.get("reference");
      if (reference) {
        setModalState({
          visible: true,
          title: "Payment Successful!",
          message: `Reference: ${reference}\n\nYour wallet has been credited.`,
          onConfirm: () => {
            setModalState({ visible: false, title: "", message: "" });
            setPaystackUrl(null);
            setAmount("");
            goBack?.();
          },
        });
      }
    }
  };

  const setQuickAmount = (val: number) => setAmount(val.toString());

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={goBack}>
          <Text style={{ fontSize: 28 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Funds to Wallet</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Amount (₦)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.note}>
            Enter the amount you want to add to your wallet
          </Text>

          <View style={styles.quickRow}>
            {[500, 1000, 5000, 10000].map((v) => (
              <TouchableOpacity
                key={v}
                style={styles.quickBtn}
                onPress={() => setQuickAmount(v)}
              >
                <Text style={styles.quickText}>₦{v.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 3. The New Payment Method Selector */}
          <Text
            style={[
              styles.note,
              { textAlign: "left", marginBottom: 10, marginTop: 10 },
            ]}
          >
            Payment Method:
          </Text>
          <View style={styles.methodRow}>
            <TouchableOpacity
              style={[
                styles.methodBtn,
                paymentChannel === "card" && styles.methodBtnActive,
              ]}
              onPress={() => setPaymentChannel("card")}
            >
              <Text
                style={[
                  styles.methodText,
                  paymentChannel === "card" && styles.methodTextActive,
                ]}
              >
                Card
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodBtn,
                paymentChannel === "bank_transfer" && styles.methodBtnActive,
              ]}
              onPress={() => setPaymentChannel("bank_transfer")}
            >
              <Text
                style={[
                  styles.methodText,
                  paymentChannel === "bank_transfer" && styles.methodTextActive,
                ]}
              >
                Transfer
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.payBtn, isPending && styles.payBtnDisabled]}
            onPress={handleAddFunds}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.payText}>
                {/* Dynamically show the action */}
                Pay with {paymentChannel === "card" ? "Card" : "Transfer"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ... (Rest of your Modal and WebView code remains the same) ... */}
      <Modal visible={!!paystackUrl} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setPaystackUrl(null);
                setAmount("");
                goBack?.();
              }}
            >
              <Text style={{ fontSize: 28, fontWeight: "bold" }}>×</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>
              Complete Payment
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {paystackUrl && (
            <WebView
              source={{ uri: paystackUrl }}
              onNavigationStateChange={handleNavigation}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <ActivityIndicator size="large" color="#007AFF" />
                </View>
              )}
            />
          )}
        </View>
      </Modal>

      <CentralModal
        visible={modalState.visible}
        title={modalState.title}
        subText={modalState.message}
        onClose={() =>
          setModalState({ visible: false, title: "", message: "" })
        }
        onConfirm={modalState.onConfirm}
        confirmText={modalState.onConfirm ? "Done" : "Close"}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f8f9fa" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 30,
  },
  form: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 16,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    fontSize: 16,
  },
  note: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginVertical: 20,
  },
  quickBtn: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  quickText: { fontWeight: "600" },

  // 4. Styles for the new Method Selector
  methodRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  methodBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  methodBtnActive: {
    borderColor: "#007AFF",
    backgroundColor: "#eff6ff",
  },
  methodText: {
    fontWeight: "600",
    color: "#666",
  },
  methodTextActive: {
    color: "#007AFF",
  },

  payBtn: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  payBtnDisabled: { opacity: 0.7 },
  payText: { color: "white", fontWeight: "bold", fontSize: 18 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f9fafb",
  },
});

export default DynamicPayStackWebViewScreen;
