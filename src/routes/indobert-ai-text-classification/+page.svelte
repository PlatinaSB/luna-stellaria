<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import Seo from '$lib/components/seo.svelte';
	import { absoluteUrl } from '$lib/seo.js';
	import { apiBaseUrl } from '$lib/api.js';

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

	type Prediction = {
		score: number;
		label: string;
	};

	let text = $state('');
	let predictions = $state<Prediction[] | null>(null);
	let error = $state<string | null>(null);
	let loading = $state(false);

	const formatScore = (score: number) => `${(score * 100).toFixed(2)}%`;

	onMount(async () => {
		const response = await fetch(`${apiBaseUrl()}/auth/me`, { credentials: 'include' });

		if (!response.ok) {
			await goto(resolve('/login'));
		}
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		error = null;
		predictions = null;

		try {
			const response = await fetch(`${apiBaseUrl()}/ai/indobert/classify`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text })
			});

			if (response.status === 401) {
				await goto(resolve('/login'));
				return;
			}

			const body = (await response.json().catch(() => null)) as {
				error?: { message?: string };
				data?: { predictions?: Prediction[] };
			} | null;

			if (!response.ok) {
				error = body?.error?.message ?? 'Failed to detect the text.';
				return;
			}

			predictions = body?.data?.predictions ?? [];
		} catch {
			error = 'Unable to reach the server. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<Seo title="Convert Image (JPEG, PNG, WebP)" {description} path="/convert" {jsonLd} />

<div class="flex min-h-screen items-center justify-center px-4">
	<Card.Root class="w-full max-w-xl shadow-xl">
		<Card.Header class="space-y-4">
			<Card.Title><h1 class="contents">IndoBERT AI Text Classification</h1></Card.Title>

			<Card.Description>Adalah alat deteksi teks generatif AI berbahasa Indonesia</Card.Description>
		</Card.Header>

		<Card.Content>
			<form onsubmit={handleSubmit} class="grid w-full gap-2">
				<Textarea
					name="text"
					placeholder="Masukkan teks yang ingin diperiksa..."
					rows={8}
					bind:value={text}
				/>

				<Button type="submit" disabled={loading}>
					{loading ? 'Mendeteksi…' : 'Deteksi Teks'}
				</Button>
			</form>

			{#if error}
				<p class="mt-3 text-sm text-red-500">
					{error}
				</p>
			{/if}
		</Card.Content>

		<Card.Footer class="block">
			<p class="mb-3 font-semibold">Hasil Deteksi</p>

			{#if predictions}
				{@const results = predictions}

				<div class="grid gap-4">
					{#each results as prediction (prediction.label)}
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
