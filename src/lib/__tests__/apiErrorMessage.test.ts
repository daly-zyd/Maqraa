import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { apiErrorMessage } from '../apiClient';

const failure = (status: number, data: unknown = {}) =>
  new AxiosError('x', 'ERR', undefined, undefined, { status, data, statusText: '', headers: {}, config: {} as never });

describe('apiErrorMessage', () => {
  it('explains a network failure in Arabic', () => {
    expect(apiErrorMessage(new AxiosError('Network Error'))).toContain('تعذّر الاتصال');
  });
  it('uses the generic server message for 401 and never mentions accounts', () => {
    expect(apiErrorMessage(failure(401, {}))).toBe('بيانات الدخول غير صحيحة.');
  });
  it('relays the Arabic detail sent by the API', () => {
    expect(apiErrorMessage(failure(401, { detail: 'الرمز غير صحيح أو انتهت صلاحيته' }))).toBe('الرمز غير صحيح أو انتهت صلاحيته');
  });
  it('relays the Arabic reason of a scheduling conflict, with a fallback', () => {
    expect(apiErrorMessage(failure(409, { code: 'conflict', detail: 'مشغول في مقرأة أخرى' }))).toBe('مشغول في مقرأة أخرى');
    expect(apiErrorMessage(failure(409))).toBe('تعارض في البيانات.');
  });
  it('explains missing rights and missing objects', () => {
    expect(apiErrorMessage(failure(403))).toContain('صلاحية');
    expect(apiErrorMessage(failure(404, { detail: 'غير موجود' }))).toBe('غير موجود');
  });
  it('ignores a non-text detail', () => {
    expect(apiErrorMessage(failure(400, { detail: { start: ['x'] } }))).toContain('خطأ غير متوقع');
  });
  it('asks to wait on rate limiting', () => {
    expect(apiErrorMessage(failure(429))).toContain('انتظر');
  });
});
