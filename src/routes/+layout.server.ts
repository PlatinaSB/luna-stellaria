import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { apiBaseUrl } from '$lib/api.js';

const ALLOWED_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

export const load = (async ({ cookies, url, fetch }) => {
	const hostname = url.hostname.toLowerCase();

	if (hostname === 'tools.luna-stellaria.com') {
		throw redirect(307, `https://luna-stellaria.com${url.pathname}${url.search}`);
	}

	const isAllowed =
		ALLOWED_HOSTNAMES.has(hostname) ||
		hostname.endsWith('.localhost') ||
		hostname.endsWith('.luna-stellaria.com') ||
		hostname.endsWith('luna-stellaria.com') ||
		hostname.endsWith('-lunatools.platinasb.workers.dev');

	if (!isAllowed) {
		throw redirect(308, `https://luna-stellaria.com${url.pathname}${url.search}`);
	}

	// The session cookie is issued by the API and forwarded here so the layout
	// can render auth state; verification itself happens in the API.
	const token = cookies.get('jwt');

	if (!token) {
		return { user: null };
	}

	try {
		const response = await fetch(`${apiBaseUrl(hostname)}/auth/me`, {
			headers: { cookie: `jwt=${encodeURIComponent(token)}` }
		});

		if (!response.ok) {
			return { user: null };
		}

		const body = (await response.json()) as {
			data?: { user?: { email: string; display_name: string } | null };
		};

		return { user: body.data?.user ?? null };
	} catch {
		return { user: null };
	}
}) satisfies LayoutServerLoad;
