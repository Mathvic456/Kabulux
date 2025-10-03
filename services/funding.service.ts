import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./api";

export type FundWalletPayload = {
  amount: number;
  channel: "card" | "bank" | "ussd";
};

export type PaystackInitResponse = {
  status: number;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
  errors: any;
};
export type WalletBalanceResponse = {
  balance: number;
};
export const useFundWalletEndPoint = () => {
  return useMutation({
    mutationFn: async (data: FundWalletPayload) => {
      const token = await AsyncStorage.getItem("token");

      return api.post<PaystackInitResponse>("wallets/fund_initiate/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: (res) => {
      const paystackUrl = res.data?.data?.authorization_url;
      console.log("Paystack checkout URL:", paystackUrl);
    },
    onError: (error: any) => {
      console.error("Wallet funding error:", error);
    },
  });
};

export const useGetMyBalance = () => {
  return useQuery({
    queryKey: ["balance"],
    queryFn: async () => {
      const res = await api.get<{ data: WalletBalanceResponse }>(
        "/wallets/my_balance/"
      );
      console.log("balance:", res.data);
      return res.data.data;
    },
  });
};
