export interface SystemInfo {
	ua: string;
	platform: string;
	language: string;
	screen: string;
	time: string;
	date: string;
}

const isBrowser = typeof navigator !== 'undefined' && typeof window !== 'undefined';

export function getSystemInfo(): SystemInfo {
	const now = new Date();
	return {
		ua: isBrowser ? navigator.userAgent : '',
		platform: isBrowser ? navigator.platform : '',
		language: isBrowser ? navigator.language : '',
		screen: isBrowser ? `${window.screen.width}x${window.screen.height}` : '',
		time: now.toLocaleTimeString('zh-CN', { hour12: false }),
		date: now.toLocaleDateString('zh-CN')
	};
}

export function widgetGrid(cols = 2, gap = '16px'): string {
	return `<div class="widget-grid" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${gap};width:100%">`;
}

export function widgetGridEnd(): string {
	return '</div>';
}

export function widgetCard(title?: string, icon?: string, colspan?: number): string {
	const colStyle = colspan ? `grid-column:span ${colspan}` : '';
	const header = title
		? `<div class="widget-header" style="display:flex;align-items:center;gap:8px;margin-bottom:4px">${icon ? `<mdui-icon name="${icon}" style="color:#bb86fc"></mdui-icon>` : ''}<span style="font-weight:600;font-size:0.9rem;color:var(--text-primary)">${title}</span></div>`
		: '';
	return `<mdui-card variant="elevated" style="padding:16px;display:flex;flex-direction:column;gap:8px;${colStyle}">${header}`;
}

export function widgetCardEnd(): string {
	return '</mdui-card>';
}
