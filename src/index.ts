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

const packageJsonPath = path.resolve(import.meta.dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version || 'N/A';

const guidelines = [
	'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/index.md',
	'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/naming.md',
	'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/media.md',
	'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/html.md',
	'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/css.md',
	'https://raw.githubusercontent.com/d-zero-dev/frontend-guidelines/refs/heads/dev/src/js.md',
];

class CodingGuidelinesServer {
	#server: Server;

	constructor() {
		this.#server = new Server(
			{
				name: 'coding_guidelines',
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
		console.error('Coding Guidelines MCP server running on stdio');
	}
	setupToolHandlers() {
		this.#server.setRequestHandler(CallToolRequestSchema, async (request) => {
			if (request.params.name !== 'get_coding_guidelines') {
				throw new McpError(
					ErrorCode.MethodNotFound,
					`Unknown tool: ${request.params.name}`,
				);
			}

			try {
				const contents = await Promise.all(
					guidelines.map(async (url) => {
						const res = await fetch(url);
						const text = await res.text();
						return text;
					}),
				);

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(contents, null, 2),
						},
					],
				};
			} catch (error: unknown) {
				if (error instanceof Error) {
					return {
						content: [
							{
								type: 'text',
								text: `Failed to read the coding guidelines file: ${error.message}`,
							},
						],
						isError: true,
					};
				}
				throw error;
			}
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
			],
		}));
	}
}

const server = new CodingGuidelinesServer();
server.run().catch(console.error);
