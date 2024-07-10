import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { getModel } from 'ottoman';
import { ValidationError } from '$lib/errors';

const User = getModel('User');

/** @type {import('@sveltejs/kit').RequestEvent} */
export const POST = async ({ request }) => {
	try {
		const { user } = await request.json();

		// validate data
		if (!user) {
			throw new ValidationError('No user data provided');
		}

		const { email, username, password } = user;
		if (!email || !username || !password) {
			const errors = { message: 'All fields are required' };
			if (!email) errors['email'] = 'email is required';
			if (!username) errors['username'] = 'user name is required';
			if (!password) errors['password'] = 'password is required';
			return json({ errors: { ...errors } }, { status: 422 });
		}

		// Check for existing user
		let existingUser;
		try {
			 existingUser = await User.findOne({ $or: [{ username }, { email }] });
		} catch (e) {
			// do nothing we want user to have unique username and email
		}

		if (existingUser) {
			throw new ValidationError('Username or email already exists');
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const createdUser = await User.create({ username, email, password: passwordHash });
		if (!createdUser) {
			throw new Error('Failed to create user');
		}
		return json({ user: createdUser.toUserResponse() }, { status: 201 });
	} catch (e) {
		console.error('Failed to create user', e);
		return json({ errors: { [e.name]: e.message } }, { status: 422 });
	}
};
