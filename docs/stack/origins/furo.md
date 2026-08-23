<!-- 日本語版: [furo.ja.md](./furo.ja.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# Origin `furo` — a frontend repository

What `/hora-setup` needs to know to create and initialize a repository whose declared origin is `furo`. The git handling itself — fetching the newest tag, discarding history, which branch the repository starts on — is the kit's own and is not restated here.

## Where it comes from

```
https://github.com/openreachtech/furo-boilerplate-nuxt.git
```

**Fetch the newest tag, never the HEAD of `main`** — the same rule, for the same reason, as [`renchan.md`](./renchan.md): the tag is what carries the version.

**The repository is currently private**, so a non-interactive session's own `git clone` fails for lack of credentials until a human clones the directory beforehand. A directory that already exists is treated as already fetched, however it got there.

**Rows with origin `furo` are often more than one.** One repository holds one Nuxt app, so repositories split along groups of screens — clone one per declared row.

### The stack, roughly

A rough guide before the real tree is read — **not** a statement of conventions:

| | Main dependencies |
|---|---|
| frontend | nuxt / vue / @openreachtech/furo-nuxt / core-js |

**A frontend holds neither a DB client nor a Redis client.** It uses no middleware, so nothing from [`../middleware.md`](../middleware.md)'s table runs beside it, and no docker file is placed in it.

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

### `npm install`

Run it in the repository once the values are filled in. As with the backend, **`@openreachtech/hora-ecosystem` does not go into this repository's `package.json`** — the catalog is the parent's devDependency, reference material rather than a product dependency.

## What to place

Nothing. The frontend uses no middleware, and the boilerplate ships everything else it needs.

## Skills to copy into the row

None.

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

## What upstream is still missing

Report what is noticed; never rewrite upstream.

| What is missing | The stopgap |
|---|---|
| `CLAUDE.md` | read the tree in place instead |

The right place for `CLAUDE.md` is the boilerplate's own repository. **Reading the real tree stays even after a `CLAUDE.md` exists** — the real thing outranks any assumption.
