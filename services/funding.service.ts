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
  id: string;
  amount: string | null;
  channel: string;
  direction: "credit" | "debit" | "";
  reference: string;
  status: "success" | "pending" | "failed";
  type: string;
  created_at?: string;
  date?: string;
};

export type TransactionsResponse = {
  status: string;
  message: string;
  data: Transaction[];
  errors: any;
  // Pagination fields (if backend supports them)
  count?: number;
  next?: string | null;
  previous?: string | null;
};

export type WithdrawPayload = {
  amount: number;
  reason?: string;
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

export type TransactionFilters = {
  filter?: "all" | "today" | "week" | "month";
  page?: number;
  page_size?: number;
};

// --- Hooks ---

const useFundWalletEndPoint = () => {
  return useMutation({
    mutationFn: async (data: FundWalletPayload) => {
      return api.post<PaystackInitResponse>("/wallets/fund_initiate/", data);
    },
    onSuccess: (res) => {
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
      const responseData = res.data ? res.data : res;
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
  filters?: TransactionFilters,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) => {
  const page = filters?.page ?? 1;
  const page_size = filters?.page_size ?? 10;

  return useQuery({
    queryKey: ["myTransactions", page, page_size],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("page_size", String(page_size));

      const res = await api.get<TransactionsResponse>(
        `/wallets/my_transactions/?${params.toString()}`
      );
      console.log("Transaction Data:", res.data);
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
  useWithdrawFunds,
};