import { http, HttpResponse } from 'msw';
import type { Me } from '../features/auth/types';
import type { MaqraaRole, Person } from '../features/people/types';
import type { ScheduleSession, TemplateSlot } from '../features/schedule/types';
import { addDays, dateInZone, weekdayOf } from '../features/schedule/week';
import { DEMO_OTP, DEMO_PASSWORD } from './constants';

/**
 * Mock of the Django contract (backend/apps/accounts, GET /me/, backend/apps/scheduling). Used while no API is
 * configured. Demo accounts and people only: nothing here is a real account, person or secret.
 */

const SHEIKH_CAPS = ['schedule.view_own', 'session.confirm', 'session.declare_absence', 'substitution.accept', 'stats.view'];
const ADMIN_CAPS = [
  ...SHEIKH_CAPS, 'schedule.view_all', 'schedule.edit', 'report.publish', 'people.view', 'people.manage',
  'access.manage', 'audit.view', 'settings.edit'
];

const ME: Record<string, Me> = {
  'admin.demo': {
    id: 1, username: 'admin.demo', full_name: 'مشرف تجريبي', person_id: 1, is_super_admin: false,
    maqraat: [{ id: 1, slug: 'hafs-men', name_ar: 'مقرأة حفص رجال', riwaya: 'hafs', gender: 'men', roles: ['admin'], capabilities: ADMIN_CAPS }],
    global_capabilities: []
  },
  'sheikh.demo': {
    id: 2, username: 'sheikh.demo', full_name: 'شيخ تجريبي', person_id: 2, is_super_admin: false,
    maqraat: [{ id: 2, slug: 'qaloun-men', name_ar: 'مقرأة قالون رجال', riwaya: 'qaloun', gender: 'men', roles: ['sheikh'], capabilities: SHEIKH_CAPS }],
    global_capabilities: []
  }
};
const PHONES: Record<string, string> = { '98123456': 'sheikh.demo', 'sheikh.demo': 'sheikh.demo' };

const tokenFor = (username: string) => ({ access: `mock-access.${username}`, refresh: `mock-refresh.${username}` });
const userOf = (header: string | null) => (header?.replace('Bearer mock-access.', '') ?? '') as string;
const invalid = (detail = 'بيانات الدخول غير صحيحة') =>
  HttpResponse.json({ code: 'authentication_failed', detail, errors: {} }, { status: 401 });

const fail = (status: number, code: string, detail: string, errors: Record<string, string> = {}) =>
  HttpResponse.json({ code, detail, errors }, { status });
const unauthenticated = () => fail(401, 'not_authenticated', 'غير مسجّل');

let lastOtpFor: string | null = null;

// ---- scheduling ------------------------------------------------------------------------------------
const PEOPLE: Record<number, string> = { 1: 'مشرف تجريبي', 2: 'شيخ تجريبي', 3: 'شيخ تجريبي ٢', 4: 'شيخ تجريبي ٣' };
/** Roles per maqraa, then per person (backend access.MaqraaAccess). Person 4 teaches in both maqraat. */
const ROSTER: Record<number, Record<number, MaqraaRole[]>> = {
  1: { 1: ['admin'], 3: ['sheikh'], 4: ['sheikh'] },
  2: { 2: ['sheikh'], 4: ['sheikh'] }
};
const hasRole = (maqraa: number, personId: number, roles: MaqraaRole[]) =>
  (ROSTER[maqraa]?.[personId] ?? []).some((r) => roles.includes(r));
