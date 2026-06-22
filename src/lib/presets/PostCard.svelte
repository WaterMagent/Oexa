<script lang="ts">
	import type { PostMeta } from '$lib/utils/posts';

	let { post }: { post: PostMeta } = $props();
	let { onclick }: { onclick?: () => void } = $props();
</script>

<mdui-card variant="elevated" class="post-card" onclick={onclick}>
	{#if post.banner}
		<div class="card-banner">
			<img src={post.banner} alt={post.title} />
		</div>
	{/if}
	<div class="card-body">
		<h2 class="card-title">{post.title}</h2>
		<p class="card-date">{post.date}</p>
		<p class="card-excerpt">点击查看详情...</p>
	</div>
</mdui-card>

<style>
	.post-card {
		cursor: pointer;
		transition: transform 0.2s;
	}
	.post-card:hover {
		transform: translateY(-4px);
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
	.card-body {
		padding: 20px;
	}
	.card-title {
		margin: 0 0 4px;
		font-size: 1.1em;
	}
	.card-date {
		color: var(--text-secondary);
		font-size: 0.9em;
		margin: 0 0 8px;
	}
	.card-excerpt {
		color: var(--text-secondary);
		font-size: 0.85em;
		margin: 0;
	}
</style>
