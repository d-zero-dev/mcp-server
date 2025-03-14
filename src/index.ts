import type { ImageFormat } from './figma-client.js';

import fs from 'node:fs';
import path from 'node:path';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ErrorCode,
	ListToolsRequestSchema,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { getCodingGuidelines } from './coding-guideline.js';
import { getFigmaData, getFigmaImage } from './figma-client.js';

const packageJsonPath = path.resolve(import.meta.dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version || 'N/A';

class CodingGuidelinesServer {
	#server: Server;

	constructor() {
		this.#server = new Server(
			{
				name: 'frontend_env',
				version,
			},
			{
				capabilities: {
					tools: {},
				},
			},
		);

		this.setupToolHandlers();

		// Error handling
		this.#server.onerror = (error) => console.error('[MCP Error]', error);
		process.on('SIGINT', async () => {
			await this.#server.close();
			process.exit(0);
		});
	}

	async run() {
		const transport = new StdioServerTransport();
		await this.#server.connect(transport);
		console.error('D-ZERO Frontend Dev Env MCP server running on stdio');
	}

	setupToolHandlers() {
		// Tool request handler
		this.#server.setRequestHandler(CallToolRequestSchema, async (request) => {
			const toolName = request.params.name;

			// Handle each tool separately to ensure correct typing
			switch (toolName) {
				case 'get_coding_guidelines': {
					// getCodingGuidelines doesn't take any arguments
					return getCodingGuidelines();
				}
				case 'get_figma_data': {
					return getFigmaData(request.params.arguments);
				}
				case 'get_figma_image': {
					// Type assertion for getFigmaImage
					if (!request.params.arguments) {
						throw new McpError(
							ErrorCode.InvalidParams,
							'Arguments are required for get_figma_image',
						);
					}

					// Convert arguments to GetFigmaImageParams
					const args = request.params.arguments;
					return getFigmaImage({
						fileId: args.fileId as string,
						nodeId: args.nodeId as string,
						format: args.format as ImageFormat | undefined,
						scale: args.scale as number | undefined,
					});
				}
				// No default
			}

			throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
		});

		this.#server.setRequestHandler(ListToolsRequestSchema, () => ({
			tools: [
				{
					name: 'get_coding_guidelines',
					description: 'Get D-Zero frontend coding guidelines',
					inputSchema: {
						type: 'object',
						properties: {},
						required: [],
					},
				},
				{
					name: 'get_figma_data',
					description: 'Get data from Figma URL',
					inputSchema: {
						type: 'object',
						properties: {
							figma_url: {
								type: 'string',
								description:
									'Figma URL (e.g.: https://www.figma.com/file/abcdef123456/FileName)',
							},
						},
						required: ['figma_url'],
					},
				},
				{
					name: 'get_figma_image',
					description: 'Get image URL from Figma node ID',
					inputSchema: {
						type: 'object',
						properties: {
							fileId: {
								type: 'string',
								description: 'Figma file ID (e.g.: abcdef123456)',
							},
							nodeId: {
								type: 'string',
								description: 'Figma node ID (e.g.: 123:456)',
							},
							format: {
								type: 'string',
								enum: ['png', 'jpg', 'svg'],
								description: 'Image format (default: png)',
							},
							scale: {
								type: 'number',
								minimum: 1,
								maximum: 4,
								description: 'Image scale factor (1-4, default: 1)',
							},
						},
						required: ['fileId', 'nodeId'],
					},
				},
			],
		}));
	}
}

const server = new CodingGuidelinesServer();
server.run().catch(console.error);
