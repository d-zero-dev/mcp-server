/**
 * Extract file ID from Figma URL
 * @param url Figma file URL
 * @returns File ID or null (if URL is invalid)
 */
export function extractFigmaFileId(url: string): string | null {
	// Regular expression to extract file ID from Figma URL
	// Example 1: https://www.figma.com/file/abcdef123456/FileName
	// Example 2: https://www.figma.com/design/abcdef123456/FileName
	const fileMatch = url.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
	if (fileMatch && fileMatch[1]) {
		return fileMatch[1];
	}

	const designMatch = url.match(/figma\.com\/design\/([a-zA-Z0-9]+)/);
	return designMatch && designMatch[1] ? designMatch[1] : null;
}
