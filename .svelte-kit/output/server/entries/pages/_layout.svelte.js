import { S as escape_html, a as store_get, r as ensure_array_like, s as unsubscribe_stores, x as attr } from "../../chunks/server.js";
import { t as page } from "../../chunks/stores.js";
import "../../chunks/navigation.js";
import "mdui";
import "mdui/components/icon.js";
//#region src/lib/utils/widget.ts
var isBrowser = typeof navigator !== "undefined" && typeof window !== "undefined";
function getSystemInfo() {
	const now = /* @__PURE__ */ new Date();
	return {
		ua: isBrowser ? navigator.userAgent : "",
		platform: isBrowser ? navigator.platform : "",
		language: isBrowser ? navigator.language : "",
		screen: isBrowser ? `${window.screen.width}x${window.screen.height}` : "",
		time: now.toLocaleTimeString("zh-CN", { hour12: false }),
		date: now.toLocaleDateString("zh-CN")
	};
}
//#endregion
//#region src/lib/components/Clock.svelte
function Clock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let info = getSystemInfo();
		let dashOffset = 0;
		const circumference = 2 * Math.PI * 52;
		$$renderer.push(`<mdui-card class="clock-card svelte-13d36y"><div class="clock-face svelte-13d36y"><div class="digital-time svelte-13d36y"><span class="time svelte-13d36y">${escape_html(info.time)}</span> <span class="date svelte-13d36y">${escape_html(info.date)}</span></div> <svg class="progress-ring" width="120" height="120"><circle class="progress-ring__circle svelte-13d36y" stroke="#bb86fc" stroke-width="4" fill="transparent" r="52" cx="60" cy="60"${attr("stroke-dasharray", circumference)}${attr("stroke-dashoffset", dashOffset)}></circle></svg></div></mdui-card>`);
	});
}
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		const navItems = [
			{
				name: "home",
				label: "主页",
				icon: "watch_later--outlined",
				path: "/"
			},
			{
				name: "posts",
				label: "文章",
				icon: "image--outlined",
				path: "/posts"
			},
			{
				name: "archive",
				label: "归档",
				icon: "library_music--outlined",
				path: "/archive"
			}
		];
		function isActive(name) {
			const path = store_get($$store_subs ??= {}, "$page", page).url.pathname;
			if (name === "home") return path === "/";
			return path.startsWith("/" + name);
		}
		$$renderer.push(`<div class="page-layout svelte-12qhfyh"><mdui-navigation-rail class="my-sidebar svelte-12qhfyh"><div class="sidebar-header svelte-12qhfyh" title="关于我"><mdui-avatar src="https://avatars.githubusercontent.com/u/195563565?v=4" size="large"></mdui-avatar></div> <!--[-->`);
		const each_array = ensure_array_like(navItems);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			$$renderer.push(`<mdui-navigation-rail-item${attr("icon", item.icon)}${attr("value", item.name)}${attr("active", isActive(item.name))}>${escape_html(item.label)}</mdui-navigation-rail-item>`);
		}
		$$renderer.push(`<!--]--></mdui-navigation-rail> <div class="clock-corner svelte-12qhfyh">`);
		Clock($$renderer, {});
		$$renderer.push(`<!----></div> <main class="main-content svelte-12qhfyh">`);
		children($$renderer);
		$$renderer.push(`<!----></main></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _layout as default };
