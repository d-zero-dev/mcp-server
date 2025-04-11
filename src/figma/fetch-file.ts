import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

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
		const json = await response.json();
		throw new McpError(
			ErrorCode.InternalError,
			`Figma API Error: ${response.status} ${response.statusText} ${json?.err ?? JSON.stringify(json)}`,
		);
	}

	return response.json();
}
