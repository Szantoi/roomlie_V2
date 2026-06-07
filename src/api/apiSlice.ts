import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/store';
import type {
  Booking,
  CreateBookingBody,
  CreateTableBody,
  LoginBody,
  RegisterBody,
  Table,
  Timeslot,
  UpdateTableBody,
  User,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const NEPTUN_CODE = import.meta.env.VITE_NEPTUN_CODE ?? '';

// Fejlesztés alatt (localhost) NEM küldjük az X-Neptun-Code fejlécet (a szerver
// hibát adna). Éles API esetén (pl. Vercelről a publikus API) viszont kötelező.
const IS_PRODUCTION_API = !/localhost|127\.0\.0\.1/.test(API_URL);

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api/v1`,
  // A HttpOnly süti alapú hitelesítéshez is jó, de elsődlegesen Bearer tokent használunk.
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (IS_PRODUCTION_API && NEPTUN_CODE) headers.set('X-Neptun-Code', NEPTUN_CODE);
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Tables', 'Timeslots', 'MyBookings', 'AllBookings', 'Me'],
  endpoints: (builder) => ({
    // ─── Auth ────────────────────────────────────────────────────────────────
    login: builder.mutation<{ token: string; user: User }, LoginBody>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation<{ user: User }, RegisterBody>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),

    // ─── Tables ──────────────────────────────────────────────────────────────
    getTables: builder.query<Table[], void>({
      query: () => '/tables',
      providesTags: (result) =>
        result
          ? [...result.map((t) => ({ type: 'Tables' as const, id: t.id })), { type: 'Tables', id: 'LIST' }]
          : [{ type: 'Tables', id: 'LIST' }],
    }),
    createTable: builder.mutation<Table, CreateTableBody>({
      query: (body) => ({ url: '/tables', method: 'POST', body }),
      invalidatesTags: [{ type: 'Tables', id: 'LIST' }],
    }),
    updateTable: builder.mutation<Table, { id: number; body: UpdateTableBody }>({
      query: ({ id, body }) => ({ url: `/tables/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Tables', id }, { type: 'Tables', id: 'LIST' }],
    }),
    updateTablePosition: builder.mutation<Table, { id: number; x: number; y: number }>({
      query: ({ id, x, y }) => ({ url: `/tables/${id}/position`, method: 'PATCH', body: { x, y } }),
      // Optimista frissítés: a cache azonnal frissül, így nincs villogás drop után.
      async onQueryStarted({ id, x, y }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          api.util.updateQueryData('getTables', undefined, (draft) => {
            const t = draft.find((tbl) => tbl.id === id);
            if (t) t.position = { x, y };
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    deleteTable: builder.mutation<void, number>({
      query: (id) => ({ url: `/tables/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Tables', id }, { type: 'Tables', id: 'LIST' }],
    }),
    getTimeslots: builder.query<Timeslot[], { tableId: number; date: string }>({
      query: ({ tableId, date }) => `/tables/${tableId}/timeslots?date=${date}`,
      providesTags: (_r, _e, { tableId, date }) => [{ type: 'Timeslots', id: `${tableId}-${date}` }],
    }),

    // ─── Bookings ────────────────────────────────────────────────────────────
    getMyBookings: builder.query<Booking[], void>({
      query: () => '/bookings/my',
      providesTags: ['MyBookings'],
    }),
    getAllBookings: builder.query<Booking[], void>({
      query: () => '/bookings',
      providesTags: ['AllBookings'],
    }),
    createBooking: builder.mutation<Booking, CreateBookingBody>({
      query: (body) => ({ url: '/bookings', method: 'POST', body }),
      invalidatesTags: (_r, _e, body) => [
        'MyBookings',
        'AllBookings',
        { type: 'Timeslots', id: `${body.tableId}-${body.date}` },
      ],
    }),
    updateBookingStatus: builder.mutation<Booking, { id: number; status: 'accepted' | 'declined' }>({
      query: ({ id, status }) => ({ url: `/bookings/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['AllBookings', 'MyBookings'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetTablesQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useUpdateTablePositionMutation,
  useDeleteTableMutation,
  useGetTimeslotsQuery,
  useGetMyBookingsQuery,
  useGetAllBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
} = api;
