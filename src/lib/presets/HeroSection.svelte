<script lang="ts">
	let { title = '欢迎来到我的博客', subtitle = '' }: { title?: string; subtitle?: string } = $props();
</script>

<div class="hero">
	<h1>{title}</h1>
	{#if subtitle}<p>{subtitle}</p>{/if}
</div>

<style>
	.hero {
		text-align: center;
		margin-bottom: 48px;
	}
	.hero h1 {
		font-size: 2rem;
		margin: 0 0 8px;
	}
	.hero p {
		color: var(--text-secondary);
		margin: 0;
	}
</style>
