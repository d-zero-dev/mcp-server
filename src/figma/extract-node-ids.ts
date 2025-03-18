/**
 * Extract node IDs from Figma URL
 * @param url Figma file URL
 * @returns Array of node IDs or empty array (if no node IDs specified)
 */
export function extractNodeIds(url: string): string[] {
	const nodeIdMatch = url.match(/node-id=([^&]+)/);
	if (nodeIdMatch && nodeIdMatch[1]) {
		return nodeIdMatch[1].split(',');
	}
	return [];
}
