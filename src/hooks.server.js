import { initializeDatabase } from '$lib/db.server';
import { checkExpiration, decodeToken, parseUserFromRequest } from '$lib/util';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	await initializeDatabase();
	const token = event.cookies.get('jwt');
	if (token) {
		const user = JSON.parse(atob(token));
		checkExpiration(decodeToken(user.token));
		event.locals.user = user;
	} else {
		event.locals.user = parseUserFromRequest(event.request);
	}
	return resolve(event);
}
