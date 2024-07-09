import API from '$lib/api.js';
import { error, redirect } from '@sveltejs/kit';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, locals, params }) {
	const [{ article }, { comments }] = await Promise.all([
		API(fetch).get(`articles/${params.slug}`, locals.user?.token),
		API(fetch).get(`articles/${params.slug}/comments`, locals.user?.token)
	]);

	const dirty = marked(article.body);
	article.body = sanitizeHtml(dirty);

	return { article, comments };
}

/** @type {import('./$types').Actions} */
export const actions = {
	createComment: async ({ fetch, locals, params, request }) => {
		if (!locals.user) error(401);

		const data = await request.formData();

		await API(fetch).post(
			`articles/${params.slug}/comments`,
			{
				comment: {
					body: data.get('comment')
				}
			},
			locals.user.token
		);
	},

	deleteComment: async ({ fetch, locals, params, url }) => {
		if (!locals.user) error(401);

		const id = url.searchParams.get('id');
		const result = await API(fetch).del(`articles/${params.slug}/comments/${id}`, locals.user.token);

		if (result.error) error(result.status, result.error);
	},

	deleteArticle: async ({ fetch, locals, params }) => {
		if (!locals.user) error(401);

		await API(fetch).del(`articles/${params.slug}`, locals.user.token);
		redirect(307, '/');
	},

	toggleFavorite: async ({ fetch, locals, params, request }) => {
		if (!locals.user) error(401);

		const data = await request.formData();
		const favorited = data.get('favorited') !== 'on';

		if (favorited) {
			API(fetch).post(`articles/${params.slug}/favorite`, null, locals.user.token);
		} else {
			API(fetch).del(`articles/${params.slug}/favorite`, locals.user.token);
		}

		redirect(307, request.headers.get('referer') ?? `/article/${params.slug}`);
	}
};
