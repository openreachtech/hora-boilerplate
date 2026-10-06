<!-- 日本語版: [furo.ja.md](./furo.ja.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# Origin `furo` — a frontend repository

*[日本語](./furo.ja.md)*

What `/hora-setup` needs to know to create and initialize a repository whose declared origin is `furo`. The git handling itself — fetching the newest tag, discarding history, which branch the repository starts on — is the kit's own and is not restated here.

## Where it comes from

```
https://github.com/openreachtech/furo-boilerplate-nuxt.git
```

**Fetch the newest tag, never the HEAD of `main`** — the same rule, for the same reason, as [`renchan.md`](./renchan.md): the tag is what carries the version.

**Fetch the tagged tree, never a clone** — again as [`renchan.md`](./renchan.md) does, and for the same reason:

```bash
curl -fsSL https://codeload.github.com/openreachtech/furo-boilerplate-nuxt/tar.gz/refs/tags/<tag> \
  | tar -xz --strip-components 1 -C <dir>
```

**The repository is public**, so a session fetches it without credentials. A directory that already exists is treated as already fetched, however it got there.

**Rows with origin `furo` are often more than one.** One repository holds one Nuxt app, so repositories split along groups of screens — fetch one per declared row.

### The stack, roughly

A rough guide before the real tree is read — **not** a statement of conventions:

| | Main dependencies |
|---|---|
| frontend | nuxt / vue / @openreachtech/furo-nuxt / core-js |

**A frontend holds neither a DB client nor a Redis client.** It uses no middleware, so nothing from [`../middleware.md`](../middleware.md)'s table runs beside it, and no docker file is placed in it.

## How it reaches the backend

**A furo client sends every request as `multipart/form-data`** — GraphQL and RESTful API alike, whether a file is attached or not. `@openreachtech/furo` builds each body as a `FormData`, and a GraphQL operation goes into its `operations` field as JSON. So the backend it calls has to accept multipart on every operation, not only on uploads ([`renchan.md`](./renchan.md), "What a frontend relies on").

**A check that calls the backend for this frontend sends the same way.** A request written as JSON reaches a backend a furo client cannot reach.

## What to fill in

### `package.json` — `name` and `description`

The boilerplate arrives with the same placeholder as the backend's.

```json
{
  "name": "<myproject>-frontend-<purpose>",
  "description": "<a one-line description written from the spec>"
}
```

**`"version": "0.0.0"` and `"private": true` are left as they are.**

### Which env files are committed

**The frontend commits no development values — unlike the backend.** `furo-boilerplate-nuxt` ignores `.furo-env` and `.furo-env.development`, and tracks only `.furo-env.example`, a template, and `.furo-env.test`, for the test suite. Leave the split as the boilerplate ships it: a frontend's development values stay on the machine, where the backend's local ones are committed ([`renchan.md`](./renchan.md), "Which env files are committed").

### `npm install`

Run it in the repository once the values are filled in. As with the backend, **`@openreachtech/hora-ecosystem` does not go into this repository's `package.json`** — the catalog is the parent's devDependency, reference material rather than a product dependency.

## What to place

Nothing. The frontend uses no middleware, and the boilerplate ships everything else it needs.

## What to read once it is there

The tree itself is the authority — nothing in this handbook overrides it. If there is a `CLAUDE.md`, read it first. Then, at minimum, get hold of:

```
Directory layout          where pages, components and modules go
Naming conventions        how components, classes and files are named
How tests are written     placement, naming, helpers, the mocking style
The component library     which components already exist, and how one is composed
Context patterns          how state is shared, and how a screen reaches the API clients
How things get registered how a page, a route or a locale entry becomes active —
                          automatic via directory scanning, or a file to append to
npm scripts               the names of the dev / test / lint commands
```

**"How things get registered" deserves the same care as on the backend** — automatic registration removes the aggregation-file problem entirely; required appending means several checkpoints touch the same single place.

## What the environment needs

| Need | Check — changes nothing | Provided by |
|---|---|---|
| a browser build Playwright launches | `node -e "process.exit(require('fs').existsSync(require('playwright').chromium.executablePath()) ? 0 : 1)"` | `npm run e2e:browser` |

**The sweep's live pass drives this frontend with headless Playwright**, and without a browser build it cannot run at all — a missing build stops acceptance as `lacked-environment`, the same as an environment that will not come up.

**`npm run e2e:browser` writes outside the project.** It fetches Chromium into a cache the whole machine shares, once per machine, so a guard that keeps writes inside the project may refuse it. That is the reason to run it early, while somebody is there to allow it.

## What upstream is still missing

Report what is noticed; never rewrite upstream.

| What is missing | The stopgap |
|---|---|
| `CLAUDE.md` | read the tree in place instead |

The right place for `CLAUDE.md` is the boilerplate's own repository. **Reading the real tree stays even after a `CLAUDE.md` exists** — the real thing outranks any assumption.
