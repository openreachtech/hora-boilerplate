import {
  coreConfig,
  eslintCommentsPluginConfig,
  jsdocPluginConfig,
  openreachtechPluginConfig,
  stylisticPluginConfig,
} from '@openreachtech/eslint-config'

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

      // The kit equipped by postinstall, from @openreachtech/hora and
      // @openreachtech/hora-skills. Not authored here, and some of the skills
      // ship .js/.mjs/.cjs. Both payload directories are ignored whole, the way
      // .gitignore does it: a denylist written against the names the packages
      // use today says nothing when it stops matching. A skill this repository
      // authors is named back in, one literal line each.
      '.claude/agents/',
      '.claude/skills/',
    ],
  },
]
