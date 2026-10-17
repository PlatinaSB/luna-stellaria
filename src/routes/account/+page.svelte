<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Seo from '$lib/components/seo.svelte';
	import { apiBaseUrl } from '$lib/api.js';

	let { data } = $props();

	type FeedbackKind = 'error' | 'success';
	type Feedback = { kind: FeedbackKind; message: string } | null;

	let nameValue = $state('');
	let emailValue = $state('');
	let currentEmailPassword = $state('');
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmNewPassword = $state('');

	let nameFeedback = $state<Feedback>(null);
	let emailFeedback = $state<Feedback>(null);
	let passwordFeedback = $state<Feedback>(null);

	let submitting = $state(false);

	const user = $derived(data.user);

	// Seed the editable fields from the latest auth state; $effect re-runs when
	// `invalidateAll()` refreshes the layout data after a successful change.
	$effect(() => {
		nameValue = user?.display_name ?? '';
		emailValue = '';
	});

	async function postAccount(
		path: string,
		payload: Record<string, string>
	): Promise<{ kind: FeedbackKind; message: string }> {
		submitting = true;

		try {
			const response = await fetch(`${apiBaseUrl()}${path}`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const body = (await response.json().catch(() => null)) as {
				error?: { message?: string };
			} | null;

			if (!response.ok) {
				return { kind: 'error', message: body?.error?.message ?? 'Something went wrong.' };
			}

			await invalidateAll();
			return { kind: 'success', message: 'Saved.' };
		} catch {
			return { kind: 'error', message: 'Unable to reach the server. Please try again.' };
		} finally {
			submitting = false;
		}
	}

	async function handleSaveName(event: SubmitEvent) {
		event.preventDefault();
		nameFeedback = await postAccount('/auth/account/name', { name: nameValue.trim() });
	}

	async function handleSaveEmail(event: SubmitEvent) {
		event.preventDefault();
		const feedback = await postAccount('/auth/account/email', {
			email: emailValue.trim(),
			current_password: currentEmailPassword
		});
		emailFeedback = feedback;

		if (feedback.kind === 'success') {
			currentEmailPassword = '';
		}
	}

	async function handleSavePassword(event: SubmitEvent) {
		event.preventDefault();
		const feedback = await postAccount('/auth/account/password', {
			current_password: currentPassword,
			password: newPassword,
			confirm_password: confirmNewPassword
		});
		passwordFeedback = feedback;

		if (feedback.kind === 'success') {
			currentPassword = '';
			newPassword = '';
			confirmNewPassword = '';
		}
	}
</script>

<Seo
	title="Account"
	description="Manage your Luna Stellaria account settings."
	path="/account"
	noindex
/>

<div class="mx-auto my-8 w-full max-w-md space-y-6">
	{#if !user}
		<Card.Root>
			<Card.Header>
				<Card.Title><h1 class="contents">Account</h1></Card.Title>
				<Card.Description>
					You are not logged in. <a href={resolve('/login')} class="underline">Log in</a> to manage your
					account.
				</Card.Description>
			</Card.Header>
		</Card.Root>
	{:else}
		<Card.Root>
			<Card.Header>
				<Card.Title><h1 class="contents">Account</h1></Card.Title>
				<Card.Description>Signed in as {user.email}</Card.Description>
			</Card.Header>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Account Name</Card.Title>
				<Card.Description>Your public name, unique across other accounts.</Card.Description>
			</Card.Header>

			<Card.Content>
				<form onsubmit={handleSaveName}>
					<div class="flex flex-col gap-4">
						<div class="grid gap-2">
							<Label for="name">Name</Label>

							<Input
								id="name"
								name="name"
								type="text"
								minlength={2}
								maxlength={40}
								required
								bind:value={nameValue}
							/>
						</div>

						<Button type="submit" disabled={submitting}>Save name</Button>
					</div>
				</form>

				{#if nameFeedback}
					<p
						class="mt-4 text-sm {nameFeedback.kind === 'error' ? 'text-red-500' : 'text-green-600'}"
					>
						{nameFeedback.message}
					</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Email</Card.Title>
				<Card.Description>Confirm your current password to change your email.</Card.Description>
			</Card.Header>

			<Card.Content>
				<form onsubmit={handleSaveEmail}>
					<div class="flex flex-col gap-4">
						<div class="grid gap-2">
							<Label for="email">New Email</Label>

							<Input
								id="email"
								name="email"
								type="email"
								placeholder="m@example.com"
								autocomplete="email"
								required
								bind:value={emailValue}
							/>
						</div>

						<div class="grid gap-2">
							<Label for="current_email_password">Current Password</Label>

							<Input
								id="current_email_password"
								name="current_password"
								type="password"
								autocomplete="current-password"
								required
								bind:value={currentEmailPassword}
							/>
						</div>

						<Button type="submit" disabled={submitting}>Save email</Button>
					</div>
				</form>

				{#if emailFeedback}
					<p
						class="mt-4 text-sm {emailFeedback.kind === 'error'
							? 'text-red-500'
							: 'text-green-600'}"
					>
						{emailFeedback.message}
					</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Password</Card.Title>
				<Card.Description>Confirm your current password to set a new one.</Card.Description>
			</Card.Header>

			<Card.Content>
				<form onsubmit={handleSavePassword}>
					<div class="flex flex-col gap-4">
						<div class="grid gap-2">
							<Label for="current_password">Current Password</Label>

							<Input
								id="current_password"
								name="current_password"
								type="password"
								autocomplete="current-password"
								required
								bind:value={currentPassword}
							/>
						</div>

						<div class="grid gap-2">
							<Label for="new_password">New Password</Label>

							<Input
								id="new_password"
								name="password"
								type="password"
								autocomplete="new-password"
								minlength={8}
								required
								bind:value={newPassword}
							/>
						</div>

						<div class="grid gap-2">
							<Label for="confirm_new_password">Re-type New Password</Label>

							<Input
								id="confirm_new_password"
								name="confirm_password"
								type="password"
								autocomplete="new-password"
								minlength={8}
								required
								bind:value={confirmNewPassword}
							/>
						</div>

						<Button type="submit" disabled={submitting}>Save password</Button>
					</div>
				</form>

				{#if passwordFeedback}
					<p
						class="mt-4 text-sm {passwordFeedback.kind === 'error'
							? 'text-red-500'
							: 'text-green-600'}"
					>
						{passwordFeedback.message}
					</p>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</div>
