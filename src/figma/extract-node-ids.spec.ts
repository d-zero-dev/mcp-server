import { describe, it, expect } from 'vitest';

import { extractNodeIds } from './extract-node-ids.js';

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
