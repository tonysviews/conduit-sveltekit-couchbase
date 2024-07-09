import { Schema, getModel } from 'ottoman';

const CommentSchema = new Schema(
	{
		body: {
			type: String,
			required: true
		},
		author: { type: String, ref: 'User' },
		article: { type: String, ref: 'Article' }
	},
	{
		timestamps: true
	}
);

CommentSchema.methods.toCommentResponse = async function (user) {
	let authorObj = await getModel('User').findById(this.author);
	return {
		id: this.id,
		body: this.body,
		createdAt: this.createdAt,
		updatedAt: this.updatedAt,
		author: authorObj.toProfileJSON(user)
	};
};

export { CommentSchema };
