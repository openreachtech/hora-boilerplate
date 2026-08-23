<!-- 日本語版: [README.ja.md](./README.ja.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# The stack handbook

**This directory is what makes the hora skills stack-agnostic.** The skills installed under `.claude/skills/` own the order and the gates; everything specific to this boilerplate's technology stack — which repositories to fetch, what to fill in, what middleware exists, what an API operation produces — lives here, and the skills read it at run time.

This is the same division of labor the kit already applies to `@openreachtech/hora-skills`: a hora skill states the kind of information it needs, and never bakes in the answer. For conventions and pass/fail criteria the answer comes from the equipped skills, matched by description. For the stack's structure the answer comes from this directory, found by its fixed place.

**The place is the contract.** A hora skill looks for `docs/stack/README.md` at the project root. If it, or an entry it needs, is missing, the skill stops and asks — it never guesses at a stack.

## The origin catalog

**Every value the spec's repository layout section may write in its `Origin` column is a row here.** A row that is not in this table is not an origin, and `/hora-setup` stops on it.

| Origin | Boilerplate | Role | How many |
|---|---|---|---|
| `renchan` | `openreachtech/renchan-boilerplate` | backend — the API and jobs, holds the DB | **exactly one.** One DB system = one repository |
| `furo` | `openreachtech/furo-boilerplate-nuxt` | a Nuxt frontend — one group of screens | **zero or more.** One Nuxt app per repository, so repositories split along groups of screens |

- **A backend count of zero, or of two or more, is a stop-and-ask** — declaring a second DB system is an architectural decision, not a row to add
- **Zero frontends is normal.** Some projects are only an API for a phone app
- **One `renchan` repository holds several servers side by side** — an employee-facing GraphQL server, an admin GraphQL server, a REST API, a Worker — in separate folders of one repository. Servers that share a DB belong in one repository

## What each origin document answers

One file per origin, under [`origins/`](./origins/). Each answers, in this order:

| Section | What it settles |
|---|---|
| **Where it comes from** | the repository URL, and how the version to fetch is chosen |
| **What to fill in** | every placeholder the boilerplate ships — package values, environment values — and the value each takes |
| **What to place** | files the boilerplate does not ship but the project needs, and where they go |
| **Skills to copy into the row** | which equipped skills get copied into the created repository's own `.claude/skills/`, so they are reachable from a session working there directly |
| **What to read once it is there** | the checklist `/hora-setup` reads the real tree against, and records into `.hora/tree/` |

## The rest of the handbook

| File | What it holds |
|---|---|
| [`origins/renchan.md`](./origins/renchan.md) | fetching and initializing the backend repository |
| [`origins/furo.md`](./origins/furo.md) | fetching and initializing a frontend repository |
| [`middleware.md`](./middleware.md) | the default middleware and versions, what may never be dropped, and the default API style |
| [`artifacts.md`](./artifacts.md) | what each kind of API operation produces, at each implementation layer |

## What this handbook is not

- **It is not a copy of the boilerplates' conventions.** How a resolver is written, how a table is shaped, what a review fails on — all of that is `@openreachtech/hora-skills`' and the boilerplates' own trees'. This handbook holds only what follows from *choosing* these boilerplates: what exists, where it comes from, and what has to be filled in
- **It is not read instead of the real tree.** `/hora-setup` still reads what was actually cloned, and the real tree beats anything written here
- **It is not the kit's.** The hora skills never restate its contents. When this boilerplate's stack changes, this directory changes with it, and no skill needs an edit
