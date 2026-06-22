//#region src/posts/about.md?raw
var about_default = "---\ntitle: 关于我\ndate: 2026-06-21\ntype: page\nslug: about\n---\n\n# Hi, I'm Baumkuchen\n\n## 技术栈\n- SvelteKit + TypeScript\n- MDUI 组件库\n- 剩下的请自行查看源码\n\n## 联系我\n- GitHub: [KagurazakaShion](https://github.com/WaterMagent)\n- Email: <3846359425@qq.com>\n";
//#endregion
//#region src/posts/ai.md?raw
var ai_default = "---\ntitle: 测试文章3\ndate: 2026-06-22\ncategory: 笔记\n---\n\n## 这是第三篇测试文章\n\n### 特性列表\n\n- SvelteKit 文件路由\n- MDUI 暗色主题\n- Markdown 博客内容\n\n### 引用\n\n> 路漫漫其修远兮，吾将上下而求索。\n";
//#endregion
//#region src/posts/ai2.md?raw
var ai2_default = "---\ntitle: 测试文章4\ndate: 2026-06-22\ncategory: 技术\n---\n\n## 系统信息组件\n\n以下是一些 MDUI 组件的示例代码：\n\n```html\n<mdui-chip variant=\"flat\" icon=\"computer\">Linux</mdui-chip>\n<mdui-chip variant=\"flat\" icon=\"language\">zh-CN</mdui-chip>\n<mdui-chip variant=\"flat\" icon=\"tune\">1920x1080</mdui-chip>\n```\n\n## 进度条示例\n\n```\n<mdui-linear-progress indeterminate></mdui-linear-progress>\n```\n";
//#endregion
//#region src/posts/test.md?raw
var test_default = "---\ntitle: 测试文章\ndate: 2026-06-20\nupdated: 2026-06-22\ncategory: 技术\nbanner: https://picsum.photos/seed/test/800/240\n---\n\n# 这是我的第一篇博客\n\n## 为什么选 SvelteKit？\n因为它快\n\n## 为什么选 MDUI？\n因为好看\n";
//#endregion
//#region src/posts/test2.md?raw
var test2_default = "---\ntitle: 测试文章2\ndate: 2026-06-21\ncategory: 随笔\nbanner: https://cdn.luogu.com.cn/upload/image_hosting/ffn1aqvo.png\n---\n\n![image](https://cdn.luogu.com.cn/upload/image_hosting/kqf11z2g.png)\n[![image](https://cdn.luogu.com.cn/upload/image_hosting/ffn1aqvo.png)](https://www.luogu.com.cn)\n\n## 代码示例\n\n```javascript\nconsole.log('Hello, World!');\n```\n\n```python\ndef hello():\n    print(\"Hello, World!\")\n```\n";
//#endregion
//#region src/lib/utils/posts.ts
function parseFrontmatter(raw) {
	const attrs = {};
	let body = raw;
	const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
	if (match) {
		const frontmatter = match[1];
		body = raw.slice(match[0].length);
		for (const line of frontmatter.split("\n")) {
			const sep = line.indexOf(":");
			if (sep !== -1) {
				const key = line.slice(0, sep).trim();
				const val = line.slice(sep + 1).trim();
				if (key) attrs[key] = val;
			}
		}
	}
	return {
		attrs,
		body
	};
}
var mdModules = /* #__PURE__ */ Object.assign({
	"/src/posts/about.md": about_default,
	"/src/posts/ai.md": ai_default,
	"/src/posts/ai2.md": ai2_default,
	"/src/posts/test.md": test_default,
	"/src/posts/test2.md": test2_default
});
function parsePosts() {
	const result = [];
	for (const [path, raw] of Object.entries(mdModules)) {
		if (!raw || typeof raw !== "string") continue;
		const { attrs, body } = parseFrontmatter(raw);
		const fileName = path.split("/").pop()?.replace(".md", "") || "unknown";
		const meta = {
			title: attrs.title || fileName.replace(/-/g, " "),
			date: attrs.date || "",
			updated: attrs.updated || void 0,
			category: attrs.category || void 0,
			slug: attrs.slug || fileName,
			content: body,
			type: attrs.type || "post",
			banner: attrs.banner || void 0
		};
		result.push(meta);
	}
	return result;
}
var allModules = parsePosts();
var allPosts = allModules.filter((p) => p.type === "post").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
var pages = allModules.filter((p) => p.type === "page");
//#endregion
export { pages as n, allPosts as t };
