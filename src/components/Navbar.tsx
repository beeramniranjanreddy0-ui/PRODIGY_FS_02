import React from 'react';
import { User } from '../types';
import { LogOut, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onQuickLogin: (role: 'admin') => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onQuickLogin,
  onOpenAuth,
}) => {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-sm tracking-wider">
              PI
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm tracking-tight text-black">PRODIGY INFOTECH</span>
              </div>
              <h1 className="text-sm font-medium text-zinc-900 hidden sm:block">Employee Management System</h1>
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <div className="flex items-center space-x-2 border border-zinc-200 px-3 py-1.5 text-xs bg-zinc-50">
                  <span className="inline-flex items-center space-x-1 font-semibold text-black">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ADMINISTRATOR</span>
                  </span>
                  <span className="text-zinc-300">|</span>
                  <span className="text-zinc-600 truncate max-w-[140px] sm:max-w-xs">{user.email}</span>
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium border border-zinc-200 hover:border-black hover:bg-zinc-50 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenAuth}
                  style={{ backgroundColor: '#e61414' }}
                  className="px-3.5 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-colors flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Sign In</span>
                </button>
                <button
                  onClick={onOpenAuth}
                  style={{ backgroundColor: '#f7f2f2' }}
                  className="px-3 py-1.5 text-xs font-medium border border-zinc-300 hover:border-black transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
