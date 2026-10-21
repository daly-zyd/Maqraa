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
  it('asks to wait on rate limiting', () => {
    expect(apiErrorMessage(failure(429))).toContain('انتظر');
  });
});
