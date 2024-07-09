import { error } from '@sveltejs/kit';

const API = (fetch) => {
	const send = async ({ method, path, data, token }) => {
		const opts = { method, headers: {} };

		if (data) {
			opts.headers['Content-Type'] = 'application/json';
			opts.body = JSON.stringify(data);
		}

		if (token) {
			opts.headers['Authorization'] = `Token ${token}`;
		}

		const res = await fetch(`/api/${path}`, opts);
		if (res.ok || res.status === 422) {
			const text = await res.text();
			return text ? JSON.parse(text) : {};
		}

		error(res.status);
	};

	const get = (path, token) => {
		return send({ method: 'GET', path, token });
	};

	const del = (path, token) => {
		return send({ method: 'DELETE', path, token });
	};

	const post = (path, data, token) => {
		return send({ method: 'POST', path, data, token });
	};

	const put = (path, data, token) => {
		return send({ method: 'PUT', path, data, token });
	};

	return { get, del, post, put };
};

export default API;
