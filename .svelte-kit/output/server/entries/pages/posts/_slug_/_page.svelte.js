import { S as escape_html, a as store_get, l as html, n as derived, o as stringify, r as ensure_array_like, s as unsubscribe_stores, t as attr_class, x as attr } from "../../../../chunks/server.js";
import { t as page } from "../../../../chunks/stores.js";
import { t as allPosts } from "../../../../chunks/posts.js";
import { t as renderMarkdown } from "../../../../chunks/markdown.js";
//#region src/lib/components/ArticleToc.svelte
function ArticleToc($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { containerSelector } = $$props;
		let headings = [];
		$$renderer.push(`<div class="toc-container svelte-liyg1o"><h3 class="toc-title svelte-liyg1o">目录</h3> `);
		if (headings.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<mdui-list class="toc-list svelte-liyg1o"><!--[-->`);
			const each_array = ensure_array_like(headings);
			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let heading = each_array[index];
				$$renderer.push(`<mdui-list-item${attr_class(`toc-item level-${stringify(heading.level)}`, "svelte-liyg1o")}${attr("data-id", heading.id)}>${escape_html(heading.text)}</mdui-list-item>`);
			}
			$$renderer.push(`<!--]--></mdui-list>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="toc-empty svelte-liyg1o">暂无目录</div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
//#region src/routes/posts/[slug]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const slug = derived(() => store_get($$store_subs ??= {}, "$page", page).params.slug);
		const currentPost = derived(() => allPosts.find((p) => p.slug === slug()));
		if (currentPost()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<mdui-button variant="text" icon="arrow_back" class="back-btn-fixed svelte-14u6r3i">返回</mdui-button> <article class="post-article svelte-14u6r3i">`);
			if (currentPost().banner) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="banner-wrapper svelte-14u6r3i"><img${attr("src", currentPost().banner)} alt="banner" class="post-banner svelte-14u6r3i"/></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <h1 class="post-title svelte-14u6r3i">${escape_html(currentPost().title)}</h1> <div class="post-meta svelte-14u6r3i"><span>发布于 ${escape_html(currentPost().date)}</span> `);
			if (currentPost().updated) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span>· 更新于 ${escape_html(currentPost().updated)}</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (currentPost().category) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<mdui-chip variant="flat">${escape_html(currentPost().category)}</mdui-chip>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="post-content svelte-14u6r3i">${html(renderMarkdown(currentPost().content))}</div></article> `);
			ArticleToc($$renderer, { containerSelector: ".post-content" });
			$$renderer.push(`<!----> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="loading svelte-14u6r3i">文章未找到</div>`);
		}
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
