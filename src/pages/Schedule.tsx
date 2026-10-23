import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Loader2, RotateCw } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { CAP, can } from '../features/auth/permissions';
import type { ScheduleSession, SessionStatus } from '../features/schedule/types';
import { addDays, dateInZone, groupByDay, weekOf } from '../features/schedule/week';
import { scheduleService } from '../services/scheduleService';
import { apiErrorMessage } from '../lib/apiClient';
import { OrnamentDivider } from '../components/OrnamentDivider';

type Load = { state: 'loading' } | { state: 'error'; message: string } | { state: 'ready'; sessions: ScheduleSession[] };

const STATUS_TONE: Record<SessionStatus, string> = {
  scheduled: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200',
  awaiting_confirmation: 'bg-lapis-100 text-lapis-800 dark:bg-lapis-900/60 dark:text-lapis-100',
  confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-100',
  room_open: 'bg-emerald-600 text-white',
  closed_out: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-100',
  reported: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-100',
  declined: 'bg-gold-100 text-gold-900 dark:bg-gold-900/50 dark:text-gold-100',
  substitution_open: 'bg-gold-100 text-gold-900 dark:bg-gold-900/50 dark:text-gold-100',
  missed: 'bg-oxblood-100 text-oxblood-800 dark:bg-oxblood-900/60 dark:text-oxblood-100',
  cancelled: 'bg-oxblood-100 text-oxblood-800 dark:bg-oxblood-900/60 dark:text-oxblood-100'
};

const navButton =
  'inline-flex items-center gap-1.5 rounded-full border border-gold-600/40 px-4 py-2 text-sm font-semibold text-emerald-900 dark:text-gold-200 hover:border-gold-500 hover:bg-white/70 dark:hover:bg-emerald-900/50 disabled:opacity-50 disabled:pointer-events-none transition-colors';

