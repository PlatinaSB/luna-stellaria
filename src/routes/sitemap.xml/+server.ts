import type { RequestHandler } from './$types';
import { absoluteUrl, publicTools } from '$lib/seo';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const lastmod = new Date().toISOString().split('T')[0];

	const entries = [{ path: '/', priority: 1.0, changefreq: 'weekly' as const }, ...publicTools];

	const urls = entries
		.map(
			(entry) => `	<url>
		<loc>${absoluteUrl(entry.path)}</loc>
		<lastmod>${lastmod}</lastmod>
		<changefreq>${entry.changefreq}</changefreq>
		<priority>${entry.priority.toFixed(1)}</priority>
	</url>`
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
