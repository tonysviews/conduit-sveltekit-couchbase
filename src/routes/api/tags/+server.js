import { json } from '@sveltejs/kit';
import Article from '$lib/models/Article';

export const GET = async () => {
	const { rows: articleTags } = await Article.find(
		{},
		{ lean: true, select: [{ $distinct: { $field: { name: 'tagList' } } }] }
	).catch((e) => console.error('Failed to retrieve tags', e));

	const tags = articleTags
		.flatMap((a) => {
			return a.tagList;
		})
		.filter((value, index, array) => {
			return array.indexOf(value) === index;
		});
	return json({ tags }, { status: 200 });
};
