/**
 * Array of URLs pointing to various frontend coding guidelines.
 * Each URL fetches a raw Markdown file from the D-Zero development repository.
 * @type {string[]} Array of URL strings
 */
const guidelines = [
	'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/index.md',
	'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/naming.md',
	'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/media.md',
	'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/html.md',
	'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/css.md',
	'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/js.md',
];

/**
 * Fetches coding guidelines from a list of URLs and returns them as a single text document.
 * @returns An object containing the compiled coding guidelines content.
 *   - content: Array of content objects, where each object has:
 *     - type: The type of content ('text')
 *     - text: The concatenated text of all guidelines, separated by dividers
 *   - isError: Present only when an error occurs
 */
export async function getCodingGuidelines() {
	try {
		const contents = await Promise.all(
			guidelines.map(async (url) => {
				const res = await fetch(url);
				const text = await res.text();
				return text;
			}),
		);

		return {
			content: [
				{
					type: 'text',
					text: contents.join('\n\n---\n\n'),
				},
			],
		};
	} catch (error: unknown) {
		if (error instanceof Error) {
			return {
				content: [
					{
						type: 'text',
						text: `Failed to read the coding guidelines file: ${error.message}`,
					},
				],
				isError: true,
			};
		}
		throw error;
	}
}
