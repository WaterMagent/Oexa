<script lang="ts">
	import { pages } from '$lib/utils/posts';
	import { renderMarkdown } from '$lib/utils/markdown';

	const aboutPage = $derived(pages.find((p) => p.slug === 'about'));

	let previewSrc = $state('');

	function handleImageClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.tagName === 'IMG') {
			previewSrc = (target as HTMLImageElement).src;
		}
	}

	function closePreview() {
		previewSrc = '';
	}
</script>

<div class="about-container">
	{#if aboutPage}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="post-content" onclick={handleImageClick}>
			{@html renderMarkdown(aboutPage.content)}
		</div>
	{:else}
		<p style="color: #f44336;">未找到关于页面</p>
	{/if}
</div>

{#if previewSrc}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="image-preview-overlay" onclick={closePreview}>
		<img src={previewSrc} alt="Full size preview" />
	</div>
{/if}

<style>
	.about-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 32px;
	}

	.post-content {
		line-height: 1.8;
		font-size: 1rem;
	}
</style>
