import type { ImageFormat } from './types.js';

import dotenv from 'dotenv';
import { describe, it, expect, beforeAll } from 'vitest';

import { extractFigmaFileId } from './extract-file-id.js';
import { extractNodeIds } from './extract-node-ids.js';
import { getFigmaImage } from './get-image.js';

// Load .env file before running tests
beforeAll(() => {
	// Load .env file
	dotenv.config();
});

describe('getFigmaImage', () => {
	describe('Error cases', () => {
		it('should throw error when using getFigmaImage with invalid params', async () => {
			// Arrange
			const fileId = 'invalid-file-id';
			const nodeId = 'invalid-node-id';
			const format: ImageFormat = 'png';
			const scale = 1;
			const params = { fileId, nodeId, format, scale };

			// Assert
			await expect(getFigmaImage(params)).rejects.toThrowError();
		});
	});

	describe('Success cases', () => {
		it('should successfully get image URL using getFigmaImage with valid token', async () => {
			// Arrange
			const figmaUrl =
				process.env.FIGMA_TEST_URL ??
				'https://www.figma.com/file/abc123/test?node-id=123-456';
			const fileId = extractFigmaFileId(figmaUrl) ?? 'abc123';
			const nodeIds = extractNodeIds(figmaUrl);
			const nodeId = nodeIds[0] ?? '123-456';
			const format: ImageFormat = 'png';
			const scale = 1;
			const params = { fileId, nodeId, format, scale };

			// Act
			const result = await getFigmaImage(params);

			// Assert
			expect(result).toBeDefined();
			expect(result.isError).toBeUndefined();
			expect(result.content).toBeDefined();
			expect(result.content?.length).toBeGreaterThan(0);
			expect(result.content?.[0]?.text).toBeDefined();
			expect(typeof result.content?.[0]?.text).toBe('string');
			expect(result.content?.[0]?.text?.length).toBeGreaterThan(0);
			expect(result.content?.[0]?.text.startsWith('https://figma')).toBe(true);
		});
	});
});
