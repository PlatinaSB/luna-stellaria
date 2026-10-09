<script lang="ts">
	import { page } from '$app/state';
	import Seo from '$lib/components/seo.svelte';

	const title = page.status === 404 ? 'Page not found' : 'Something went wrong';
</script>

<Seo
	{title}
	description="The page you were looking for could not be found."
	path={page.url.pathname}
	noindex
/>

<main class="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
	<h1 class="text-6xl font-bold tracking-tight">{page.status}</h1>
	<p class="text-lg text-muted-foreground">{title}</p>
	<a href="/" rel="" class="mt-4 text-sm underline underline-offset-4">Back to home</a>
</main>
