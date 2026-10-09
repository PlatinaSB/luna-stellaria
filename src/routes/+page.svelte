<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import Seo from '$lib/components/seo.svelte';
	import { SITE, absoluteUrl, publicTools } from '$lib/seo.js';

	import { imageTools, cardTools, aiTools } from '$lib/menu-list/index.js';

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': `${SITE.url}/#website`,
				url: `${SITE.url}/`,
				name: SITE.name,
				description: SITE.defaultDescription,
				inLanguage: 'en',
				publisher: { '@id': `${SITE.url}/#organization` }
			},
			{
				'@type': 'Organization',
				'@id': `${SITE.url}/#organization`,
				name: SITE.name,
				url: `${SITE.url}/`,
				logo: `${SITE.url}/icons/icon_512.png`,
				sameAs: ['https://github.com/PlatinaSB/luna-stellaria']
			},
			{
				'@type': 'ItemList',
				name: 'Luna Stellaria browser tools',
				itemListElement: publicTools.map((tool, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					url: absoluteUrl(tool.path),
					name: tool.title
				}))
			}
		]
	};
</script>

<Seo title={SITE.name} description={SITE.defaultDescription} path="/" suffix={false} {jsonLd} />

<main class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-2xl space-y-6 text-center">
		<div class="space-y-2">
			<h1 class="text-4xl font-bold tracking-tight">Luna Stellaria</h1>
			<p class="text-muted-foreground">
				Free, privacy-friendly browser tools for images, QR codes, puzzles, and text.
			</p>
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title>My Tools</Card.Title>
			</Card.Header>

			<Card.Content class="space-y-6">
				<div class="space-y-2">
					<h2 class="text-lg font-semibold">AI tools</h2>
					<div class="grid gap-2">
						{#each aiTools as tool (tool.title)}
							<a
								href={tool.href}
								class="block rounded-md border p-3 text-left transition hover:bg-muted"
							>
								<div class="font-medium">{tool.title}</div>
								<div class="text-sm text-muted-foreground">{tool.description}</div>
							</a>
						{/each}
					</div>

					<div class="space-y-2">
						<h2 class="text-lg font-semibold">Image Tools</h2>
						<div class="grid gap-2">
							{#each imageTools as tool (tool.title)}
								<a
									href={tool.href}
									rel=""
									class="block rounded-md border p-3 text-left transition hover:bg-muted"
								>
									<div class="font-medium">{tool.title}</div>
									<div class="text-sm text-muted-foreground">{tool.description}</div>
								</a>
							{/each}
						</div>
					</div>

					<div class="space-y-2">
						<h2 class="text-lg font-semibold">Playing Card</h2>
						<div class="grid gap-2">
							{#each cardTools as tool (tool.title)}
								<a
									href={tool.href}
									class="block rounded-md border p-3 text-left transition hover:bg-muted"
								>
									<div class="font-medium">{tool.title}</div>
									<div class="text-sm text-muted-foreground">{tool.description}</div>
								</a>
							{/each}
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</main>
