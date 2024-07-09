import { error } from '@sveltejs/kit';
import { Ottoman, model, getDefaultInstance } from 'ottoman';
import { ArticleSchema } from '$lib/models/Article';
import { UserSchema } from '$lib/models/User';
import { CommentSchema } from '$lib/models/Comment';

const initializeDatabase = async function () {
	let ottoman = getDefaultInstance();

	if (!ottoman) {
		ottoman = new Ottoman();
	}

	if (ottoman.bucketName) {
		return;
	}

	const endpoint = process.env.COUCHBASE_SERVER || 'couchbase://localhost';
	const username = process.env.COUCHBASE_USER || 'Administrator';
	const password = process.env.COUCHBASE_PASSWORD || 'password';
	const bucket = process.env.COUCHBASE_BUCKET || 'default';
	const scopeName = process.env.COUCHBASE_SCOPE || '_default';

	try {
		await ottoman.connect({
			connectionString: endpoint,
			username: username,
			password: password,
			bucketName: bucket
		});

		model('Article', ArticleSchema, { scopeName });
		model('User', UserSchema, { scopeName });
		model('Comment', CommentSchema, { scopeName });

		await ottoman.start();
		console.log('Connected to Couchbase');
	} catch (e) {
		console.error('Failed to initialize ottoman', e);
		throw error(500, 'Failed to initialize ottoman');
	}
};

export { initializeDatabase };
