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
 * How a person's name is rendered, anywhere.
 *
 * Prefers whatever the API already composed, because the backend owns the
 * rule. Falls back to joining the parts the same way its `fullName()` helper
 * does — dropping the blanks first, so the common case of no middle name never
 * leaves a double space or the word "undefined" on screen.
 *
 * Never interpolate the parts by hand:
 *   `${u.firstName} ${u.middleName} ${u.lastName}` → "Agim  Kenneth"
 */
export const displayName = (
  person?: NameParts | null,
  fallback = "",
): string => {
  if (!person) return fallback;

  const composed = (person.fullName ?? person.name ?? "").trim();
  if (composed) return composed;

  const joined = [person.firstName, person.middleName, person.lastName]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(" ");

  return joined || fallback;
};

/**
 * Avatar initials: the first letter of the first and last name parts, skipping
 * the middle one. "Nwachukwu Faith Oluebube" → "NO".
 */
export const nameInitials = (
  person?: NameParts | null,
  fallback = "?",
): string => {
  const words = displayName(person).split(/\s+/).filter(Boolean);
  if (words.length === 0) return fallback;
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return `${first}${last}`.toUpperCase() || fallback;
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
