import { useSystemSettings } from "../../hooks/useSettings";
import { resolveName } from "../../utils/branding";

type FooterProps = {
  year?: number;
};

export default function Footer({
  year = new Date().getFullYear(),
}: FooterProps) {
  const { data } = useSystemSettings();
  const settings = data?.settings;
  const appName = resolveName(settings);
  const contact = [settings?.phone, settings?.email, settings?.address]
    .filter(Boolean)
    .join(" · ");

  return (
    <footer className="dash-footer">
      <p className="dash-footer__copy">
        &copy; {year} <span>{appName}</span>. All rights reserved.
      </p>
      {contact && <p className="dash-footer__contact">{contact}</p>}
    </footer>
  );
}
