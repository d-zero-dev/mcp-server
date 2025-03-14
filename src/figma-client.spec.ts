import type { ImageFormat } from './figma-client.js';

import dotenv from 'dotenv';
import { describe, it, expect, beforeAll } from 'vitest';

import {
	extractFigmaFileId,
	extractNodeIds,
	analyzeFigmaError,
	fetchFigmaFile,
	fetchFigmaNodes,
	fetchFigmaImage,
	getFigmaImage,
} from './figma-client.js';

// Load .env file before running tests
beforeAll(() => {
	// Load .env file
	dotenv.config();
});

describe('Figma Client', () => {
	describe('extractFigmaFileId', () => {
		it('should extract file ID from file URL correctly', () => {
			const url = 'https://www.figma.com/file/abc123/FileName';
			expect(extractFigmaFileId(url)).toBe('abc123');
		});

		it('should extract file ID from design URL correctly', () => {
			const url = 'https://www.figma.com/design/def456/FileName';
			expect(extractFigmaFileId(url)).toBe('def456');
		});

		it('should return null for invalid URL', () => {
			const url = 'https://www.example.com';
			expect(extractFigmaFileId(url)).toBeNull();
		});
	});

	describe('extractNodeIds', () => {
		it('should extract node ID from URL correctly', () => {
			const url = 'https://www.figma.com/file/abc123/FileName?node-id=123-456';
			expect(extractNodeIds(url)).toEqual(['123-456']);
		});

		it('should extract multiple node IDs correctly', () => {
			const url = 'https://www.figma.com/file/abc123/FileName?node-id=123-456,789-012';
			expect(extractNodeIds(url)).toEqual(['123-456', '789-012']);
		});

		it('should return empty array when no node IDs are present', () => {
			const url = 'https://www.figma.com/file/abc123/FileName';
			expect(extractNodeIds(url)).toEqual([]);
		});
	});

	describe('analyzeFigmaError', () => {
		it('should correctly analyze 401 error', () => {
			const error = {
				response: {
					status: 401,
					data: { message: 'Unauthorized' },
				},
			};
			expect(analyzeFigmaError(error)).toContain(
				'API key is invalid or expired. Please check your FIGMA_ACCESS_TOKEN environment variable.',
			);
		});

		it('should correctly analyze 404 error (file)', () => {
			const error = {
				response: {
					status: 404,
					data: { message: 'Not Found' },
				},
			};
			const context = { fileId: 'abc123' };
			expect(analyzeFigmaError(error, context)).toContain(
				'File (abc123) not found. Please check the file ID.',
			);
		});

		it('should correctly analyze 404 error (node)', () => {
			const error = {
				response: {
					status: 404,
					data: { message: 'Not Found' },
				},
			};
			const context = { fileId: 'abc123', nodeId: '123-456' };
			expect(analyzeFigmaError(error, context)).toContain(
				'Node (123-456) not found. Please check the node ID.',
			);
		});

		it('should correctly analyze timeout error', () => {
			const error = {
				message: 'timeout of 30000ms exceeded',
			};
			expect(analyzeFigmaError(error)).toContain(
				'Figma API request timed out. The file might be too large or there may be network connectivity issues.',
			);
		});
	});

	describe('Figma API Integration Tests', () => {
		// 異常系テスト
		describe('Error cases', () => {
			it('should throw error when fetching image URL for a node with invalid API key', async () => {
				// Arrange
				const apiKey = 'invalid-api-key';
				const fileId = 'test-file-id';
				const nodeIds = ['test-node-id'];
				const format: ImageFormat = 'png';
				const scale = 1;

				// Act & Assert
				await expect(
					fetchFigmaImage(apiKey, fileId, nodeIds, format, scale),
				).rejects.toThrow();
			});

			it('should return error response when using getFigmaImage with invalid params', async () => {
				// Arrange
				const nodeId = 'invalid-file-id:invalid-node-id';
				const format: ImageFormat = 'png';
				const scale = 1;
				const params = { nodeId, format, scale };

				// Act
				const result = await getFigmaImage(params);

				// Assert
				expect(result).toBeDefined();
				expect(result.content).toBeDefined();
				expect(result.isError).toBe(true);
			});

			it('should throw error when fetching nodes data with invalid API key', async () => {
				// Arrange
				const apiKey = 'invalid-api-key';
				const fileId = 'test-file-id';
				const nodeIds = ['test-node-id'];

				// Act & Assert
				await expect(fetchFigmaNodes(apiKey, fileId, nodeIds)).rejects.toThrow();
			});

			it('should throw error when fetching file data with invalid API key', async () => {
				// Arrange
				const apiKey = 'invalid-api-key';
				const fileId = 'test-file-id';

				// Act & Assert
				await expect(fetchFigmaFile(apiKey, fileId)).rejects.toThrow();
			});
		});

		// 正常系テスト
		describe('Success cases', () => {
			it('should successfully fetch image URL for a node', async () => {
				// Skip test if no API token
				if (!process.env.FIGMA_ACCESS_TOKEN) {
					throw new Error('Environment variable FIGMA_ACCESS_TOKEN is not set');
				}

				// Get Figma URL from .env file
				const figmaUrl = process.env.FIGMA_TEST_URL;
				if (!figmaUrl) {
					throw new Error('Environment variable FIGMA_TEST_URL is not set');
				}

				// Extract file ID and node IDs from URL
				const fileId = extractFigmaFileId(figmaUrl);
				const nodeIds = extractNodeIds(figmaUrl);

				// Check if file ID and node IDs are valid
				if (!fileId || nodeIds.length === 0) {
					throw new Error('Could not extract file ID or no node IDs in test URL');
				}

				// Arrange
				const apiKey = process.env.FIGMA_ACCESS_TOKEN;
				const format: ImageFormat = 'png';
				const scale = 1;

				// Act
				const response = await fetchFigmaImage(apiKey, fileId, nodeIds, format, scale);

				// Assert
				expect(response).toBeDefined();
				expect(response.images).toBeDefined();

				// Check if we got any image URLs
				const imageUrls = Object.values(response.images);
				expect(imageUrls.length).toBeGreaterThan(0);

				// Check if at least one URL is valid
				const hasValidUrl = imageUrls.some(
					(url) => typeof url === 'string' && url.startsWith('http'),
				);
				expect(hasValidUrl).toBe(true);
			});

			it('should successfully get image URL using getFigmaImage with valid token', async () => {
				// Arrange
				const figmaUrl =
					process.env.FIGMA_TEST_URL ||
					'https://www.figma.com/file/abc123/test?node-id=123-456';
				const fileId = extractFigmaFileId(figmaUrl) || 'abc123';
				const nodeIds =
					extractNodeIds(figmaUrl).length > 0 ? extractNodeIds(figmaUrl) : ['123-456'];
				const nodeId = `${fileId}:${nodeIds[0]}`;
				const format: ImageFormat = 'png';
				const scale = 1;
				const params = { nodeId, format, scale };

				// Act
				const result = await getFigmaImage(params);

				// Assert
				expect(result).toBeDefined();
				expect(result.content).toBeDefined();
				expect(result.content?.length).toBeGreaterThan(0);
				expect(result.content?.[0]?.text).toBeDefined();
				expect(typeof result.content?.[0]?.text).toBe('string');
				expect(result.content?.[0]?.text?.length).toBeGreaterThan(0);
			});
		});
	});
});
