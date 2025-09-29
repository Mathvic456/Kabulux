import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { ProfileResponse } from "./type";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () =>
      api
        .get<{ data: ProfileResponse }>("profile/me")
        .then((res) => res.data.data),
  });
};
