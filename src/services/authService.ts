import { apiClient } from '../lib/apiClient';
import { tokenStore } from '../lib/tokenStore';
import type { Me, TokenPair } from '../features/auth/types';

/** The only module that knows the auth endpoints. Components call these, never axios. */
const keep = (pair: TokenPair) => {
  tokenStore.setAccess(pair.access);
  tokenStore.setRefresh(pair.refresh);
};

export const authService = {
  async login(identifier: string, password: string): Promise<void> {
    const { data } = await apiClient.post<TokenPair>('/auth/login/', { identifier, password });
    keep(data);
  },

  async requestOtp(identifier: string): Promise<void> {
    await apiClient.post('/auth/otp/request/', { identifier });
  },

  async verifyOtp(identifier: string, code: string): Promise<void> {
    const { data } = await apiClient.post<TokenPair>('/auth/otp/verify/', { identifier, code });
    keep(data);
  },

  async forgotPassword(identifier: string): Promise<void> {
    await apiClient.post('/auth/password/forgot/', { identifier });
  },

  async resetPassword(identifier: string, code: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/password/reset/', { identifier, code, new_password: newPassword });
  },

  async me(): Promise<Me> {
    const { data } = await apiClient.get<Me>('/me/');
    return data;
  },

  /** Restores a session after a reload using the stored refresh token. Returns null if there is none. */
  async restore(): Promise<Me | null> {
    if (!tokenStore.getRefresh()) return null;
    try {
      return await this.me(); // a 401 triggers the silent refresh in the client
    } catch {
      tokenStore.clear();
      return null;
    }
  },

  async logout(): Promise<void> {
    const refresh = tokenStore.getRefresh();
    tokenStore.clear();
    if (refresh) await apiClient.post('/auth/logout/', { refresh }).catch(() => undefined);
  }
};
