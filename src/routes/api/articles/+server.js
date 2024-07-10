import { json } from '@sveltejs/kit';
import Article from "$lib/models/Article"
import User from '$lib/models/User'

export const GET = async ({ url, locals }) => {
	let limit = 20;
	let offset = 0;
	let query = {};

	const params = url.searchParams;

	if (params.get('limit')) {
		limit = params.get('limit');
	}
	if (params.get('offset')) {
		offset = params.get('offset');
	}
	if (params.get('tag')) {
		query[`"${params.get('tag')}"`] = { $in: { $field: 'tagList' } };
	}

	if (params.get('author')) {
		const author = await User.findByUsername(params.get('author')).catch((e) => {
			log.error('Failed to retrieve author', e);
		});
		if (author) {
			query.author = author.id;
		}
	}

	if (params.get('favorited')) {
		const favoriter = await User.findbyUsername(params.get('favorited')).catch((e) => {
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
		const loginUser = await User.findByUsername(locals.user.username).catch((e) => {
			log.error('Failed to retrieve logged in user', e);
		});
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
