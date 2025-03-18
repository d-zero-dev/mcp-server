/**
 * Directly call Figma API to get node data
 * @param apiKey Figma API key
 * @param fileId File ID
 * @param nodeIds Array of node IDs
 * @returns Node data
 */
export async function fetchFigmaNodes(
	apiKey: string,
	fileId: string,
	nodeIds: string[],
): Promise<unknown> {
	const response = await fetch(
		`https://api.figma.com/v1/files/${fileId}/nodes?ids=${nodeIds.join(',')}`,
		{
			headers: {
				'X-FIGMA-TOKEN': apiKey,
			},
		},
	);

	if (!response.ok) {
		throw new Error(`Figma API Error: ${response.status} ${response.statusText}`);
	}

	return response.json();
}
