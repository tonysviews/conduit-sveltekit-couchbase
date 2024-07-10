import { Schema, model } from 'ottoman';
import jwt from 'jsonwebtoken';
import { accessTokenSecret, scopeName } from '$lib/constants';
import Article from '$lib/models/Article';

const emailPattern =
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const UserSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			index: true
		},
		password: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			validator: { regexp: emailPattern, message: 'Invalid email format' },
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

UserSchema.index.findByUsername = { by: 'username', type: 'refdoc' };
UserSchema.index.findByEmail = { by: 'email', type: 'refdoc' };

UserSchema.methods.generateAccessToken = function () {
	const accessToken = jwt.sign(
		{
			user: {
				username: this.username,
				email: this.email
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

	const article = await Article.findById(id);

	article.favouritesCount += 1;
	await this.save();

	return article.save();
};

UserSchema.methods.unfavorite = async function (id) {
	const idx = this.favouriteArticles.indexOf(id);
	if (idx !== -1) {
		this.favouriteArticles.splice(idx, 1);
	}

	const article = await Article.findById(id);
	article.favouritesCount -= 1;
	await this.save();

	return article.save();
};

const User = model('User', UserSchema, { scopeName });

export default User;
