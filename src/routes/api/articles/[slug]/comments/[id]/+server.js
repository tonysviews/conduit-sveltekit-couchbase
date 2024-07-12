import { json } from '@sveltejs/kit';
import { ForbiddenError, NotFoundError } from '$lib/errors.js';
import Article from '$lib/models/Article.js';
import User from '$lib/models/User.js';
import Comment from '$lib/models/Comment.js';

export const DELETE = async ({ params, locals }) => {
	try {
		const { slug, id } = params;
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

		const comment = await Comment.findById(id).catch((e) => {
			console.error(`Unable to retrieve comment with id: ${id}`, e);
		});
		if (!comment) {
			throw NotFoundError('Comment not found');
		}

		if (comment.author !== user.id) {
			throw ForbiddenError('You do not have permission to delete this comment');
		}

		await article.removeComment(comment.id);
		await Comment.removeById(comment.id);
		return json({ message: 'Comment has been successfully deleted' }, { status: 200 });
	} catch (e) {
		console.error('Failed to delete comment', e);
		throw e;
	}
};
