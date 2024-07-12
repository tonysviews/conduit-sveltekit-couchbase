import { error, json } from '@sveltejs/kit';

class ValidationErrors extends Error {
	constructor(errors) {
		super();
		this.name = 'ValidationErrors';
		this.errors = errors;
	}

	toResponse() {
		return json({ errors: this.errors }, { status: 422 });
	}
}

class ValidationError extends Error {
	constructor(field, message) {
		super(message);
		this.name = 'ValidationError';
		this.errors = { [field]: message };
	}

	toResponse() {
		return json({ errors: this.errors }, { status: 422 });
	}
}

const UnauthorizedError = (message) => {
	return error(401, message);
};

const ForbiddenError = (message) => {
	return error(403, message);
};

const NotFoundError = (message) => {
	return error(404, message);
};

const InternalServerError = (message) => {
	return error(500, message);
};

export {
	ValidationError,
	ValidationErrors,
	UnauthorizedError,
	ForbiddenError,
	NotFoundError,
	InternalServerError
};
