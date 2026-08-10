import {
  coreConfig,
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

      // Implementation repositories. Each one lints itself, under its own
      // config. A repository adopted under its own directory name matches
      // neither pattern below, so /hora-setup appends one literal entry per
      // declared `Directory` right after them.
      '*-backend*/',
      '*-frontend*/',

      // Skills equipped from @openreachtech/ai-agent-skills. Not authored here.
      '.claude/skills/backend-*/',
      '.claude/skills/frontend-*/',
      '.claude/skills/core-*/',
    ],
  },
]
