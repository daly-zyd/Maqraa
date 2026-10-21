import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserRound, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from './AuthContext';

/** Navbar entry: «تسجيل الدخول» when signed out, a user menu (dashboard, profile, sign out) when signed in. */
export const UserMenu: React.FC<{ onNavigate?: () => void; block?: boolean }> = ({ onNavigate, block }) => {
  const { me, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  if (loading) return <span className="w-24 h-10" aria-hidden />;

  if (!me) {
    return (
      <Link
        to="/login"
        onClick={onNavigate}
        className={`${block ? 'flex w-full justify-center py-3.5' : 'inline-flex px-5 py-2.5'} items-center rounded-full text-sm font-bold text-emerald-900 dark:text-gold-200 border border-gold-600/60 hover:bg-gold-400/10 transition-colors`}
      >
        تسجيل الدخول
      </Link>
    );
  }

  const item = 'flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-stone-800 dark:text-stone-100 hover:bg-gold-400/10';
  return (
    <div className={`relative ${block ? 'w-full' : ''}`} ref={box}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-full border border-gold-600/60 ps-2 pe-4 py-1.5 text-sm font-bold text-emerald-900 dark:text-gold-200 hover:bg-gold-400/10"
      >
        <span className="grid place-items-center w-8 h-8 rounded-full bg-emerald-800 text-gold-200 text-sm" aria-hidden>
          {me.full_name.slice(0, 1)}
        </span>
        <span className="max-w-32 truncate">{me.full_name}</span>
        <ChevronDown className="w-4 h-4" aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute end-0 mt-2 w-56 overflow-hidden rounded-2xl border border-gold-600/30 bg-paper dark:bg-emerald-950 shadow-xl z-50">
          <Link role="menuitem" to="/dashboard" className={item} onClick={() => { setOpen(false); onNavigate?.(); }}>
            <LayoutDashboard className="w-4 h-4 text-gold-600" aria-hidden /> لوحة التحكم
          </Link>
          <Link role="menuitem" to="/profile" className={item} onClick={() => { setOpen(false); onNavigate?.(); }}>
            <UserRound className="w-4 h-4 text-gold-600" aria-hidden /> ملفي الشخصي
          </Link>
          <button
            role="menuitem"
            type="button"
            className={`${item} w-full border-t border-gold-600/20 text-oxblood-600 dark:text-oxblood-300`}
            onClick={async () => { setOpen(false); await signOut(); onNavigate?.(); navigate('/'); }}
          >
            <LogOut className="w-4 h-4" aria-hidden /> تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
};
