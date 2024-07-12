import { json } from '@sveltejs/kit';
import { ValidationError } from '$lib/errors.js';
import Article from '$lib/models/Article.js';
import Comment from '$lib/models/Comment.js';
import User from '$lib/models/User.js';

export const POST = async ({ request, params, locals }) => {
	try {
		const { comment } = await request.json();
		const { body } = comment;
		if (!body) {
			throw new ValidationError('body', "can't be blank");
		}

		const { slug } = params;
		const article = await Article.findOne({ slug }).catch((e) => {
			console.error(`Unable to retrieve article with slug: ${slug}`, e);
		});
		if (!article) {
			throw NotFoundError('Unable to retrieve article data.');
		}

		const loggedInUser = locals.user;
		const commenter = await User.findById(loggedInUser.id).catch((e) => {
			console.error(`Unable to retrieve user with id: ${loggedInUser.id}`, e);
		});
		if (!commenter) {
			throw NotFoundError('User not found');
		}

		const newComment = await Comment.create({
			body,
			author: commenter.id,
			article: article.id
		});

		await article.addComment(newComment.id);

		const commentResponse = await newComment.toCommentResponse(commenter);
		return json({ comment: commentResponse }, { status: 200 });
	} catch (e) {
		console.error('Failed to favorite article', e);
		throw e;
	}
};

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

		if (!article.comments) {
			return json({ comments: [] }, { status: 200 });
		}

		let user = null;
		if (loggedInUser) {
			user = await User.findById(loggedInUser.id).catch((e) => {
				console.error(`Unable to retrieve user with id: ${loggedInUser.id}`, e);
			});
			if (!user) {
				throw NotFoundError('User not found');
			}
		}
		const { rows: articleComments } = await Comment.find({ id: { $in: article.comments } });
		const comments = await Promise.all(
			articleComments.map(async (comment) => await comment.toCommentResponse(user))
		);
		return json({ comments }, { status: 200 });
	} catch (e) {
		console.error('Failed to retrieve comments', e);
		throw e;
	}
};
