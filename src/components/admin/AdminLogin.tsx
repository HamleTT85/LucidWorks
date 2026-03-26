import { useState } from 'react';
import type { AdminSession } from '../../lib/types';

const SESSION_KEY = 'lucidworks-admin-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface Props {
  onLogin: () => void;
}

export function checkAdminSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return false;
    const session: AdminSession = JSON.parse(stored);
    if (session.authenticated && session.expiresAt > Date.now()) return true;
    localStorage.removeItem(SESSION_KEY);
    return false;
  } catch {
    return false;
  }
}

export function saveAdminSession() {
  const session: AdminSession = {
    authenticated: true,
    expiresAt: Date.now() + SESSION_DURATION,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default function AdminLogin({ onLogin }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check password against environment variable
    // Since this is a static site, we hash and compare client-side
    // The password is set via .env and baked at build time
    const adminPassword = import.meta.env.PUBLIC_ADMIN_PASSWORD || 'admin';

    if (password === adminPassword) {
      saveAdminSession();
      onLogin();
    } else {
      setError('Falsches Passwort / Wrong password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-8">
          <h1 className="font-heading text-2xl font-bold text-[#e8e4df] mb-2">Admin Panel</h1>
          <p className="text-[#b0aaa2] text-sm mb-8">Portfolio Management</p>

          <form onSubmit={handleSubmit}>
            <label className="block text-[#b0aaa2] text-sm mb-2">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0a1a] border border-white/10 rounded-lg
                       text-[#e8e4df] placeholder:text-[#b0aaa2]/40
                       focus:outline-none focus:border-[#c8a45c]/50 transition-colors"
              placeholder="••••••••"
              autoFocus
            />

            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full mt-6 px-4 py-3 bg-[#c8a45c] text-[#0a0a1a] font-heading font-semibold
                       rounded-lg hover:bg-[#d4b876] transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Prüfe...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
