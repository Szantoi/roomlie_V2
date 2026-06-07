import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ToastContainer from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import RoomPage from './pages/RoomPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import { useApplyTheme } from './hooks/useApplyTheme';
import { useAuthBootstrap } from './hooks/useAuthBootstrap';

export default function App() {
  useApplyTheme();
  useAuthBootstrap();

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
      <Navbar />

      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<RoomPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Bejelentkezett felhasználóknak */}
          <Route element={<ProtectedRoute />}>
            <Route path="/my-bookings" element={<MyBookingsPage />} />
          </Route>

          {/* Csak adminoknak */}
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/admin/add-table" element={<RoomPage autoOpenAdd />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <ToastContainer />
    </div>
  );
}
