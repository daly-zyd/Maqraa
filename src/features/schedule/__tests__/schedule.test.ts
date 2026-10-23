import { getResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { handlers } from '../../../mocks/handlers';
import type { ScheduleSession, TemplateSlot } from '../types';
import { addDays, dateInZone, groupByDay, weekOf, weekdayOf } from '../week';

describe('week helpers', () => {
  it('numbers weekdays like the backend (Monday = 0)', () => {
    expect(weekdayOf('2026-10-19')).toBe(0);
    expect(weekdayOf('2026-10-25')).toBe(6);
  });

  it('returns the Monday-to-Sunday week, across a month end', () => {
    const week = weekOf('2026-11-01');
    expect(week.from).toBe('2026-10-26');
    expect(week.to).toBe('2026-11-01');
    expect(week.days).toHaveLength(7);
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('dates an instant in Tunis time, not UTC', () => {
    expect(dateInZone('2026-10-22T23:30:00Z')).toBe('2026-10-23');
  });

  it('groups sessions by local start day in chronological order', () => {
    const at = (start_utc: string) => ({ start_utc });
    const days = weekOf('2026-10-20').days;
    const grouped = groupByDay([at('2026-10-20T19:00:00Z'), at('2026-10-20T04:00:00Z'), at('2026-11-20T04:00:00Z')], days);
    expect(grouped.get('2026-10-20')?.map((s) => s.start_utc)).toEqual(['2026-10-20T04:00:00Z', '2026-10-20T19:00:00Z']);
    expect([...grouped.values()].flat()).toHaveLength(2);
  });
});

describe('scheduling mock follows the API contract', () => {
  // Resolves requests against the handlers directly: no network interception, so it runs on any Node version.
  const API = 'http://localhost/api/v1';
  const call = async (path: string, user: string, init: RequestInit = {}): Promise<Response> => {
    const request = new Request(`${API}${path}`, {
      ...init,
      headers: { Authorization: `Bearer mock-access.${user}`, 'Content-Type': 'application/json' }
    });
    const response = await getResponse(handlers, request);
    if (!response) throw new Error(`no mock handler for ${init.method ?? 'GET'} ${path}`);
    return response;
  };

  it('lists a week of sessions with Tunis and Mecca times', async () => {
    const res = await call('/maqraat/1/sessions/?from=2026-10-19&to=2026-10-25', 'admin.demo');
    const sessions = (await res.json()) as ScheduleSession[];
    expect(res.status).toBe(200);
    expect(sessions).toHaveLength(6);
    const night = sessions.find((s) => s.start_tunis === '22:30')!;
    expect(night.end_tunis).toBe('00:30');
    expect(night.start_mecca).toBe('00:30');
    expect(Date.parse(night.end_utc) - Date.parse(night.start_utc)).toBe(2 * 3600_000);
  });

  it('gives a sheikh only their own sessions', async () => {
    const sessions = (await (await call('/maqraat/2/sessions/?from=2026-10-19&to=2026-10-25', 'sheikh.demo')).json()) as ScheduleSession[];
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions.every((s) => s.sheikh?.id === 2)).toBe(true);
  });

  it('hides a maqraa outside the caller scope (404) and denies missing capabilities (403)', async () => {
    expect((await call('/maqraat/1/sessions/', 'sheikh.demo')).status).toBe(404);
    expect((await call('/maqraat/2/slots/', 'sheikh.demo')).status).toBe(403);
  });

  it('rejects a date range over 62 days', async () => {
    expect((await call('/maqraat/1/sessions/?from=2026-01-01&to=2026-04-01', 'admin.demo')).status).toBe(400);
  });

  it('refuses overlapping slots with an Arabic reason, accepts free ones', async () => {
    const post = (body: object) => call('/maqraat/1/slots/', 'admin.demo', { method: 'POST', body: JSON.stringify(body) });

    const clash = await post({ weekday: 0, start: '06:00', end: '07:00' });
    expect(clash.status).toBe(409);
    expect(await clash.json()).toMatchObject({ code: 'conflict', errors: { conflict: 'same_maqraa' } });

    // sheikh 4 teaches in maqraa 2 on Sunday 06:00-07:30
    const busy = await post({ weekday: 6, start: '07:00', end: '08:00', sheikh_id: 4 });
    expect(await busy.json()).toMatchObject({ errors: { conflict: 'person_busy_elsewhere', who: 'sheikh' } });

    const ok = await post({ weekday: 4, start: '15:00', end: '16:00', sheikh_id: 3 });
    expect(ok.status).toBe(201);
    const created = (await ok.json()) as TemplateSlot;
    expect(created).toMatchObject({ weekday_ar: 'الجمعة', start: '15:00', sheikh: { id: 3 } });

    const removed = await call(`/maqraat/1/slots/${created.id}/`, 'admin.demo', { method: 'DELETE' });
    expect(removed.status).toBe(204);
  });
});
