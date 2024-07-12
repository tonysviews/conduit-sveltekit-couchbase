import { json } from '@sveltejs/kit';
import Article from '$lib/models/Article';
import User from '$lib/models/User';
import { NotFoundError } from '$lib/errors.js';

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
		const author = await User.findOne({ username: params.get('author') }).catch((e) => {
			console.warn('Failed to retrieve author', e);
		});
		if (author) {
			query.author = author.id;
		}
	}

	if (params.get('favorited')) {
		const favoriter = await User.findOne({ username: params.get('favorited') }).catch((e) => {
			console.warn('Failed to retrieve favorites owner', e);
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
		const loginUser = await User.findById(locals.user.id).catch((e) => {
			console.error('Failed to retrieve logged in user', e);
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

export const POST = async ({ request, locals }) => {
	try {
		let loggedInUser = locals.user;
		const { id } = loggedInUser;

		const author = await User.findById(id).catch((e) => {
			console.warn('Unable to retrieve user with id: ' + id, e);
		});

		if (!author) {
			throw NotFoundError('User not found');
		}

		const { article } = await request.json();
		const { title, description, body, tagList } = article;

		// confirm data
		if (!title || !description || !body) {
			const errors = {};
			if (!title) {
				errors.title = "can't be blank";
			}
			if (!description) {
				errors.description = "can't be blank";
			}
			if (!body) {
				errors.body = "can't be blank";
			}
			throw new ValidationErrors(errors);
		}

		const createdArticle = await Article.create({ title, description, body });

		createdArticle.author = id;

		if (Array.isArray(tagList) && tagList.length > 0) {
			const sortedTags = Array.from(tagList).sort((a, b) => {
				return a.localeCompare(b);
			});
			createdArticle.tagList = sortedTags;
		}

		const savedArticle = await createdArticle.save();

		return json(
			{
				article: await savedArticle.toArticleResponse(author)
			},
			{ status: 201 }
		);
	} catch (e) {
		console.error('Failed to create article', e);
		throw e;
	}
};