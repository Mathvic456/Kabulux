import { useMutation } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { api } from "./api";

export type UploadResponse = {
  success: boolean;
  message: string;
  data?: {
    file_url: string;
    file_name: string;
  };
};

export type UploadPayload = {
  uri: string;
  name: string;
  type: string;
};

export const useUploadProfilePhoto = () => {
  const mutation = useMutation<AxiosResponse<UploadResponse>, any, FormData>({
    mutationFn: (formData: FormData) =>
      api.post("uploads/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    onSuccess: (res) => {
      console.log("✅ [Upload] Photo uploaded successfully:", res.data);
    },
    onError: (error: any) => {
      console.error("❌ [Upload] Photo upload error:", error);
    },
  });

  return mutation;
};
