import type { LayoutServerLoad } from './$types';
import { jwtVerify } from 'jose';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const ALLOWED_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

export const load = (async ({ cookies, url }) => {
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

	const token = cookies.get('jwt');

	if (!token || !env.JWT_SECRET) {
		return { user: null };
	}

	try {
		const secret = new TextEncoder().encode(env.JWT_SECRET);
		const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
		return { user: { email: String(payload.email ?? '') } };
	} catch {
		return { user: null };
	}
}) satisfies LayoutServerLoad;
