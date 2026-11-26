import js from '@eslint/js';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
// @ts-expect-error – eslint-plugin-jsx-a11y ships no bundled type declarations
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import { configs as storybookConfigs } from 'eslint-plugin-storybook';
import globals from 'globals';

export default [
  {
    name: 'Target Correct Source Files',

    ignores: [
      '**/*.d.ts',
      '**/*.tsbuildinfo',
      '**/.react-router/',
      '**/build/',
      '**/dist/',
      '**/node_modules/',
      '**/storybook-static/'
    ]
  },

  js.configs.recommended,
  ...tsEslintPlugin.configs['flat/recommended'],
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  jsxA11yPlugin.flatConfigs.recommended,
  eslintConfigPrettier,

  // react-hooks: configs['recommended-latest'] uses plugins: ["react-hooks"] (array format),
  // which is not valid in ESLint 9 flat config. Register the plugin manually instead.
  {
    name: 'React Hooks',

    plugins: {
      'react-hooks': reactHooksPlugin
    },

    rules: reactHooksPlugin.configs['recommended-latest'].rules
  },

  ...storybookConfigs['flat/recommended'],

  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,

  {
    name: 'General Linting',

    languageOptions: {
      globals: { ...globals.node }
    },

    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        typescript: {
          noWarnOnMultipleProjects: true,
          project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json']
        },
        node: {
          project: ['./tsconfig.json']
        }
      }
    },

    rules: {
      'import/no-unresolved': ['error', { ignore: ['^virtual:'] }],

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/index.js'] },
            {
              group: ['@base-ui/*', 'sonner'],
              message:
                'Only packages/ui uses Base UI and sonner, wrapped in its own components. Use those from @mfdiy/ui (0003).'
            }
          ]
        }
      ],

      'import/no-cycle': ['error', { maxDepth: Infinity }],

      'import/extensions': [
        'error',
        'never',
        {
          js: 'ignorePackages'
        }
      ],

      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: false
          },

          groups: ['type', ['builtin', 'external', 'internal'], 'parent', 'sibling', 'index', 'object'],

          'newlines-between': 'always'
        }
      ]
    }
  },

  {
    name: 'TypeScript Linting',

    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },

    rules: {
      'no-unused-expressions': 'off',

      'no-return-await': 'off',

      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true
        }
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],

      '@typescript-eslint/return-await': ['error', 'always'],

      '@typescript-eslint/no-import-type-side-effects': 'error',

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'separate-type-imports'
        }
      ]
    }
  },

  {
    name: 'Perfectionist Linting',
    files: ['**/*.tsx'],
    plugins: {
      perfectionist
    },
    rules: {
      'perfectionist/sort-jsx-props': [
        'error',
        {
          type: 'natural',
          ignoreCase: false
        }
      ]
    }
  },

  {
    name: 'Base UI lives behind packages/ui (0003)',
    files: ['packages/ui/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['**/index.js'] }] }]
    }
  }
];
