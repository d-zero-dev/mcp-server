import type { GetFigmaDataParams } from './types.js';

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { extractFigmaFileId } from './extract-file-id.js';
import { extractNodeIds } from './extract-node-ids.js';
import { fetchFigmaFile } from './fetch-file.js';
import { fetchFigmaNodes } from './fetch-nodes.js';

/**
 * Get Figma data
 * @param args Parameters for getting Figma data
 * @param args.figma_url
 */
export async function getFigmaData({ figma_url }: GetFigmaDataParams) {
	// Get data using Figma API
	if (!process.env.FIGMA_ACCESS_TOKEN) {
		throw new McpError(
			ErrorCode.InvalidParams,
			'Figma API access token is not set. Please set the FIGMA_ACCESS_TOKEN environment variable.',
		);
	}

	const fileId = extractFigmaFileId(figma_url);

	if (!fileId) {
		throw new McpError(
			ErrorCode.InvalidParams,
			`Invalid Figma URL: ${figma_url} - Could not extract file ID. Please check the URL format.`,
		);
	}

	// Extract node IDs
	const nodeIds = extractNodeIds(figma_url);

	try {
		const nodesData =
			nodeIds.length > 0
				? await fetchFigmaNodes(process.env.FIGMA_ACCESS_TOKEN, fileId, nodeIds)
				: await fetchFigmaFile(process.env.FIGMA_ACCESS_TOKEN, fileId);

		const cacheDir = path.join(os.tmpdir(), 'd-zero-dev', 'mcp-server', 'figma-data');
		await fs.mkdir(cacheDir, { recursive: true });
		const fileName = `${fileId}-${crypto.randomUUID()}.json`;
		const filePath = path.join(cacheDir, fileName);
		const content = JSON.stringify(nodesData, null, 2);
		await fs.writeFile(filePath, content);

		return {
			filePath,
			content,
		};
	} catch (error) {
		throw new McpError(
			ErrorCode.InternalError,
			'Error retrieving node information:',
			error,
		);
	}
}
