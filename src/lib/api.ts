import { env as publicEnv } from '$env/dynamic/public';

const DEV_API_URL = 'http://localhost:8787';
const PRODUCTION_API_URL = 'https://api.luna-stellaria.com';

/**
 * Branch previews live on parallel wildcard hosts inside the zone
 * (`previews` in both wrangler.jsonc files):
 *
 * 	frontend  `<branch>.preview.luna-stellaria.com`
 * 	api       `<branch>.preview-api.luna-stellaria.com`
 */
const PREVIEW_FRONTEND_HOST_SUFFIX = '.preview.luna-stellaria.com';
const PREVIEW_API_HOST_SUFFIX = '.preview-api.luna-stellaria.com';

/**
 * Base URL of the luna-stellaria API.
 *
 * The explicit `PUBLIC_API_URL` var wins when set. Otherwise hosts resolve to
 * their environment's API: branch previews to the parallel preview-api host,
 * localhost (dev server and `wrangler dev` preview) to the local API, and
 * every other host to the deployed API. Server-side callers pass the request
 * hostname explicitly.
 */
export function apiBaseUrl(hostname?: string): string {
	const overrideUrl = publicEnv.PUBLIC_API_URL;

	if (overrideUrl) {
		return overrideUrl;
	}

	const host = hostname ?? (typeof window === 'undefined' ? '' : window.location.hostname);

	if (host === 'localhost' || host === '127.0.0.1') {
		return DEV_API_URL;
	}

	if (host.endsWith(PREVIEW_FRONTEND_HOST_SUFFIX)) {
		const branch = host.slice(0, -PREVIEW_FRONTEND_HOST_SUFFIX.length);

		if (branch) {
			return `https://${branch}${PREVIEW_API_HOST_SUFFIX}`;
		}
	}

	return PRODUCTION_API_URL;
}
