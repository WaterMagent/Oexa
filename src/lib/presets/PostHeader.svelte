<script lang="ts">
	let { title }: { title: string } = $props();
</script>

<div class="post-header">
	<mdui-button variant="text" icon="arrow_back" class="back-btn">返回</mdui-button>
	<h1 class="post-title">{title}</h1>
</div>

<style>
	.post-header {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px 20px 0;
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.post-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: var(--text-primary);
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
