import type { GetFigmaImageParams } from './types.js';

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { fetchFigmaImage } from './fetch-image.js';

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
		throw new McpError(ErrorCode.InternalError, `No image URL found for node: ${nodeId}`);
	}

	// At this point, imageUrl is guaranteed to be a string
	const validImageUrl: string = imageUrl;
	console.log('Image URL retrieved successfully');

	return {
		content: [
			{
				type: 'text',
				text: validImageUrl,
			},
		],
	};
}
