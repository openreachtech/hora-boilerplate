<!-- 日本語版: [adopting.ja.md](./adopting.ja.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# Adopting Hora Kit onto a project that already exists

Hora Kit is usually met as a template you start from. This is the other case: a renchan backend and a furo frontend already exist, already hold working code, and you want the kit around them.

**Nothing about the existing repositories is taken over.** Their history, their branches, their configs and their code stay theirs. Hora Kit is a repository that sits *outside* them and holds the spec, the plan and the record.

---

## What adoption actually buys you

Not "the kit will build the rest for you" — that is what it does afterwards. **The first thing it does is tell you what the product currently does.**

A feature declared as already built skips the seventeen checkpoints that describe how it would have been built, and **still enters the acceptance run**. So the first sweep after adopting is an acceptance review of the whole existing product against its own stated use cases: what is reachable, what is complete, what tells the truth when it fails.

**Expect findings, and expect them to be the reason this was worth doing.**

After that, new features go through the full eighteen, one at a time.

---

## Before you start

| | |
|---|---|
| **The repositories are renchan / furo based** | the checkpoints delegate to skills that describe renchan and Furo conventions specifically. A repository on a different stack will get the order and the gates, but every delegated procedure will describe something it is not |
| **One backend, holding one DB system** | the policy is `one DB system = one repository`. Zero, or two or more, stops and asks |
| **Node and npm**, for the kit's own `npm install` | |
| **Claude Code** | |

**A frontend is optional.** Some projects are only an API for a phone app.

---

## The shape you are moving toward

```
myproject-app/                  ← the kit. Holds specs/, .hora/, .claude/. No application code
  legacy-api/                   ← your existing backend, untouched
  admin-console/                ← your existing frontend, untouched
```

**The nesting is not git's requirement but Claude Code's:** a session cannot write outside its working directory, so the repositories it must reach have to sit inside it.

**The directory names do not have to change.** That is what the `Directory` column exists for.

---

## Step 1 — Create the kit repository around them

Create `<myproject>-app` from this template, exactly as a new project would ([README](../README.md), "Getting started"), then move the existing repositories inside it.

```sh
mv legacy-api admin-console myproject-app/
cd myproject-app
npm install
```

**Move them, or clone them fresh — do not symlink.** A symlinked repository breaks the working-directory rule that every per-repository command depends on, and the failures are indirect: a command runs, reads the wrong config, and reports something plausible.

**Nothing is done to their `.git`.** The `rm -rf .git && git init` you may read about in [`boilerplates.md`](../.claude/skills/hora-setup/references/boilerplates.md) belongs to a *fresh clone of a boilerplate*, so that hundreds of somebody else's commits never land on a product repository's `main`. **A repository that already existed skips that entirely** — the kit is adopted onto it, never over it.

---

## Step 2 — Write the spec, describing what is already there

Copy the blank spec and fill it in.

```sh
cp specs/skeleton/spec.md specs/1.0.0/spec.md
```

[`spec-format.md`](../.claude/skills/hora/references/spec-format.md) explains every section. Three of them matter more than usual when adopting.

### 2.1 The repository layout, with a `Directory` column

```markdown
## 2. Repository layout

| Repository | Origin | Role | Directory |
|---|---|---|---|
| `myproject-backend` | renchan | the API and jobs (holds the DB) | `legacy-api` |
| `myproject-frontend-admin` | furo | the admin screens | `admin-console` |

### 2.1 Servers

| Server | protocol | consumer |
|---|---|---|
| `admin-graphql` | GraphQL | `frontend-admin` |
| `worker` | — | an API server in the same repository (no contract needed) |
```

| | |
|---|---|
| **`Directory` written** | `/hora-setup` looks there, **and never clones.** A stated directory declares the repository already exists — if it is not there, it stops and asks rather than creating something over the name |
| **`Repository` still matters** | `target`'s value comes from **this column**, not from `Directory`. It is a permanent classification recorded in `.hora/tasks/`; a directory is a place on one person's disk. Rename the folder later and nothing in `.hora/` moves |
| **Omit the column** for a row that follows the default name | a project mixing both is perfectly normal |

**The server table is not optional.** Contracts are derived from it, and it is what tells the kit which frontend reads which contract.

### 2.2 `built:` on every feature that already exists

This is the annotation that makes adoption possible.

```markdown
## Attendance
<!-- id: attendance -->
<!-- target: backend, frontend-admin -->
<!-- built: frontend -->
```

| Value | Means | Checkpoints marked not-applicable |
|---|---|---|
| *(omit)* | nothing exists yet | none — the normal case for a new feature |
| `spec` | the specification exists; no code does | 1–2 |
| `backend` | the backend gate's work is already there | 1–9 |
| `frontend` | the frontend gate's work is already there too | 1–17 |

**Checkpoint 18 is never covered by any value.** It stays `[ ]`, whatever you write. That is the whole design: **adopting does not rebuild what works, but it does find out what actually works.**

**Write it yourself. The kit will not infer it.** A half-finished screen and a finished one are indistinguishable from a file listing, and guessing wrong here silently skips the gates that would have caught it. A feature nobody declares is planned from checkpoint 1, however finished its code looks.

**Still write the feature's use cases and acceptance criteria**, even for something already built. Checkpoint 18 verifies against them, and a `built:` feature with neither has nothing to be accepted against.

### 2.3 Existing assets

```markdown
## 4. Existing assets

Current implementation: legacy-api, admin-console (adopted in place)
Treatment: keep it — Hora Kit is being adopted onto these repositories, not used to rewrite them
```

**This section normally means something else** — "port this old code into the new repository" versus "match its behavior but rewrite it". Under adoption the honest answer is usually neither, and saying so plainly here is what stops a checkpoint from deciding to rewrite something.

---

## Step 3 — Run `/hora`

```
/hora
```

It works out that repositories are declared but not all set up, and runs `/hora-setup` first. For an adopted row, that means:

| Step | What happens to an adopted row |
|---|---|
| finding the newest tag, cloning, discarding `.git` | **skipped entirely** |
| **registering the directory in the exclusion lists** | **`.gitignore` and `eslint.config.js` both get an entry** (below) |
| `package.json` name/description | filled in **only if still a placeholder** |
| `.env.development` | filled in **only where a key is still empty** |
| `docker.sh` / `docker-compose.development.yml` | **never overwritten.** If yours exist, they are read, and any difference from the spec's manual-verification table is reported |
| `npm install` | run |
| copying `bank-id` into the backend | **only if not already there** |
| reading the real tree | run, and cached in `.hora/tree/` with the boilerplate tag it was read at |

**Every one of those is a separate idempotent check, not one all-or-nothing skip.** Nothing a human already filled in is overwritten.

### Why the exclusion lists matter more than they look

`.gitignore` and the root `eslint.config.js` both exclude implementation repositories **by name** (`*-backend*/`, `*-frontend*/`). A directory called `legacy-api/` matches neither, and **both failures are silent**:

| | What happens | How you would find out |
|---|---|---|
| `.gitignore` | your entire backend gets tracked and committed **into the kit repository** | only by reading `git status` — by then it is committed |
| `eslint.config.js` | the root's lint walks into a repository whose config is not its own | a flood of violations against rules that repository never agreed to |

`/hora-setup` adds one literal entry per declared `Directory` to both files and reports that it did. **Check that it happened** — it is the one step of adoption whose omission is expensive and quiet.

---

## Step 4 — Read the plan before building anything

`/hora-plan` runs next. It fixes the version, asks about whatever the spec leaves undecided, and writes the feature list.

**This is the moment to check that `built:` is right.** The plan will show, per feature, how many checkpoints are already marked not-applicable. A feature you thought was finished but declared nothing about will be planned from checkpoint 1; a feature you declared `built: frontend` will sit with only checkpoint 18 open.

**Getting one wrong in either direction is cheap to fix now and expensive later:**

| Wrong how | What follows |
|---|---|
| declared `built:` but it is not really built | the acceptance run fails it, the marks are cleared, and it is built for real — **the safe direction** |
| not declared, but it is built | seventeen checkpoints run against working code. Nothing breaks, but the time is wasted |

---

## Step 5 — The first acceptance sweep

A feature whose only open checkpoint is 18 writes no code and cuts no branch. `/hora-build` goes straight to `/hora-accept`.

```
1. Confirm the environment      the local E2E stack must actually run
2. Unit suites, per repository  your existing tests, run as they are
3. The scenario list            derived from what the API exposes
4. The acceptance review        reachability, CRUD completeness, affordances,
                                 whether failures and waits are told truthfully
5. UX findings                  severity-ranked, against the project context
```

**Step 1 will very likely stop the first run**, and that is normal. Checkpoint 17 exists to build a local end-to-end environment, and an existing project usually has *something* — a compose file, a seed script — that does not yet meet the prerequisite: every service running behind the app, each role able to sign in, and reviewable data present. Fix that, then re-run.

**Do not skip it, and do not review the frontend on its own.** A review run that way reports a pass it has not earned.

### What the findings mean

Each one names the checkpoint it sends the run back to, in whichever feature. For an adopted feature that lands inside a stretch marked *built before Hora Kit was adopted*, **those marks are cleared** — code that has to change was not simply inherited after all, so it is built for real from the earliest checkpoint affected.

This is the mechanism by which an existing product gets pulled up to the kit's standard **one shortfall at a time, only where a shortfall was actually demonstrated.**

---

## What to watch for

### The boilerplate is at a newer tag than your code

`/hora-setup` reads the real tree and caches what it read, with the tag. An existing repository may predate conventions the current boilerplate assumes. **The tree wins over any assumption** — that is why the reading step exists — but the delegated skills describe the *current* conventions, so new work may look different from old work in the same repository. That is expected, and preferable to writing new code against conventions the package has moved on from.

### `release/<version>` on a repository with history

The kit works on `release/<version>` in every repository. For an adopted row, that branch is cut from `origin/main` after a fetch — not from a fresh `git init`. It still gets the empty `Release <version>` opening marker.

**Never commit straight to `main`.** `main-guard.yml` in the kit repository restricts PRs into main to `release/*`, `hotfix/*`, `dev` and `env`; your existing repositories may have no such guard, which makes the rule easier to break by accident.

### Your eslint config, and this one

Each repository lints itself, under its own config, run from inside it. The kit's root config **never** lints an implementation repository — that is what the exclusion list is for. If the existing config disagrees with `@openreachtech/eslint-config`, the existing one wins inside that repository, and the checkpoints work with it.

### Your existing tests

They are run as they are, by `/hora-accept` step 2. **They are never weakened to make a run pass** — no test skipped, deleted, loosened or waited out. If an existing test fails, that is a finding, not an obstacle to route around.

### CI

The workflows under `.github/workflows/` run on a self-hosted runner labeled `light`. If you cannot register one, **do not change `runs-on`** — note it in `specs/<version>/spec.md` instead.

---

## The short version

```
1. Create <myproject>-app from this template. Move the existing repositories inside it
2. Write specs/1.0.0/spec.md:
     - repository layout, with a Directory column for each existing repository
     - built: spec | backend | frontend on every feature that already exists
     - use cases and acceptance criteria on all of them, built or not
     - existing assets: keep it
3. /hora
     - setup skips cloning, registers the directories in both exclusion lists,
       fills in only what is still a placeholder
     - plan asks about whatever is undecided
4. Check the plan: is every built: right?
5. The first acceptance sweep tells you what the product actually does
6. From there, new features go through all eighteen, one at a time
```

---

## Where to go next

| | |
|---|---|
| what each command does, in detail | [`commands.md`](./commands.md) |
| why the design is shaped this way | [`architecture.md`](./architecture.md) |
| the skills the checkpoints delegate to | [`skills.md`](./skills.md) |
| the format of a spec | [`spec-format.md`](../.claude/skills/hora/references/spec-format.md) |
| the eighteen checkpoints | [`checkpoints.md`](../.claude/skills/hora-build/references/checkpoints.md) |
