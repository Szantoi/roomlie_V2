// ─── Domain típusok (a REST API szerződéséhez igazítva) ─────────────────────

export type TableType = 'snooker' | 'air-hockey' | 'foosball';
export type TableCategory = 'competition' | 'normal' | 'kids';
export type TableColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple';
export type BookingStatus = 'pending' | 'accepted' | 'declined';
export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Table {
  id: number;
  name: string;
  type: TableType;
  category: TableCategory;
  color: TableColor;
  status: number; // 1-10
  position: { x: number; y: number };
  isLocked: boolean;
}

export interface Timeslot {
  startTime: string; // 'HH:MM'
  endTime: string;
  isAvailable: boolean;
}

export interface Booking {
  id: number;
  tableId: number;
  tableName: string;
  userId: number;
  date: string; // 'YYYY-MM-DD'
  startTime: string;
  endTime: string;
  name: string;
  email: string;
  phone: string;
  headcount: number;
  notes?: string;
  status: BookingStatus;
}

// ─── Kérés-törzsek (API felé) ────────────────────────────────────────────────

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface CreateTableBody {
  name?: string;
  type: TableType;
  category: TableCategory;
  color: TableColor;
  status: number;
  position: { x: number; y: number };
  isLocked: boolean;
}

export interface UpdateTableBody {
  name?: string;
  type?: TableType;
  category?: TableCategory;
  color?: TableColor;
  status?: number;
  isLocked?: boolean;
}

export interface CreateBookingBody {
  tableId: number;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  email: string;
  phone: string;
  headcount: number;
  notes?: string;
}
