<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Seo from '$lib/components/seo.svelte';
	import { apiBaseUrl } from '$lib/api.js';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state<string | null>(null);
	let submitting = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const response = await fetch(`${apiBaseUrl()}/auth/register`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					password,
					confirm_password: confirmPassword,
					...(name.trim() ? { name: name.trim() } : {})
				})
			});

			const body = (await response.json().catch(() => null)) as {
				error?: { message?: string };
			} | null;

			if (!response.ok) {
				error = body?.error?.message ?? 'Registration failed. Please try again.';
				return;
			}

			await invalidateAll();
			await goto(resolve('/'));
		} catch {
			error = 'Unable to reach the server. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<Seo
	title="Register"
	description="Create a free Luna Stellaria account."
	path="/register"
	noindex
/>

<div class="flex min-h-screen items-center justify-center">
	<Card.Root class="-my-4 w-full max-w-sm">
		<Card.Header>
			<Card.Title><h1 class="contents">Register your account</h1></Card.Title>

			<Card.Description>Enter your email and password to create your account.</Card.Description>

			<Card.Action>
				<Button variant="link" href={resolve('/login')}>Login</Button>
			</Card.Action>
		</Card.Header>

		<Card.Content>
			<form onsubmit={handleSubmit}>
				<div class="flex flex-col gap-6">
					<div class="grid gap-2">
						<Label for="name">Account Name</Label>

						<Input
							id="name"
							name="name"
							type="text"
							placeholder="Leave blank for a random name"
							minlength={2}
							maxlength={40}
							bind:value={name}
						/>
					</div>

					<div class="grid gap-2">
						<Label for="email">Email</Label>

						<Input
							id="email"
							name="email"
							type="email"
							placeholder="m@example.com"
							autocomplete="email"
							required
							bind:value={email}
						/>
					</div>

					<div class="grid gap-2">
						<Label for="password">Password</Label>

						<Input
							id="password"
							name="password"
							type="password"
							autocomplete="new-password"
							required
							bind:value={password}
						/>
					</div>

					<div class="grid gap-2">
						<Label for="confirm_password">Re-type Password</Label>

						<Input
							id="confirm_password"
							name="confirm_password"
							type="password"
							autocomplete="new-password"
							required
							bind:value={confirmPassword}
						/>
					</div>

					<Button type="submit" class="w-full" disabled={submitting}>
						{submitting ? 'Registering…' : 'Register'}
					</Button>
				</div>
			</form>

			{#if error}
				<p class="mt-4 text-sm text-red-500">
					{error}
				</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
