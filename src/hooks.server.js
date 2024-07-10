import { initializeDatabase } from '$lib/db.server';
import { parseUserFromRequest } from '$lib/util';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	await initializeDatabase();
	const token = event.cookies.get('jwt');
	if (token) {
		event.locals.user = JSON.parse(atob(token));
	} else {
		event.locals.user = parseUserFromRequest(event.request);
	}
	console.log(event.locals.user)
	return resolve(event);
}
