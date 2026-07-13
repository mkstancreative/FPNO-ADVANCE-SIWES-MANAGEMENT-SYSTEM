import { api } from "./api";
import type { GetSettingsResponse } from "../types/settings";

export const getSystemSettings = async (): Promise<GetSettingsResponse> => {
  const response = await api.get("/settings");
  return response.data;
};

export const updateSystemSettings = async (
  formData: FormData,
): Promise<GetSettingsResponse> => {
  const response = await api.put("/settings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
