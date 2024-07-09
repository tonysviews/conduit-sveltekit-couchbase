import API from '$lib/api';
import { page_size } from '$lib/constants';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, locals, url }) {
	const tab = url.searchParams.get('tab') || 'all';
	const tag = url.searchParams.get('tag');
	const page = +(url.searchParams.get('page') ?? '1');

	const endpoint = tab === 'feed' ? 'articles/feed' : 'articles';

	const q = new URLSearchParams();

	q.set('limit', page_size);
	q.set('offset', (page - 1) * page_size);
	if (tag) q.set('tag', tag);

	const [{ articles, articlesCount }, { tags }] = await Promise.all([
		API(fetch).get(`${endpoint}?${q}`, locals.user?.token),
		API(fetch).get('tags')
	]);

	return {
		articles,
		pages: Math.ceil(articlesCount / page_size),
		tags
	};
}
