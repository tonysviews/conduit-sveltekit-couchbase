import { json } from '@sveltejs/kit';
import Article from '$lib/models/Article.js';
import User from '$lib/models/User.js';

export const POST = async ({ params, locals }) => {
	try {
		const { slug } = params;
		const article = await Article.findOne({ slug }).catch((e) => {
			console.error(`Unable to retrieve article with slug: ${slug}`, e);
		});
		if (!article) {
			throw NotFoundError('Unable to retrieve article data.');
		}

		const loggedInUser = locals.user;
		const user = await User.findById(loggedInUser.id).catch((e) => {
			console.error(`Unable to retrieve user with id: ${loggedInUser.id}`, e);
		});
		if (!user) {
			throw NotFoundError('User not found');
		}

		const chosenArticle = await user.favorite(article.id);
		const articleResponse = await chosenArticle.toArticleResponse(user);
		return json({ article: articleResponse }, { status: 200 });
	} catch (e) {
		console.error('Failed to favorite article', e);
		throw e;
	}
};

export const DELETE = async ({ params, locals }) => {
	try {
		const { slug } = params;
		const article = await Article.findOne({ slug }).catch((e) => {
			console.error(`Unable to retrieve article with slug: ${slug}`, e);
		});
		if (!article) {
			throw NotFoundError('Unable to retrieve article data.');
		}

		const loggedInUser = locals.user;
		const user = await User.findById(loggedInUser.id).catch((e) => {
			console.error(`Unable to retrieve user with id: ${loggedInUser.id}`, e);
		});
		if (!user) {
			throw NotFoundError('User not found');
		}

		const chosenArticle = await user.unfavorite(article.id);
		const articleResponse = await chosenArticle.toArticleResponse(user);
		return json({ article: articleResponse }, { status: 200 });
	} catch (e) {
		console.error('Failed to unfavorite article', e);
		throw e;
	}
};
