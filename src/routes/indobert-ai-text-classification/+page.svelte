<script lang="ts">
	import type { PageProps } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import Seo from '$lib/components/seo.svelte';
	import { absoluteUrl } from '$lib/seo.js';

	const description =
		'IndoBERT AI Text Classification adalah alat deteksi teks generatif AI berbahasa Indonesia';

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'Convert Image',
		url: absoluteUrl('/indobert-ai-text-classification'),
		applicationCategory: 'MultimediaApplication',
		operatingSystem: 'Any',
		browserRequirements: 'Requires JavaScript',
		description,
		isAccessibleForFree: false,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
	};

	let { form }: PageProps = $props();

	type Prediction = {
		score: number;
		label: string;
	};

	const formatScore = (score: number) => `${(score * 100).toFixed(2)}%`;
</script>

<Seo title="Convert Image (JPEG, PNG, WebP)" {description} path="/convert" {jsonLd} />

<div class="flex min-h-screen items-center justify-center px-4">
	<Card.Root class="w-full max-w-xl shadow-xl">
		<Card.Header class="space-y-4">
			<Card.Title><h1 class="contents">IndoBERT AI Text Classification</h1></Card.Title>

			<Card.Description>Adalah alat deteksi teks generatif AI berbahasa Indonesia</Card.Description>
		</Card.Header>

		<Card.Content>
			<form method="POST" action="?/detect" class="grid w-full gap-2">
				<Textarea
					name="text"
					placeholder="Masukkan teks yang ingin diperiksa..."
					rows={8}
					value={form?.text ?? ''}
				/>

				<Button type="submit">Deteksi Teks</Button>
			</form>

			{#if form?.error}
				<p class="mt-3 text-sm text-red-500">
					{form.error}
				</p>
			{/if}
		</Card.Content>

		<Card.Footer class="block">
			<p class="mb-3 font-semibold">Hasil Deteksi</p>

			{#if form?.success}
				{@const predictions = form.result as Prediction[]}

				<div class="grid gap-4">
					{#each predictions as prediction (prediction.label)}
						<div class="rounded-lg border p-4">
							<div class="mb-2 flex items-center justify-between">
								<span class="font-medium">
									{prediction.label}
								</span>

								<span class="font-semibold">
									{formatScore(prediction.score)}
								</span>
							</div>

							<Progress value={prediction.score * 100} class="" />
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">Hasil deteksi akan ditampilkan di sini.</p>
			{/if}
		</Card.Footer>
	</Card.Root>
</div>
