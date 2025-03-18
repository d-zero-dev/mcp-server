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
			await expect(getFigmaData({})).rejects.toThrowError();
		});

		it('should return error when invalid Figma URL is provided', async () => {
			// Arrange
			const args = { figma_url: 'https://www.example.com' };

			// Act
			const result = await getFigmaData(args);

			// Assert
			expect(result).toBeDefined();
			expect(result.isError).toBe(true);
			expect(result.content).toBeDefined();
			expect(result.content?.length).toBeGreaterThan(0);
			expect(result.content?.[0]?.text).toContain('Invalid Figma URL');
		});
	});
});
