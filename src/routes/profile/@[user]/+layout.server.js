import API from '$lib/api.js';

export async function load({ fetch, locals, params }) {
	const { profile } = await API(fetch).get(`profiles/${params.user}`, locals.user?.token);

	return {
		profile
	};
}
