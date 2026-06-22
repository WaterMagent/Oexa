export interface PostMeta {
	title: string;
	date: string;
	updated?: string;
	category?: string;
	slug: string;
	content: string;
	type: 'post' | 'page';
	banner?: string;
}

function parseFrontmatter(raw: string): {
	attrs: Record<string, string>;
	body: string;
} {
	const attrs: Record<string, string> = {};
	let body = raw;

	const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
	if (match) {
		const frontmatter = match[1];
		body = raw.slice(match[0].length);
		for (const line of frontmatter.split('\n')) {
			const sep = line.indexOf(':');
			if (sep !== -1) {
				const key = line.slice(0, sep).trim();
				const val = line.slice(sep + 1).trim();
				if (key) attrs[key] = val;
			}
		}
	}

	return { attrs, body };
}

const mdModules = import.meta.glob('/src/posts/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

function parsePosts(): PostMeta[] {
	const result: PostMeta[] = [];

	for (const [path, raw] of Object.entries(mdModules)) {
		if (!raw || typeof raw !== 'string') continue;

		const { attrs, body } = parseFrontmatter(raw);
		const fileName = path.split('/').pop()?.replace('.md', '') || 'unknown';

		const meta: PostMeta = {
			title: attrs.title || fileName.replace(/-/g, ' '),
			date: attrs.date || '',
			updated: attrs.updated || undefined,
			category: attrs.category || undefined,
			slug: attrs.slug || fileName,
			content: body,
			type: (attrs.type as 'post' | 'page') || 'post',
			banner: attrs.banner || undefined
		};

		result.push(meta);
	}

	return result;
}

const allModules = parsePosts();

export const allPosts = allModules
	.filter((p) => p.type === 'post')
	.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const pages = allModules.filter((p) => p.type === 'page');
