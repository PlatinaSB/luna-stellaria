<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Seo from '$lib/components/seo.svelte';
	import { SITE, absoluteUrl, publicTools } from '$lib/seo.js';

	const description =
		'Luna Tools is a growing collection of free, privacy-friendly browser tools, including image conversion and compression, QR code generation, and puzzle solvers.';

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'AboutPage',
		name: 'About Luna Tools',
		url: absoluteUrl('/about'),
		description,
		isPartOf: { '@id': `${SITE.url}/#website` }
	};
</script>

<Seo title="About" {description} path="/about" {jsonLd} />

<main class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-2xl space-y-6">
		<div class="space-y-2 text-center">
			<h1 class="text-4xl font-bold tracking-tight">About Luna Tools</h1>
			<p class="text-muted-foreground">{description}</p>
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title>Why Luna Tools?</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<p>
					Luna Tools is a lightweight collection of utilities that run entirely in your browser.
					Your files are processed on your own device, so images never leave your computer and
					nothing needs to be uploaded.
				</p>
				<p>
					Every tool is free to use and works on desktop and mobile. New tools are added over time
					based on what is genuinely useful.
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Available tools</Card.Title>
			</Card.Header>
			<Card.Content>
				<ul class="grid gap-2">
					{#each publicTools as tool (tool.path)}
						<li>
							<a
								href={tool.path}
								rel=""
								class="block rounded-md border p-3 transition hover:bg-muted"
							>
								<span class="font-medium">{tool.title}</span>
								<span class="block text-sm text-muted-foreground">{tool.description}</span>
							</a>
						</li>
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	</div>
</main>
