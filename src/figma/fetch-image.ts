import type { FigmaImageResponse, ImageFormat } from './types.js';

/**
 * Directly call Figma API to get image URLs
 * @param apiKey Figma API key
 * @param fileId File ID
 * @param nodeIds Array of node IDs
 * @param format Image format (png, jpg, svg)
 * @param scale Image scale (1-4)
 * @returns Image data with URLs
 */
export async function fetchFigmaImage(
	apiKey: string,
	fileId: string,
	nodeIds: string[],
	format: ImageFormat = 'png',
	scale: number = 1,
): Promise<FigmaImageResponse> {
	const url = `https://api.figma.com/v1/images/${fileId}?ids=${nodeIds.join(',')}&format=${format}&scale=${scale}`;
	const response = await fetch(url, {
		headers: {
			'X-FIGMA-TOKEN': apiKey,
		},
	});

	if (!response.ok) {
		throw new Error(
			`Figma API Error: ${response.status} ${response.statusText} on URL: ${url}`,
		);
	}

	return response.json();
}
