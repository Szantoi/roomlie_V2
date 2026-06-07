import { useCallback, useRef, useState } from 'react';
import type { Table as TableModel } from '../types';
import { ROOM_SIZE } from '../constants/tableMeta';
import { getOverlappingIds } from '../utils/collision';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { selectIsAdmin, selectIsAuthenticated } from '../store/authSlice';
import { selectSelectedTableId, setSelectedTable } from '../store/uiSlice';
import { addToast } from '../store/toastSlice';
import { useUpdateTablePositionMutation } from '../api/apiSlice';
import Table from './Table';

interface RoomProps {
  tables: TableModel[];
  onTableSelected?: () => void;
}

export default function Room({ tables, onTableSelected }: RoomProps) {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const isAuth = useAppSelector(selectIsAuthenticated);
  const selectedTableId = useAppSelector(selectSelectedTableId);
  const [updatePosition] = useUpdateTablePositionMutation();

  const roomRef = useRef<HTMLDivElement>(null);
  // Mozgatás közbeni élő pozíciók (csak az ütközés-vizualizációhoz, a központi
  // állapotot csak az elengedéskor frissítjük – "Action Up").
  const [livePositions, setLivePositions] = useState<Record<number, { x: number; y: number }>>({});

  const handleDragMove = useCallback((id: number, x: number, y: number) => {
    setLivePositions((prev) => ({ ...prev, [id]: { x, y } }));
  }, []);

  const handleDragEnd = useCallback(
    async (id: number, x: number, y: number) => {
      setLivePositions((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      try {
        await updatePosition({ id, x, y }).unwrap();
      } catch {
        dispatch(addToast('Az asztal pozícióját nem sikerült menteni.', 'error'));
      }
    },
    [updatePosition, dispatch],
  );

  // Kijelölés (highlight) – pointer down. Mobilon NEM vált fület, hogy az admin
  // el tudja kezdeni a húzást anélkül, hogy a részletek fülre ugrana.
  const handleSelect = useCallback(
    (id: number) => {
      dispatch(setSelectedTable(id));
    },
    [dispatch],
  );

  // Valódi koppintás (húzás nélkül) – ekkor nyitjuk meg a részleteket (mobil fülváltás).
  const handleTap = useCallback(
    (id: number) => {
      dispatch(setSelectedTable(id));
      onTableSelected?.();
    },
    [dispatch, onTableSelected],
  );

  // Az ütközésvizsgálathoz az élő pozíciókat rávetítjük az asztalokra.
  const tablesWithLive = tables.map((t) =>
    livePositions[t.id] ? { ...t, position: livePositions[t.id] } : t,
  );
  const overlappingIds = isAdmin ? getOverlappingIds(tablesWithLive) : new Set<number>();

  return (
    <div
      ref={roomRef}
      className="relative bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden mx-auto rounded-lg"
      style={{
        width: ROOM_SIZE.width,
        height: ROOM_SIZE.height,
        backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        color: 'rgba(150,150,150,0.25)',
      }}
      onPointerDown={() => dispatch(setSelectedTable(null))}
    >
      {tablesWithLive.map((t) => (
        <Table
          key={t.id}
          table={t}
          isSelected={t.id === selectedTableId}
          isOverlapping={overlappingIds.has(t.id)}
          interactive={isAuth}
          draggable={isAdmin && !t.isLocked}
          roomRef={roomRef}
          onSelect={handleSelect}
          onTap={handleTap}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        />
      ))}

      {tables.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2 pointer-events-none">
          <span className="material-icons text-4xl opacity-30">table_restaurant</span>
          <p className="text-sm">A terem üres.</p>
        </div>
      )}
    </div>
  );
}
