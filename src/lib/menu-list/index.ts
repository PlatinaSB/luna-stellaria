import type { Pathname } from '$app/types';

type Tool = { title: string; href: Pathname; description: string };

export const imageTools: Tool[] = [
	{
		title: 'Convert Image',
		href: '/convert',
		description: 'Convert images between formats'
	},
	{
		title: 'Compress Image',
		href: '/compress',
		description: 'Reduce image file size'
	},
	{
		title: 'QR Code Generator',
		href: '/qrcode-generator',
		description: 'QR Code Generator with various format and quality'
	}
];

export const cardTools: Tool[] = [
	{
		title: '24 Card Game',
		href: '/24cardgame',
		description: 'solve 24 card puzzles'
	}
];

export const aiTools: Tool[] = [
	{
		title: 'IndoBERT AI Text Classification',
		href: '/indobert-ai-text-classification',
		description: 'Adalah alat deteksi teks generatif AI berbahasa Indonesia'
	}
];
