import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { User } from '../types';
import { X, ShieldCheck, AlertCircle, KeyRound, Eye, EyeOff, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // Secret Code states
  const [defaultAdminSecret, setDefaultAdminSecret] = useState('');
  const [loginSecretCode, setLoginSecretCode] = useState('');
  const [registerSecretCode, setRegisterSecretCode] = useState('');
  const [showDefaultSecret, setShowDefaultSecret] = useState(false);
  const [showLoginSecret, setShowLoginSecret] = useState(false);
  const [showRegisterSecret, setShowRegisterSecret] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear all entered secret codes and passwords fresh every time modal opens or mode switches
  const resetFormFields = () => {
    setDefaultAdminSecret('');
    setLoginSecretCode('');
    setRegisterSecretCode('');
    setPassword('');
    setError(null);
    setShowDefaultSecret(false);
    setShowLoginSecret(false);
    setShowRegisterSecret(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetFormFields();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetFormFields();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      if (!loginSecretCode.trim()) {
        setError('Admin Secret Code is required to sign in as Administrator.');
        return;
      }
    } else {
      if (!registerSecretCode.trim()) {
        setError('Admin Secret Code is required to create an Administrator account.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password, loginSecretCode.trim());
        resetFormFields();
        onSuccess(res.user);
      } else {
        const res = await api.register(email, username, password, 'admin', registerSecretCode.trim());
        resetFormFields();
        onSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDefaultAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!defaultAdminSecret.trim()) {
      setError('Please enter the Administrator Secret Code to sign in.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login('admin@prodigy.com', 'AdminPassword@2026', defaultAdminSecret.trim());
      resetFormFields();
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid Administrator Secret Code. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-black w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              {mode === 'login' ? 'Administrator Authentication' : 'Create Administrator Account'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Protected by Master Secret Security Code
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-zinc-400 hover:text-black hover:bg-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Secret Code Verification for Default Administrator Sign In */}
        <div className="p-4 bg-zinc-100 border-b border-zinc-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-700 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-black" />
              <span>Default Administrator Access</span>
            </span>
          </div>

          <form onSubmit={handleDefaultAdminLogin} className="space-y-2" autoComplete="off">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-800 mb-1">
                Admin Secret Code <span className="text-black">*</span>
              </label>
              <div className="relative">
                <input
                  type={showDefaultSecret ? 'text' : 'password'}
                  value={defaultAdminSecret}
                  onChange={(e) => setDefaultAdminSecret(e.target.value)}
                  placeholder="Enter secret code to login"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  data-lpignore="true"
                  className="w-full pl-3 pr-8 py-1.5 border border-zinc-300 bg-white text-xs focus:outline-none focus:border-black font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowDefaultSecret(!showDefaultSecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                >
                  {showDefaultSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 p-2 border border-black bg-black text-white hover:bg-zinc-800 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Secret Code & Sign In</span>
            </button>
          </form>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex border-b border-zinc-200 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              resetFormFields();
            }}
            className={`flex-1 py-2 font-medium border-b-2 transition-colors ${
              mode === 'login'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-zinc-500 hover:text-black'
            }`}
          >
            Custom Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              resetFormFields();
            }}
            className={`flex-1 py-2 font-medium border-b-2 transition-colors ${
              mode === 'register'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-zinc-500 hover:text-black'
            }`}
          >
            Create Admin Account
          </button>
        </div>

        {/* Custom Login / Register Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs" autoComplete="off">
          {error && (
            <div className="p-3 border border-black bg-zinc-100 text-black flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-black" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block font-semibold text-zinc-800 mb-1">Full Name / Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. System Administrator"
                  autoComplete="off"
                  className="w-full px-3 py-1.5 border border-zinc-300 bg-white focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-800 mb-1 flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-black" />
                  <span>Admin Secret Code</span> <span className="text-black">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegisterSecret ? 'text' : 'password'}
                    required
                    value={registerSecretCode}
                    onChange={(e) => setRegisterSecretCode(e.target.value)}
                    placeholder="Enter master secret code to create admin"
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    data-lpignore="true"
                    className="w-full pl-3 pr-8 py-1.5 border border-zinc-300 bg-white font-mono focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterSecret(!showRegisterSecret)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                  >
                    {showRegisterSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Secret authorization code required to register as Administrator.
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-zinc-800 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@prodigy.com"
              autoComplete="off"
              className="w-full px-3 py-1.5 border border-zinc-300 bg-white focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-800 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secure password"
              autoComplete="new-password"
              className="w-full px-3 py-1.5 border border-zinc-300 bg-white focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {mode === 'login' && (
            <div>
              <label className="block font-semibold text-zinc-800 mb-1 flex items-center space-x-1">
                <Lock className="w-3 h-3 text-black" />
                <span>Admin Secret Code</span> <span className="text-black">*</span>
              </label>
              <div className="relative">
                <input
                  type={showLoginSecret ? 'text' : 'password'}
                  required
                  value={loginSecretCode}
                  onChange={(e) => setLoginSecretCode(e.target.value)}
                  placeholder="Enter administrator secret code"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  data-lpignore="true"
                  className="w-full pl-3 pr-8 py-1.5 border border-zinc-300 bg-white font-mono focus:outline-none focus:border-black transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginSecret(!showLoginSecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                >
                  {showLoginSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                Security authorization code required to sign in as Administrator.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-black text-white hover:bg-zinc-800 font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? 'Verifying...' : mode === 'login' ? 'Sign In as Admin' : 'Verify Code & Create Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};
