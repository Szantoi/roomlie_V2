import { useState } from 'react';
import type { Table } from '../types';
import Room from '../components/Room';
import TableDetailsPanel from '../components/TableDetailsPanel';
import Modal from '../components/Modal';
import TableForm from '../components/TableForm';
import { useGetTablesQuery } from '../api/apiSlice';
import { useAppSelector } from '../hooks/reduxHooks';
import { selectIsAdmin } from '../store/authSlice';
import { selectSelectedTableId } from '../store/uiSlice';

type ModalState = { mode: 'create' | 'edit'; table?: Table } | null;

export default function RoomPage({ autoOpenAdd = false }: { autoOpenAdd?: boolean }) {
  const isAdmin = useAppSelector(selectIsAdmin);
  const selectedTableId = useAppSelector(selectSelectedTableId);

  const { data: tables, isLoading, isError, refetch } = useGetTablesQuery();

  // Az "Asztal hozzáadása" menüpontról érkezve (autoOpenAdd) azonnal nyitva a modal.
  const [modal, setModal] = useState<ModalState>(() =>
    autoOpenAdd && isAdmin ? { mode: 'create' } : null,
  );
  const [mobileTab, setMobileTab] = useState<'room' | 'details'>('room');

  const selectedTable = tables?.find((t) => t.id === selectedTableId);

  return (
    <div className="h-full flex flex-col">
      {/* Mobil fülek */}
      <div className="flex lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button
          onClick={() => setMobileTab('room')}
          className={`flex-1 py-2 text-sm font-medium border-r border-gray-200 dark:border-gray-800 ${
            mobileTab === 'room' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500'
          }`}
        >
          Terem
        </button>
        <button
          onClick={() => setMobileTab('details')}
          className={`flex-1 py-2 text-sm font-medium ${
            mobileTab === 'details' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500'
          }`}
        >
          Részletek
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Terem */}
        <section
          className={`${mobileTab === 'room' ? 'flex' : 'hidden'} lg:flex flex-col flex-1 overflow-auto p-3 sm:p-4`}
        >
          {isAdmin && (
            <div className="flex justify-end mb-3 shrink-0">
              <button
                onClick={() => setModal({ mode: 'create' })}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 px-4 py-2 rounded-md transition-opacity shadow-sm"
              >
                <span className="material-icons text-[16px]">add</span>
                Új asztal
              </button>
            </div>
          )}

          {isLoading && <p className="text-gray-400 m-auto">Terem betöltése…</p>}
          {isError && (
            <div className="m-auto text-center">
              <p className="text-red-500 mb-2">Nem sikerült betölteni a termet.</p>
              <button onClick={() => refetch()} className="text-sm text-blue-600 underline">
                Újrapróbálkozás
              </button>
            </div>
          )}
          {tables && <Room tables={tables} onTableSelected={() => setMobileTab('details')} />}
        </section>

        {/* Részletek panel */}
        <aside
          className={`${
            mobileTab === 'details' ? 'flex flex-1' : 'hidden'
          } lg:flex flex-col w-full lg:w-[360px] bg-white dark:bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 shrink-0 overflow-y-auto`}
        >
          <div className="hidden lg:flex items-center px-5 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Asztal adatai</span>
          </div>
          <TableDetailsPanel table={selectedTable} onEdit={(t) => setModal({ mode: 'edit', table: t })} />
        </aside>
      </div>

      {/* Admin: hozzáadás / szerkesztés modal */}
      <Modal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Asztal szerkesztése' : 'Új asztal hozzáadása'}
      >
        {modal && <TableForm mode={modal.mode} table={modal.table} onClose={() => setModal(null)} />}
      </Modal>
    </div>
  );
}
