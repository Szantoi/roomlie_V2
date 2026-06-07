import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { selectIsAuthenticated, setCredentials } from '../store/authSlice';
import { addToast } from '../store/toastSlice';
import { useLoginMutation, useRegisterMutation } from '../api/apiSlice';

const inputClass =
  'w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuth = useAppSelector(selectIsAuthenticated);
  const [register, { isLoading }] = useRegisterMutation();
  const [login] = useLoginMutation();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (isAuth) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('A jelszónak legalább 6 karakteresnek kell lennie.');
      return;
    }
    try {
      await register(form).unwrap();
      // Regisztráció után automatikus bejelentkezés a folyamatos élményért.
      const res = await login({ email: form.email, password: form.password }).unwrap();
      dispatch(setCredentials({ user: res.user, token: res.token }));
      dispatch(addToast('Sikeres regisztráció! Üdv a Roomlie-ban!', 'success'));
      navigate('/');
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        setError('Ez az email cím már foglalt.');
        dispatch(addToast('Ez az email cím már foglalt.', 'error'));
      } else {
        dispatch(addToast('A regisztráció sikertelen. Próbáld újra!', 'error'));
      }
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Regisztráció</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Hozz létre egy új fiókot.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Név</label>
            <input
              type="text"
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
            <input
              type="email"
              required
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Jelszó</label>
            <input
              type="password"
              required
              minLength={6}
              className={inputClass}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Legalább 6 karakter"
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm mt-1"
          >
            {isLoading ? 'Regisztráció…' : 'Regisztráció'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
          Van már fiókod?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Jelentkezz be
          </Link>
        </p>
      </div>
    </div>
  );
}
