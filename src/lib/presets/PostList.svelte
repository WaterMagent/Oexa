<script lang="ts">
	import type { PostMeta } from '$lib/utils/posts';
	import PostCard from './PostCard.svelte';

	let { posts }: { posts: PostMeta[] } = $props();
	let { onclick }: { onclick?: (slug: string) => void } = $props();
</script>

<div class="post-grid">
	{#each posts as post}
		<PostCard {post} onclick={() => onclick?.(post.slug)} />
	{/each}
</div>

<style>
	.post-grid {
		display: grid;
		gap: 20px;
		margin-bottom: 30px;
	}
</style>
