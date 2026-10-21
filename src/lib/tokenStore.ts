/** Access token lives in memory only; the refresh token survives reloads (localStorage, best effort). */
const REFRESH_KEY = 'maqraa_refresh_v1';

let accessToken: string | null = null;

export const tokenStore = {
  getAccess: () => accessToken,
  setAccess: (token: string | null) => {
    accessToken = token;
  },
  getRefresh: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  setRefresh: (token: string | null) => {
    try {
      if (token) localStorage.setItem(REFRESH_KEY, token);
      else localStorage.removeItem(REFRESH_KEY);
    } catch {
      /* private mode: the session simply ends with the tab */
    }
  },
  clear() {
    accessToken = null;
    this.setRefresh(null);
  }
};
