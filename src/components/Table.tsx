import { memo, useRef, useState } from 'react';
import type { Table as TableModel } from '../types';
import { COLOR_HEX, getTableSize, TABLE_TYPE_LABELS } from '../constants/tableMeta';

// Ekkora elmozdulás felett tekintjük húzásnak (nem koppintásnak) az interakciót.
const DRAG_THRESHOLD = 5;

interface TableProps {
  table: TableModel;
  isSelected: boolean;
  isOverlapping: boolean;
  interactive: boolean; // kattintható (user/admin)
  draggable: boolean; // mozgatható (csak admin + !isLocked)
  roomRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (id: number) => void; // kijelölés (highlight) – pointer down
  onTap?: (id: number) => void; // valódi koppintás (elmozdulás nélkül) – pointer up
  onDragMove?: (id: number, x: number, y: number) => void;
  onDragEnd?: (id: number, x: number, y: number) => void;
}

const CATEGORY_BORDER: Record<string, string> = {
  normal: 'border-solid',
  competition: 'border-double border-4',
  kids: 'border-dashed',
};

const Table = memo(function Table({
  table,
  isSelected,
  isOverlapping,
  interactive,
  draggable,
  roomRef,
  onSelect,
  onTap,
  onDragMove,
  onDragEnd,
}: TableProps) {
  // A "megfogási" kiindulópont (utolsó pointer pozíció). A megjelenített pozíció
  // teljesen vezérelt: a Room a mozgatás közbeni élő pozíciót a `table.position`-be
  // vetíti, így itt nincs szükség külön lokális pozíció-állapotra.
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  // A lenyomás kiinduló pontja és hogy történt-e tényleges húzás (tap vs. drag
  // megkülönböztetéséhez). Refben tartjuk, mert nem befolyásolja a renderelést.
  const downPosRef = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(false);

  const { width, height } = getTableSize(table.type);
  const opacity = Math.max(0.25, table.status / 10);
  const categoryBorder = CATEGORY_BORDER[table.category] ?? 'border-solid';

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    e.stopPropagation();
    onSelect(table.id); // csak kijelölés/highlight – mobilon NEM vált fület
    downPosRef.current = { x: e.clientX, y: e.clientY };
    movedRef.current = false;
    if (!draggable) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;

    // Húzásnak minősül-e már (a lenyomási ponttól mért teljes elmozdulás alapján)?
    if (downPosRef.current && !movedRef.current) {
      const totalDx = e.clientX - downPosRef.current.x;
      const totalDy = e.clientY - downPosRef.current.y;
      if (Math.hypot(totalDx, totalDy) > DRAG_THRESHOLD) movedRef.current = true;
    }
    // A küszöb átlépéséig nem mozgatunk (és nem hozunk létre élő pozíciót), így a
    // koppintás tisztán koppintás marad.
    if (!movedRef.current) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    let newX = table.position.x + dx;
    let newY = table.position.y + dy;

    const room = roomRef.current;
    if (room) {
      newX = Math.max(0, Math.min(newX, room.clientWidth - width));
      newY = Math.max(0, Math.min(newY, room.clientHeight - height));
    }

    setDragStart({ x: e.clientX, y: e.clientY });
    onDragMove?.(table.id, newX, newY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggable && dragStart) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDragStart(null);
      if (movedRef.current) {
        // Valódi húzás: a pozíciót mentjük, fület NEM váltunk.
        onDragEnd?.(table.id, table.position.x, table.position.y);
      } else {
        // Csak koppintás: megnyitjuk a részleteket (mobilon fület vált).
        onTap?.(table.id);
      }
    } else if (interactive && !draggable) {
      // Nem mozgatható, de kattintható asztal: a koppintás megnyitja a részleteket.
      onTap?.(table.id);
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={[
        'absolute flex flex-col items-center justify-center rounded-md',
        'text-white text-xs font-semibold text-center leading-tight px-2 select-none',
        'border-2 border-black/30',
        categoryBorder,
        isSelected ? 'ring-4 ring-blue-400 ring-offset-1 z-10' : '',
        isOverlapping ? 'shadow-[0_0_20px_4px_rgba(239,68,68,0.85)] ring-2 ring-red-500' : 'shadow-md',
        draggable ? 'cursor-grab active:cursor-grabbing' : interactive ? 'cursor-pointer' : 'cursor-default',
        'transition-shadow transition-opacity duration-150',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        left: table.position.x,
        top: table.position.y,
        width,
        height,
        backgroundColor: COLOR_HEX[table.color],
        opacity,
        touchAction: 'none',
      }}
      title={`${table.name} | ${TABLE_TYPE_LABELS[table.type]} | Állapot: ${table.status}/10`}
    >
      <span className="drop-shadow-sm">{table.name}</span>
      {table.isLocked && (
        <span className="material-icons absolute top-1 right-1 text-[14px] opacity-80">lock</span>
      )}
    </div>
  );
});

export default Table;
