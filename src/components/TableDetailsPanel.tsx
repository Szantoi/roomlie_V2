import type { Table } from '../types';
import {
  COLOR_HEX,
  TABLE_CATEGORY_LABELS,
  TABLE_COLOR_LABELS,
  TABLE_TYPE_LABELS,
} from '../constants/tableMeta';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { selectIsAdmin, selectIsAuthenticated } from '../store/authSlice';
import { setSelectedTable } from '../store/uiSlice';
import { addToast } from '../store/toastSlice';
import { useDeleteTableMutation } from '../api/apiSlice';
import BookingPanel from './BookingPanel';

interface Props {
  table: Table | undefined;
  onEdit: (table: Table) => void;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-800 dark:text-gray-100">{value}</span>
    </div>
  );
}

export default function TableDetailsPanel({ table, onEdit }: Props) {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const isAuth = useAppSelector(selectIsAuthenticated);
  const [deleteTable, { isLoading: deleting }] = useDeleteTableMutation();

  if (!table) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center gap-3 h-full text-gray-400">
        <span className="material-icons text-5xl text-gray-300 dark:text-gray-600">touch_app</span>
        <p className="text-sm">
          {isAuth
            ? 'Kattints egy asztalra a részletekhez.'
            : 'Jelentkezz be az asztalok foglalásához.'}
        </p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm(`Biztosan törlöd a(z) "${table.name}" asztalt?`)) return;
    try {
      await deleteTable(table.id).unwrap();
      dispatch(setSelectedTable(null));
      dispatch(addToast('Asztal törölve.', 'success'));
    } catch {
      dispatch(addToast('Az asztal törlése sikertelen.', 'error'));
    }
  };

  return (
    <div className="p-5 flex flex-col gap-4">
      {/* Fejléc */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div
          className="rounded-md shrink-0 shadow-sm border border-black/10"
          style={{ width: 48, height: 32, backgroundColor: COLOR_HEX[table.color], opacity: Math.max(0.3, table.status / 10) }}
        />
        <div>
          <div className="font-bold text-base text-gray-900 dark:text-white leading-tight">{table.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {TABLE_TYPE_LABELS[table.type]} · {TABLE_CATEGORY_LABELS[table.category]}
          </div>
        </div>
      </div>

      {/* Adatok */}
      <div>
        <InfoRow label="Szín" value={TABLE_COLOR_LABELS[table.color]} />
        <InfoRow label="Pozíció" value={`${Math.round(table.position.x)}, ${Math.round(table.position.y)}`} />
        <InfoRow label="Mozgatható" value={table.isLocked ? 'Nem (rögzített)' : 'Igen'} />
        <div className="py-2">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Állapot</span>
            <span className="font-bold text-gray-800 dark:text-gray-100">{table.status} / 10</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${table.status * 10}%` }} />
          </div>
        </div>
      </div>

      {/* Admin: szerkesztés / törlés */}
      {isAdmin && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onEdit(table)}
            className="w-full py-2.5 rounded-md text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 transition-opacity shadow-sm"
          >
            Asztal szerkesztése
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full py-2.5 rounded-md text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50"
          >
            Asztal törlése
          </button>
          <p className="text-xs text-center text-gray-400 pt-1">
            Az asztal helyét húzással (drag &amp; drop) is módosíthatod a teremben.
          </p>
        </div>
      )}

      {/* Felhasználó (nem admin): foglalás */}
      {isAuth && !isAdmin && <BookingPanel table={table} />}
    </div>
  );
}
