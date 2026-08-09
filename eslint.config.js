import {
  coreConfig,
  coreRuleOptionHash,
  jsdocPluginConfig,
  openreachtechPluginConfig,
  stylisticPluginConfig,
} from '@openreachtech/eslint-config'

// TODO: Replace with a named export once `@openreachtech/eslint-config`
// exposes `eslintCommentsPluginConfig` from its index.js. This deep path
// works only because the package declares no `exports` field.
import eslintCommentsPluginConfig from '@openreachtech/eslint-config/lib/configurations/plugins/eslint-comments.js'

export default [
  coreConfig,

  stylisticPluginConfig,

  jsdocPluginConfig,

  eslintCommentsPluginConfig,

  openreachtechPluginConfig,

  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
      },
      sourceType: 'module',
    },
  },

  {
    ignores: [
      '**/node_modules/**',

      '*-backend*/',
      '*-frontend*/',
      '.claude/skills/backend-*/',
      '.claude/skills/frontend-*/',
      '.claude/skills/core-*/',
    ],
  },

  {
    files: [
      '**/workflows/**/*.js',
    ],
    languageOptions: {
      globals: {
        agent: 'readonly',
        args: 'readonly',
        budget: 'readonly',
        log: 'readonly',
        parallel: 'readonly',
        phase: 'readonly',
        pipeline: 'readonly',
        workflow: 'readonly',
      },
    },
    rules: {
      'no-restricted-properties': [
        'error',
        ...coreRuleOptionHash['no-restricted-properties'].spreadOptions,
        {
          object: 'Date',
          property: 'now',
          message: 'Not allowed to use `Date.now()` in workflow sandbox',
        },
        {
          object: 'Math',
          property: 'random',
          message: 'Not allowed to use `Math.random()` in workflow sandbox',
        },
      ],
      'no-restricted-syntax': [
        'error',
        ...coreRuleOptionHash['no-restricted-syntax'].spreadOptions,
        {
          selector: 'NewExpression[callee.name="Date"][arguments.length=0]',
          message: 'Not allowed to use `new Date()` in workflow sandbox',
        },
      ],
    },
  },
]
