/**
 *
 * @param task
 */
export function splitTaskSteps(task: string) {
	const steps = task.trim().split(/(?:^|\n\r?)(?=#\s)/);
	return steps.map((step) => {
		const lines = step
			.trim()
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => !/^#\s+\d+/.test(line));
		return lines.join('\n');
	});
}
