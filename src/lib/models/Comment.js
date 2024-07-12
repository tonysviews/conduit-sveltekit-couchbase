import { Schema, model } from 'ottoman';
import { scopeName } from '$lib/constants.server';
import User from '$lib/models/User';

const CommentSchema = new Schema(
	{
		body: { type: String, required: true },
		author: { type: String, ref: 'User' },
		article: { type: String, ref: 'Article' }
	},
	{
		timestamps: true
	}
);

CommentSchema.methods.toCommentResponse = async function (user) {
	let authorObj = await User.findById(this.author);
	return {
		id: this.id,
		body: this.body,
		createdAt: this.createdAt,
		updatedAt: this.updatedAt,
		author: authorObj.toProfileJSON(user)
	};
};

const Comment = model('Comment', CommentSchema, { scopeName });

export default Comment;
