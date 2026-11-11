import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode } from '../../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../../utils/storage';

export interface ThemeState {
  mode: ThemeMode;
}

function getInitialTheme(): ThemeMode {
  const saved = getStorageItem<ThemeMode | null>(STORAGE_KEYS.THEME, null);
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  return 'dark';
}

const initialState: ThemeState = {
  mode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      setStorageItem(STORAGE_KEYS.THEME, action.payload);
    },
    toggleTheme(state) {
      const next: ThemeMode = state.mode === 'dark' ? 'light' : 'dark';
      state.mode = next;
      setStorageItem(STORAGE_KEYS.THEME, next);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
