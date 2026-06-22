<script lang="ts">
	import type { PostMeta } from '$lib/utils/posts';

	let { posts }: { posts: PostMeta[] } = $props();
	let { onclick }: { onclick?: (slug: string) => void } = $props();

	function formatDate(dateStr: string) {
		if (!dateStr) return '';
		const p = dateStr.split('-');
		return `${p[1]}月${p[2]}日`;
	}

	const grouped = $derived.by(() => {
		const groups: Record<string, PostMeta[]> = {};
		posts.forEach((post) => {
			const year = post.date.split('-')[0];
			if (!groups[year]) groups[year] = [];
			groups[year].push(post);
		});
		return groups;
	});
</script>

<div class="timeline">
	{#each Object.entries(grouped) as [year, items]}
		<div class="year-section">
			<div class="year-title">{year}</div>
			<div class="posts-list">
				{#each items as post}
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<div class="timeline-item" onclick={() => onclick?.(post.slug)}>
						<div class="axis-node"><div class="dot"></div></div>
						<div class="card">
							<span class="date">{formatDate(post.date)}</span>
							<h3>{post.title}</h3>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	.timeline { max-width: 800px; margin: 0 auto; padding: 32px 20px; }
	.year-section { margin-bottom: 40px; }
	.year-title { font-size: 1.5rem; font-weight: bold; color: var(--accent); margin-bottom: 16px; margin-left: 35px; }
	.posts-list { margin-left: 40px; }
	.timeline-item { display: flex; align-items: center; margin-bottom: 16px; cursor: pointer; }
	.axis-node { width: 40px; height: 20px; position: relative; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
	.axis-node::before { content: ''; position: absolute; left: 50%; transform: translateX(-50%); top: -20px; bottom: -20px; width: 2px; background-color: var(--border); z-index: 0; }
	.timeline-item:first-child .axis-node::before { top: 0; }
	.dot { width: 12px; height: 12px; border-radius: 50%; background-color: var(--bg-primary); border: 2px solid var(--accent); position: relative; z-index: 1; transition: all 0.2s; }
	.timeline-item:hover .dot { background-color: var(--accent); transform: scale(1.2); }
	.card { flex: 1; background-color: var(--bg-secondary); padding: 12px 20px; border-radius: 8px; border: 1px solid var(--border); transition: all 0.2s; }
	.timeline-item:hover .card { border-color: var(--accent); transform: translateX(5px); }
	.card h3 { margin: 4px 0 0; font-size: 1rem; color: var(--text-primary); }
	.date { font-size: 0.85rem; color: var(--text-secondary); }
</style>
