/**
 * Production build: the API is expected to be served from the same origin
 * (e.g. reverse proxy `/api` -> Django). Adjust if the API lives elsewhere.
 */
export const environment = {
  production: true,
  apiUrl: '/api',
};
