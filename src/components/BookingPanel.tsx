import { useState } from 'react';
import type { Table, Timeslot } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { selectCurrentUser } from '../store/authSlice';
import { addToast } from '../store/toastSlice';
import { useCreateBookingMutation, useGetTimeslotsQuery } from '../api/apiSlice';
import { addDays, formatDateHu, isBeforeToday, todayISO } from '../utils/date';

const inputClass =
  'w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1';

export default function BookingPanel({ table }: { table: Table }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const [createBooking, { isLoading }] = useCreateBookingMutation();

  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState<Timeslot | null>(null);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    headcount: 1,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: timeslots, isFetching } = useGetTimeslotsQuery({ tableId: table.id, date });

  const goToDay = (delta: number) => {
    const next = addDays(date, delta);
    if (delta < 0 && isBeforeToday(next)) return; // múltba nem lépünk
    setDate(next);
    setSlot(null);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'A név megadása kötelező.';
    if (!form.email.trim()) next.email = 'Az email megadása kötelező.';
    if (!form.phone.trim()) next.phone = 'A telefonszám megadása kötelező.';
    if (form.headcount < 1) next.headcount = 'Legalább 1 fő.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) {
      dispatch(addToast('Válassz egy szabad időpontot!', 'info'));
      return;
    }
    if (!validate()) return;

    try {
      await createBooking({
        tableId: table.id,
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        headcount: form.headcount,
        notes: form.notes.trim() || undefined,
      }).unwrap();
      dispatch(addToast('Sikeres foglalás! Az állapota: függőben.', 'success'));
      setSlot(null);
      setForm((f) => ({ ...f, phone: '', notes: '', headcount: 1 }));
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        dispatch(addToast('Ez az időpont időközben elkelt. Válassz másikat!', 'error'));
      } else {
        dispatch(addToast('A foglalás sikertelen. Próbáld újra!', 'error'));
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Nap-navigáció */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Foglalás</h4>
        <div className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-md p-1.5">
          <button
            type="button"
            onClick={() => goToDay(-1)}
            disabled={isBeforeToday(addDays(date, -1))}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Előző nap"
          >
            <span className="material-icons text-[18px]">chevron_left</span>
          </button>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{formatDateHu(date)}</span>
          <button
            type="button"
            onClick={() => goToDay(1)}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label="Következő nap"
          >
            <span className="material-icons text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Időpontok */}
      <div>
        <label className={labelClass}>Elérhető időpontok</label>
        {isFetching ? (
          <p className="text-sm text-gray-400 py-2">Időpontok betöltése…</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {timeslots?.map((ts) => {
              const isSelected = slot?.startTime === ts.startTime;
              return (
                <button
                  key={ts.startTime}
                  type="button"
                  disabled={!ts.isAvailable}
                  onClick={() => setSlot(ts)}
                  className={[
                    'text-sm rounded-md py-2 border transition-colors',
                    !ts.isAvailable
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 line-through cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-blue-400',
                  ].join(' ')}
                >
                  {ts.startTime}–{ts.endTime}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Foglalási űrlap – csak ha választottunk időpontot */}
      {slot && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-gray-100 dark:border-gray-700 pt-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Foglalás: <span className="font-semibold">{table.name}</span>, {date} {slot.startTime}–{slot.endTime}
          </p>

          <div>
            <label className={labelClass}>Név</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className={labelClass}>Telefonszám</label>
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+36 20 123 4567"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className={labelClass}>Résztvevők száma</label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={form.headcount}
              onChange={(e) => setForm({ ...form, headcount: Number(e.target.value) })}
            />
            {errors.headcount && <p className="text-red-500 text-xs mt-1">{errors.headcount}</p>}
          </div>
          <div>
            <label className={labelClass}>Megjegyzés (opcionális)</label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-md text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isLoading ? 'Foglalás…' : 'Foglalás véglegesítése'}
          </button>
        </form>
      )}
    </div>
  );
}
