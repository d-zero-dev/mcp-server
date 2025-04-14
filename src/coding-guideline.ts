const guidelines = {
	general: [
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/index.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/naming.md',
	],
	media: [
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/media.md',
	],
	html: [
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/html.md',
	],
	css: [
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/css.md',
	],
	js: [
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/js.md',
	],
	'web-components': [
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/html.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/js.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-env/refs/heads/dev/packages/%40d-zero/custom-components/src/hamburger-menu.mdx',
	],
} as const;

/**
 * @param techTypes
 */
export async function getCodingGuidelines(
	techTypes: 'html' | 'css' | 'js' | 'media' | 'web-components',
) {
	const urls = [...guidelines.general, ...guidelines[techTypes]];

	const contents = await Promise.all(
		urls.map(async (url) => {
			const res = await fetch(url);
			const text = await res.text();
			return text;
		}),
	);

	return contents.join('\n\n---\n\n');
}
