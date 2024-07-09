import { json } from '@sveltejs/kit';
import { getModel } from 'ottoman';

const Article = getModel('Article');

export const GET = async () => {
	const tags = await Article.find(
		{},
		{ lean: true, select: [{ $distinct: { $field: { name: 'tagList' } } }] }
	).catch((e) => console.error('Failed to retrieve tags', e));

	const filteredTags = tags.rows
		.flatMap((a) => {
			return a.tagList;
		})
		.filter((value, index, array) => {
			return array.indexOf(value) === index;
		});
	return json(
		{
			tags: filteredTags
		},
		{ status: 200 }
	);
};
