<script lang="ts">
	import { goto } from '$app/navigation';
	import { allPosts } from '$lib/utils/posts';

	let searchQuery = $state('');
	let currentPage = $state(1);
	const pageSize = 5;

	const filteredPosts = $derived(
		searchQuery
			? allPosts.filter((p) => {
					const q = searchQuery.toLowerCase();
					return (
						p.title.toLowerCase().includes(q) ||
						p.date.includes(q) ||
						(p.updated || '').includes(q) ||
						(p.category || '').toLowerCase().includes(q)
					);
				})
			: allPosts
	);

	const totalPages = $derived(Math.ceil(filteredPosts.length / pageSize));
	const paginatedPosts = $derived(
		filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);
</script>

<div class="home-container">
	<h1>所有文章</h1>

	<mdui-text-field
		class="search-bar"
		variant="outlined"
		placeholder="搜索标题、日期、分类…"
		icon="search"
		value={searchQuery}
		oninput={(e) => { searchQuery = e.target.value; currentPage = 1; }}
	></mdui-text-field>

	<div class="post-grid">
		{#each paginatedPosts as post}
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<mdui-card
				variant="elevated"
				class="post-card"
				onclick={() => goto(`/posts/${post.slug}`)}
			>
				{#if post.banner}
					<div class="card-banner">
						<img src={post.banner} alt={post.title} />
					</div>
				{/if}
				<div class="card-content">
					<h2>{post.title}</h2>
					<p class="date">{post.date}</p>
					{#if post.category}
						<mdui-chip variant="flat" class="card-category">{post.category}</mdui-chip>
					{/if}
					<p class="excerpt">点击查看详情...</p>
				</div>
			</mdui-card>
		{/each}
		{#if paginatedPosts.length === 0}
			<p class="no-results">没有找到匹配的文章</p>
		{/if}
	</div>

	{#if totalPages > 1}
		<div class="pagination">
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<mdui-button variant="text" disabled={currentPage === 1} onclick={() => currentPage--}>上一页</mdui-button>
			<span>第 {currentPage} / {totalPages} 页</span>
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<mdui-button variant="text" disabled={currentPage === totalPages} onclick={() => currentPage++}>下一页</mdui-button>
		</div>
	{/if}
</div>

<style>
	.home-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 40px 20px;
	}

	.search-bar {
		width: 100%;
		margin-bottom: 24px;
	}

	.post-grid {
		display: grid;
		gap: 20px;
		margin-bottom: 30px;
	}

	.post-card {
		cursor: pointer;
		transition: transform 0.2s;
	}
	.post-card:hover {
		transform: translateY(-4px);
	}

	.card-content {
		padding: 20px;
	}

	.card-banner {
		width: 100%;
		height: 160px;
		overflow: hidden;
		border-radius: 12px 12px 0 0;
	}
	.card-banner img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.date {
		color: var(--text-secondary);
		font-size: 0.9em;
	}

	.no-results {
		text-align: center;
		color: var(--text-secondary);
		padding: 40px 0;
	}

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 20px;
	}
</style>
