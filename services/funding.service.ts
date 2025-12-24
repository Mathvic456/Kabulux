import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./api";


export type FundWalletPayload = {
  amount: number;
  channel: string;
};

export interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}
export type WalletBalanceResponse = {
  balance: number;
  currency?: string;
};


export type Transaction = {
  id: string; // Changed from number to string
  amount: string | null; 
  channel: string;
  direction: "credit" | "debit" | ""; 
  reference: string;
  status: "success" | "pending" | "failed";
  type: string; // API returns ""
  created_at?: string; // Optional, as it wasn't in the provided log
  date?: string; // Keeping for compatibility if backend adds it
};

// CORRECTED: Matches the JSON log structure {"data": [...], "status": "success"}
export type TransactionsResponse = {
  status: string;
  message: string;
  data: Transaction[]; // Key is 'data', not 'results'
  errors: any;
};

// --- New Types for Withdrawal ---
export type WithdrawPayload = {
  amount: number;
};

export type WithdrawResponse = {
  status: number;
  message: string;
};

export type CreateRecipientResponse = {
  status: number;
  message: string;
  data: {
    recipient_code: string;
  };
};

export type CreateRecipientPayload = {
  account_number: string;
  bank_code: string;
};

// --- Hooks ---

const useFundWalletEndPoint = () => {
  return useMutation({
    mutationFn: async (data: FundWalletPayload) => {
      // Using your original endpoint
      return api.post<PaystackInitResponse>("/wallets/fund_initiate/", data);
    },
    onSuccess: (res) => {
      console.log(res);
      const paystackUrl = res.data?.authorization_url;
      console.log("Paystack checkout URL:", paystackUrl);
    },
    onError: (error: any) => {
      console.error("Wallet funding error:", error);
    },
  });
};

const useGetMyBalance = () => {
  return useQuery({
    queryKey: ["balance"],
    queryFn: async () => {
      const res = await api.get<any>("/wallets/my_balance/"); 
      
      console.log("DEBUG BALANCE RAW:", res);

      const responseData = res.data ? res.data : res;

      // Check if balance is nested inside another 'data' key or at the root
      if (responseData.data && responseData.data.balance !== undefined) {
        return responseData.data;
      } else if (responseData.balance !== undefined) {
        return responseData;
      }
      
      return { balance: 0 };
    },
  });
};

const useGetMyTransactions = (
  options?: { enabled?: boolean; refetchInterval?: number }
) => {
  return useQuery({
    queryKey: ["myTransactions"],
    queryFn: async () => {
      // Using your original endpoint
      const res = await api.get<TransactionsResponse>(
        "/wallets/my_transactions/"
      );
      // Return the full response object so we can access .data array in the component
      return res.data;
    },
    ...options,
  });
};

const useWithdrawFunds = () => {
  return useMutation({
    mutationFn: async (data: WithdrawPayload) => {
      return api.post<WithdrawResponse>("/wallets/withdraw/", data);
    },
    onSuccess: (res) => {
      console.log("Withdrawal successful:", res.data.message);
    },
    onError: (error: any) => {
      console.error("Withdrawal error:", error);
    },
  });
};

const useCreateTransferRecipient = () => {
  return useMutation({
    mutationFn: async (data: CreateRecipientPayload) => {
      return api.post<CreateRecipientResponse>(
        "/wallets/create_transfer_recipient/",
        data
      );
    },
    onSuccess: (res) => {
      console.log("Transfer recipient creation successful:", res.data);
    },
    onError: (error: any) => {
      console.error("Transfer recipient creation error:", error);
    },
  });
};

export {
  useCreateTransferRecipient,
  useFundWalletEndPoint,
  useGetMyBalance,
  useGetMyTransactions,
  useWithdrawFunds
};

