import { Schema, getModel, addValidators } from 'ottoman';
import jwt from 'jsonwebtoken';
import accessTokenSecret from '$lib/constants';
import { PropertyRequiredError } from '$lib/errors';

const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/;

const UserSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			validator: 'username'
		},
		password: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			validator: { regexp: emailPattern, message: 'email invalid' },
			index: true
		},
		bio: {
			type: String,
			default: ''
		},
		image: {
			type: String,
			default: ''
		},
		favouriteArticles: { default: () => [], type: [{ type: String, ref: 'Article' }] },
		followingUsers: { default: () => [], type: [{ type: String, ref: 'User' }] }
	},
	{
		timestamps: true
	}
);

UserSchema.methods.generateAccessToken = function () {
	const accessToken = jwt.sign(
		{
			user: {
				id: this.id,
				email: this.email,
				password: this.password
			}
		},
		accessTokenSecret,
		{ expiresIn: '1d' }
	);
	return accessToken;
};

UserSchema.methods.toUserResponse = function () {
	return {
		username: this.username,
		email: this.email,
		bio: this.bio,
		image: this.image,
		token: this.generateAccessToken()
	};
};

UserSchema.methods.toProfileJSON = function (user) {
	return {
		username: this.username,
		bio: this.bio,
		image: this.image,
		following: user ? user.isFollowing(this.id) : false
	};
};

UserSchema.methods.isFollowing = function (id) {
	const idStr = id.toString();
	if (this.followingUsers) {
		for (const followingUser of this.followingUsers) {
			if (followingUser.toString() === idStr) {
				return true;
			}
		}
	}
	return false;
};

UserSchema.methods.follow = function (id) {
	if (this.followingUsers.indexOf(id) === -1) {
		this.followingUsers.push(id);
	}
	return this.save();
};

UserSchema.methods.unfollow = function (id) {
	const idx = this.followingUsers.indexOf(id);
	if (idx !== -1) {
		this.followingUsers.splice(idx, 1);
	}
	return this.save();
};

UserSchema.methods.isFavourite = function (id) {
	const idStr = id.toString();
	if (this.favouriteArticles) {
		for (const article of this.favouriteArticles) {
			if (article.toString() === idStr) {
				return true;
			}
		}
	}
	return false;
};

UserSchema.methods.favorite = async function (id) {
	if (this.favouriteArticles.indexOf(id) === -1) {
		this.favouriteArticles.push(id);
	}

	const article = await getModel('Article').findById(id);

	article.favouritesCount += 1;
	await this.save();

	return article.save();
};

UserSchema.methods.unfavorite = async function (id) {
	const idx = this.favouriteArticles.indexOf(id);
	if (idx !== -1) {
		this.favouriteArticles.splice(idx, 1);
	}

	const article = await getModel('Article').findById(id);
	article.favouritesCount -= 1;
	await this.save();

	return article.save();
};

addValidators({
	username: (value) => {
		if (value && /\s/g.test(value)) {
			throw new PropertyRequiredError('username');
		}
	}
});

export { UserSchema };
