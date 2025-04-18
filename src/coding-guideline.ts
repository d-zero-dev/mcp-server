const guidelines = {
	general: [
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/text-files.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/naming/index.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/naming/principles.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/naming/structure.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/naming/abbreviation.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/naming/consistency.md',
	],
	html: [
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/html/style.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/html/doctype.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/html/meta.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/html/links.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/html/components.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/html/elements.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/html/ids.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/html/accessibility.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/html/interactions.md',
	],
	css: [
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/css/builder.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/css/structure.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/css/ids.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/css/rules.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/css/selectors.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/css/order.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/css/variables.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/css/values.md',
	],
	media: [
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/media/index.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/media/image.md',
	],
	js: [
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/js/structure.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/js/loading.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/js/development.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/js/interactions.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/js/libraries.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/js/no-style-attr.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/js/performance.md',
	],
	'web-components': [
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/js/development.md',
		'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/js/libraries.md',
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
