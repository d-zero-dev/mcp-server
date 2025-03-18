/**
 * Serialize error object to a detailed string representation
 * This is needed because JSON.stringify(error) only returns "{}" for Error objects
 * @param error Any error object
 * @returns Detailed string representation of the error
 */
export function serializeError(error: unknown): string {
	// If it's not an object or null, just stringify it
	if (!error || typeof error !== 'object') {
		return JSON.stringify(error, null, 2);
	}

	// Create a detailed error representation
	const errorDetails: Record<string, unknown> = {};

	// Extract standard Error properties
	if (error instanceof Error) {
		errorDetails.name = error.name;
		errorDetails.message = error.message;
		errorDetails.stack = error.stack;

		// Extract cause if available
		if ('cause' in error && error.cause) {
			errorDetails.cause = error.cause;
		}
	}

	// Extract all enumerable properties
	for (const key in error) {
		if (Object.prototype.hasOwnProperty.call(error, key)) {
			try {
				const value = (error as Record<string, unknown>)[key];

				// Handle special case for response object
				if (key === 'response' && value && typeof value === 'object') {
					const response = value as Record<string, unknown>;
					errorDetails.response = {
						status: response.status,
						statusText: response.statusText,
						headers: response.headers,
						data: response.data,
					};
				} else {
					errorDetails[key] = value;
				}
			} catch (error_) {
				errorDetails[key] =
					`[Error extracting property: ${error_ instanceof Error ? error_.message : String(error_)}]`;
			}
		}
	}

	return JSON.stringify(errorDetails, null, 2);
}
