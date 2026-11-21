/** Shows "+92 300 1234567" style text for a 92-prefixed number; otherwise the number as entered. */
export function displayPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const m = digits.match(/^92(\d{3})(\d{7})$/);
  return m ? `+92 ${m[1]} ${m[2]}` : value;
}

/** `tel:` link for a phone number written any way ("0300 1234567", "+92 300-1234567"). */
export function telHref(value: string): string {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}
