<script lang="ts">
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Seo from '$lib/components/seo.svelte';
</script>

<Seo title="Login" description="Log in to your Luna Stellaria account." path="/login" noindex />

<div class="flex min-h-screen items-center justify-center">
	<Card.Root class="-my-4 w-full max-w-sm">
		<Card.Header>
			<Card.Title><h1 class="contents">Login to your account</h1></Card.Title>
			<Card.Description>Enter your email below to login to your account</Card.Description>

			<Card.Action>
				<Button variant="link" href="/register">Register</Button>
			</Card.Action>
		</Card.Header>

		<Card.Content>
			<form method="POST">
				<div class="flex flex-col gap-6">
					<div class="grid gap-2">
						<Label for="email">Email</Label>
						<Input id="email" name="email" type="email" placeholder="m@example.com" required />
					</div>

					<div class="grid gap-2">
						<div class="flex items-center">
							<Label for="password">Password</Label>

							<!-- <a
								href="/forgot-password"
								rel=""
								class="ms-auto inline-block text-sm underline-offset-4 hover:underline"
							>
								Forgot your password?
							</a> -->
						</div>

						<Input id="password" name="password" type="password" required />
					</div>

					<Button type="submit" class="w-full">Login</Button>
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
