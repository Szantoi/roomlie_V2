import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'roomlie_theme';

interface UiState {
  theme: Theme;
  selectedTableId: number | null;
}

function loadTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  // Rendszer-preferencia, ha nincs mentett érték.
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

const initialState: UiState = {
  theme: loadTheme(),
  selectedTableId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, state.theme);
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      localStorage.setItem(THEME_KEY, state.theme);
    },
    setSelectedTable(state, action: PayloadAction<number | null>) {
      state.selectedTableId = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, setSelectedTable } = uiSlice.actions;

export const selectTheme = (state: { ui: UiState }) => state.ui.theme;
export const selectSelectedTableId = (state: { ui: UiState }) => state.ui.selectedTableId;

export default uiSlice.reducer;
