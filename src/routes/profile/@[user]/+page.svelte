<script>
	import ArticleList from '$lib/components/ArticleList/index.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<ArticleList articles={data.articles} />
