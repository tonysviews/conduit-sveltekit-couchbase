import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { InternalServerError, ValidationError, ValidationErrors } from '$lib/errors';
import User from '$lib/models/User';

/** @type {import('@sveltejs/kit').RequestEvent} */
export const POST = async ({ request }) => {
	try {
		const { user } = await request.json();

		// validate data
		if (!user) {
			throw new ValidationError('user data', 'not provided');
		}

		const { email, username, password } = user;
		if (!email || !username || !password) {
			const errors = {};
			if (!email) {
				errors.email = "can't be blank";
			}
			if (!username) {
				errors.username = "can't be blank";
			}
			if (!password) {
				errors.password = "can't be blank";
			}
			throw new ValidationErrors(errors);
		}

		// Check for existing user
		let existingUser = await User.findOne({ $or: [{ username }, { email }] }).catch((e) => {
			// do nothing we want user to have unique username and email
		});

		if (existingUser) {
			throw new ValidationError('email or username', 'already taken');
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const createdUser = await User.create({ username, email, password: passwordHash });
		if (!createdUser) {
			throw InternalServerError('Failed to return created user');
		}
		return json({ user: createdUser.toUserResponse() }, { status: 201 });
	} catch (e) {
		console.error('Failed to create user', e);
		if (e instanceof ValidationError || e instanceof ValidationErrors) {
			return e.toResponse();
		}
		throw e;
	}
};
