<script lang="ts">
	import './layout.css';
	import './native-like-experience.css';
	import favicon from '$lib/assets/logo.svg';
	import { ModeWatcher } from 'mode-watcher';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import { toggleMode } from 'mode-watcher';
	import { Moon as MoonIcon } from 'lucide-svelte';
	import { Sun as SunIcon } from 'lucide-svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { navigationMenuTriggerStyle } from '$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte';

	let { children, data } = $props();

	const isMobile = new IsMobile();

	const imageTools: { title: string; href: string; description: string }[] = [
		{
			title: 'Convert Image',
			href: '/convert',
			description: 'Convert images between formats'
		},
		{
			title: 'Compress Image',
			href: '/compress',
			description: 'Reduce image file size'
		}
	];

	const cardTools: { title: string; href: string; description: string }[] = [
		{
			title: '24 Card Game',
			href: '/24cardgame',
			description: 'solve 24 card puzzles'
		}
	];

	const aiTools: { title: string; href: string; description: string }[] = [
		{
			title: 'IndoBERT AI Text Classification',
			href: '/indobert-ai-text-classification',
			description: 'Adalah alat deteksi teks generatif AI berbahasa Indonesia'
		}
	];

	type ListItemProps = HTMLAttributes<HTMLAnchorElement> & {
		title: string;
		href: string;
		content: string;
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Luna Tools</title>
	<meta name="description" content="i make random stuff that work on browser to put here" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="theme-color" content="#a3004c" />
	<meta name="apple-mobile-web-app-status-bar-style" content="default" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@Platina_SB" />
	<meta name="twitter:url" content="https://tools.luna-stellaria.com/" />
	<meta name="twitter:title" content="Luna Tools" />
	<meta name="twitter:description" content="i make random stuff that work on browser to put here" />
	<meta name="twitter:image" content="https://tools.luna-stellaria.com//demo.png" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Luna Tools" />
	<meta property="og:description" content="i make random stuff that work on browser to put here" />
	<meta property="og:site_name" content="Luna Tools" />
	<meta property="og:url" content="https://tools.luna-stellaria.com/" />
	<meta property="og:image" content="https://tools.luna-stellaria.com//demo.png" />

	<link rel="preload" href="/manifest.json" />
	<link rel="manifest" href="/manifest.json" />
	<script async src="https://unpkg.com/pwacompat" crossOrigin="anonymous"></script>

	<!-- Apple touch icon -->
	<link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon_120.png" />
	<link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon_152.png" />
	<link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon_167.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon_180.png" />
</svelte:head>

<ModeWatcher />

{#snippet ListItem({ title, content, href, class: className, ...restProps }: ListItemProps)}
	<li>
		<NavigationMenu.Link>
			{#snippet child()}
				<a
					{href}
					rel=""
					class={cn(
						'block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
						className
					)}
					{...restProps}
				>
					<div class="text-sm leading-none font-medium">{title}</div>
					<p class="line-clamp-2 text-sm leading-snug text-muted-foreground">
						{content}
					</p>
				</a>
			{/snippet}
		</NavigationMenu.Link>
	</li>
{/snippet}

<NavigationMenu.Root viewport={isMobile.current}>
	<NavigationMenu.List class="flex-wrap">
		<NavigationMenu.Item>
			<NavigationMenu.Link>
				{#snippet child()}
					<a href="/" class={navigationMenuTriggerStyle()}>Home</a>
				{/snippet}
			</NavigationMenu.Link>
		</NavigationMenu.Item>
		<NavigationMenu.Item>
			<NavigationMenu.Trigger>AI Tools</NavigationMenu.Trigger>
			<NavigationMenu.Content>
				<ul class="grid w-75 gap-4 p-2">
					{#each aiTools as cardTool, i (i)}
						{@render ListItem({
							href: cardTool.href,
							title: cardTool.title,
							content: cardTool.description
						})}
					{/each}
				</ul>
			</NavigationMenu.Content>
		</NavigationMenu.Item>

		<NavigationMenu.Item>
			<NavigationMenu.Trigger>Image Tools</NavigationMenu.Trigger>
			<NavigationMenu.Content>
				<ul class="grid w-75 gap-2 p-2 sm:w-100 md:w-125 md:grid-cols-2 lg:w-150">
					{#each imageTools as imageTool, i (i)}
						{@render ListItem({
							href: imageTool.href,
							title: imageTool.title,
							content: imageTool.description
						})}
					{/each}
				</ul>
			</NavigationMenu.Content>
		</NavigationMenu.Item>

		<NavigationMenu.Item>
			<NavigationMenu.Trigger>Playing Card</NavigationMenu.Trigger>
			<NavigationMenu.Content>
				<ul class="grid w-75 gap-4 p-2">
					{#each cardTools as cardTool, i (i)}
						{@render ListItem({
							href: cardTool.href,
							title: cardTool.title,
							content: cardTool.description
						})}
					{/each}
				</ul>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
		<NavigationMenu.Item>
			<Button onclick={toggleMode} variant="outline" size="icon">
				<SunIcon
					class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
				/>
				<MoonIcon
					class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</NavigationMenu.Item>
		{#if data.user}
			<NavigationMenu.Item>
				<span class="flex h-9 items-center rounded-md px-3 text-sm font-medium">
					{data.user.email}
				</span>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<form method="POST" action="/logout">
					<Button type="submit" variant="outline">Logout</Button>
				</form>
			</NavigationMenu.Item>
		{:else}
			<NavigationMenu.Item>
				<NavigationMenu.Link>
					{#snippet child()}
						<a href="/login" class={navigationMenuTriggerStyle()}> Login </a>
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Link>
					{#snippet child()}
						<a href="/register" class={navigationMenuTriggerStyle()}> Register </a>
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>
		{/if}
	</NavigationMenu.List>
</NavigationMenu.Root>

{@render children()}

<footer class="mt-12 border-t bg-muted/30">
	<div
		class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row"
	>
		<p>
			© {new Date().getFullYear()} PlatinaSB. All rights reserved.
		</p>

		<a
			href="https://github.com/PlatinaSB/lunatools"
			target="_blank"
			rel="noopener noreferrer"
			class="transition-colors hover:text-foreground"
		>
			GitHub
		</a>
	</div>
</footer>
