// Format date to readable format
export function formatDate(
  date: Date | string | number | undefined | null,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
): string {
  if (!date) return "—";
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

// Format date and time to readable format
export function formatDateTime(
  date: Date | string | number | undefined | null,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  },
): string {
  if (!date) return "—";
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

export const fmt = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export const ago = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/** Naira amounts, with an em dash for "not applicable" rather than ₦0. */
export const naira = (amount?: number | null) =>
  amount == null ? "—" : `₦${amount.toLocaleString()}`;

// ─── IT period ────────────────────────────────────────────────────────────────

/**
 * A certificate's IT period. Only `startDate` and `endDate` are dependable —
 * a platform student's period is their batch's and carries `name`/`duration`
 * too, a self-registered student's is exactly the two dates they typed. Never
 * read the extra keys; they are not there for everyone.
 */
export interface ITPeriodDates {
  startDate?: string | null;
  endDate?: string | null;
  [key: string]: unknown;
}

/**
 * These dates are stored at midnight UTC, so they must be formatted in UTC.
 * Local formatting would show the previous day to anyone behind UTC — a
 * certificate that reads "31 May" instead of "1 June".
 */
export const formatUtcDate = (date?: string | null): string => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

/**
 * "1 Jun 2023 – 1 Dec 2023", or an em dash when the period is missing. The API
 * returns `null` when it cannot work one out, so this never assumes both ends
 * are present.
 */
export const formatItPeriod = (period?: ITPeriodDates | null): string => {
  if (!period?.startDate || !period?.endDate) return "—";
  return `${formatUtcDate(period.startDate)} – ${formatUtcDate(period.endDate)}`;
};
