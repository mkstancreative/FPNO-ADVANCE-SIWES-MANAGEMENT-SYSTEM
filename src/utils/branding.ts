import type { SystemSettings } from "../api/types/settings";

// Backend serves uploaded assets (e.g. /uploads/logo/...) from its own origin,
// not from VITE_API_URL (which points at the /api prefix).
const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(
  /\/api(\/v\d+)?\/?$/,
  "",
);

export const FALLBACK_LOGO = "/logo.png";
export const FALLBACK_APP_NAME =
  (import.meta.env.VITE_APP_NAME as string | undefined) || "SIWES Portal";

export function logoSrc(logo?: string): string {
  if (!logo) return "";
  if (/^https?:\/\//.test(logo)) return logo;
  return `${apiBase}${logo.startsWith("/") ? "" : "/"}${logo}`;
}

export function resolveLogo(settings?: SystemSettings): string {
  return logoSrc(settings?.logo?.url) || FALLBACK_LOGO;
}

export function resolveName(settings?: SystemSettings): string {
  return settings?.name || FALLBACK_APP_NAME;
}
