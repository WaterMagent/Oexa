import MarkdownIt from "markdown-it";
//#region src/lib/utils/markdown.ts
var md = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true
});
function renderMarkdown(content) {
	return md.render(content);
}
//#endregion
export { renderMarkdown as t };
