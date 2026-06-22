<script lang="ts">
	import { page } from '$app/stores';
	import { allPosts } from '$lib/utils/posts';
	import { renderMarkdown } from '$lib/utils/markdown';
	import ArticleToc from '$lib/components/ArticleToc.svelte';

	const slug = $derived($page.params.slug);
	const currentPost = $derived(allPosts.find((p) => p.slug === slug));

	let previewSrc = $state('');

	function handleImageClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.tagName === 'IMG') previewSrc = (target as HTMLImageElement).src;
	}

	function closePreview() { previewSrc = ''; }

	function initCopyButtons() {
		const container = document.querySelector('.post-content');
		if (!container) return;
		container.querySelectorAll('pre').forEach((pre) => {
			if (pre.querySelector('.copy-btn')) return;
			const btn = document.createElement('button');
			btn.className = 'copy-btn';
			btn.innerText = '复制';
			btn.onclick = async () => {
				const code = pre.querySelector('code')?.innerText || pre.innerText;
				try {
					if (navigator.clipboard && window.isSecureContext) {
						await navigator.clipboard.writeText(code);
					} else {
						const ta = document.createElement('textarea');
						ta.value = code;
						ta.style.position = 'fixed';
						ta.style.opacity = '0';
						document.body.appendChild(ta);
						ta.select();
						document.execCommand('copy');
						document.body.removeChild(ta);
					}
					btn.innerText = '已复制!';
					btn.classList.add('copied');
					setTimeout(() => { btn.innerText = '复制'; btn.classList.remove('copied'); }, 2000);
				} catch { btn.innerText = '失败'; }
			};
			pre.appendChild(btn);
		});
	}

	$effect(() => {
		if (currentPost) requestAnimationFrame(initCopyButtons);
	});
</script>

{#if currentPost}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<mdui-button variant="text" icon="arrow_back" class="back-btn-fixed" onclick={() => history.back()}>返回</mdui-button>

	<article class="post-article">
		{#if currentPost.banner}
			<div class="banner-wrapper">
				<img src={currentPost.banner} alt="banner" class="post-banner" />
			</div>
		{/if}

		<h1 class="post-title">{currentPost.title}</h1>

		<div class="post-meta">
			<span>发布于 {currentPost.date}</span>
			{#if currentPost.updated}<span>· 更新于 {currentPost.updated}</span>{/if}
			{#if currentPost.category}<mdui-chip variant="flat">{currentPost.category}</mdui-chip>{/if}
		</div>

		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="post-content" onclick={handleImageClick}>
			{@html renderMarkdown(currentPost.content)}
		</div>
	</article>

	<ArticleToc containerSelector=".post-content" />

	{#if previewSrc}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="image-preview-overlay" onclick={closePreview}>
			<div class="preview-container" onclick={(e) => e.stopPropagation()}>
				<img src={previewSrc} alt="Full size preview" />
				<div class="preview-hint">点击任意处关闭</div>
			</div>
		</div>
	{/if}
{:else}
	<div class="loading">文章未找到</div>
{/if}

<style>
	.back-btn-fixed {
		position: fixed;
		top: 16px;
		left: 96px;
		z-index: 300;
		--mdui-button-text-color: var(--text-secondary);
		font-weight: 500;
	}

	.post-article {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		text-align: center;
	}

	.banner-wrapper {
		margin-bottom: 24px;
	}
	.post-banner {
		width: 100%;
		height: 240px;
		object-fit: cover;
		border-radius: 12px;
		display: block;
	}

	.post-title {
		font-size: 1.75rem;
		font-weight: bold;
		margin: 0 0 12px;
		color: var(--text-primary);
	}

	.post-meta {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		font-size: 0.85rem;
		color: var(--text-secondary);
		margin-bottom: 32px;
		flex-wrap: wrap;
	}

	.post-content-wrapper {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px 20px 32px;
		padding-right: 280px;
		min-width: 0;
	}

	.loading {
		text-align: center;
		padding: 60px 0;
		color: var(--text-secondary);
	}

	.post-content {
		line-height: 1.8;
		font-size: 1rem;
		color: var(--text-primary);
		text-align: left;
	}

	.image-preview-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,.85);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		cursor: pointer;
	}
	.preview-container { position: relative; }
	.preview-container img { max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 8px; }
	.preview-hint { position: absolute; bottom: -32px; color: rgba(255,255,255,.5); font-size: .85rem; }
</style>
