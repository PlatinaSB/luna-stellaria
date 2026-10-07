import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import type { Actions } from './$types';
import { env } from '$env/dynamic/private';

export const actions: Actions = {
	default: async ({ request, platform, cookies }) => {
		const db = platform?.env?.lunadb;

		if (!db) {
			throw new Error('D1 binding "lunadb" is not available');
		}

		const form = await request.formData();

		const email = String(form.get('email') ?? '')
			.trim()
			.toLowerCase();

		const password = String(form.get('password') ?? '');

		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required.',
				email
			});
		}

		const user = await db
			.prepare(
				`
				SELECT id, email, password_hash
				FROM users
				WHERE email = ?
				LIMIT 1
			`
			)
			.bind(email)
			.first<{
				id: number;
				email: string;
				password_hash: string;
			}>();

		if (!user) {
			return fail(400, {
				error: 'Invalid email or password.',
				email
			});
		}

		const passwordValid = await bcrypt.compare(password, user.password_hash);

		if (!passwordValid) {
			return fail(400, {
				error: 'Invalid email or password.',
				email
			});
		}

		const secret = new TextEncoder().encode(env.JWT_SECRET);

		const token = await new SignJWT({
			email: user.email
		})
			.setProtectedHeader({
				alg: 'HS256',
				typ: 'JWT'
			})
			.setSubject(String(user.id))
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
