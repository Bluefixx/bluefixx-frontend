/**
 * Phone number utilities
 * - E.164 normalization for backend API compliance
 * - Country code data for the phone input selector
 */

export interface CountryCode {
  code: string;       // e.g. "+234"
  country: string;    // e.g. "Nigeria"
  iso: string;        // e.g. "NG"
  flag: string;       // emoji flag e.g. "🇳🇬"
}

/** Curated list of country codes — Nigeria first, then common African + international codes */
export const COUNTRY_CODES: CountryCode[] = [
  { code: "+234", country: "Nigeria", iso: "NG", flag: "🇳🇬" },
  { code: "+233", country: "Ghana", iso: "GH", flag: "🇬🇭" },
  { code: "+254", country: "Kenya", iso: "KE", flag: "🇰🇪" },
  { code: "+27",  country: "South Africa", iso: "ZA", flag: "🇿🇦" },
  { code: "+256", country: "Uganda", iso: "UG", flag: "🇺🇬" },
  { code: "+255", country: "Tanzania", iso: "TZ", flag: "🇹🇿" },
  { code: "+237", country: "Cameroon", iso: "CM", flag: "🇨🇲" },
  { code: "+225", country: "Côte d'Ivoire", iso: "CI", flag: "🇨🇮" },
  { code: "+221", country: "Senegal", iso: "SN", flag: "🇸🇳" },
  { code: "+20",  country: "Egypt", iso: "EG", flag: "🇪🇬" },
  { code: "+1",   country: "United States", iso: "US", flag: "🇺🇸" },
  { code: "+44",  country: "United Kingdom", iso: "GB", flag: "🇬🇧" },
  { code: "+49",  country: "Germany", iso: "DE", flag: "🇩🇪" },
  { code: "+33",  country: "France", iso: "FR", flag: "🇫🇷" },
  { code: "+971", country: "UAE", iso: "AE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", iso: "SA", flag: "🇸🇦" },
  { code: "+91",  country: "India", iso: "IN", flag: "🇮🇳" },
  { code: "+86",  country: "China", iso: "CN", flag: "🇨🇳" },
];

/**
 * Normalize a phone number to E.164 format.
 *
 * - Strips spaces, dashes, and parentheses.
 * - If the number already starts with "+", returns as-is (after stripping).
 * - If it starts with "0", replaces the leading zero with the provided country code.
 * - Otherwise, prepends the country code.
 *
 * @param phone      Raw user input, e.g. "0803 245 0182" or "803 245 0182"
 * @param countryCode  E.g. "+234"
 * @returns E.164 formatted string, e.g. "+2348032450182"
 */
export function toE164(phone: string, countryCode: string = "+234"): string {
  // Strip all non-digit and non-plus characters
  const stripped = phone.replace(/[^+\d]/g, "");

  if (!stripped) return "";

  // Already has a full international prefix
  if (stripped.startsWith("+")) {
    return stripped;
  }

  // Leading zero → replace with country code
  if (stripped.startsWith("0")) {
    return countryCode + stripped.slice(1);
  }

  // Bare number → prepend country code
  return countryCode + stripped;
}
