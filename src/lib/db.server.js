import { error } from '@sveltejs/kit';
import { Ottoman, getDefaultInstance } from 'ottoman';

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
	const bucket = process.env.COUCHBASE_BUCKET || '_default';

	try {
		await ottoman.connect({
			connectionString: endpoint,
			username: username,
			password: password,
			bucketName: bucket
		});

		await ottoman.start();
		console.log('Connected to Couchbase');
	} catch (e) {
		console.error('Failed to initialize ottoman', e);
		throw error(500, 'Failed to initialize ottoman');
	}
};

export { initializeDatabase };
