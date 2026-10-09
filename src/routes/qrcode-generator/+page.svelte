<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as NativeSelect from '$lib/components/ui/native-select/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import QRCode from 'qrcode';

	let input = $state('');
	let ecl: 'L' | 'M' | 'Q' | 'H' = $state('H');

	let format: 'image/jpeg' | 'image/webp' | 'image/png' = $state('image/png');

	const extensions = {
		'image/png': 'png',
		'image/jpeg': 'jpg',
		'image/webp': 'webp'
	};

	let extension = $derived(extensions[format]);

	let qrCodeUrl = $state('');

	$effect(() => {
		const text = input.trim();
		const errorCorrectionLevel = ecl;
		const type = format;

		if (!text) {
			qrCodeUrl = '';
			return;
		}

		let cancelled = false;

		QRCode.toDataURL(text, {
			width: 300,
			margin: 2,
			errorCorrectionLevel,
			type,
			rendererOpts: {
				quality: 0.92
			}
		})
			.then((url) => {
				if (!cancelled) qrCodeUrl = url;
			})
			.catch((err) => {
				if (!cancelled) {
					qrCodeUrl = '';
					console.error(err);
				}
			});

		return () => {
			cancelled = true;
		};
	});
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title>QR Code Generator</Card.Title>
			<div class="grid gap-2">
				<Input bind:value={input} placeholder="Enter URL or text" />

				<Label>Error correction level</Label>
				<NativeSelect.Root bind:value={ecl}>
					<NativeSelect.Option value="L">Low</NativeSelect.Option>
					<NativeSelect.Option value="M">Medium</NativeSelect.Option>
					<NativeSelect.Option value="Q">Quartile</NativeSelect.Option>
					<NativeSelect.Option value="H">High</NativeSelect.Option>
				</NativeSelect.Root>

				<Label>Image Format</Label>
				<NativeSelect.Root bind:value={format}>
					<NativeSelect.Option value="image/png">PNG</NativeSelect.Option>
					<NativeSelect.Option value="image/jpeg">JPEG</NativeSelect.Option>
					<NativeSelect.Option value="image/webp">WebP</NativeSelect.Option>
				</NativeSelect.Root>
			</div>
		</Card.Header>

		<Card.Content>
			{#if qrCodeUrl}
				<img src={qrCodeUrl} alt="Generated QR Code" class="mx-auto h-auto w-full max-w-75" />
			{/if}
		</Card.Content>

		<Card.Footer>
			{#if qrCodeUrl}
				<Button
					class="w-full"
					onclick={() => {
						const link = document.createElement('a');
						link.href = qrCodeUrl;
						link.download = `qrcode.${extension}`;
						link.click();
					}}
				>
					Download {extension.toUpperCase()}
				</Button>
			{/if}
		</Card.Footer>
	</Card.Root>
</div>
