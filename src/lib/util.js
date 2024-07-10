import jwt from 'jsonwebtoken';

export const parseUserFromRequest = (request) => {
	const authorization = request.headers.get('authorization');
	if (!authorization) {
		return null;
	}
	const [_, token] = authorization.split(' ');
	const { user, exp } = jwt.decode(token);
	const currentTime = Date.now();
	const expiration = Number(exp * 1000);
	if (currentTime > expiration) {
		throw new Error('The token is expired');
	}
	return user;
};
