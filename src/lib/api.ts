const DEV_API_URL = 'http://localhost:8787';
const PRODUCTION_API_URL = 'https://api.luna-stellaria.com';

/**
 * Base URL of the luna-stellaria API.
 *
 * Localhost (dev server and `wrangler dev` preview) talks to the local API;
 * every other host talks to the deployed API. Server-side callers pass the
 * request hostname explicitly.
 */
export function apiBaseUrl(hostname?: string): string {
	const host = hostname ?? (typeof window === 'undefined' ? '' : window.location.hostname);

	return host === 'localhost' || host === '127.0.0.1' ? DEV_API_URL : PRODUCTION_API_URL;
}
