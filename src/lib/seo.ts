export const SITE = {
	name: 'Luna Tools',
	url: 'https://tools.luna-stellaria.com',
	twitter: '@Platina_SB',
	locale: 'en_US',
	defaultImage: '/demo.png',
	defaultDescription:
		'Free browser-based tools for converting and compressing images, generating QR codes, solving 24 card puzzles, and detecting Indonesian AI text. No uploads, no install, no sign-up.'
} as const;

export type PublicTool = {
	path: string;
	title: string;
	description: string;
	priority: number;
	changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
};

export const publicTools: PublicTool[] = [
	{
		path: '/convert',
		title: 'Convert Image',
		description: 'Convert images between JPEG, PNG, and WebP formats privately in your browser.',
		priority: 0.9,
		changefreq: 'weekly'
	},
	{
		path: '/compress',
		title: 'Compress Image',
		description: 'Reduce image file size while keeping quality, directly in your browser.',
		priority: 0.9,
		changefreq: 'weekly'
	},
	{
		path: '/qrcode-generator',
		title: 'QR Code Generator',
		description:
			'Generate downloadable QR codes in PNG, JPEG, or WebP with custom error correction.',
		priority: 0.8,
		changefreq: 'weekly'
	},
	{
		path: '/24cardgame',
		title: '24 Card Game',
		description: 'Find a solution to any 24 card game puzzle from four numbers instantly.',
		priority: 0.7,
		changefreq: 'monthly'
	},
	{
		path: '/about',
		title: 'About',
		description: 'Learn about Luna Tools and the free browser tools it offers.',
		priority: 0.4,
		changefreq: 'monthly'
	}
];

export const absoluteUrl = (path: string) =>
	`${SITE.url}${path === '/' ? '/' : path.replace(/\/+$/, '')}`;
