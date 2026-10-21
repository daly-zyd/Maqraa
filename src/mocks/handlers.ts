import { http, HttpResponse } from 'msw';
import type { Me } from '../features/auth/types';

/**
 * Mock of the Django auth contract (backend/apps/accounts + GET /me/). Used while no API is configured.
 * Demo accounts only: nothing here is a real account or secret.
 */
export const DEMO_PASSWORD = 'Demo-Passw0rd!';
export const DEMO_OTP = '123456';

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

let lastOtpFor: string | null = null;

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
    return me ? HttpResponse.json(me) : HttpResponse.json({ code: 'not_authenticated', detail: 'غير مسجّل', errors: {} }, { status: 401 });
  })
];
