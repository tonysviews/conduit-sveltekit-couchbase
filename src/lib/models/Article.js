import { Schema, model } from 'ottoman';
import slugify from 'slugify';
import { scopeName } from '$lib/constants';
import User from '$lib/models/User';

const ArticleSchema = new Schema(
	{
		slug: {
			type: String,
			unique: true,
			lowercase: true,
			index: true
		},
		title: {
			type: String,
			required: true
		},
		description: {
			type: String,
			required: true
		},
		body: {
			type: String,
			required: true
		},
		tagList: {
			default: () => [],
			type: [
				{
					type: String
				}
			]
		},
		author: { type: String, ref: 'User' },
		favouritesCount: {
			type: Number,
			default: 0
		},
		comments: { default: () => [], type: [{ type: String, ref: 'Comment' }] }
	},
	{
		timestamps: true
	}
);

ArticleSchema.pre('update', function (document) {
	document.slug = slugify(document.title, { lower: true, replacement: '-' });
});

ArticleSchema.index.findBySlug = { by: 'slug', type: 'refdoc' };

ArticleSchema.methods.toArticleResponse = async function (user) {
	const authorObj = await User.findById(this.author);
	return {
		slug: this.slug,
		articleSlug: this.slug,
		title: this.title,
		description: this.description,
		body: this.body,
		createdAt: this.createdAt,
		updatedAt: this.updatedAt,
		tagList: this.tagList,
		favorited: user ? user.isFavourite(this.id) : false,
		favoritesCount: this.favouritesCount,
		author: authorObj.toProfileJSON(user)
	};
};

ArticleSchema.methods.addComment = async function (commentId) {
	if (this.comments.indexOf(commentId) === -1) {
		this.comments.push(commentId);
	}
	return this.save();
};

ArticleSchema.methods.removeComment = async function (commentId) {
	const idx = this.comments.indexOf(commentId);
	if (idx !== -1) {
		this.comments.splice(idx, 1);
	}

	return this.save();
};

const Article = model('Article', ArticleSchema, { scopeName });

export default Article;
