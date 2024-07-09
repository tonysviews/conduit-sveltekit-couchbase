import { initializeDatabase } from '$lib/db.server';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	await initializeDatabase();
	const jwt = event.cookies.get('jwt');
	event.locals.user = jwt ? JSON.parse(atob(jwt)) : null;

	return resolve(event);
}
