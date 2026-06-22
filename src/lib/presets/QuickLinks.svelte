<script lang="ts">
	import { widgetCard, widgetCardEnd } from '$lib/utils/widget';
</script>

{@html widgetCard('快速导航', 'explore', 2)}
	<div style="display:flex;gap:8px;flex-wrap:wrap">
		<mdui-chip variant="flat" icon="article">最新文章</mdui-chip>
		<mdui-chip variant="flat" icon="archive">归档</mdui-chip>
		<mdui-chip variant="flat" icon="person">关于</mdui-chip>
	</div>
{@html widgetCardEnd()}