/** Weekly planning of one maqraa. Sheikhs receive only their own sessions from the API; the page does not filter. */
export const Schedule: React.FC = () => {
  const { me } = useAuth();
  const { t, i18n } = useTranslation();
  const maqraat = useMemo(() => (me ? me.maqraat.filter((m) => can(me, CAP.scheduleViewOwn, m.id)) : []), [me]);

  const today = dateInZone(new Date());
  const [maqraaId, setMaqraaId] = useState<number | null>(maqraat[0]?.id ?? null);
  const [anchor, setAnchor] = useState(today);
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const week = useMemo(() => weekOf(anchor), [anchor]);

  const fetchWeek = useCallback(async () => {
    if (maqraaId === null) return;
    setLoad({ state: 'loading' });
    try {
      setLoad({ state: 'ready', sessions: await scheduleService.sessions(maqraaId, week.from, week.to) });
    } catch (e) {
      setLoad({ state: 'error', message: apiErrorMessage(e) });
    }
  }, [maqraaId, week.from, week.to]);

  useEffect(() => {
    void fetchWeek();
  }, [fetchWeek]);

  const locale = `${i18n.language}-u-nu-latn`;
  const dayLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }),
    [locale]
  );
  const rangeLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
    [locale]
  );
  const noon = (iso: string) => new Date(`${iso}T12:00:00Z`);

  if (!me) return null;
  const seesAll = maqraaId !== null && can(me, CAP.scheduleViewAll, maqraaId);
  const byDay = load.state === 'ready' ? groupByDay(load.sessions, week.days) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <header className="text-center mb-8">
        <Link to="/dashboard" className="text-sm font-semibold text-emerald-800 dark:text-gold-300 underline-offset-4 hover:underline">
          {t('schedule.back')}
        </Link>
        <h1 className="mt-2 font-amiri text-4xl sm:text-5xl font-bold text-emerald-900 dark:text-gold-200">{t('schedule.title')}</h1>
        <OrnamentDivider className="mt-3 mb-4" />
        <p className="text-stone-600 dark:text-stone-300">{t(seesAll ? 'schedule.subtitle_all' : 'schedule.subtitle_own')}</p>
      </header>

      {maqraat.length === 0 ? (
        <p className="text-center text-stone-600 dark:text-stone-300">{t('schedule.no_maqraa')}</p>
      ) : (
        <>
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {maqraat.length > 1 ? (
              <label className="flex items-center gap-3 font-semibold text-emerald-900 dark:text-gold-200">
                {t('schedule.maqraa')}
                <select
                  value={maqraaId ?? ''}
                  onChange={(e) => setMaqraaId(Number(e.target.value))}
                  className="rounded-xl border border-gold-600/40 bg-white/80 dark:bg-emerald-950/60 px-4 py-2 text-base text-stone-900 dark:text-stone-100 focus:border-gold-500"
                >
                  {maqraat.map((m) => (
                    <option key={m.id} value={m.id}>{m.name_ar}</option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="font-bold text-emerald-900 dark:text-gold-200">{maqraat[0].name_ar}</p>
            )}

            <nav className="flex flex-wrap items-center gap-2" aria-label={t('schedule.title')}>
              <button type="button" className={navButton} onClick={() => setAnchor(addDays(anchor, -7))}>
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" aria-hidden />
                {t('schedule.prev_week')}
              </button>
              <button type="button" className={navButton} onClick={() => setAnchor(today)} disabled={week.days.includes(today)}>
                {t('schedule.this_week')}
              </button>
              <button type="button" className={navButton} onClick={() => setAnchor(addDays(anchor, 7))}>
                {t('schedule.next_week')}
                <ChevronRight className="w-4 h-4 rtl:rotate-180" aria-hidden />
              </button>
              <span className="ms-2 text-sm text-stone-600 dark:text-stone-300">
                {rangeLabel.format(noon(week.from))} – {rangeLabel.format(noon(week.to))}
              </span>
            </nav>
          </div>

          {load.state === 'loading' && (
            <p className="py-16 flex items-center justify-center gap-2 text-stone-500" role="status">
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
              {t('schedule.loading')}
            </p>
          )}

          {load.state === 'error' && (
            <div className="py-12 text-center" role="alert">
              <p className="mb-4 text-oxblood-700 dark:text-oxblood-200">{load.message}</p>
              <button type="button" className={navButton} onClick={() => void fetchWeek()}>
                <RotateCw className="w-4 h-4" aria-hidden />
                {t('schedule.retry')}
              </button>
            </div>
          )}

          {byDay && (
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {week.days.map((day) => {
                const sessions = byDay.get(day) ?? [];
                const isToday = day === today;
                return (
                  <li
                    key={day}
                    aria-current={isToday ? 'date' : undefined}
                    className={`rounded-2xl border bg-white/70 dark:bg-emerald-950/60 p-4 ${isToday ? 'border-gold-500 ring-2 ring-gold-400/40' : 'border-gold-600/30'}`}
                  >
                    <h2 className="mb-3 flex items-baseline justify-between gap-2 font-bold text-emerald-900 dark:text-gold-200">
                      <span>{dayLabel.format(noon(day))}</span>
                      {isToday && <span className="text-xs font-semibold text-gold-700 dark:text-gold-300">{t('schedule.today')}</span>}
                    </h2>
                    {sessions.length === 0 ? (
                      <p className="text-sm text-stone-500 dark:text-stone-400">{t('schedule.no_sessions')}</p>
                    ) : (
                      <ul className="space-y-3">
                        {sessions.map((s) => (
                          <li key={s.id} className="rounded-xl border border-gold-600/20 bg-gold-50/60 dark:bg-emerald-900/40 p-3">
                            <p className="text-lg font-bold tabular-nums whitespace-nowrap text-stone-900 dark:text-stone-100">
                              {s.start_tunis} – {s.end_tunis}
                              <span className="ms-1 text-xs font-semibold text-stone-500 dark:text-stone-400">{t('schedule.tunis')}</span>
                            </p>
                            <p className="text-sm tabular-nums whitespace-nowrap text-stone-600 dark:text-stone-300">
                              {s.start_mecca} – {s.end_mecca}
                              <span className="ms-1 text-xs">{t('schedule.mecca')}</span>
                            </p>
                            <dl className="mt-2 space-y-0.5 text-sm">
                              <div className="flex gap-1">
                                <dt className="text-stone-500 dark:text-stone-400">{t('schedule.sheikh')}:</dt>
                                <dd className="font-semibold text-emerald-900 dark:text-gold-100">{s.sheikh?.name ?? t('schedule.unassigned')}</dd>
                              </div>
                              {s.supervisor && (
                                <div className="flex gap-1">
                                  <dt className="text-stone-500 dark:text-stone-400">{t('schedule.supervisor')}:</dt>
                                  <dd>{s.supervisor.name}</dd>
                                </div>
                              )}
                            </dl>
                            <p className="mt-2 flex flex-wrap gap-1.5">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_TONE[s.status]}`}>
                                {t(`schedule.status.${s.status}`)}
                              </span>
                              {s.awaiting_report && (
                                <span className="rounded-full bg-gold-200 px-2.5 py-0.5 text-xs font-semibold text-gold-900">
                                  {t('schedule.awaiting_report')}
                                </span>
                              )}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}
    </div>
  );
};

export default Schedule;
