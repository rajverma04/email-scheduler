import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string | null, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        void fetch(`${baseUrl}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        }).finally(() => {
          localStorage.removeItem('auth-storage');
          set({ token: null, user: null, isAuthenticated: false });
          window.location.assign('/login');
        });
      },
    }),
    {
      name: 'auth-storage', // key in local storage
    }
  )
);
