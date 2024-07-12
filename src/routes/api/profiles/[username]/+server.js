import { json } from '@sveltejs/kit';
import User from '$lib/models/User.js';
import { NotFoundError } from '$lib/errors.js';

export const GET = async ({ params, locals }) => {
	const { username } = params;
	const user = await User.findOne({ username }).catch((e) => {
		console.error(`Unable to retrieve user with username: ${username}`, e);
	});
	if (!user) {
		throw NotFoundError('Unable to retrieve user data.');
	}

	const loggedInUser = locals.user;
	let currentUser = null;
	if (loggedInUser) {
		currentUser = await User.findById(loggedInUser.id).catch((e) => {
			console.error(`Unable to retrieve user with id: ${loggedInUser.id}`, e);
		});
		if (!currentUser) {
			throw NotFoundError('Unable to retrieve current user data.');
		}
	}

	const profile = await user.toProfileJSON(currentUser);
	return json({ profile }, { status: 200 });
};
