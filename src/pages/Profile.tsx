import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { OrnamentDivider } from '../components/OrnamentDivider';

const ROLE_AR: Record<string, string> = { sheikh: 'شيخ', supervisor: 'مشرف', admin: 'مدير' };

export const Profile: React.FC = () => {
  const { me } = useAuth();
  if (!me) return null;
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-center font-amiri text-4xl font-bold text-emerald-900 dark:text-gold-200">ملفي الشخصي</h1>
      <OrnamentDivider className="mt-3 mb-8" />
      <dl className="rounded-2xl border border-gold-600/30 bg-white/70 dark:bg-emerald-950/60 divide-y divide-gold-600/20">
        <div className="flex justify-between gap-4 px-6 py-4"><dt className="font-bold">الاسم</dt><dd>{me.full_name}</dd></div>
        <div className="flex justify-between gap-4 px-6 py-4"><dt className="font-bold">اسم المستخدم</dt><dd dir="ltr">{me.username}</dd></div>
        {me.maqraat.map((m) => (
          <div key={m.id} className="flex justify-between gap-4 px-6 py-4">
            <dt className="font-bold">{m.name_ar}</dt>
            <dd>{m.roles.map((r) => ROLE_AR[r] ?? r).join('، ') || '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default Profile;
