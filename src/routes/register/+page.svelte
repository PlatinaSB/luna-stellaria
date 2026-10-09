<script lang="ts">
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Seo from '$lib/components/seo.svelte';
</script>

<Seo title="Register" description="Create a free Luna Stellaria account." path="/register" noindex />

<div class="flex min-h-screen items-center justify-center">
	<Card.Root class="-my-4 w-full max-w-sm">
		<Card.Header>
			<Card.Title><h1 class="contents">Register your account</h1></Card.Title>

			<Card.Description>Enter your email and password to create your account.</Card.Description>

			<Card.Action>
				<Button variant="link" href="/login">Login</Button>
			</Card.Action>
		</Card.Header>

		<Card.Content>
			<form method="POST">
				<div class="flex flex-col gap-6">
					<div class="grid gap-2">
						<Label for="email">Email</Label>

						<Input
							id="email"
							name="email"
							type="email"
							placeholder="m@example.com"
							autocomplete="email"
							required
							value={form?.email ?? ''}
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
						/>
					</div>

					<Button type="submit" class="w-full">Register</Button>
				</div>
			</form>

			{#if form?.error}
				<p class="mt-4 text-sm text-red-500">
					{form.error}
				</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
