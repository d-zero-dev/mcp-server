import { describe, it, expect } from 'vitest';

import { splitTaskSteps } from './split-task-steps.js';

describe('splitTaskSteps', () => {
	it('should split the task into steps', () => {
		const task = `
# 1
Step 1

---

# 2
Step 2

---

# 3
Step 3

`;
		const steps = splitTaskSteps(task);
		expect(steps).toEqual(['Step 1\n\n---', 'Step 2\n\n---', 'Step 3']);
	});
});
