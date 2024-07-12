import { json } from '@sveltejs/kit';
import { ForbiddenError, NotFoundError } from '$lib/errors.js';
import User from '$lib/models/User.js';

export const POST = async ({ params, locals }) => {
	try {
		const { username } = params;
		const user = await User.findOne({ username }).catch((e) => console.error('User not found', e));
		if (!user) {
			throw NotFoundError('User not found');
		}

		const loginUser = locals.user;
		const currentUser = await User.findById(loginUser.id).catch((e) =>
			console.error('Current user not found', e)
		);
		if (!currentUser) {
			throw NotFoundError('Current user not found');
		}

		if (user.email == currentUser.email) {
			throw ForbiddenError('You cannot follow yourself');
		}

		await currentUser.follow(user.id);

		const profile = await user.toProfileJSON(currentUser);
		return json({ profile }, { status: 200 });
	} catch (e) {
		console.error('Failed to follow user', e);
		throw e;
	}
};

export const DELETE = async ({ params, locals }) => {
	try {
		const { username } = params;
		const user = await User.findOne({ username }).catch((e) => console.error('User not found', e));
		if (!user) {
			throw NotFoundError('User not found');
		}

		const loginUser = locals.user;
		const currentUser = await User.findById(loginUser.id).catch((e) =>
			console.error('Current user not found', e)
		);
		if (!currentUser) {
			throw NotFoundError('Current user not found');
		}

		if (user.email == currentUser.email) {
			throw ForbiddenError('You cannot unfollow yourself');
		}

		await currentUser.unfollow(user.id);

		const profile = await user.toProfileJSON(currentUser);
		return json({ profile }, { status: 200 });
	} catch (e) {
		console.error('Failed to unfollow user', e);
		throw e;
	}
};
