import type { TableType, TableCategory, TableColor, BookingStatus } from '../types';

// A terem előre definiált, fix mérete (px). A seed asztalai ebbe beleférnek.
export const ROOM_SIZE = { width: 820, height: 560 };

// Asztal méretek típus szerint (px) – a kliens származtatja, az API nem tárolja.
export const TABLE_SIZES: Record<TableType, { width: number; height: number }> = {
  foosball: { width: 140, height: 90 },
  snooker: { width: 220, height: 110 },
  'air-hockey': { width: 160, height: 80 },
};

export const DEFAULT_TABLE_SIZE = { width: 120, height: 80 };

export function getTableSize(type: TableType) {
  return TABLE_SIZES[type] ?? DEFAULT_TABLE_SIZE;
}

// Az API szín-enumjának megfelelő megjelenítési hex értékek.
export const COLOR_HEX: Record<TableColor, string> = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  yellow: '#eab308',
  purple: '#a855f7',
};

export const TABLE_TYPE_LABELS: Record<TableType, string> = {
  foosball: 'Csocsó',
  snooker: 'Biliárd',
  'air-hockey': 'Léghoki',
};

export const TABLE_CATEGORY_LABELS: Record<TableCategory, string> = {
  normal: 'Normál',
  competition: 'Verseny',
  kids: 'Gyerek',
};

export const TABLE_COLOR_LABELS: Record<TableColor, string> = {
  red: 'Piros',
  green: 'Zöld',
  blue: 'Kék',
  yellow: 'Sárga',
  purple: 'Lila',
};

export const TABLE_TYPE_OPTIONS = (Object.keys(TABLE_TYPE_LABELS) as TableType[]).map((v) => ({
  value: v,
  label: TABLE_TYPE_LABELS[v],
}));

export const TABLE_CATEGORY_OPTIONS = (Object.keys(TABLE_CATEGORY_LABELS) as TableCategory[]).map(
  (v) => ({ value: v, label: TABLE_CATEGORY_LABELS[v] }),
);

export const TABLE_COLOR_OPTIONS = (Object.keys(TABLE_COLOR_LABELS) as TableColor[]).map((v) => ({
  value: v,
  label: TABLE_COLOR_LABELS[v],
}));

// Foglalási státuszok megjelenítése.
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Függőben',
  accepted: 'Elfogadva',
  declined: 'Elutasítva',
};

export const BOOKING_STATUS_CLASSES: Record<BookingStatus, string> = {
  pending:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  accepted:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800',
  declined:
    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800',
};
