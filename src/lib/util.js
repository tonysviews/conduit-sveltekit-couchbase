import jwt from 'jsonwebtoken';

export const decodeToken = (token) => {
	return jwt.decode(token);
}
export const checkExpiration = ({exp}) => {
	const currentTime = Date.now();
	const expiration = Number(exp * 1000);
	if (currentTime > expiration) {
		throw new Error('The token is expired');
	}
};

export const parseUserFromRequest = (request) => {
	const authorization = request.headers.get('authorization');
	if (!authorization) {
		return null;
	}
	const [_, encodedToken] = authorization.split(' ');
	const token = decodeToken(encodedToken);
	checkExpiration(token);
	const { user } = token;
	return user;
};
