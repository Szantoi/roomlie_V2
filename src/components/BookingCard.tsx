import { useState } from 'react';
import type { Booking } from '../types';
import { BOOKING_STATUS_CLASSES, BOOKING_STATUS_LABELS } from '../constants/tableMeta';
import { useAppDispatch } from '../hooks/reduxHooks';
import { addToast } from '../store/toastSlice';
import { useUpdateBookingStatusMutation } from '../api/apiSlice';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-sm py-1">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-800 dark:text-gray-100 text-right">{value}</span>
    </div>
  );
}

export default function BookingCard({ booking, adminActions = false }: { booking: Booking; adminActions?: boolean }) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [updateStatus, { isLoading }] = useUpdateBookingStatusMutation();

  const handleStatus = async (status: 'accepted' | 'declined') => {
    try {
      await updateStatus({ id: booking.id, status }).unwrap();
      dispatch(
        addToast(status === 'accepted' ? 'Foglalás elfogadva.' : 'Foglalás elutasítva.', 'success'),
      );
    } catch {
      dispatch(addToast('A státusz módosítása sikertelen.', 'error'));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{booking.tableName}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {booking.date} · {booking.startTime}–{booking.endTime}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BOOKING_STATUS_CLASSES[booking.status]}`}>
            {BOOKING_STATUS_LABELS[booking.status]}
          </span>
          <span className="material-icons text-gray-400 text-[20px]">{open ? 'expand_less' : 'expand_more'}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-800">
          <DetailRow label="Foglaló neve" value={booking.name} />
          <DetailRow label="Email" value={booking.email} />
          <DetailRow label="Telefon" value={booking.phone} />
          <DetailRow label="Résztvevők" value={`${booking.headcount} fő`} />
          {booking.notes && <DetailRow label="Megjegyzés" value={booking.notes} />}

          {adminActions && booking.status === 'pending' && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleStatus('accepted')}
                disabled={isLoading}
                className="flex-1 py-2 rounded-md text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Elfogad
              </button>
              <button
                onClick={() => handleStatus('declined')}
                disabled={isLoading}
                className="flex-1 py-2 rounded-md text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Elutasít
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
