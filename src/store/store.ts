import { configureStore } from '@reduxjs/toolkit';
import { api } from '../api/apiSlice';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import toastReducer from './toastSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    ui: uiReducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
