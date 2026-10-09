<script lang="ts">
	import { SITE, absoluteUrl } from '$lib/seo.js';

	interface Props {
		title: string;
		description?: string;
		path?: string;
		image?: string;
		type?: 'website' | 'article';
		noindex?: boolean;
		suffix?: boolean;
		jsonLd?: Record<string, unknown> | Record<string, unknown>[];
	}

	let {
		title,
		description = SITE.defaultDescription,
		path = '/',
		image = SITE.defaultImage,
		type = 'website',
		noindex = false,
		suffix = true,
		jsonLd
	}: Props = $props();

	const fullTitle = $derived(suffix ? `${title} | ${SITE.name}` : title);
	const canonical = $derived(absoluteUrl(path));
	const imageUrl = $derived(image.startsWith('http') ? image : absoluteUrl(image));
	const jsonLdString = $derived(jsonLd ? JSON.stringify(jsonLd).replace(/</g, '\\u003c') : '');
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta
			name="robots"
			content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
		/>
	{/if}

	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:width" content="1920" />
	<meta property="og:image:height" content="1080" />
	<meta property="og:image:alt" content={fullTitle} />
	<meta property="og:locale" content={SITE.locale} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={SITE.twitter} />
	<meta name="twitter:creator" content={SITE.twitter} />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />

	{#if jsonLdString}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- jsonLdString escapes "<" so it cannot break out of the script tag -->
		{@html `<script type="application/ld+json">${jsonLdString}<\u002fscript>`}
	{/if}
</svelte:head>
