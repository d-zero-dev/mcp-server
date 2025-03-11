import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

// Figma API access token (from environment variable)
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

export type GetFigmaDataParams = {
	figma_url?: string;
};

/**
 * Get Figma data
 * @param args Parameters for getting Figma data
 */
export async function getFigmaData(args?: GetFigmaDataParams) {
	console.error('Starting Figma data retrieval');

	// Get data using Figma API
	if (!FIGMA_ACCESS_TOKEN) {
		return {
			content: [
				{
					type: 'text',
					text: 'Figma API access token is not set. Please set the FIGMA_ACCESS_TOKEN environment variable.',
				},
			],
			isError: true,
		};
	}

	if (!args?.figma_url) {
		throw new McpError(ErrorCode.InvalidParams, 'figma_url parameter is required');
	}

	const figmaUrl = args.figma_url;
	const fileId = extractFigmaFileId(figmaUrl);

	if (!fileId) {
		return {
			content: [
				{
					type: 'text',
					text: `Invalid Figma URL: ${figmaUrl} - Could not extract file ID. Please check the URL format.`,
				},
			],
			isError: true,
		};
	}

	console.error(`Retrieving Figma file: ${fileId}`);

	// Extract node IDs
	const nodeIds = extractNodeIds(figmaUrl);
	if (nodeIds.length > 0) {
		console.error(`Node IDs: ${nodeIds.join(', ')}`);
	}

	try {
		// When retrieving specific node information
		if (nodeIds.length > 0) {
			console.error('Retrieving node information only');
			try {
				const nodesData = await fetchFigmaNodes(FIGMA_ACCESS_TOKEN, fileId, nodeIds);

				console.error('Node information retrieved successfully');
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({ nodes: nodesData }, null, 2),
						},
					],
				};
			} catch (error) {
				console.error('Error retrieving node information:', error);
				return {
					content: [
						{
							type: 'text',
							text: analyzeFigmaError(error, {
								fileId,
								nodeId: nodeIds.join(','),
							}),
						},
					],
					isError: true,
				};
			}
		}

		// Retrieve entire file information
		console.error('Retrieving entire file information');
		try {
			const fileData = await fetchFigmaFile(FIGMA_ACCESS_TOKEN, fileId);

			console.error('File information retrieved successfully');
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({ file: fileData }, null, 2),
					},
				],
			};
		} catch (error) {
			console.error('Error retrieving file information:', error);
			return {
				content: [
					{
						type: 'text',
						text: analyzeFigmaError(error, { fileId }),
					},
				],
				isError: true,
			};
		}
	} catch (error) {
		console.error('Unexpected error while retrieving Figma data:', error);
		return {
			content: [
				{
					type: 'text',
					text: `An unexpected error occurred: ${
						error instanceof Error ? error.message : 'Unknown error'
					}`,
				},
			],
			isError: true,
		};
	}
}

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

/**
 * Extract file ID from Figma URL
 * @param url Figma file URL
 * @returns File ID or null (if URL is invalid)
 */
export function extractFigmaFileId(url: string): string | null {
	// Regular expression to extract file ID from Figma URL
	// Example 1: https://www.figma.com/file/abcdef123456/FileName
	// Example 2: https://www.figma.com/design/abcdef123456/FileName
	const fileMatch = url.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
	if (fileMatch && fileMatch[1]) {
		return fileMatch[1];
	}

	const designMatch = url.match(/figma\.com\/design\/([a-zA-Z0-9]+)/);
	return designMatch && designMatch[1] ? designMatch[1] : null;
}

/**
 * Extract node IDs from Figma URL
 * @param url Figma file URL
 * @returns Array of node IDs or empty array (if no node IDs specified)
 */
export function extractNodeIds(url: string): string[] {
	const nodeIdMatch = url.match(/node-id=([^&]+)/);
	if (nodeIdMatch && nodeIdMatch[1]) {
		return nodeIdMatch[1].split(',');
	}
	return [];
}

/**
 * Analyze Figma API error and return detailed error message
 * @param error Error object
 * @param context Additional context information about where the error occurred
 * @param context.fileId
 * @param context.nodeId
 * @returns Detailed error message
 */
export function analyzeFigmaError(
	error: unknown,
	context: { fileId?: string; nodeId?: string } = {},
): string {
	// Analyze Figma API error response
	if (error && typeof error === 'object') {
		// For Axios errors
		if ('response' in error && error.response) {
			const response = error.response as { status?: number; data?: unknown };
			const status = response.status;
			const data = response.data || {};
			const errorMessage =
				typeof data === 'object' && data !== null && 'message' in data
					? data.message
					: '';

			// Error messages based on status code
			switch (status) {
				case 400: {
					return `Invalid request: Request parameters are invalid. ${errorMessage}`;
				}
				case 401: {
					return 'API key is invalid or expired. Please check your FIGMA_ACCESS_TOKEN environment variable.';
				}
				case 403: {
					return `Access denied. You don't have permission to access this Figma file (${context.fileId}) or the file is private.`;
				}
				case 404: {
					if (context.nodeId) {
						return `Node (${context.nodeId}) not found. Please check the node ID.`;
					}
					return `File (${context.fileId}) not found. Please check the file ID.`;
				}
				case 429: {
					return 'API rate limit reached. Please wait and try again later.';
				}
				case 500:
				case 502:
				case 503:
				case 504: {
					return `Figma server error (${status}): Server is not responding or under maintenance.`;
				}
				default: {
					return `Figma API error (${status}): ${
						errorMessage || 'Unknown error details'
					}`;
				}
			}
		}

		// Timeout error
		if (
			'message' in error &&
			typeof error.message === 'string' &&
			error.message.includes('timeout')
		) {
			return 'Figma API request timed out. The file might be too large or there may be network connectivity issues.';
		}

		// Other errors
		if ('message' in error && typeof error.message === 'string') {
			return `Figma API error: ${error.message}`;
		}
	}

	// Unknown error
	return 'An unknown error occurred.';
}
