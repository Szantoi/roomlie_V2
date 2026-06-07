import type { Table } from '../types';
import { getTableSize } from '../constants/tableMeta';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * AABB (Axis-Aligned Bounding Box) ütközésvizsgálat két téglalap között.
 * Igaz, ha átfednek egymással.
 */
export function checkCollision(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function toRect(t: Table): Rect {
  const { width, height } = getTableSize(t.type);
  return { x: t.position.x, y: t.position.y, width, height };
}

/**
 * Visszaadja azon asztal ID-k halmazát, amelyek legalább egy másikkal ütköznek.
 * A vizuális visszajelzéshez (piros keret) használjuk mozgatás közben.
 */
export function getOverlappingIds(tables: Table[]): Set<number> {
  const overlapping = new Set<number>();
  for (let i = 0; i < tables.length; i++) {
    for (let j = i + 1; j < tables.length; j++) {
      if (checkCollision(toRect(tables[i]), toRect(tables[j]))) {
        overlapping.add(tables[i].id);
        overlapping.add(tables[j].id);
      }
    }
  }
  return overlapping;
}
