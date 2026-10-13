const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** Convert Latin digits in a string/number to Persian digits. */
export function toFa(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

/** Convert Persian/Arabic-Indic digits to Latin digits (for parsing). */
export function toEn(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}
