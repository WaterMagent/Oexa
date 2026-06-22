import { S as escape_html, n as derived, r as ensure_array_like, x as attr } from "../../../chunks/server.js";
import "../../../chunks/navigation.js";
import { t as allPosts } from "../../../chunks/posts.js";
//#region src/routes/posts/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let searchQuery = "";
		let currentPage = 1;
		const pageSize = 5;
		const filteredPosts = derived(() => allPosts);
		const totalPages = derived(() => Math.ceil(filteredPosts().length / pageSize));
		const paginatedPosts = derived(() => filteredPosts().slice((currentPage - 1) * pageSize, currentPage * pageSize));
		$$renderer.push(`<div class="home-container svelte-lvfn04"><h1>所有文章</h1> <mdui-text-field class="search-bar svelte-lvfn04" variant="outlined" placeholder="搜索标题、日期、分类…" icon="search"${attr("value", searchQuery)}></mdui-text-field> <div class="post-grid svelte-lvfn04"><!--[-->`);
		const each_array = ensure_array_like(paginatedPosts());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let post = each_array[$$index];
			$$renderer.push(`<mdui-card variant="elevated" class="post-card svelte-lvfn04">`);
			if (post.banner) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="card-banner svelte-lvfn04"><img${attr("src", post.banner)}${attr("alt", post.title)} class="svelte-lvfn04"/></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="card-content svelte-lvfn04"><h2>${escape_html(post.title)}</h2> <p class="date svelte-lvfn04">${escape_html(post.date)}</p> `);
			if (post.category) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<mdui-chip variant="flat" class="card-category">${escape_html(post.category)}</mdui-chip>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <p class="excerpt">点击查看详情...</p></div></mdui-card>`);
		}
		$$renderer.push(`<!--]--> `);
		if (paginatedPosts().length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="no-results svelte-lvfn04">没有找到匹配的文章</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (totalPages() > 1) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="pagination svelte-lvfn04"><mdui-button variant="text"${attr("disabled", true, true)}>上一页</mdui-button> <span>第 ${escape_html(currentPage)} / ${escape_html(totalPages())} 页</span> <mdui-button variant="text"${attr("disabled", currentPage === totalPages(), true)}>下一页</mdui-button></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
