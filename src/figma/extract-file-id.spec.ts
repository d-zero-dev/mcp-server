import { describe, it, expect } from 'vitest';

import { extractFigmaFileId } from './extract-file-id.js';

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
