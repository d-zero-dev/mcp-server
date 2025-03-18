import type { ImageFormat } from './types.js';

import dotenv from 'dotenv';
import { describe, it, expect, beforeAll } from 'vitest';

import { extractFigmaFileId } from './extract-file-id.js';
import { extractNodeIds } from './extract-node-ids.js';
import { fetchFigmaImage } from './fetch-image.js';

// Load .env file before running tests
beforeAll(() => {
	// Load .env file
	dotenv.config();
});

describe('fetchFigmaImage', () => {
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
	});

	describe('Success cases', () => {
		it.skip('should successfully fetch image URL for a node', async () => {
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
	});
});
