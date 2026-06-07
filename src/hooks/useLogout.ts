import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from './reduxHooks';
import { useLogoutMutation, api } from '../api/apiSlice';
import { clearCredentials } from '../store/authSlice';
import { addToast } from '../store/toastSlice';

/**
 * Kijelentkezés: érvényteleníti a tokent a szerveren, kiüríti a helyi
 * autentikációs állapotot és az API cache-t, majd a Terem oldalra navigál.
 */
export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();

  return async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      /* a token már lejárhatott – a helyi állapotot mindenképp kiürítjük */
    }
    dispatch(clearCredentials());
    dispatch(api.util.resetApiState());
    dispatch(addToast('Sikeres kijelentkezés.', 'success'));
    navigate('/');
  };
}
