import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

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
		const json = await response.json();
		throw new McpError(
			ErrorCode.InternalError,
			`Figma API Error: ${response.status} ${response.statusText} ${json?.err ?? JSON.stringify(json)}`,
		);
	}

	return response.json();
}
