import fs from 'node:fs';
import path from 'node:path';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { getCodingGuidelines } from './coding-guideline.js';
import { getFigmaData } from './figma/get-data.js';
import { getFigmaImage } from './figma/get-image.js';
import { getTaskStep } from './utils/get-task-step.js';

const packageJsonPath = path.resolve(import.meta.dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version || 'N/A';

const server = new McpServer({
	name: 'frontend_env',
	version,
});

server.tool(
	'get_coding_guidelines',
	'Get D-Zero frontend coding guidelines',
	{
		techTypes: z
			.enum(['html', 'css', 'js', 'media', 'web-components'])
			.describe(
				'Will create a coding guideline for the following tech types: html, css, js, media (images, videos, audio, etc.), web-components',
			),
	},
	async ({ techTypes }) => {
		const content = await getCodingGuidelines(techTypes);
		return {
			content: [
				{
					type: 'text',
					text: content,
				},
			],
		};
	},
);

server.tool(
	'get_task_step',
	'Get task step',
	{
		cwd: z.string().describe('Current working directory (Absolute path)'),
		filePath: z.string().describe('Task file path (Relative to cwd)'),
		step: z.optional(z.number().min(1).int()).describe('Step number (default: 1)'),
	},
	async ({ cwd, filePath, step }) => {
		const content = await getTaskStep(
			path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath),
			step,
		);
		return {
			content: [
				{
					type: 'text',
					text: content,
				},
			],
		};
	},
);

server.tool(
	'get_figma_data',
	'Get data as a cached JSON file path and content from Figma URL',
	{
		figmaUrl: z
			.string()
			.describe('Figma URL (e.g.: https://www.figma.com/file/abcdef123456/FileName)'),
	},
	async ({ figmaUrl }) => {
		const { content } = await getFigmaData({ figma_url: figmaUrl });
		return {
			content: [
				{
					type: 'text',
					text: content,
				},
			],
		};
	},
);

server.tool(
	'get_figma_image',
	'Get image URL from Figma node ID',
	{
		fileId: z.string().describe('Figma file ID (e.g.: abcdef123456)'),
		nodeId: z.string().describe('Figma node ID (e.g.: 123:456)'),
		format: z
			.optional(z.enum(['png', 'jpg', 'svg']))
			.describe('Image format (default: png)'),
		scale: z
			.optional(z.number().min(1).max(4))
			.describe('Image scale factor (1-4, default: 1)'),
	},
	async ({ fileId, nodeId, format, scale }) => {
		const res = await getFigmaImage({ fileId, nodeId, format, scale });
		return {
			content: res.content.map((content) => {
				return {
					type: 'text',
					text: content.text,
				};
			}),
		};
	},
);

const transport = new StdioServerTransport();
await server.connect(transport);
