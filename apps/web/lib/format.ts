export function formatCurrency(value: number, currency: string, locale = 'en-US') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function formatNumber(
  value: number,
  locale = 'en-US',
  options: Intl.NumberFormatOptions = {}
) {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatDate(
  date: string | number | Date,
  locale = 'en-US',
  timeZone = 'UTC',
  options: Intl.DateTimeFormatOptions = {}
) {
  return new Intl.DateTimeFormat(locale, { timeZone, ...options }).format(new Date(date));
}
