import { S as escape_html, n as derived, r as ensure_array_like, x as attr } from "../../chunks/server.js";
import "../../chunks/navigation.js";
import { t as allPosts } from "../../chunks/posts.js";
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const recentPosts = derived(() => allPosts.slice(0, 3));
		$$renderer.push(`<div class="welcome-container svelte-1uha8ag"><div class="hero-section svelte-1uha8ag"><h1>欢迎来到 Baumkuchen 的博客</h1> <p>没有要写的</p></div> <div class="recent-posts svelte-1uha8ag"><h2 class="svelte-1uha8ag">最近更新</h2> <div class="post-list svelte-1uha8ag"><!--[-->`);
		const each_array = ensure_array_like(recentPosts());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let post = each_array[$$index];
			$$renderer.push(`<mdui-card variant="outlined" class="recent-card svelte-1uha8ag">`);
			if (post.banner) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="recent-banner svelte-1uha8ag"><img${attr("src", post.banner)}${attr("alt", post.title)} class="svelte-1uha8ag"/></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="card-content svelte-1uha8ag"><h3 class="svelte-1uha8ag">${escape_html(post.title)}</h3> <p class="date svelte-1uha8ag">${escape_html(post.date)}</p></div></mdui-card>`);
		}
		$$renderer.push(`<!--]--></div> <div style="margin-top: 20px; text-align: center;"><mdui-button variant="text">查看所有文章 →</mdui-button></div></div></div>`);
	});
}
//#endregion
export { _page as default };
