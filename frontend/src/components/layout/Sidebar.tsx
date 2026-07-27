import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { Clock, Send, ChevronDown, Menu, Plus, Mail, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAuthStore } from '@/store/authStore';
import { useDashboard } from '@/hooks/useDashboard';

export const Sidebar = ({ isOpen, setisOpen }: { isOpen: boolean, setisOpen: (v: boolean) => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { data: stats } = useDashboard();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isSentActive = location.pathname === '/emails' && location.search.includes('status=SENT');
  const isScheduledActive = location.pathname === '/emails' && !isSentActive;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setisOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out p-5 justify-between",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tighter text-gray-900 dark:text-white font-mono">
              ONE
            </h1>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setisOpen(false)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* User Profile Pill with Popover */}
          <div className="relative">
            <div
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 cursor-pointer hover:bg-gray-100/80 transition-colors w-full"
            >
              <div className="w-9 h-9 rounded-full bg-amber-100 overflow-hidden shrink-0 flex items-center justify-center font-bold text-amber-800 text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name || 'Oliver Brown'}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {user?.email || 'oliver.brown@domain.io'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
            </div>

            {profileMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-50 space-y-1 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'Oliver Brown'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email || 'oliver.brown@domain.io'}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>

          {/* Compose Pill Button */}
          <button
            onClick={() => navigate('/schedule')}
            className="w-full flex items-center justify-center gap-2 border-2 border-[#00A859] hover:bg-emerald-50 text-[#00A859] font-medium py-2.5 px-4 rounded-full transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Compose New Email
          </button>

          {/* Navigation Section */}
          <div className="space-y-4 pt-2">
            <p className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase px-2">
              CORE
            </p>

            <nav className="space-y-1.5">
              <NavLink
                to="/emails"
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isScheduledActive
                    ? "bg-[#EAF5ED] text-[#00A859] font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4" />
                  <span>Scheduled</span>
                </div>
                <span className="text-xs font-normal text-gray-400">
                  {stats?.scheduled ?? 0}
                </span>
              </NavLink>

              <NavLink
                to="/emails?status=SENT"
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isSentActive
                    ? "bg-[#EAF5ED] text-[#00A859] font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <Send className="w-4 h-4" />
                  <span>Sent</span>
                </div>
                <span className="text-xs font-normal text-gray-400">
                  {stats?.sent ?? 0}
                </span>
              </NavLink>

              <NavLink
                to="/senders"
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#EAF5ED] text-[#00A859] font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <Mail className="w-4 h-4" />
                <span>Senders</span>
              </NavLink>

              <NavLink
                to="/dashboard"
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#EAF5ED] text-[#00A859] font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};
