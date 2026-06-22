<script lang="ts">
	import { getSystemInfo, widgetCard, widgetCardEnd, widgetGrid, widgetGridEnd } from '$lib/utils/widget';

	let info = $state(getSystemInfo());

	$effect(() => {
		const id = setInterval(() => { info = getSystemInfo(); }, 1000);
		return () => clearInterval(id);
	});
</script>

{@html widgetGrid(3, '12px')}
	{@html widgetCard('平台', 'computer')}
		<mdui-chip variant="flat">{info.platform || '未知'}</mdui-chip>
	{@html widgetCardEnd()}

	{@html widgetCard('语言', 'language')}
		<mdui-chip variant="flat">{info.language || '未知'}</mdui-chip>
	{@html widgetCardEnd()}

	{@html widgetCard('屏幕', 'tune')}
		<mdui-chip variant="flat">{info.screen || '未知'}</mdui-chip>
	{@html widgetCardEnd()}
{@html widgetGridEnd()}
