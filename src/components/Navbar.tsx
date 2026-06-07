import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { selectCurrentUser, selectIsAdmin, selectIsAuthenticated } from '../store/authSlice';
import { selectTheme, toggleTheme } from '../store/uiSlice';
import { useLogout } from '../hooks/useLogout';

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
    isActive
      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800',
  ].join(' ');
}

export default function Navbar() {
  const user = useAppSelector(selectCurrentUser);
  const isAuth = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();
  const logout = useLogout();

  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  const links = (
    <>
      <NavLink to="/" end className={navLinkClass} onClick={closeMobile}>
        Terem
      </NavLink>

      {isAuth && !isAdmin && (
        <NavLink to="/my-bookings" className={navLinkClass} onClick={closeMobile}>
          Foglalásaim
        </NavLink>
      )}

      {isAdmin && (
        <>
          <NavLink to="/admin/add-table" className={navLinkClass} onClick={closeMobile}>
            Asztal hozzáadása
          </NavLink>
          <NavLink to="/admin/bookings" className={navLinkClass} onClick={closeMobile}>
            Beérkezett foglalások
          </NavLink>
        </>
      )}

      {!isAuth && (
        <>
          <NavLink to="/login" className={navLinkClass} onClick={closeMobile}>
            Bejelentkezés
          </NavLink>
          <NavLink to="/register" className={navLinkClass} onClick={closeMobile}>
            Regisztráció
          </NavLink>
        </>
      )}
    </>
  );

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm shrink-0 z-30">
      <div className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2">
        {/* Bal: márka + (asztali) linkek */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <NavLink to="/" className="flex items-center gap-2 shrink-0" onClick={closeMobile}>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-extrabold text-sm">
              R
            </span>
            <span className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
              Roomlie
            </span>
          </NavLink>
          <nav className="hidden md:flex items-center gap-1 ml-2">{links}</nav>
        </div>

        {/* Jobb: téma váltó + felhasználó */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
            title={theme === 'dark' ? 'Világos mód' : 'Sötét mód'}
            aria-label="Téma váltása"
          >
            <span className="material-icons text-[20px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          </button>

          {isAuth && user && (
            <div className="hidden md:flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                <span className="material-icons text-[18px] text-gray-400">account_circle</span>
                {user.name}
                {isAdmin && (
                  <span className="text-[10px] uppercase font-bold tracking-wide bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 px-2.5 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Kijelentkezés
              </button>
            </div>
          )}

          {/* Mobil menü gomb */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Menü"
          >
            <span className="material-icons">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobil legördülő menü */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-gray-200 dark:border-gray-800 px-3 py-3 flex flex-col gap-1 bg-white dark:bg-gray-900">
          {isAuth && user && (
            <div className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 mb-1">
              <span className="material-icons text-[18px] text-gray-400">account_circle</span>
              {user.name}
              {isAdmin && (
                <span className="text-[10px] uppercase font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-1.5 py-0.5 rounded">
                  Admin
                </span>
              )}
            </div>
          )}
          {links}
          {isAuth && (
            <button
              onClick={() => {
                closeMobile();
                logout();
              }}
              className="text-left px-3 py-1.5 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Kijelentkezés
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
