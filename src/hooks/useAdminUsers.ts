import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  lookupAdminUsers,
  resetUserPasswordByAdmin,
} from "../api/services/adminUser";
import { getApiErrorMessage } from "../api/services/api";

export const useAdminUserLookup = (q: string, enabled = true) => {
  return useQuery({
    queryKey: ["admin-users-lookup", q],
    queryFn: () => lookupAdminUsers(q),
    enabled: enabled && Boolean(q.trim()),
    staleTime: 30_000,
  });
};

export const useAdminResetUserPassword = () => {
  return useMutation({
    mutationFn: ({
      userId,
      newPassword,
    }: {
      userId: string;
      newPassword: string;
    }) => resetUserPasswordByAdmin(userId, newPassword),
    onSuccess: (data) => {
      toast.success(data.message || "User password updated successfully!");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Failed to update user password."),
      );
    },
  });
};
