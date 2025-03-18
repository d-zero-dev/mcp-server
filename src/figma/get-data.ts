import type { GetFigmaDataParams } from './types.js';

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { extractFigmaFileId } from './extract-file-id.js';
import { extractNodeIds } from './extract-node-ids.js';
import { fetchFigmaFile } from './fetch-file.js';
import { fetchFigmaNodes } from './fetch-nodes.js';
import { serializeError } from './serialize-error.js';

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