const AR_WEEKDAYS = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const HIJRI = new Intl.DateTimeFormat('ar-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const TUNIS_UTC_OFFSET = 60; // minutes; Tunisia has no DST
const MECCA_FROM_TUNIS = 120;
const WEEK_MINUTES = 7 * 1440;

interface MockSlot { id: number; maqraa: number; weekday: number; start: string; end: string; sheikh: number | null; supervisor: number | null; notes: string }

let nextSlotId = 1;
const mkSlot = (maqraa: number, weekday: number, start: string, end: string, sheikh: number, supervisor: number | null = null): MockSlot =>
  ({ id: nextSlotId++, maqraa, weekday, start, end, sheikh, supervisor, notes: '' });
const SLOTS: MockSlot[] = [
  mkSlot(1, 0, '05:00', '06:30', 3, 1), mkSlot(1, 0, '20:00', '21:30', 4, 1), mkSlot(1, 2, '05:00', '06:30', 3, 1),
  mkSlot(1, 3, '22:30', '00:30', 4, 1), mkSlot(1, 5, '09:00', '10:30', 3, 1), mkSlot(1, 6, '20:00', '21:30', 4, 1),
  mkSlot(2, 1, '19:00', '20:30', 2), mkSlot(2, 4, '19:00', '20:30', 2), mkSlot(2, 6, '06:00', '07:30', 4)
];

const toMinutes = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));
const toHm = (minutes: number) => {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
/** Length in minutes; an end <= start crosses midnight, as in the backend. */
const duration = (s: Pick<MockSlot, 'start' | 'end'>) => (toMinutes(s.end) - toMinutes(s.start) + 1440) % 1440 || 1440;
const person = (id: number | null) => (id ? { id, name: PEOPLE[id] ?? null } : null);

const slotDict = (s: MockSlot): TemplateSlot => ({
  id: s.id, weekday: s.weekday, weekday_ar: AR_WEEKDAYS[s.weekday], start: s.start, end: s.end,
  sheikh: person(s.sheikh), supervisor: person(s.supervisor), notes: s.notes
});

/** Sessions are derived from the template on the fly (the API stores them; the contract is the same). */
function sessionsBetween(maqraa: number, from: string, to: string, onlySheikh: number | null): ScheduleSession[] {
  const now = Date.now();
  const out: ScheduleSession[] = [];
  for (let day = from; day <= to; day = addDays(day, 1)) {
    for (const s of SLOTS) {
      if (s.maqraa !== maqraa || s.weekday !== weekdayOf(day) || (onlySheikh !== null && s.sheikh !== onlySheikh)) continue;
      const start = Date.parse(`${day}T00:00:00Z`) + (toMinutes(s.start) - TUNIS_UTC_OFFSET) * 60_000;
      const end = start + duration(s) * 60_000;
      const past = end < now;
      const awaiting = past && s.id % 3 === 0; // a few ended sessions still waiting for their report
      out.push({
        id: Number(`${s.id}${day.replaceAll('-', '')}`),
        status: awaiting ? 'confirmed' : past ? 'reported' : start < now ? 'room_open' : 'scheduled',
        awaiting_report: awaiting,
        start_utc: new Date(start).toISOString(), end_utc: new Date(end).toISOString(),
        start_tunis: s.start, end_tunis: s.end,
        start_mecca: toHm(toMinutes(s.start) + MECCA_FROM_TUNIS), end_mecca: toHm(toMinutes(s.end) + MECCA_FROM_TUNIS),
        sheikh: person(s.sheikh), supervisor: person(s.supervisor)
      });
    }
  }
  return out.sort((a, b) => Date.parse(a.start_utc) - Date.parse(b.start_utc));
}

/** Caller and capabilities in one maqraa. A maqraa outside their scope is a 404, as in the API. */
function scoped(request: Request, maqraaId: number, capability: string): Response | { me: Me; caps: string[] } {
  const me = ME[userOf(request.headers.get('Authorization'))];
  if (!me) return unauthenticated();
  const access = me.maqraat.find((m) => m.id === maqraaId);
  if (!access) return fail(404, 'not_found', 'غير موجود');
  if (!access.capabilities.includes(capability)) return fail(403, 'forbidden', 'ليست لديك صلاحية لهذا الإجراء');
  return { me, caps: access.capabilities };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HM = /^\d{2}:\d{2}(:\d{2})?$/;
const dateParam = (request: Request, name: string) => new URL(request.url).searchParams.get(name);

const span = (s: Pick<MockSlot, 'weekday' | 'start' | 'end'>): [number, number] => {
  const start = s.weekday * 1440 + toMinutes(s.start);
  return [start, start + duration(s)];
};
/** Overlap on a circular week (a Sunday-night slot can run into Monday). */
const overlaps = (a: [number, number], b: [number, number]) =>
  [-WEEK_MINUTES, 0, WEEK_MINUTES].some((shift) => a[0] < b[1] + shift && b[0] + shift < a[1]);

function slotProblem(c: MockSlot): Response | null {
  if (!Number.isInteger(c.weekday) || c.weekday < 0 || c.weekday > 6) return fail(400, 'validation_error', 'يوم غير صالح');
  if (!HM.test(c.start) || !HM.test(c.end)) return fail(400, 'validation_error', 'بيانات غير صالحة');
  if (toMinutes(c.start) === toMinutes(c.end)) return fail(400, 'validation_error', 'وقت البداية يساوي وقت النهاية');
  if (c.sheikh && !hasRole(c.maqraa, c.sheikh, ['sheikh'])) {
    return fail(400, 'validation_error', 'المصحح غير مسجل في هذه المقرأة', { sheikh_id: 'not_in_maqraa' });
  }
  if (c.supervisor && !hasRole(c.maqraa, c.supervisor, ['supervisor', 'admin'])) {
    return fail(400, 'validation_error', 'المشرف غير مسجل في هذه المقرأة', { supervisor_id: 'not_in_maqraa' });
  }
  const others = SLOTS.filter((s) => s.id !== c.id);
  if (others.some((o) => o.maqraa === c.maqraa && overlaps(span(c), span(o)))) {
    return fail(409, 'conflict', 'يتداخل هذا الموعد مع موعد آخر في نفس المقرأة', { conflict: 'same_maqraa' });
  }
  for (const who of ['sheikh', 'supervisor'] as const) {
    const id = c[who];
    const clash = id && others.find((o) => (o.sheikh === id || o.supervisor === id) && overlaps(span(c), span(o)));
    if (clash) {
      const here = clash.maqraa === c.maqraa;
      return fail(409, 'conflict', here ? 'مشغول في موعد آخر في هذه المقرأة' : 'مشغول في مقرأة أخرى',
        { conflict: here ? 'person_busy_here' : 'person_busy_elsewhere', who });
    }
  }
  return null;
}

interface SlotBody { weekday?: number; start?: string; end?: string; sheikh_id?: number | null; supervisor_id?: number | null; notes?: string }

const applyBody = (target: MockSlot, b: SlotBody): MockSlot => ({
  ...target,
  ...(b.weekday !== undefined && { weekday: b.weekday }),
  ...(b.start !== undefined && { start: b.start.slice(0, 5) }),
  ...(b.end !== undefined && { end: b.end.slice(0, 5) }),
  ...(b.sheikh_id !== undefined && { sheikh: b.sheikh_id }),
  ...(b.supervisor_id !== undefined && { supervisor: b.supervisor_id }),
  ...(b.notes !== undefined && { notes: b.notes })
});

const peopleHandlers = [
  http.get('*/people/', ({ request }) => {
    const maqraa = Number(new URL(request.url).searchParams.get('maqraa'));
    if (!Number.isInteger(maqraa) || maqraa <= 0) return fail(400, 'validation_error', '', { maqraa: 'required' });
    const ctx = scoped(request, maqraa, 'people.view');
    if (ctx instanceof Response) return ctx;
    const people: Person[] = Object.entries(ROSTER[maqraa] ?? {}).map(([id, roles]) => ({
      id: Number(id), full_name: PEOPLE[Number(id)], roles, display_name_formal: '', phone: null
    }));
    return HttpResponse.json(people.sort((a, b) => a.full_name.localeCompare(b.full_name, 'ar')));
  })
];

const scheduleHandlers = [
  http.get('*/maqraat/:id/sessions/', ({ request, params }) => {
    const maqraa = Number(params.id);
    const ctx = scoped(request, maqraa, 'schedule.view_own');
    if (ctx instanceof Response) return ctx;
    const from = dateParam(request, 'from') ?? dateInZone(new Date());
    const to = dateParam(request, 'to') ?? from;
    if (!ISO_DATE.test(from) || !ISO_DATE.test(to)) return fail(400, 'validation_error', 'YYYY-MM-DD');
    if (to < from || addDays(from, 62) < to) return fail(400, 'validation_error', 'مجال التواريخ غير صالح');
    const onlyOwn = ctx.caps.includes('schedule.view_all') ? null : ctx.me.person_id;
    return HttpResponse.json(sessionsBetween(maqraa, from, to, onlyOwn));
  }),

  http.get('*/maqraat/:id/today/', ({ request, params }) => {
    const maqraa = Number(params.id);
    const ctx = scoped(request, maqraa, 'schedule.view_own');
    if (ctx instanceof Response) return ctx;
    const day = dateParam(request, 'date') ?? dateInZone(new Date());
    if (!ISO_DATE.test(day)) return fail(400, 'validation_error', 'YYYY-MM-DD');
    const access = ctx.me.maqraat.find((m) => m.id === maqraa)!;
    const onlyOwn = ctx.caps.includes('schedule.view_all') ? null : ctx.me.person_id;
    return HttpResponse.json({
      maqraa: { id: maqraa, name_ar: access.name_ar },
      date: day,
      date_ar: `${AR_WEEKDAYS[weekdayOf(day)]} ${Number(day.slice(8))} ${AR_MONTHS[Number(day.slice(5, 7)) - 1]} ${day.slice(0, 4)}`,
      date_hijri_ar: HIJRI.format(new Date(`${day}T12:00:00Z`)),
      sessions: sessionsBetween(maqraa, day, day, onlyOwn)
    });
  }),

  http.get('*/maqraat/:id/slots/', ({ request, params }) => {
    const maqraa = Number(params.id);
    const ctx = scoped(request, maqraa, 'schedule.view_all');
    if (ctx instanceof Response) return ctx;
    const slots = SLOTS.filter((s) => s.maqraa === maqraa).sort((a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start));
    return HttpResponse.json(slots.map(slotDict));
  }),

  http.post('*/maqraat/:id/slots/', async ({ request, params }) => {
    const maqraa = Number(params.id);
    const ctx = scoped(request, maqraa, 'schedule.edit');
    if (ctx instanceof Response) return ctx;
    const body = (await request.json()) as SlotBody;
    if (body.weekday === undefined || !body.start || !body.end) return fail(400, 'validation_error', 'بيانات غير صالحة');
    const candidate = applyBody({ id: 0, maqraa, weekday: 0, start: '', end: '', sheikh: null, supervisor: null, notes: '' }, body);
    const problem = slotProblem(candidate);
    if (problem) return problem;
    const created = { ...candidate, id: nextSlotId++ };
    SLOTS.push(created);
    return HttpResponse.json(slotDict(created), { status: 201 });
  }),

  http.patch('*/maqraat/:id/slots/:slotId/', async ({ request, params }) => {
    const maqraa = Number(params.id);
    const ctx = scoped(request, maqraa, 'schedule.edit');
    if (ctx instanceof Response) return ctx;
    const index = SLOTS.findIndex((s) => s.id === Number(params.slotId) && s.maqraa === maqraa);
    if (index < 0) return fail(404, 'not_found', 'غير موجود');
    const updated = applyBody(SLOTS[index], (await request.json()) as SlotBody);
    const problem = slotProblem(updated);
    if (problem) return problem;
    SLOTS[index] = updated;
    return HttpResponse.json(slotDict(updated));
  }),

  http.delete('*/maqraat/:id/slots/:slotId/', ({ request, params }) => {
    const maqraa = Number(params.id);
    const ctx = scoped(request, maqraa, 'schedule.edit');
    if (ctx instanceof Response) return ctx;
    const index = SLOTS.findIndex((s) => s.id === Number(params.slotId) && s.maqraa === maqraa);
    if (index < 0) return fail(404, 'not_found', 'غير موجود');
    SLOTS.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/maqraat/:id/generate-sessions/', ({ request, params }) => {
    const ctx = scoped(request, Number(params.id), 'schedule.edit');
    if (ctx instanceof Response) return ctx;
    return HttpResponse.json({ removed: 0, created: 0 }); // mock sessions always follow the template
  })
];

export const handlers = [
  http.post('*/auth/login/', async ({ request }) => {
    const { identifier, password } = (await request.json()) as { identifier: string; password: string };
    const key = identifier.trim().toLowerCase();
    if (!ME[key] || password !== DEMO_PASSWORD) return invalid();
    return HttpResponse.json({ ...tokenFor(key), user: { id: ME[key].id, username: key } });
  }),

  http.post('*/auth/otp/request/', async ({ request }) => {
    const { identifier } = (await request.json()) as { identifier: string };
    lastOtpFor = PHONES[identifier.trim().toLowerCase()] ?? null;
    return HttpResponse.json({ detail: 'إن كان للحساب رقم واتساب مسجّل فسيصلك رمز التحقق خلال لحظات' }, { status: 202 });
  }),

  http.post('*/auth/otp/verify/', async ({ request }) => {
    const { identifier, code } = (await request.json()) as { identifier: string; code: string };
    const user = PHONES[identifier.trim().toLowerCase()];
    if (!user || user !== lastOtpFor || code !== DEMO_OTP) return invalid('الرمز غير صحيح أو انتهت صلاحيته');
    return HttpResponse.json({ ...tokenFor(user), user: { id: ME[user].id, username: user } });
  }),

  http.post('*/auth/password/forgot/', () =>
    HttpResponse.json({ detail: 'إن كان للحساب رقم واتساب مسجّل فسيصلك رمز التحقق خلال لحظات' }, { status: 202 })
  ),

  http.post('*/auth/password/reset/', async ({ request }) => {
    const { code, new_password: pw } = (await request.json()) as { code: string; new_password: string };
    if (code !== DEMO_OTP) return invalid('الرمز غير صحيح أو انتهت صلاحيته');
    if (pw.length < 10) {
      return HttpResponse.json({ code: 'validation_error', detail: 'كلمة المرور ضعيفة', errors: {} }, { status: 400 });
    }
    return HttpResponse.json({ detail: 'تم تغيير كلمة المرور. سجّل الدخول بها الآن' });
  }),

  http.post('*/auth/refresh/', async ({ request }) => {
    const { refresh } = (await request.json()) as { refresh: string };
    const user = refresh.replace('mock-refresh.', '');
    return ME[user] ? HttpResponse.json(tokenFor(user)) : invalid('انتهت الجلسة');
  }),

  http.post('*/auth/logout/', () => HttpResponse.json({ detail: 'تم تسجيل الخروج' })),

  http.get('*/me/', ({ request }) => {
    const me = ME[userOf(request.headers.get('Authorization'))];
    return me ? HttpResponse.json(me) : unauthenticated();
  }),

  ...peopleHandlers,
  ...scheduleHandlers
];
