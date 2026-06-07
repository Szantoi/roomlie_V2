import BookingCard from '../components/BookingCard';
import { useGetMyBookingsQuery } from '../api/apiSlice';

export default function MyBookingsPage() {
  const { data: bookings, isLoading, isError } = useGetMyBookingsQuery();

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Foglalásaim</h1>
        {bookings && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {bookings.length} foglalás
          </p>
        )}
      </div>

      {isLoading && <p className="text-gray-400">Foglalások betöltése…</p>}
      {isError && <p className="text-red-500">Nem sikerült betölteni a foglalásokat.</p>}

      {bookings && bookings.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <span className="material-icons text-5xl text-gray-300 dark:text-gray-600 mb-2">event_busy</span>
          <p className="text-sm">Még nincs foglalásod. Nézz körül a Terem oldalon!</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {bookings?.map((b) => (
          <BookingCard key={b.id} booking={b} />
        ))}
      </div>
    </div>
  );
}
