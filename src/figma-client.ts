import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

export type ImageFormat = 'jpg' | 'png' | 'svg';

export type GetFigmaImageParams = {
	fileId: string;
	nodeId: string;
	format?: ImageFormat;
	scale?: number;
};

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
	if (!process.env.FIGMA_ACCESS_TOKEN) {
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
				const nodesData = await fetchFigmaNodes(
					process.env.FIGMA_ACCESS_TOKEN,
					fileId,
					nodeIds,
				);

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
				// Return the error without processing
				return {
					content: [
						{
							type: 'text',
							text: serializeError(error),
						},
					],
					isError: true,
				};
			}
		}

		// Retrieve entire file information
		console.error('Retrieving entire file information');
		try {
			const fileData = await fetchFigmaFile(process.env.FIGMA_ACCESS_TOKEN, fileId);

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
			// Return the error without processing
			return {
				content: [
					{
						type: 'text',
						text: serializeError(error),
					},
				],
				isError: true,
			};
		}
	} catch (error) {
		console.error('Unexpected error while retrieving Figma data:', error);
		// Return unexpected errors without processing as well
		return {
			content: [
				{
					type: 'text',
					text: serializeError(error),
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
 * Get Figma image URL for a specific node
 * @param params Parameters for getting Figma image
 * @returns Image URL
 */
export async function getFigmaImage(params: GetFigmaImageParams) {
	console.error('Starting Figma image retrieval');

	// Check if API token is set
	if (!process.env.FIGMA_ACCESS_TOKEN) {
		throw new McpError(ErrorCode.InvalidParams, 'Figma API access token is not set');
	}

	// Validate parameters
	if (!params.nodeId) {
		throw new McpError(ErrorCode.InvalidParams, 'nodeId parameter is required');
	}

	// Ensure fileId is a string (parts[0] is guaranteed to exist after the length check)
	const fileId = params.fileId;
	const nodeId = params.nodeId;
	const format = params.format || 'png';
	const scale = params.scale || 1;

	if (!fileId) {
		throw new McpError(
			ErrorCode.InvalidParams,
			`Invalid node ID: ${params.nodeId}. Could not extract file ID. Please check the node ID format.`,
		);
	}

	console.error(
		`Retrieving image for node: ${nodeId}, format: ${format}, scale: ${scale}`,
	);

	// Call Figma API to get image URL
	const imageData = await fetchFigmaImage(
		process.env.FIGMA_ACCESS_TOKEN,
		fileId,
		[nodeId],
		format,
		scale,
	);

	// Extract image URL from response
	const imageUrl = Object.values(imageData.images)?.[0];

	// Type guard to ensure imageUrl is a string
	if (typeof imageUrl !== 'string') {
		return {
			content: [
				{
					type: 'text',
					text: `No image URL found for node: ${nodeId}`,
				},
			],
			isError: true,
		};
	}

	// At this point, imageUrl is guaranteed to be a string
	const validImageUrl: string = imageUrl;
	console.error('Image URL retrieved successfully');
	return {
		content: [
			{
				type: 'text',
				text: validImageUrl,
			},
		],
	};
}

// Figma API response type for image URLs
export type FigmaImageResponse = {
	err: null | string;
	images: Record<string, string | undefined>;
};

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

/**
 * Serialize error object to a detailed string representation
 * This is needed because JSON.stringify(error) only returns "{}" for Error objects
 * @param error Any error object
 * @returns Detailed string representation of the error
 */
export function serializeError(error: unknown): string {
	// If it's not an object or null, just stringify it
	if (!error || typeof error !== 'object') {
		return JSON.stringify(error, null, 2);
	}

	// Create a detailed error representation
	const errorDetails: Record<string, unknown> = {};

	// Extract standard Error properties
	if (error instanceof Error) {
		errorDetails.name = error.name;
		errorDetails.message = error.message;
		errorDetails.stack = error.stack;

		// Extract cause if available
		if ('cause' in error && error.cause) {
			errorDetails.cause = error.cause;
		}
	}

	// Extract all enumerable properties
	for (const key in error) {
		if (Object.prototype.hasOwnProperty.call(error, key)) {
			try {
				const value = (error as Record<string, unknown>)[key];

				// Handle special case for response object
				if (key === 'response' && value && typeof value === 'object') {
					const response = value as Record<string, unknown>;
					errorDetails.response = {
						status: response.status,
						statusText: response.statusText,
						headers: response.headers,
						data: response.data,
					};
				} else {
					errorDetails[key] = value;
				}
			} catch (error_) {
				errorDetails[key] =
					`[Error extracting property: ${error_ instanceof Error ? error_.message : String(error_)}]`;
			}
		}
	}

	return JSON.stringify(errorDetails, null, 2);
}
