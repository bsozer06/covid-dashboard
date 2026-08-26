export const numberFmt = new Intl.NumberFormat('en-US');

export const compactFmt = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatAxisDate(date: string): string {
  const parsed = parseMdY(date);
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function parseMdY(raw: string): Date {
  const [month, day, year] = raw.split('/');
  const fullYear = Number(year) < 100 ? 2000 + Number(year) : Number(year);
  return new Date(fullYear, Number(month) - 1, Number(day));
}
