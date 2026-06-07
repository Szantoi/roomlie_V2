import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types';

const STORAGE_KEY = 'roomlie_auth';

interface AuthState {
  user: User | null;
  token: string | null;
}

// Az autentikációs állapotot a localStorage-ban tartjuk, hogy újratöltés után is
// megmaradjon a bejelentkezett munkamenet.
function loadInitialState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthState;
      if (parsed && typeof parsed.token === 'string') return parsed;
    }
  } catch {
    /* hibás tárolt adat – figyelmen kívül hagyjuk */
  }
  return { user: null, token: null };
}

const initialState: AuthState = loadInitialState();

function persist(state: AuthState) {
  if (state.token) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      persist(state);
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      persist(state);
    },
    clearCredentials(state) {
      state.user = null;
      state.token = null;
      persist(state);
    },
  },
});

export const { setCredentials, setUser, clearCredentials } = authSlice.actions;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.token;
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.user?.role === 'admin';

export default authSlice.reducer;
