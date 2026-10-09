<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import Seo from '$lib/components/seo.svelte';
	import { absoluteUrl } from '$lib/seo.js';

	const description =
		'Free 24 card game solver. Enter four numbers and instantly find the arithmetic expression that makes 24 using addition, subtraction, multiplication, and division.';

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: '24 Card Game Solver',
		url: absoluteUrl('/24cardgame'),
		applicationCategory: 'GameApplication',
		operatingSystem: 'Any',
		browserRequirements: 'Requires JavaScript',
		description,
		isAccessibleForFree: true,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
	};

	let card1 = $state<number | undefined>(undefined);
	let card2 = $state<number | undefined>(undefined);
	let card3 = $state<number | undefined>(undefined);
	let card4 = $state<number | undefined>(undefined);
	let result = $state('');

	function solve24(cards: number[]): string {
		const ops = ['+', '-', '*', '/'];

		const permute = (arr: number[]): number[][] => {
			if (arr.length === 1) return [arr];
			const result: number[][] = [];
			for (let i = 0; i < arr.length; i++) {
				const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
				for (const p of permute(rest)) {
					result.push([arr[i], ...p]);
				}
			}
			return result;
		};

		const permutations = Array.from(new Set(permute(cards).map((p) => JSON.stringify(p)))).map(
			(p) => JSON.parse(p)
		);

		for (const p of permutations) {
			for (const op1 of ops) {
				for (const op2 of ops) {
					for (const op3 of ops) {
						const expressions = [
							`((${p[0]}${op1}${p[1]})${op2}${p[2]})${op3}${p[3]}`,
							`(${p[0]}${op1}(${p[1]}${op2}${p[2]}))${op3}${p[3]}`,
							`${p[0]}${op1}((${p[1]}${op2}${p[2]})${op3}${p[3]})`,
							`${p[0]}${op1}(${p[1]}${op2}(${p[2]}${op3}${p[3]}))`,
							`(${p[0]}${op1}${p[1]})${op2}(${p[2]}${op3}${p[3]})`
						];

						for (const expr of expressions) {
							try {
								const indirectEval = eval;
								if (Math.abs(indirectEval(expr) - 24) < 0.0001) {
									return `${expr} = 24`;
								}
							} catch {
								// ignore invalid expressions
							}
						}
					}
				}
			}
		}

		return 'No solution found.';
	}

	function clamp(value: number | undefined): number | undefined {
		if (value === undefined) return undefined;
		return Math.min(10, Math.max(0, value));
	}

	$effect(() => {
		card1 = clamp(card1);
		card2 = clamp(card2);
		card3 = clamp(card3);
		card4 = clamp(card4);

		if (card1 !== undefined && card2 !== undefined && card3 !== undefined && card4 !== undefined) {
			result = solve24([card1, card2, card3, card4]);
		} else {
			result = '';
		}
	});
</script>

<Seo title="24 Card Game Solver" {description} path="/24cardgame" {jsonLd} />

<div class="flex min-h-screen items-center justify-center px-4">
	<Card class="relative w-full max-w-xl shadow-xl">
		<CardHeader class="space-y-4">
			<div class="flex items-center justify-between">
				<CardTitle class="text-2xl"><h1 class="contents">Kartu Remi Game 24</h1></CardTitle>
			</div>
		</CardHeader>

		<CardContent class="space-y-6">
			<div class="min-h-7 text-center text-lg font-medium">
				<span class="text-muted-foreground">Masukan Angka Kartu</span>
			</div>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
				<Input type="number" min="1" max="10" bind:value={card1} placeholder="Card 1" />
				<Input type="number" min="1" max="10" bind:value={card2} placeholder="Card 2" />
				<Input type="number" min="1" max="10" bind:value={card3} placeholder="Card 3" />
				<Input type="number" min="1" max="10" bind:value={card4} placeholder="Card 4" />
			</div>
			<div class="min-h-7 text-center text-lg font-medium">
				{#if result}
					<span class="">Hasil<br /></span>

					<span class="">{result}</span>
				{/if}
			</div>
		</CardContent>
	</Card>
</div>
