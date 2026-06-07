// Dátum segédfüggvények a foglalási naptárhoz (helyi idő szerint, 'YYYY-MM-DD').

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return toISODate(date);
}

const WEEKDAYS = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];

export function formatDateHu(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${y}. ${String(m).padStart(2, '0')}. ${String(d).padStart(2, '0')}. – ${WEEKDAYS[date.getDay()]}`;
}

export function isBeforeToday(iso: string): boolean {
  return iso < todayISO();
}
