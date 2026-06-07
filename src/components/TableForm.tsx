import { useState } from 'react';
import type { Table, TableCategory, TableColor, TableType } from '../types';
import {
  COLOR_HEX,
  ROOM_SIZE,
  TABLE_CATEGORY_OPTIONS,
  TABLE_COLOR_OPTIONS,
  TABLE_TYPE_OPTIONS,
  getTableSize,
} from '../constants/tableMeta';
import { useAppDispatch } from '../hooks/reduxHooks';
import { addToast } from '../store/toastSlice';
import { setSelectedTable } from '../store/uiSlice';
import {
  useCreateTableMutation,
  useUpdateTableMutation,
  useUpdateTablePositionMutation,
} from '../api/apiSlice';

interface TableFormProps {
  mode: 'create' | 'edit';
  table?: Table;
  onClose: () => void;
}

interface FormState {
  name: string;
  type: TableType;
  category: TableCategory;
  color: TableColor;
  status: number;
  x: number;
  y: number;
  isLocked: boolean;
}

const inputClass =
  'w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1';

export default function TableForm({ mode, table, onClose }: TableFormProps) {
  const dispatch = useAppDispatch();
  const [createTable, { isLoading: creating }] = useCreateTableMutation();
  const [updateTable, { isLoading: updating }] = useUpdateTableMutation();
  const [updatePosition] = useUpdateTablePositionMutation();

  const [form, setForm] = useState<FormState>({
    name: table?.name ?? '',
    type: table?.type ?? 'foosball',
    category: table?.category ?? 'normal',
    color: table?.color ?? 'green',
    status: table?.status ?? 8,
    x: table?.position.x ?? 40,
    y: table?.position.y ?? 40,
    isLocked: table?.isLocked ?? false,
  });
  const [errors, setErrors] = useState<{ status?: string; position?: string }>({});

  const isSaving = creating || updating;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (form.status < 1 || form.status > 10) next.status = 'Az állapot 1 és 10 között legyen!';

    const { width, height } = getTableSize(form.type);
    if (
      form.x < 0 ||
      form.y < 0 ||
      form.x > ROOM_SIZE.width - width ||
      form.y > ROOM_SIZE.height - height
    ) {
      next.position = `A pozíció a teremen belül legyen (max ${ROOM_SIZE.width - width} × ${
        ROOM_SIZE.height - height
      }).`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (mode === 'create') {
        const created = await createTable({
          name: form.name.trim() || undefined,
          type: form.type,
          category: form.category,
          color: form.color,
          status: form.status,
          position: { x: form.x, y: form.y },
          isLocked: form.isLocked,
        }).unwrap();
        dispatch(setSelectedTable(created.id));
        dispatch(addToast('Asztal sikeresen létrehozva.', 'success'));
      } else if (table) {
        await updateTable({
          id: table.id,
          body: {
            name: form.name.trim() || undefined,
            type: form.type,
            category: form.category,
            color: form.color,
            status: form.status,
            isLocked: form.isLocked,
          },
        }).unwrap();

        // A pozíciót külön végponton frissítjük, ha változott és nem rögzített.
        const moved = form.x !== table.position.x || form.y !== table.position.y;
        if (moved && !form.isLocked) {
          await updatePosition({ id: table.id, x: form.x, y: form.y }).unwrap();
        }
        dispatch(addToast('Módosítások elmentve.', 'success'));
      }
      onClose();
    } catch {
      dispatch(
        addToast(
          mode === 'create' ? 'Az asztal létrehozása sikertelen.' : 'A módosítás sikertelen.',
          'error',
        ),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className={labelClass}>Név (opcionális)</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Üresen hagyva generált név"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Típus</label>
          <select value={form.type} onChange={(e) => update('type', e.target.value as TableType)} className={inputClass}>
            {TABLE_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Kategória</label>
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value as TableCategory)}
            className={inputClass}
          >
            {TABLE_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Szín</label>
        <div className="flex gap-2">
          {TABLE_COLOR_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              title={o.label}
              onClick={() => update('color', o.value as TableColor)}
              className="w-8 h-8 rounded-full border-2 transition-all"
              style={{
                backgroundColor: COLOR_HEX[o.value as TableColor],
                borderColor: form.color === o.value ? '#1d4ed8' : 'transparent',
                outline: form.color === o.value ? '2px solid #93c5fd' : 'none',
                outlineOffset: '1px',
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className={labelClass + ' mb-0'}>Állapot</label>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{form.status} / 10</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={form.status}
          onChange={(e) => update('status', Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Pozíció X</label>
          <input
            type="number"
            value={form.x}
            onChange={(e) => update('x', Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Pozíció Y</label>
          <input
            type="number"
            value={form.y}
            onChange={(e) => update('y', Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>
      {errors.position && <p className="text-red-500 text-xs -mt-1">{errors.position}</p>}

      <label className="flex items-center gap-2 cursor-pointer select-none py-1">
        <input
          type="checkbox"
          checked={form.isLocked}
          onChange={(e) => update('isLocked', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600"
        />
        <span className="text-sm text-gray-700 dark:text-gray-200">
          Rögzített <span className="text-gray-400">(nem mozgatható)</span>
        </span>
      </label>

      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 mt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Mégsem
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isSaving ? 'Mentés…' : mode === 'create' ? 'Hozzáadás' : 'Mentés'}
        </button>
      </div>
    </form>
  );
}
