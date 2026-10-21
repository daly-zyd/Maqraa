import { describe, expect, it } from 'vitest';
import { CAP, can, visibleLinks } from '../permissions';
import type { Me } from '../types';

const base: Me = { id: 1, username: 'u', full_name: 'U', person_id: 1, is_super_admin: false, maqraat: [], global_capabilities: [] };
const withCaps = (caps: string[], maqraaId = 1): Me => ({
  ...base,
  maqraat: [{ id: maqraaId, slug: 's', name_ar: 'م', riwaya: 'hafs', gender: 'men', roles: ['sheikh'], capabilities: caps }]
});

describe('can()', () => {
  it('denies everything when signed out', () => {
    expect(can(null, CAP.scheduleViewOwn)).toBe(false);
  });
  it('checks capabilities, not roles', () => {
    expect(can(withCaps([CAP.scheduleViewOwn]), CAP.scheduleViewOwn)).toBe(true);
    expect(can(withCaps([CAP.scheduleViewOwn]), CAP.accessManage)).toBe(false);
  });
  it('scopes to the given maqraa', () => {
    const me = withCaps([CAP.peopleManage], 1);
    expect(can(me, CAP.peopleManage, 1)).toBe(true);
    expect(can(me, CAP.peopleManage, 2)).toBe(false);
  });
  it('honours global capabilities', () => {
    expect(can({ ...base, global_capabilities: [CAP.auditView] }, CAP.auditView, 99)).toBe(true);
  });
});

describe('visibleLinks()', () => {
  it('shows only the tiles the user may use', () => {
    const links = visibleLinks(withCaps([CAP.scheduleViewOwn, CAP.peopleView])).map((l) => l.to);
    expect(links).toEqual(['/dashboard/schedule', '/dashboard/people']);
  });
  it('is empty for a user with no capability', () => {
    expect(visibleLinks(withCaps([]))).toEqual([]);
  });
});
