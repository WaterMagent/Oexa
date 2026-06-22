<script lang="ts">
	import { goto } from '$app/navigation';
	import { allPosts } from '$lib/utils/posts';

	const recentPosts = $derived(allPosts.slice(0, 3));
</script>

<div class="welcome-container">
	<div class="hero-section">
		<h1>欢迎来到 Baumkuchen 的博客</h1>
		<p>没有要写的</p>
	</div>

	<div class="recent-posts">
		<h2>最近更新</h2>
		<div class="post-list">
			{#each recentPosts as post}
				<mdui-card
					variant="outlined"
					class="recent-card"
					onclick={() => goto(`/posts/${post.slug}`)}
				>
					{#if post.banner}
						<div class="recent-banner">
							<img src={post.banner} alt={post.title} />
						</div>
					{/if}
					<div class="card-content">
						<h3>{post.title}</h3>
						<p class="date">{post.date}</p>
					</div>
				</mdui-card>
			{/each}
		</div>

		<div style="margin-top: 20px; text-align: center;">
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<mdui-button variant="text" onclick={() => goto('/posts')}>查看所有文章 →</mdui-button>
		</div>
	</div>
</div>

<style>
	.welcome-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 32px;
	}

	.hero-section {
		text-align: center;
		margin-bottom: 48px;
	}

	.recent-posts h2 {
		border-bottom: 2px solid var(--accent);
		display: inline-block;
		padding-bottom: 8px;
		margin-bottom: 24px;
	}

	.post-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.recent-card {
		cursor: pointer;
		transition: transform 0.2s, border-color 0.2s;
	}

	.recent-card:hover {
		transform: translateX(8px);
		border-color: var(--accent);
	}

	.card-content {
		padding: 16px 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.recent-banner {
		width: 100%;
		height: 120px;
		overflow: hidden;
	}
	.recent-banner img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.card-content h3 {
		margin: 0;
		font-size: 1.1em;
	}

	.date {
		color: var(--text-secondary);
		font-size: 0.9em;
		margin: 0;
	}
</style>
