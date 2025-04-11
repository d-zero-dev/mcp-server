import dotenv from 'dotenv';
import { describe, it, expect, beforeAll } from 'vitest';

import { getFigmaData } from './get-data.js';

// Load .env file before running tests
beforeAll(() => {
	// Load .env file
	dotenv.config();
});

describe('getFigmaData', () => {
	describe('Error cases', () => {
		it('should throw error when figma_url is not provided', async () => {
			// Act & Assert
			await expect(getFigmaData({ figma_url: '' })).rejects.toThrowError();
		});

		it('should return error when invalid Figma URL is provided', async () => {
			// Arrange
			const args = { figma_url: 'https://www.example.com' };

			// Assert
			await expect(getFigmaData(args)).rejects.toThrow();
		});
	});
});
