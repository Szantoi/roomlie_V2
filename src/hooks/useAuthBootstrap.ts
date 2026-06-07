import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './reduxHooks';
import { selectToken, setUser, clearCredentials } from '../store/authSlice';
import { useGetMeQuery } from '../api/apiSlice';

/**
 * Betöltéskor (ha van tárolt token) ellenőrzi a munkamenetet a /auth/me hívással.
 * Sikeres esetben frissíti a felhasználó adatait, 401 esetén kijelentkeztet.
 */
export function useAuthBootstrap() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);

  const { data, isError, error } = useGetMeQuery(undefined, { skip: !token });

  useEffect(() => {
    if (data) dispatch(setUser(data));
  }, [data, dispatch]);

  useEffect(() => {
    if (isError && (error as { status?: number })?.status === 401) {
      dispatch(clearCredentials());
    }
  }, [isError, error, dispatch]);
}
