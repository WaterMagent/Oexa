<script lang="ts">
	let { content }: { content: string } = $props();
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
					await navigator.clipboard.writeText(code);
					btn.innerText = '已复制!';
					btn.classList.add('copied');
					setTimeout(() => { btn.innerText = '复制'; btn.classList.remove('copied'); }, 2000);
				} catch { btn.innerText = '失败'; }
			};
			pre.appendChild(btn);
		});
	}

	$effect(() => { requestAnimationFrame(initCopyButtons); });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="post-content" onclick={handleImageClick}>
	{@html content}
</div>

{#if previewSrc}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="image-preview-overlay" onclick={closePreview}>
		<div class="preview-container" onclick={(e) => e.stopPropagation()}>
			<img src={previewSrc} alt="preview" />
			<div class="preview-hint">点击任意处关闭</div>
		</div>
	</div>
{/if}

<style>
	.post-content { line-height: 1.8; font-size: 1rem; color: var(--text-primary); }
	.image-preview-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,.85); display: flex; justify-content: center; align-items: center; z-index: 1000; cursor: pointer; }
	.preview-container { position: relative; display: flex; justify-content: center; align-items: center; }
	.preview-container img { max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 8px; }
	.preview-hint { position: absolute; bottom: -32px; color: rgba(255,255,255,.5); font-size: .85rem; }
</style>
