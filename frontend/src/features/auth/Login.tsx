import { Button } from '@/components/ui/button';

export const Login = () => {
  const handleGoogleLogin = () => {
    window.location.assign(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/google`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-gray-950 p-4">
      <div className="w-full max-w-[380px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">ReachInbox</h1>
          <p className="text-sm text-gray-500">Sign in to schedule and track your email campaigns.</p>
        </div>
        <Button onClick={handleGoogleLogin} type="button" className="w-full bg-[#00A859] hover:bg-[#00924D] text-white py-3 rounded-xl">
          Continue with Google
        </Button>
      </div>
    </div>
  );
};
