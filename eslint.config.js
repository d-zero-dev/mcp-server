import dz from '@d-zero/eslint-config';

/**
 * @type {import('eslint').ESLint.ConfigData[]}
 */
export default [
	...dz.configs.standard,
	{
		rules: {
			'@typescript-eslint/ban-ts-comment': 0,
			'no-console': 0,
			'unicorn/prefer-add-event-listener': 0,
			'unicorn/prefer-top-level-await': 0,
		},
	},
	{
		files: ['*.mjs', '**/*.spec.{js,mjs,ts}'],
		rules: {
			'import/no-extraneous-dependencies': 0,
		},
	},
	{
		files: ['.textlintrc.js'],
		...dz.configs.commonjs,
	},
	{
		ignores: ['**/dist/**/*'],
	},
];
