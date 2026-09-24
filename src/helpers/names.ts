// ─── People's names ───────────────────────────────────────────────────────────
// Everyone has three name parts now, and the middle one is optional in every
// flow. A record created before the change has no `middleName` key at all; one
// created after it stores `""` when none was given. Absent, `null` and `""` all
// mean the same thing — no middle name — and both spellings will be around for
// a long time, because no migration was run.

export interface NameParts {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  /** Composed by the API — list and detail endpoints return this. */
  name?: string | null;
  /** Composed by the API — login and `/auth/me` return this. */
  fullName?: string | null;
}

/**
 * How a person's name is rendered, anywhere: **surname first**.
 *
 *   "Oluebube, Nwachukwu Faith"
 *   "Kenneth, Agim"              ← no middle name, the common case
 *
 * This is why the parts win over the API's own `name` / `fullName`: those are
 * composed as "First Middle Last", which is the opposite order. The composed
 * string is only used when the parts are not there to reorder — a payload that
 * carries nothing but a finished string cannot be split safely, because a
 * surname can be more than one word.
 *
 * Blanks are dropped before joining, so a missing middle name never leaves a
 * double space or the word "undefined" on screen. Never interpolate by hand.
 */
export const displayName = (
  person?: NameParts | null,
  fallback = "",
): string => {
  if (!person) return fallback;

  const surname = (person.lastName ?? "").trim();
  const rest = [person.firstName, person.middleName]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(" ");

  if (surname && rest) return `${surname}, ${rest}`;
  // One half missing: show whichever exists, with no stray comma.
  if (surname || rest) return surname || rest;

  return (person.fullName ?? person.name ?? "").trim() || fallback;
};

/**
 * Avatar initials, still given name first: "Nwachukwu Faith Oluebube" → "NO".
 * Deliberately not reordered with the display name — an avatar reads as a
 * person, not as a record, and "ON" would look like a different one.
 *
 * Falls back to the first and last words of a composed string when the parts
 * are not available.
 */
export const nameInitials = (
  person?: NameParts | null,
  fallback = "?",
): string => {
  const first = (person?.firstName ?? "").trim();
  const last = (person?.lastName ?? "").trim();

  if (first || last) {
    return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || fallback;
  }

  const words = (person?.fullName ?? person?.name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return fallback;
  const head = words[0][0] ?? "";
  const tail = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return `${head}${tail}`.toUpperCase() || fallback;
};

// ─── Validation ───────────────────────────────────────────────────────────────

export const MIDDLE_NAME_MAX_LENGTH = 50;

/**
 * Deliberately wider than letters-only: real names carry hyphens and
 * apostrophes, and multi-word middle names like "Faith Oluebube" are fine.
 * Mirrors the backend so nobody is bounced by a 400 they could have been told
 * about while typing.
 */
export const MIDDLE_NAME_PATTERN = /^[A-Za-z][A-Za-z\s'.-]*$/;

/**
 * The problem with a middle name, or `""` when there is none. Empty input is
 * always valid — the field is optional everywhere.
 */
export const middleNameError = (value?: string | null): string => {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.length > MIDDLE_NAME_MAX_LENGTH) {
    return `Middle name cannot be longer than ${MIDDLE_NAME_MAX_LENGTH} characters.`;
  }
  if (!MIDDLE_NAME_PATTERN.test(trimmed)) {
    return "Middle name must start with a letter and can only contain letters, spaces, apostrophes, periods and hyphens.";
  }
  return "";
};
