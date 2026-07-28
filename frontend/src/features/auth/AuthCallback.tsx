import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import api from '@/api/axios';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    let active = true;
    const tokenFromUrl = searchParams.get('token');

    const headers = tokenFromUrl ? { Authorization: `Bearer ${tokenFromUrl}` } : undefined;

    api.get('/auth/profile', { headers })
      .then(({ data }) => {
        if (!active) return;
        setAuth(tokenFromUrl || useAuthStore.getState().token, data.user);
        toast.success('Successfully logged in!');
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        if (!active) return;
        toast.error('Authentication failed');
        navigate('/login', { replace: true });
      });
    return () => { active = false; };
  }, [navigate, searchParams, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};
