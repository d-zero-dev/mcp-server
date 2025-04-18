import { promises as fs } from 'node:fs';

import { splitTaskSteps } from './split-task-steps.js';

const cache = new Map<string, string[]>();

/**
 *
 * @param filePath
 * @param step
 */
export async function getTaskStep(filePath: string, step = 1) {
	if (cache.has(filePath)) {
		const steps = cache.get(filePath);
		if (!steps) {
			throw new Error('No steps found');
		}
		return getStep(steps, step);
	}
	const task = await fs.readFile(filePath, 'utf8');
	const steps = splitTaskSteps(task);
	cache.set(filePath, steps);
	return getStep(steps, step);
}

/**
 *
 * @param steps
 * @param step
 */
function getStep(steps: string[], step: number) {
	if (steps.length < step) {
		return '全てのステップが完了しました。';
	}
	return steps.at(step - 1) ?? 'ステップが見つかりません。次のステップに進んでください。';
}
