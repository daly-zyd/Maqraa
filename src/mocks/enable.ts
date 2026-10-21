/** Starts the mock API when asked (VITE_USE_MOCK=true) or in dev with no VITE_API_URL. Never in a real build. */
export let mockActive = false;

export async function enableMocking(): Promise<boolean> {
  const wanted =
    import.meta.env.VITE_USE_MOCK === 'true' || (import.meta.env.DEV && !import.meta.env.VITE_API_URL);
  if (!wanted) return false;
  const { setupWorker } = await import('msw/browser');
  const { handlers } = await import('./handlers');
  await setupWorker(...handlers).start({
    quiet: true,
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` }
  });
  mockActive = true;
  return true;
}
