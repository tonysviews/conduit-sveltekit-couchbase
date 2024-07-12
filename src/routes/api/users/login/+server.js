import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import User from '$lib/models/User';
import { NotFoundError, ValidationError, ValidationErrors } from '$lib/errors.js';

export const POST = async ({ request }) => {
	try {
		const { user } = await request.json();

		// validate data
		if (!user) {
			throw new ValidationError('user data', 'not provided');
		}

		const { email, password } = user;
		if (!email || !password) {
			const errors = {};
			if (!email) {
				errors.email = "can't be blank";
			}
			if (!password) {
				errors.password = "can't be blank";
			}
			throw new ValidationErrors(errors);
		}

		const loginUser = await User.findOne({ email: {$eq: email, $ignoreCase: true }}).catch((e) => {
			console.error(`User with email ${email} does not exist`, e);
		});

		if (!loginUser) {
			throw NotFoundError('User does not exist');
		}

		const match = await bcrypt.compare(password, loginUser.password);
		if (!match) {
			throw new ValidationError('User', 'Email or password invalid');
		}

		return json({ user: loginUser.toUserResponse() }, { status: 200 });
	} catch (e) {
		console.error('Failed to login', e);
		if (e instanceof ValidationError || e instanceof ValidationErrors) {
			return e.toResponse();
		}
		throw e;
	}
};
