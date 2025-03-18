import { describe, it, expect } from 'vitest';

import { serializeError } from './serialize-error.js';

describe('serializeError', () => {
	it('should serialize primitive values correctly', () => {
		expect(serializeError(null)).toBe('null');
		expect(serializeError(123)).toBe('123');
		expect(serializeError('test')).toBe('"test"');
		expect(serializeError(true)).toBe('true');
	});

	it('should serialize Error objects with name, message and stack', () => {
		// Arrange
		const error = new Error('Test error');

		// Act
		const result = serializeError(error);
		const parsed = JSON.parse(result);

		// Assert
		expect(parsed).toHaveProperty('name', 'Error');
		expect(parsed).toHaveProperty('message', 'Test error');
		expect(parsed).toHaveProperty('stack');
	});

	it('should serialize custom error properties', () => {
		// Arrange
		const error = new Error('Test error') as Error & Record<string, unknown>;
		error.customProp = 'custom value';
		error.code = 404;

		// Act
		const result = serializeError(error);
		const parsed = JSON.parse(result);

		// Assert
		expect(parsed).toHaveProperty('customProp', 'custom value');
		expect(parsed).toHaveProperty('code', 404);
	});

	it('should handle errors with response property', () => {
		// Arrange
		const error = new Error('API Error') as Error & Record<string, unknown>;
		error.response = {
			status: 404,
			statusText: 'Not Found',
			headers: { 'content-type': 'application/json' },
			data: { message: 'Resource not found' },
		};

		// Act
		const result = serializeError(error);
		const parsed = JSON.parse(result);

		// Assert
		expect(parsed).toHaveProperty('response');
		expect(parsed.response).toHaveProperty('status', 404);
		expect(parsed.response).toHaveProperty('statusText', 'Not Found');
		expect(parsed.response).toHaveProperty('headers');
		expect(parsed.response).toHaveProperty('data');
		expect(parsed.response.data).toHaveProperty('message', 'Resource not found');
	});
});
