import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import User from '$lib/models/User';
import { parseUserFromRequest } from '$lib/util.js';
import { NotFoundError, ValidationError, ValidationErrors } from '$lib/errors.js';

export const GET = async ({ request, locals }) => {
	try {
		let loggedInUser = locals.user;
		const { id } = loggedInUser;

		const user = await User.findById(id).catch((e) => {
			console.error(`Unable to retrieve user with id: ${id}`, e);
		});

		if (!user) {
			throw NotFoundError('Unable to retrieve current user data.');
		}

		return json({ user: user.toUserResponse() }, { status: 200 });
	} catch (e) {
		console.error('Failed to retrieve current user', e);
		throw e;
	}
};

export const PUT = async ({ request, locals }) => {
	try {
		let loggedInUser = locals.user;
		const { id } = loggedInUser;
		const existingUser = await User.findById(id).catch((e) =>
			console.error(e, 'Failed to retrieve user with id: ' + id)
		);
		if (!existingUser) {
			throw NotFoundError('User not found');
		}
		
		// confirm data
		const { user } = await request.json();
		if (!user) {
			throw new ValidationError('user data', 'not provided');
		}

		if (user.email) {
			existingUser.email = user.email;
		}

		if (user.username) {
			existingUser.username = user.username;
		}

		if (user.password) {
			const passwordHash = await bcrypt.hash(user.password, 10);
			existingUser.password = passwordHash;
		}

		if (typeof user.image !== 'undefined') {
			existingUser.image = user.image;
		}

		if (typeof user.bio !== 'undefined') {
			existingUser.bio = user.bio;
		}

		await existingUser.save();

		return json({ user: existingUser.toUserResponse() }, { status: 200 });
	} catch (e) {
		console.error('Failed to update user details', e);
		if (e instanceof ValidationError || e instanceof ValidationErrors) {
			return e.toResponse();
		}
		throw e;
	}
};
