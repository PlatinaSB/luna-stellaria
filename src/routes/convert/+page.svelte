<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { File as FileIcon, X as Xicon } from 'lucide-svelte';
	import Compressor from 'compressorjs';
	import { Input } from '$lib/components/ui/input/index.js';
	import { onDestroy } from 'svelte';
	import * as NativeSelect from '$lib/components/ui/native-select/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import Seo from '$lib/components/seo.svelte';
	import { absoluteUrl } from '$lib/seo.js';

	const description =
		'Convert images between JPEG, PNG, and WebP for free in your browser. Batch convert, optionally compress, and download instantly — no uploads and no sign-up.';

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'Convert Image',
		url: absoluteUrl('/convert'),
		applicationCategory: 'MultimediaApplication',
		operatingSystem: 'Any',
		browserRequirements: 'Requires JavaScript',
		description,
		isAccessibleForFree: true,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
	};

	let file1: FileList | undefined = $state(undefined);

	let results: {
		url: string;
		name: string;
		progress: number;
		status: 'waiting' | 'uploading' | 'compressing' | 'done';
	}[] = $state([]);

	let isDragging = $state(false);
	let fileInput: HTMLInputElement | null | undefined = $state(null);

	let format: 'jpeg' | 'png' | 'webp' = $state('jpeg');
	let useCompression = $state(false);
	let quality = $state(0.8);

	let compressbar = $state(0);
	let isCompressing = $state(false);

	function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		if (e.dataTransfer?.files) {
			file1 = e.dataTransfer.files;
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function triggerFile() {
		fileInput?.click();
	}

	function getName(file: File) {
		const base = file.name.replace(/\.[^/.]+$/, '');
		return `${base}.${format}`;
	}

	function removeFile(index: number) {
		if (!file1) return;

		const dt = new DataTransfer();

		Array.from(file1).forEach((file, i) => {
			if (i !== index) dt.items.add(file);
		});

		file1 = dt.files;

		if (fileInput) {
			fileInput.files = dt.files;
		}
	}

	function clearFiles() {
		file1 = undefined;

		results.forEach((r) => URL.revokeObjectURL(r.url));

		results = [];
		compressbar = 0;

		if (fileInput) {
			fileInput.value = '';
		}
	}

	async function processImages() {
		if (!file1 || isCompressing) return;

		isCompressing = true;
		compressbar = 0;

		results.forEach((r) => URL.revokeObjectURL(r.url));
		results = [];

		const files = Array.from(file1);

		for (let i = 0; i < files.length; i++) {
			const file = files[i];

			await sleep(1);

			results = [
				...results,
				{
					url: '',
					name: file.name,
					progress: 10,
					status: 'uploading'
				}
			];

			await sleep(1);

			results[i].progress = 30;
			results[i].status = 'compressing';

			const result = await new Promise<{
				url: string;
				name: string;
				progress: number;
				status: 'done';
			}>((resolve, reject) => {
				new Compressor(file, {
					quality: useCompression ? quality : 1,
					mimeType: `image/${format}`,

					success(result) {
						resolve({
							url: URL.createObjectURL(result as Blob),
							name: getName(file),
							progress: 100,
							status: 'done'
						});
					},

					error(err) {
						reject(err);
					}
				});
			});

			results[i] = result;
			results = [...results];

			compressbar = Math.round(((i + 1) / files.length) * 100);

			await sleep(1);
		}

		isCompressing = false;
	}

	onDestroy(() => {
		results.forEach((r) => {
			if (r.url) URL.revokeObjectURL(r.url);
		});
	});
</script>

<Seo title="Convert Image (JPEG, PNG, WebP)" {description} path="/convert" {jsonLd} />

<div class="flex min-h-screen items-center justify-center">
	<Card.Root class="w-full max-w-[66vw]">
		<Card.Header>
			<Card.Title><h1 class="contents">Convert &amp; Compress Image</h1></Card.Title>
		</Card.Header>

		<Card.Content>
			{#if !file1 || file1.length === 0}
				<div
					role="button"
					tabindex="0"
					class={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center ${
						isDragging ? 'border-blue-500 bg-blue-50' : ''
					}`}
					ondrop={handleDrop}
					ondragover={handleDragOver}
					ondragleave={handleDragLeave}
					onclick={triggerFile}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') triggerFile();
					}}
				>
					<Empty.Root>
						<Empty.Header>
							<Empty.Media variant="icon">
								<FileIcon />
							</Empty.Media>

							<Empty.Title>No Image Uploaded</Empty.Title>
						</Empty.Header>

						<Empty.Content>
							<p>Drag & Drop or click to upload</p>

							<Input
								id="file"
								type="file"
								accept="image/*"
								multiple
								class="hidden"
								bind:ref={fileInput}
								bind:files={file1}
							/>

							<Button onclick={triggerFile}>Upload</Button>
						</Empty.Content>
					</Empty.Root>
				</div>
			{:else}
				<div class="grid grid-cols-3 gap-3">
					{#each Array.from(file1) as file, i (file.name + i)}
						<div class="relative">
							<img src={URL.createObjectURL(file)} class="rounded-xl" alt={file.name} />

							<Button
								class="absolute top-1 right-1"
								variant="destructive"
								onclick={() => removeFile(i)}
								disabled={isCompressing}
							>
								<Xicon />
							</Button>
						</div>
					{/each}
				</div>
			{/if}

			{#if file1 && file1.length > 0}
				<div class="mt-4 space-y-3">
					<div class="flex flex-wrap items-center gap-3">
						<NativeSelect.Root bind:value={format}>
							<NativeSelect.Option value="jpeg">JPEG</NativeSelect.Option>
							<NativeSelect.Option value="png">PNG</NativeSelect.Option>
							<NativeSelect.Option value="webp">WEBP</NativeSelect.Option>
						</NativeSelect.Root>

						<label class="flex items-center gap-2">
							<input type="checkbox" bind:checked={useCompression} disabled={isCompressing} />

							<span>Compression</span>
						</label>

						{#if useCompression}
							<input
								type="range"
								min="0.1"
								max="1"
								step="0.1"
								bind:value={quality}
								disabled={isCompressing}
							/>

							<span>{quality}</span>
						{/if}

						<Button variant="destructive" onclick={clearFiles} disabled={isCompressing}>
							Clear All
						</Button>

						<Button onclick={processImages} disabled={isCompressing}>
							{#if isCompressing}
								<Spinner />
								Converting...
							{:else}
								Convert
							{/if}
						</Button>
					</div>

					{#if isCompressing || compressbar > 0}
						<div class="space-y-2">
							<div class="flex items-center justify-between text-sm">
								<span>Total Progress</span>
								<span>{compressbar}%</span>
							</div>

							<Progress value={compressbar} />
						</div>
					{/if}
				</div>
			{/if}
		</Card.Content>

		<Card.Footer>
			{#if results.length > 0}
				<div class="mt-4 w-full space-y-3">
					<p>Result:</p>

					<div class="grid grid-cols-3 gap-3">
						{#each results as img (img.name)}
							<Card.Root>
								<Card.Header>
									<Card.Title>{img.name}</Card.Title>
									<Progress value={img.progress} />
								</Card.Header>

								<Card.Content>
									<img src={img.url} class="mt-3 mb-2 rounded-xl" alt={img.name} />
								</Card.Content>

								<Card.Footer>
									{#if img.url}
										<a href={img.url} rel="" download={img.name} class="w-full">
											<Button class="w-full">Download</Button>
										</a>
									{/if}
								</Card.Footer>
							</Card.Root>
						{/each}
					</div>
				</div>
			{/if}
		</Card.Footer>
	</Card.Root>
</div>
