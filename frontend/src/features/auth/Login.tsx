import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '@/api/axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/config/api.config';
import toast from 'react-hot-toast';

export const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    window.location.assign(`${API_BASE_URL}/auth/google`);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both Email ID and Password');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.sessionToken, data.user);
      toast.success(`Welcome back, ${data.user.name || data.user.email}!`);
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 p-4">
      <div className="w-full max-w-[420px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm space-y-6">
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-[#1E293B] dark:text-white text-center">
          Login
        </h1>

        {/* Google Login Button matching exact mockup */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-[#EAF5ED] hover:bg-[#DDF0E2] text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-2xl transition-colors text-sm shadow-none"
        >
          {/* Multicolored Google Icon SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Login with Google</span>
        </button>

        {/* Or sign up through email divider */}
        <div className="flex items-center gap-3 text-xs text-gray-400 font-normal my-4 before:flex-1 before:h-[1px] before:bg-gray-100 dark:before:bg-gray-800 after:flex-1 after:h-[1px] after:bg-gray-100 dark:after:bg-gray-800">
          or sign up through email
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F7F9FA] dark:bg-gray-800/60 border-none rounded-2xl py-3.5 px-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00A859]"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F7F9FA] dark:bg-gray-800/60 border-none rounded-2xl py-3.5 px-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00A859]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00A859] hover:bg-[#00924D] text-white font-medium py-3.5 px-4 rounded-2xl transition-colors text-sm shadow-none mt-4 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>

      </div>
    </div>
  );
};
