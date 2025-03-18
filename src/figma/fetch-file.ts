/**
 * Directly call Figma API to get file data
 * @param apiKey Figma API key
 * @param fileId File ID
 * @returns File data
 */
export async function fetchFigmaFile(apiKey: string, fileId: string): Promise<unknown> {
	const response = await fetch(`https://api.figma.com/v1/files/${fileId}`, {
		headers: {
			'X-FIGMA-TOKEN': apiKey,
		},
	});

	if (!response.ok) {
		throw new Error(`Figma API Error: ${response.status} ${response.statusText}`);
	}

	return response.json();
}
