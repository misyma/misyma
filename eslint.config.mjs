import tseslint from 'typescript-eslint';
import perfectionist from 'eslint-plugin-perfectionist';
import stylistic from '@stylistic/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    files: ['**/*.ts'],
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.mjs', '**/*.js'],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...tseslint.configs.strictTypeChecked,
  {
    rules: {
      '@typescript-eslint/no-unsafe-assignment': ['off'],
      '@typescript-eslint/camelcase': ['off'],
      '@typescript-eslint/require-await': ['off'],
      '@typescript-eslint/no-empty-object-type': ['off'],
      '@typescript-eslint/no-extraneous-class': ['off'],
      '@typescript-eslint/no-unnecessary-type-parameters': ['off'],
      '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': ['error', { allowHigherOrderFunctions: true }],
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          overrides: {
            accessors: 'explicit',
            constructors: 'explicit',
            methods: 'explicit',
            parameterProperties: 'explicit',
            properties: 'explicit',
          },
        },
      ],
      "@typescript-eslint/related-getter-setter-pairs": "off",
      '@typescript-eslint/explicit-module-boundary-types': ['off'],
      '@typescript-eslint/interface-name-prefix': ['off'],
      '@typescript-eslint/no-empty-function': 0,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['off'],
      'arrow-parens': ['error', 'always'],
      'brace-style': ['error', '1tbs'],
      curly: 'error',
      'eol-last': ['error', 'always'],
      'lines-between-class-members': [
        'error',
        'always',
        {
          exceptAfterSingleLine: true,
        },
      ],
      'no-unused-vars': ['off'],
      'no-useless-rename': 'error',
      'object-curly-spacing': ['error', 'always'],
      'object-property-newline': [
        'error',
        {
          allowAllPropertiesOnSameLine: false,
        },
      ],
      'object-shorthand': ['error'],
    },
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/no-trailing-spaces': ['error'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/arrow-parens': ['error', 'always'],
    },
  },
  {
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          groups: ['side-effect', ['builtin', 'external'], 'internal', ['parent'], ['sibling', 'index']],
          newlinesBetween: 'always',
          order: 'asc',
          type: 'natural',
        },
      ],
    },
  },
  prettierConfig,
);
