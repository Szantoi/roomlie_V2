import { useEffect } from 'react';
import { useAppSelector } from './reduxHooks';
import { selectTheme } from '../store/uiSlice';

/**
 * A Tailwind `darkMode: 'class'` beállításához a <html> elemen kell a `dark` osztály.
 * Ezt deklaratívan, a Redux téma-állapotból vezéreljük – a class beállítása
 * mellékhatás, ezért kizárólag useEffect-ben történik.
 */
export function useApplyTheme() {
  const theme = useAppSelector(selectTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);
}
