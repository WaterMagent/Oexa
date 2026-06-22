import { S as escape_html, n as derived, r as ensure_array_like } from "../../../chunks/server.js";
import "../../../chunks/navigation.js";
import { t as allPosts } from "../../../chunks/posts.js";
//#region src/routes/archive/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const groupedPosts = derived(() => {
			const groups = {};
			allPosts.forEach((post) => {
				const year = post.date.split("-")[0];
				if (!groups[year]) groups[year] = [];
				groups[year].push(post);
			});
			return groups;
		});
		function formatDate(dateStr) {
			if (!dateStr) return "";
			const parts = dateStr.split("-");
			return `${parts[1]}月${parts[2]}日`;
		}
		$$renderer.push(`<div class="archive-container svelte-1d6nxft"><h1>文章归档</h1> <div class="timeline"><!--[-->`);
		const each_array = ensure_array_like(Object.entries(groupedPosts()));
		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let [year, posts] = each_array[$$index_1];
			$$renderer.push(`<div class="year-section svelte-1d6nxft"><div class="year-title svelte-1d6nxft">${escape_html(year)}</div> <div class="posts-list svelte-1d6nxft"><!--[-->`);
			const each_array_1 = ensure_array_like(posts);
			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let post = each_array_1[$$index];
				$$renderer.push(`<div class="timeline-item svelte-1d6nxft"><div class="axis-node svelte-1d6nxft"><div class="dot svelte-1d6nxft"></div></div> <div class="card svelte-1d6nxft"><span class="date svelte-1d6nxft">${escape_html(formatDate(post.date))}</span> <h3 class="svelte-1d6nxft">${escape_html(post.title)}</h3></div></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
	});
}
//#endregion
export { _page as default };
