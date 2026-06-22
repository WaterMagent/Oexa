<script lang="ts">
	import 'mdui/mdui.css';
	import 'mdui';
	import 'mdui/components/icon.js';
	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Clock from '$lib/components/Clock.svelte';

	let { children } = $props();

	const navItems = [
		{ name: 'home', label: '主页', icon: 'watch_later--outlined', path: '/' },
		{ name: 'posts', label: '文章', icon: 'image--outlined', path: '/posts' },
		{ name: 'archive', label: '归档', icon: 'library_music--outlined', path: '/archive' }
	];

	function isActive(name: string): boolean {
		const path = $page.url.pathname;
		if (name === 'home') return path === '/';
		return path.startsWith('/' + name);
	}
</script>

<div class="page-layout">
	<mdui-navigation-rail class="my-sidebar">
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="sidebar-header" onclick={() => goto('/about')} title="关于我">
			<mdui-avatar src="https://avatars.githubusercontent.com/u/195563565?v=4" size="large"></mdui-avatar>
		</div>

		{#each navItems as item}
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<mdui-navigation-rail-item
				icon={item.icon}
				value={item.name}
				active={isActive(item.name)}
				onclick={() => goto(item.path)}
			>
				{item.label}
			</mdui-navigation-rail-item>
		{/each}

	</mdui-navigation-rail>

	<div class="clock-corner">
		<Clock />
	</div>

	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.page-layout {
		display: flex;
		min-height: 100vh;
	}
	.my-sidebar {
		width: 80px;
		background-color: var(--bg-secondary);
		display: flex;
		flex-direction: column;
	}
	.sidebar-header {
		height: 64px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 16px;
		cursor: pointer;
	}
	.main-content {
		flex: 1;
		background-color: var(--bg-primary);
		overflow-y: auto;
	}
	.clock-corner {
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 200;
	}
</style>
