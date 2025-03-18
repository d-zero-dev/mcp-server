import { describe, it, expect } from 'vitest';

import { fetchFigmaFile } from './fetch-file.js';

describe('fetchFigmaFile', () => {
	describe('Error cases', () => {
		it('should throw error when fetching file data with invalid API key', async () => {
			// Arrange
			const apiKey = 'invalid-api-key';
			const fileId = 'test-file-id';

			// Act & Assert
			await expect(fetchFigmaFile(apiKey, fileId)).rejects.toThrow();
		});
	});
});
