export type ImageFormat = 'jpg' | 'png' | 'svg';

export type GetFigmaImageParams = {
	fileId: string;
	nodeId: string;
	format?: ImageFormat;
	scale?: number;
};

export type GetFigmaDataParams = {
	figma_url?: string;
};

// Figma API response type for image URLs
export type FigmaImageResponse = {
	err: null | string;
	images: Record<string, string | undefined>;
};
