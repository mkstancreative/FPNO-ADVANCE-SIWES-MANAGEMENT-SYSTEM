// ─── System Settings Types ────────────────────────────────────────────────────
// Portal branding + contact details. Singleton document, auto-created with
// defaults on first GET.

export interface SystemSettings {
  logo: { url: string };
  name: string;
  phone: string;
  email: string;
  address: string;
  code: string;
}

export interface GetSettingsResponse {
  success: boolean;
  settings: SystemSettings;
}
