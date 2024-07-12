import { json } from '@sveltejs/kit';
import Article from '$lib/models/Article.js';
import User from '$lib/models/User.js';

export const GET = async ({ url, locals }) => {
	try {
		let limit = 20;
		let offset = 0;

		const query = url.searchParams;

		if (query.get('limit')) {
			limit = query.get('limit');
		}

		if (query.get('offset')) {
			offset = query.get('offset');
		}

		const { id } = locals.user;
		const user = await User.findById(id);

		// confirm data
		const { rows: articleList } = await Article.find(
			{ author: { $in: user.followingUsers } },
			{
				limit: Number(limit),
				skip: Number(offset)
			}
		);

		const articlesCount = await Article.count({ author: { $in: user.followingUsers } });
		const articles = await Promise.all(
			articleList.map(async (article) => {
				return await article.toArticleResponse(user);
			})
		);
		return json({ articles, articlesCount }, { status: 200 });
	} catch (e) {
		console.error('Failed to retrieve articles', e);
		throw e;
	}
};
