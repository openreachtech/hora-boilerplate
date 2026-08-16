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

      // Scratch space. `.gitignore` already excludes it, but flat config does
      // not read `.gitignore`, so without this entry a throwaway script left
      // here fails `npm run lint` locally while CI — which never checks out an
      // ignored directory — stays green, and nothing points at the cause.
      '.scratch/',

      // Implementation repositories. Each one lints itself, under its own
      // config. A repository adopted under its own directory name matches
      // neither pattern below, so /hora-setup appends one literal entry per
      // declared `Directory` right after them.
      '*-backend*/',
      '*-frontend*/',

      // Skills equipped from the project's conventions package. Not authored
      // here, and some packages ship .js/.mjs/.cjs alongside their skills.
      // Their names belong to that package, and a denylist that stops matching
      // says nothing when it stops — so this ignores the whole directory and
      // names this repository's own skills back in.
      '.claude/skills/*/',
      '!.claude/skills/bank-id/',
      '!.claude/skills/hora/',
      '!.claude/skills/hora-accept/',
      '!.claude/skills/hora-build/',
      '!.claude/skills/hora-plan/',
      '!.claude/skills/hora-setup/',
      '!.claude/skills/hora-spec/',
      '!.claude/skills/hora-spec-usecases/',
      '!.claude/skills/hora-spec-horizon/',
      '!.claude/skills/hora-spec-nonfunctional/',
      '!.claude/skills/hora-spec-provider/',
      '!.claude/skills/hora-spec-consumer/',
      '!.claude/skills/hora-spec-security/',
      '!.claude/skills/hora-spec-review/',
    ],
  },
]
