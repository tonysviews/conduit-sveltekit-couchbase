import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import User from '$lib/models/User'

export const POST = async ({ request }) => {
	try {
		const { user } = await request.json();

		// validate data
		if (!user) {
			throw new ValidationError('No user data provided');
		}

		const { email, password } = user;
		if (!email || !password) {
			const errors = { message: 'All fields are required' };
			if (!email) errors['email'] = 'email is required';
			if (!password) errors['password'] = 'password is required';
			return json({ errors: { ...errors } }, { status: 422 });
		}

		const loginUser = await User.findByEmail(email).catch((e) => {
			console.error(`User with email ${email} does not exist`, e);
		});
		if (!loginUser) {
			throw new Error('User does not exist');
		}

		const match = await bcrypt.compare(password, loginUser.password);
		if (!match) {
			return json({ errors: { "ValidationError": 'Email or password invalid' } }, { status: 422 });
		}
		
		return json({ user: loginUser.toUserResponse() }, { status: 200 });
	} catch (e) {
		console.error('Failed to login', e);
		return json({ errors: { [e.name]: e.message } }, { status: 422 });
	}
};
