import { l as html, n as derived } from "../../../chunks/server.js";
import { n as pages } from "../../../chunks/posts.js";
import { t as renderMarkdown } from "../../../chunks/markdown.js";
//#region src/routes/about/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const aboutPage = derived(() => pages.find((p) => p.slug === "about"));
		$$renderer.push(`<div class="about-container svelte-cwls5q">`);
		if (aboutPage()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="post-content svelte-cwls5q">${html(renderMarkdown(aboutPage().content))}</div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p style="color: #f44336;">未找到关于页面</p>`);
		}
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { _page as default };
