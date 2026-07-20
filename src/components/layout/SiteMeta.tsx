import { useEffect } from "react";
import { useSystemSettings } from "../../hooks/useSettings";
import { resolveLogo, resolveName } from "../../utils/branding";

/** Keeps the browser tab title + favicon in sync with the live portal settings. */
export default function SiteMeta() {
  const { data } = useSystemSettings();
  const settings = data?.settings;

  useEffect(() => {
    console.log("[SiteMeta] settings:", JSON.stringify(settings));
    if (!settings) return;
    document.title = resolveName(settings);
    console.log("[SiteMeta] set title to", resolveName(settings));

    const favicon = document.querySelector<HTMLLinkElement>(
      "link[rel~='icon']",
    );
    if (favicon) favicon.href = resolveLogo(settings);
  }, [settings]);

  return null;
}
