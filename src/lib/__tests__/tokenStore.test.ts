import { beforeEach, describe, expect, it } from 'vitest';
import { tokenStore } from '../tokenStore';

describe('tokenStore', () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => mem.set(k, v), removeItem: (k: string) => mem.delete(k) }
    });
    tokenStore.clear();
  });
  it('keeps the access token in memory only', () => {
    tokenStore.setAccess('a');
    expect(tokenStore.getAccess()).toBe('a');
    expect(tokenStore.getRefresh()).toBeNull();
  });
  it('persists and clears the refresh token', () => {
    tokenStore.setRefresh('r');
    expect(tokenStore.getRefresh()).toBe('r');
    tokenStore.clear();
    expect(tokenStore.getRefresh()).toBeNull();
    expect(tokenStore.getAccess()).toBeNull();
  });
});
