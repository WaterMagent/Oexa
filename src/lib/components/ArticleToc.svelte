<script lang="ts">
	let { containerSelector }: { containerSelector: string } = $props();

	let headings = $state<{ id: string; text: string; level: number }[]>([]);
	let activeId = $state('');
	let observer: IntersectionObserver | null = null;

	function updateActiveStyle(newId: string) {
		const allItems = document.querySelectorAll('.toc-item');
		allItems.forEach((item) => {
			const el = item as HTMLElement;
			const isActive = el.dataset.id === newId;
			el.style.color = isActive ? '#bb86fc' : '#a0a0a0';
			el.style.fontWeight = isActive ? '600' : '400';
			el.style.backgroundColor = 'transparent';

			const shadowRoot = (el as any).shadowRoot;
			if (shadowRoot) {
				const targets = shadowRoot.querySelectorAll('*');
				targets.forEach((target: any) => {
					if (target.style) {
						target.style.color = isActive ? '#bb86fc' : '';
						target.style.fontWeight = isActive ? '600' : '';
					}
				});
			}
		});
	}

	function extractHeadings() {
		const container = document.querySelector(containerSelector);
		if (!container) return;
		const elements = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
		headings = elements.map((el, idx) => {
			if (!el.id) el.id = `heading-${idx}`;
			return { id: el.id, text: el.textContent?.trim() || '', level: Number(el.tagName.charAt(1)) };
		});
	}

	function setupIntersectionObserver() {
		const container = document.querySelector(containerSelector);
		if (!container) return;

		observer = new IntersectionObserver(
			(entries) => {
				let topElement: Element | null = null;
				let minTop = Infinity;

				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const rect = entry.target.getBoundingClientRect();
						if (rect.top < window.innerHeight / 2 && rect.top < minTop) {
							minTop = rect.top;
							topElement = entry.target;
						}
					}
				});

				if (topElement && 'id' in topElement) {
					const newId = (topElement as HTMLElement).id;
					if (newId !== activeId) {
						activeId = newId;
						updateActiveStyle(newId);
					}
				}
			},
			{
				root: null,
				threshold: 0,
				rootMargin: '-100px 0px -50% 0px'
			}
		);

		container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => observer?.observe(el));
	}

	function scrollToHeading(id: string) {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			activeId = id;
			updateActiveStyle(id);
		}
	}

	$effect(() => {
		containerSelector;
		setTimeout(() => {
			extractHeadings();
			setupIntersectionObserver();
			if (headings.length > 0) {
				updateActiveStyle(headings[0].id);
			}
		}, 100);

		return () => observer?.disconnect();
	});
</script>

<div class="toc-container">
	<h3 class="toc-title">目录</h3>

	{#if headings.length > 0}
		<mdui-list class="toc-list">
			{#each headings as heading, index}
				<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
				<mdui-list-item
					class="toc-item level-{heading.level}"
					data-id={heading.id}
					onclick={() => scrollToHeading(heading.id)}
				>
					{heading.text}
				</mdui-list-item>
			{/each}
		</mdui-list>
	{:else}
		<div class="toc-empty">暂无目录</div>
	{/if}
</div>

<style>
	.toc-container {
		position: fixed;
		right: 40px;
		top: 50%;
		transform: translateY(-50%);
		width: 240px;
		max-height: 70vh;
		overflow-y: auto;
		padding: 12px;
		background: var(--bg-secondary, rgba(255, 255, 255, 0.95));
		backdrop-filter: blur(10px);
		border-radius: 12px;
		border: 1px solid var(--border, #e5e7eb);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		z-index: 100;
		scrollbar-width: thin;
		scrollbar-color: #ccc transparent;
	}

	.toc-container::-webkit-scrollbar { width: 4px; }
	.toc-container::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }

	.toc-title {
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0 0 8px 12px;
		color: var(--text-primary, #333);
	}

	.toc-list { padding: 0; }

	.toc-item {
		font-size: 0.85rem;
		height: 32px;
		transition: all 0.2s;
		cursor: pointer;
		display: flex !important;
		align-items: center !important;
	}

	:global(.level-1) { --mdui-list-item-padding-left: 12px; }
	:global(.level-2) { --mdui-list-item-padding-left: 24px; }
	:global(.level-3) { --mdui-list-item-padding-left: 36px; font-size: 0.8rem; }
	:global(.level-4) { --mdui-list-item-padding-left: 48px; font-size: 0.75rem; }
	:global(.level-5),
	:global(.level-6) { --mdui-list-item-padding-left: 60px; font-size: 0.75rem; opacity: 0.7; }

	.toc-empty {
		font-size: 0.8rem;
		color: var(--text-secondary, #999);
		padding: 12px;
		text-align: center;
	}

	@media (max-width: 1200px) {
		.toc-container { display: none; }
	}
</style>
