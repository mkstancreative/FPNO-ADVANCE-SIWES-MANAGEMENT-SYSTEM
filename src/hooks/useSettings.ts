import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getSystemSettings, updateSystemSettings } from "../api/services/settings";
import { getApiErrorMessage } from "../api/services/api";

export const settingsKey = ["system-settings"] as const;

export const useSystemSettings = () =>
  useQuery({
    queryKey: settingsKey,
    queryFn: getSystemSettings,
    staleTime: 10 * 60 * 1000,
  });

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => updateSystemSettings(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKey });
      toast.success("Settings updated successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getApiErrorMessage(err, "Failed to update settings.")),
  });
};
