import { json } from '@sveltejs/kit';
import { NotFoundError } from '$lib/errors.js';
import Article from '$lib/models/Article.js';
import User from '$lib/models/User.js';

export const GET = async ({ params, locals }) => {
	try {
		const { slug } = params;
		const article = await Article.findOne({ slug }).catch((e) => {
			console.error(`Unable to retrieve article with slug: ${slug}`, e);
		});
		if (!article) {
			throw NotFoundError('Unable to retrieve article data.');
		}
		const loggedInUser = locals.user;
		let user = null;
		if (loggedInUser) {
			user = await User.findById(loggedInUser?.id).catch((e) => {
				console.error(`Unable to retrieve user with id: ${loggedInUser?.id}`, e);
			});
		}
		const articleResponse = await article.toArticleResponse(user);
		return json({ article: articleResponse }, { status: 200 });
	} catch (e) {
		console.error('Failed to retrieve article', e);
		throw e;
	}
};

export const PUT = async ({ request, params, locals }) => {
	try {
		const loggedInUser = locals.user;

		const user = await User.findById(loggedInUser.id).catch((e) => {
			console.error(`Unable to retrieve user with id: ${loggedInUser.id}`, e);
		});
		if (!user) {
			throw NotFoundError('User not found');
		}
		const { slug } = params;
		const article = await Article.findOne({ slug }).catch((e) => {
			console.error(`Unable to retrieve article with slug: ${slug}`, e);
		});
		if (!article) {
			throw NotFoundError('Unable to retrieve article data.');
		}

		const { article: newData } = await request.json();
		const { body, description, title, tagList } = newData;
		if (body) {
			article.body = body;
		}
		if (description) {
			article.description = description;
		}
		if (title) {
			article.title = title;
		}
		if (Array.isArray(tagList) && tagList.length > 0) {
			const sortedTags = Array.from(tagList).sort((a, b) => {
				return a.localeCompare(b);
			});
			article.tagList = sortedTags;
		}

		const updatedArticle = await article.save().catch((e) => {
			console.error(`Unable to update article with slug: ${slug}`, e);
		});
		if (!updatedArticle) {
			throw NotFoundError('Unable to update article data.');
		}

		const articleResponse = await updatedArticle.toArticleResponse(user);
		return json({ article: articleResponse }, { status: 200 });
	} catch (e) {
		console.error('Failed to update article', e);
		throw e;
	}
};

export const DELETE = async ({ params, locals }) => {
	try {
		const loggedInUser = locals.user;
		const user = await User.findById(loggedInUser.id).catch((e) => {
			console.error(`Unable to retrieve user with id: ${loggedInUser.id}`, e);
		});
		if (!user) {
			throw NotFoundError('User not found');
		}
		const { slug } = params;
		const article = await Article.findOne({ slug }).catch((e) => {
			console.error(`Unable to retrieve article with slug: ${slug}`, e);
		});
		if (!article) {
			throw NotFoundError('Unable to retrieve article data.');
		}

		if (article.author !== user.id) {
			throw ForbiddenError('You do not have permission to delete this article');
		}

		await Article.removeById(article.id);

		return json({ message: 'Article successfully deleted' }, { status: 200 });
	} catch (e) {
		console.error('Failed to delete article', e);
		throw e;
	}
};
