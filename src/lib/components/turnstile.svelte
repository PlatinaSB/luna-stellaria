<script lang="ts">
	import { mode } from 'mode-watcher';
	import { env } from '$env/dynamic/public';

	interface Props {
		/** Receives the solved token, or `''` when the widget clears again. */
		onverify: (token: string) => void;
		/** Increment to force a fresh challenge; tokens are single-use. */
		resetSignal?: number;
	}

	let { onverify, resetSignal = 0 }: Props = $props();

	/** Shape of the global object left by the Turnstile script. */
	interface TurnstileApi {
		render: (container: HTMLElement, options: Record<string, unknown>) => string;
		reset: (id?: string) => void;
		remove: (id?: string) => void;
	}

	const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

	let container = $state<HTMLDivElement | null>(null);
	let widgetId: string | undefined;
	let loadFailed = $state(false);

	/** Latest callback, resolved through a ref so parent re-renders never remount the widget. */
	let onverifyRef: Props['onverify'] = () => {};
	$effect(() => {
		onverifyRef = onverify;
	});

	function turnstileGlobal(): TurnstileApi | undefined {
		return (globalThis as { turnstile?: TurnstileApi }).turnstile;
	}

	/** Loads the challenge script once per page, no matter how often the widget mounts. */
	let scriptPromise: Promise<TurnstileApi> | null = null;

	function loadTurnstile(): Promise<TurnstileApi> {
		scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
			const existing = turnstileGlobal();

			if (existing) {
				resolve(existing);
				return;
			}

			const script = document.createElement('script');
			script.src = SCRIPT_SRC;
			script.async = true;
			script.onload = () => {
				const api = turnstileGlobal();

				if (api) {
					resolve(api);
				} else {
					reject(new Error('Turnstile API missing after script load.'));
				}
			};
			script.onerror = () => {
				// Allow a fresh attempt on the next mount.
				scriptPromise = null;
				reject(new Error('Failed to load the Turnstile script.'));
			};
			document.head.appendChild(script);
		});

		return scriptPromise;
	}

	$effect(() => {
		const el = container;

		if (!el) {
			return;
		}

		let unmounted = false;

		loadTurnstile()
			.then((api) => {
				if (unmounted) {
					return;
				}

				// Read here so the theme at mount follows the site's light/dark mode
				// without re-rendering the widget mid-challenge.
				const theme = mode.current === 'dark' ? 'dark' : 'light';

				widgetId = api.render(el, {
					sitekey: env.PUBLIC_Turnstile_site_key,
					theme,
					callback: (token: string) => onverifyRef(token),
					'expired-callback': () => onverifyRef('')
				});
			})
			.catch(() => {
				loadFailed = true;
			});

		return () => {
			unmounted = true;

			if (widgetId !== undefined) {
				turnstileGlobal()?.remove(widgetId);
				widgetId = undefined;
			}
		};
	});

	// A rising edge on `resetSignal` forces a fresh challenge (default start is 0).
	let lastResetSeen = 0;
	$effect(() => {
		if (resetSignal !== lastResetSeen && widgetId !== undefined) {
			turnstileGlobal()?.reset(widgetId);
		}

		lastResetSeen = resetSignal;
	});
</script>

<div bind:this={container}></div>

{#if loadFailed}
	<p class="text-sm text-red-500">
		Verification could not load. Please allow challenges.cloudflare.com and refresh.
	</p>
{/if}
