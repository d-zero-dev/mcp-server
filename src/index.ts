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
import { getFigmaData } from './figma-client.js';

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
		// Map of tool names and their corresponding handlers
		const toolHandlers = {
			get_coding_guidelines: getCodingGuidelines,
			get_figma_data: getFigmaData,
		} as const;

		// Tool request handler
		this.#server.setRequestHandler(CallToolRequestSchema, async (request) => {
			const handler = toolHandlers[request.params.name as keyof typeof toolHandlers];

			if (!handler) {
				throw new McpError(
					ErrorCode.MethodNotFound,
					`Unknown tool: ${request.params.name}`,
				);
			}

			return handler(request.params.arguments);
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
			],
		}));
	}
}

const server = new CodingGuidelinesServer();
server.run().catch(console.error);
