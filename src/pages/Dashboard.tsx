import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { visibleLinks } from '../features/auth/permissions';
import { OrnamentDivider } from '../components/OrnamentDivider';

/** Landing page after sign-in. Tiles come from the capabilities in /me/, never from role names. */
export const Dashboard: React.FC = () => {
  const { me } = useAuth();
  if (!me) return null;
  const links = visibleLinks(me);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <header className="text-center mb-10">
        <h1 className="font-amiri text-4xl sm:text-5xl font-bold text-emerald-900 dark:text-gold-200">مرحبا، {me.full_name}</h1>
        <OrnamentDivider className="mt-3 mb-4" />
        <p className="text-stone-600 dark:text-stone-300">
          {me.maqraat.length > 0 ? `مقرآتك: ${me.maqraat.map((m) => m.name_ar).join('، ')}` : 'لا توجد مقرأة مرتبطة بحسابك بعد.'}
        </p>
      </header>

      {links.length === 0 ? (
        <p className="text-center text-stone-600 dark:text-stone-300">لا تتوفر لك أقسام بعد. تواصل مع مشرف المقرأة ليمنحك الصلاحيات.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-5">
          {links.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="group flex items-center justify-between gap-4 rounded-2xl border border-gold-600/30 bg-white/70 dark:bg-emerald-950/60 px-6 py-5 hover:border-gold-500 hover:bg-white dark:hover:bg-emerald-900/50 transition-colors">
                <span>
                  <span className="block text-xl font-bold text-emerald-900 dark:text-gold-200">{l.label}</span>
                  <span className="block text-sm text-stone-600 dark:text-stone-300">{l.description}</span>
                </span>
                <ChevronLeft className="w-5 h-5 text-gold-600 transition-transform group-hover:-translate-x-1" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
