import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { env } from '$env/dynamic/private';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, platform, cookies }) => {
		const db = platform?.env?.lunadb;

		if (!db) {
			throw new Error('D1 binding "lunadb" is not available');
		}

		if (!env.JWT_SECRET) {
			throw new Error('JWT_SECRET is not configured');
		}

		const form = await request.formData();

		const email = String(form.get('email') ?? '')
			.trim()
			.toLowerCase();

		const password = String(form.get('password') ?? '');
		const confirmPassword = String(form.get('confirm_password') ?? '');

		if (!email || !password || !confirmPassword) {
			return fail(400, {
				error: 'All fields are required.',
				email
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				error: 'Passwords do not match.',
				email
			});
		}

		if (password.length < 8) {
			return fail(400, {
				error: 'Password must be at least 8 characters.',
				email
			});
		}

		const existingUser = await db
			.prepare(
				`
				SELECT id
				FROM users
				WHERE email = ?
				LIMIT 1
			`
			)
			.bind(email)
			.first<{ id: number }>();

		if (existingUser) {
			return fail(400, {
				error: 'An account with this email already exists.',
				email
			});
		}

		const passwordHash = await bcrypt.hash(password, 12);

		const result = await db
			.prepare(
				`
				INSERT INTO users (
					email,
					password_hash
				)
				VALUES (?, ?)
				RETURNING id, email
			`
			)
			.bind(email, passwordHash)
			.first<{
				id: number;
				email: string;
			}>();

		if (!result) {
			throw new Error('Failed to create user');
		}

		const secret = new TextEncoder().encode(env.JWT_SECRET);

		const token = await new SignJWT({
			email: result.email
		})
			.setProtectedHeader({
				alg: 'HS256',
				typ: 'JWT'
			})
			.setSubject(String(result.id))
			.setIssuedAt()
			.setExpirationTime('7d')
			.sign(secret);

		cookies.set('jwt', token, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7
		});

		throw redirect(303, '/');
	}
};
