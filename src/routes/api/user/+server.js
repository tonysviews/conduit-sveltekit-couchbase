import { json } from '@sveltejs/kit';
import User from '$lib/models/User';

export const GET = async ({ locals }) => {
	try {
		const loggedInUser = locals.user;
		if(!loggedInUser){
			throw new Error("Failed to verify token");
		}
		const { email } = loggedInUser;
		const user = await User.findByEmail(email).catch((e) => {
			console.error(`Unable to retrieve user with username: ${username}`, e);
		});
		if (!user) {
			throw new Error('Unable to retrieve current user');
		}
		return json({ user: user.toUserResponse() }, { status: 200 });
	} catch (e) {
		console.error('Failed to retrieve current user', e);
		return json({ errors: { [e.name]: e.message } }, { status: 422 });
	}
};
