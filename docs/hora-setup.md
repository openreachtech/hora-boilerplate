<!-- 日本語版: [hora-setup.ja.md](./hora-setup.ja.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# `/hora-setup`

*[日本語](./hora-setup.ja.md)*

**The one skill this repository writes itself.** It creates the repositories your spec declares, fills in the values that carry your project's name, and reads what actually arrived.

`/hora` orders it like the four that come from `@openreachtech/hora`, and you can run it directly. What it does step by step is [`SKILL.md`](../kit/skills/hora-setup/SKILL.md); where it sits among the commands is [`commands.md`](https://github.com/openreachtech/hora-core/blob/main/docs/commands.md) in `hora-core`. This page is why it lives here, and what it asks of you.

---

## Why it is not in the kit

Every other skill Hora Kit ships is about order and gates. This one is about a stack from beginning to end: which repositories exist, what fills them, what to read once they are there. **A package that knows no stack cannot hold those answers**, so the boilerplate that does knows them writes the skill and equips it.

The answers themselves are not in the skill either. They live in [`docs/stack/`](./stack/README.md), which the skill reads at run time. Change the stack and that directory changes with it; the skill needs no edit.

---

## What it does

```
1. Create only the repositories that are missing, from the declaration
2. Fill in the values that carry this project's name
3. Read what was fetched, in place, and record it in .hora/tree/
4. Wire test caching over the rows it created, where a skill covers it
```

**Step 3 bakes nothing in.** The newest released state is always fetched, so any convention written down here would eventually disagree with the real thing. What it read is cached in `.hora/tree/<repository>.md` with the tag it was read at, and re-read when that tag changes.

**Step 4 hands over nothing but the list.** One verification unit per created row, each with its test command already recorded. What a cache declaration looks like belongs to whichever equipped skill covers caching, and `.hora/tree/<repository>.md` says per row whether it was wired or skipped for want of one.

---

## What it reads, and what it writes

| | |
|---|---|
| **Reads** | the repository layout and project name in `specs/<version>/spec.md`; the stack handbook under `docs/stack/`; the real tree of every repository |
| **Writes** | the implementation repositories; this repository's `package.json`, `.gitignore` and `eslint.config.js`; `.hora/tree/` |

**It is read-only on `specs/`.** Only `/hora-spec` and `/hora-plan` write there, and both show you every word before they do.

---

## Where it stops and asks

These are decisions rather than facts it can look up, so it stops instead of guessing.

| | |
|---|---|
| no repository layout section in the entry point | adding a repository is an architectural decision |
| no project name | it must not be derived from the directory name |
| an `Origin` the stack catalog does not list | that value is not an origin |
| a row count outside the origin's stated bounds | those bounds are the stack's own constraints |
| no table of servers | contracts cannot be derived without one |
| a declared `Directory` that is not there | it would otherwise create something over your name |

**A missing stack handbook stops it too.** Like a missing declaration, it is never a guess.

---

## The directory of each row, and the two exclusion lists

A row lands in `<project name>-<row>` unless the layout's optional `Directory` column says otherwise.

| `Directory` | What happens |
|---|---|
| **omitted** | `<project name>-<row>`, fetched if it is missing. The default, and what a new project meets |
| **written** | that exact directory, and it is **never fetched**. Writing it declares that the repository already exists |

**Then it registers the directory in `.gitignore` and `eslint.config.js`, and reports that it did.** The built-in patterns cover the default names. A directory named anything else matches neither, and both failures are silent: an unexcluded repository gets committed wholesale into this one, and the root lint walks into a repository whose config is not its own.

**Check that the report appeared.** It is the one step of a run whose omission is expensive and quiet.

---

## What it never does

Vendoring the boilerplate, keeping an upstream remote, making it a submodule, `npm update`, starting the middleware, or overwriting a value you already filled in.

**A repository that already existed keeps its history.** `.git` is discarded and re-initialized only for a boilerplate this run fetched, so that hundreds of somebody else's commits never land on your `main`. A row you placed yourself skips that entirely — the kit is adopted onto a repository, never over it.

---

## It runs again on every version

Repositories arrive later: a project starts as an API for a phone app and gains an admin screen. **Passing this once is not the end of it.** Anything already there is passed over, so running it again is safe.

**On any disagreement between the record and the tree, the tree wins**, and `.hora/tree/<repository>.md` is rewritten from it.

---

## Where to go next

| | |
|---|---|
| the procedure, step by step | [`SKILL.md`](../kit/skills/hora-setup/SKILL.md) |
| the stack it takes its answers from | [`README.md`](./stack/README.md) under `docs/stack/` |
| where it sits among the commands | [`commands.md`](https://github.com/openreachtech/hora-core/blob/main/docs/commands.md) in `hora-core` |
| what a project built here contains | [`architecture.md`](./architecture.md) |
| putting the kit on a project that already exists | [`adopting.md`](https://github.com/openreachtech/hora-core/blob/main/docs/adopting.md) in `hora-core` |
