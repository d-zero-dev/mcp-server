import { describe, it, expect } from 'vitest';

import { fetchFigmaNodes } from './fetch-nodes.js';

describe('fetchFigmaNodes', () => {
	describe('Error cases', () => {
		it('should throw error when fetching nodes data with invalid API key', async () => {
			// Arrange
			const apiKey = 'invalid-api-key';
			const fileId = 'test-file-id';
			const nodeIds = ['test-node-id'];

			// Act & Assert
			await expect(fetchFigmaNodes(apiKey, fileId, nodeIds)).rejects.toThrow();
		});
	});
});
