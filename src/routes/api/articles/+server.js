import { json } from '@sveltejs/kit';
import { getModel } from 'ottoman';

const Article = getModel('Article');
const User = getModel('User');

export const GET = async ({ params, locals }) => {
	let limit = 20;
	let offset = 0;
	let query = {};

	if (params.limit) {
		limit = params.limit;
	}
	if (params.offset) {
		offset = params.offset;
	}
	if (params.tag) {
		query[`"${params.tag}"`] = { $in: { $field: 'tagList' } };
	}

	if (params.author) {
		const author = await User.findOne({ username: params.author }).catch((e) => {
			log.error('Failed to retrieve author', e);
		});
		if (author) {
			query.author = author.id;
		}
	}

	if (params.favorited) {
		const favoriter = await User.findOne({ username: params.favorited }).catch((e) => {
			log.error('Failed to retrieve favorites owner', e);
		});
		if (favoriter) {
			query.id = { $in: favoriter.favouriteArticles };
		}
	}

	const { rows: filteredArticles } = await Article.find(query, {
		limit: Number(limit),
		skip: Number(offset),
		sort: { createdAt: 'DESC' }
	}).catch((e) => {
		console.error('Failed to retrieve articles', e);
	});

	const articleCount = await Article.count(query).catch((e) => {
		console.error('Failed to retrieve article count', e);
	});

	if (locals.user) {
		const loginUser = await User.findById(locals.user.userId);
		const fetchedArticles = await Promise.all(
			filteredArticles.map(async (article) => {
				return await article.toArticleResponse(loginUser);
			})
		);
		return json(
			{
				articles: fetchedArticles,
				articlesCount: articleCount
			},
			{ status: 200 }
		);
	} else {
		const fetchedArticles = await Promise.all(
			filteredArticles.map(async (article) => {
				return await article.toArticleResponse(false);
			})
		);
		return json(
			{
				articles: fetchedArticles,
				articlesCount: articleCount
			},
			{ status: 200 }
		);
	}
};
