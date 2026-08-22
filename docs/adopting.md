<!-- 日本語版: [adopting.ja.md](./adopting.ja.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# Adopting Hora Kit onto a project that already exists

Hora Kit is usually met as a template you start from. This is the other case: a renchan backend and a furo frontend already exist, already hold working code, and you want the kit around them.

**Nothing about the existing repositories is taken over.** Their history, their branches, their configs and their code stay theirs. Hora Kit is a repository that sits *outside* them and holds the spec, the plan and the record.

---

## What adoption actually buys you

Not "the kit will build the rest for you" — that is what it does afterwards. **The first thing it does is tell you what the product currently does.**

A feature declared as already built skips the seventeen checkpoints that describe how it would have been built, and **still enters the acceptance run**. So the first sweep after adopting is an acceptance review of the whole existing product against its own stated use cases: what is reachable, what is complete, what tells the truth when it fails. **This is what happens under `Baseline: verified`**, and leaving a feature inventoried instead — named, and never accepted — is the other option (below).

**Expect findings, and expect them to be the reason this was worth doing.**

After that, new features go through the full eighteen, one at a time.

---

## First, decide which of the two adoptions this is

**Before any step below, answer one question: when the spec and the code disagree, which one is right?** Everything else in this document branches on the answer, and it is declared in one line of the spec — `Authority:`, in the `Existing assets` section ([`spec-format.md`](../.claude/skills/hora/references/spec-format.md), "Existing assets").

| | **`as-built`** — the implementation is the truth | **`to-spec`** — the spec is the truth |
|---|---|---|
| Your situation | the product runs, and what it does is what you want. You are adopting the kit to **fix the current state as a version** and grow from there | the product is **mid-implementation** against a spec somebody wrote. You are adopting the kit to **finish the distance** |
| The spec describes | the product as it runs today | the product as it should be |
| A divergence between them | the spec text gets corrected | a task — the code gets corrected |
| Questions you get asked | **the minimum**: the declaration, per-feature confirmations of a derived `built:` table (select, don't compose), batched confirmations of what was read, and one question per operation reachable without signing in | the ordinary seven-stage conversation |
| Use cases and acceptance criteria | **drafted from the running system**, corrected rather than composed | from the conversation — unfinished code is not evidence of what should exist |
| The plan | every feature `built:`, **one adoption sweep** closes checkpoint 18 for all of them | each unfinished feature runs its checkpoints, which **reconcile** existing code toward the spec rather than starting over |
| Then | sweep passes → merge → **tag `1.0.0` — under `Baseline: verified`, the current state is now the fixed and verified baseline.** New work arrives as `1.1.0`, a diff, drafted from a note in `specs/1.1.0/request/` | the version finishes when the code reaches the spec, and is accepted like any other |

**Mixing them is normal, and it is declared per feature.** Fifteen features are done and three are half-way: write `Authority: as-built` in `Existing assets` and put `<!-- authority: to-spec -->` on the three ([`spec-format.md`](../.claude/skills/hora/references/spec-format.md), "`authority`"). Answering `not finished` on those three during stage 1's per-feature confirmation produces exactly this shape without you editing anything by hand.

**What `as-built` does not buy:** checkpoint 18 still runs — the adoption sweep is what makes the fixed baseline a verified one, not a claimed one. Anything reachable without authentication is still asked about one operation at a time, whatever the declaration says. And the declaration reaches only the features built when it was made — a feature added in `1.1.0` is specified in conversation like any other new feature.

**There is a second declaration, and it decides how much is accepted before the tag.** It is the `Baseline:` line of the same `Existing assets` section, and it has two values ([`spec-format.md`](../.claude/skills/hora/references/spec-format.md), "Existing assets").

| | `verified` | `inventoried` |
|---|---|---|
| What every existing feature owes | its use cases and its acceptance criteria, like any other feature | **either that, or a name and one line** — chosen per feature with `<!-- baseline: inventoried -->` |
| What the adoption sweep reviews | every feature | **only the ones not listed** |
| What the tag claims | a verified baseline | **what was accepted, and no more — the rest is named** |
| What a verdict may read | `passed` | **`passed over 17 of 20 features; 3 not accepted`** — a bare `passed` is not available |

**What `inventoried` buys:** starting the next piece of work without first specifying and accepting twenty features. A listed feature stays named in `_plan.md`'s `## Not accepted` and on every acceptance record's `not-accepted:` line, and **the version that next changes it writes the spec then, and accepts it at full live reach.**

**What it does not buy:** any confirmation that the feature works. Its inherited tests passing is the whole of the guarantee, and nothing beyond that is claimed.

**Whether it pays for itself is proportional to how untested the product is.** The cost it removes is the exchange-per-feature needed to settle acceptance criteria for a feature with no tests to draft them from — where the tests are good, criteria are drafted and confirmed three or four features at a time. **On a well-tested product the declaration and the per-feature choices cost more than they save, and `verified` is the right answer.**

---

## Before you start

| | |
|---|---|
| **The repositories are renchan / furo based** | the checkpoints delegate to skills that describe renchan and Furo conventions specifically. A repository on a different stack will get the order and the gates, but every delegated procedure will describe something it is not |
| **One backend, holding one DB system** | the policy is `one DB system = one repository`. Zero, or two or more, stops and asks |
| **Node and npm**, for the kit's own `npm install` | it is what places the kit — the skills come from packages, not from this template's tree |
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

## Step 2 — Bring your existing documents in

**Do this before running `/hora-spec`.** A session can only read what is inside its own working directory, and everything `/hora` reads is reached by following links from `specs/<version>/spec.md`. A requirements document sitting on a wiki is a document stage 0 cannot open.

**Three directories ship empty for exactly this.** Drop each document into whichever one describes it:

```
myproject-app/
  specs/
    1.0.0/
      spec.md               ← the entry point. Ships empty; /hora-spec fills it
      sources/              ← documents that ARE the specification
        api-reference.md
        requirements.md
      annex/                ← documents that EXPLAIN it
        screens.pdf
        er-diagram.png
        old-design-doc.md
      request/              ← what you want built now, in your own words
        this-quarter.md
  legacy-api/               ← your repositories, from step 1
  admin-console/
```

**Which folder you choose is what you would otherwise be asked, one document at a time.** Stage 0 reads them all, puts your placement back as a check — *"these are in `sources/`, so I am treating them as part of the specification; right?"* — and writes the tables. Twenty documents become one exchange, plus whichever you want moved.

**`request/` is the one that is not about documents you already have.** It is where what you want built goes — a mail, a ticket, a page of bullets, in whatever words you have it in. Stage 0 reads it as this version's agenda, and the seven stages turn it into sections you approve one at a time. Nothing in it ever becomes spec text on its own, and `/hora-plan` does not read it at all.

**No directory is required.** A document placed anywhere else under `specs/<version>/` is found all the same; stage 0 just asks about it instead of confirming it. **Bring your project's existing layout across as it is if you prefer** — there is exactly one structural rule, that `spec.md` sits directly under the version directory, and beyond that names, nesting and depth are free.

### Which documents to bring

| Bring it | Because |
|---|---|
| requirements lists, API references, data dictionaries | they may become part of the specification itself |
| mockups, screen designs, ER diagrams, flow charts | they explain what the screens and the model are for |
| an old design document, even a stale one | stale is still evidence, and stage 0 records that it is stale |
| spreadsheets somebody actually works from | often the only written form a rule has ever had |

**Binary files are fine.** A PDF, a PNG, an exported mockup — they are linked and described, never transcribed into the spec as though a drawing were a stated requirement.

### Two things that go wrong

**Do not link into the implementation repositories.** `legacy-api/docs/` is gitignored, so a link into it **resolves on your disk and breaks in everybody else's clone** — and it breaks silently. Copy what you need into `specs/<version>/` instead.

**Material is closed inside one version, not shared across them** ([`structure.md`](../.claude/skills/hora/references/structure.md), invariant 3). If 1.1.0 needs the same document, it gets its own copy. That looks redundant and is deliberate: shared material means editing it for 1.1.0 silently changes what 1.0.0 was written against.

### What the directories actually decide

The first two map onto two tables in `spec.md`, and **the difference is not filing — it is whether the kit will build what the document says**:

| | What it means | What `/hora` does with it |
|---|---|---|
| **`Sources`** | this document **is** part of the specification | reads it **exactly as it reads a feature file.** What is in it becomes tasks, and gets built |
| **`Annex`** | this document **explains** the specification | interpretation only. **Never produces a task** |
| **`request/`** | this is what somebody **wants**, and nobody has worked it out yet | `/hora-spec` drafts sections from it, which you approve. **Never a table, never a task, never read by `/hora-plan`** |

**The third row is why a rough note is safe to hand over and a rough `Source` is not.** Put a wish list in `sources/` and the wishes become tasks; put it in `request/` and each one arrives back at you as a question or a proposal first.

**So a five-year-old line about a Slack integration, in a document you put in `sources/`, is a Slack integration somebody builds.** In `annex/` the same line is background: it informs what stage 4 puts to you, and only what you confirm reaches the spec.

**The split is therefore not about quality — it is whether anybody is willing to be held to it.** A current API reference is `Sources`; a two-year-old design document is `Annex` however good it is.

**When in doubt, `annex/`.** Nothing is lost: if its content matters, it reaches the spec through the conversation and becomes a feature from there. All the longer route adds is one place where a person reads it and says yes — which is exactly what `sources/` skips.

Writing the tables by hand and using neither directory works too — the format is in [`spec-format.md`](../.claude/skills/hora/references/spec-format.md), "Directory layout".

### If you cannot bring something in

**Say it exists anyway.** Stage 0 asks what lives somewhere it cannot reach — a wiki, a drive, a ticket tracker — precisely because the most useful document is regularly one nobody thought to mention. Naming it lets what is in it reach the spec through the conversation, even when the file never arrives.

---

## Step 3 — Write the spec, describing what is already there

**Run `/hora-spec`.** It reads what already exists at stage 0, copies the blank spec, and writes it with you a section at a time through its seven stages ([`stages.md`](../.claude/skills/hora-spec/references/stages.md)). Copying it and filling it in by hand still works and produces the same document:

```sh
cp specs/skeleton/spec.md specs/1.0.0/spec.md
```

**You are not expected to dictate the product.** A person describing twenty existing features from memory, in an exacting format, describes the ones they remember — and the silence around the rest reads exactly like "there is nothing there". So stage 0 reads the repositories and every document you point it at, drafts what they show, and puts it back to you **to correct rather than to compose** ([`investigation.md`](../.claude/skills/hora-spec/references/investigation.md)).

**What it reads and what it asks are two different lists**, and the split is the whole design:

| It reads this, and asks you to confirm it | It asks you outright — nothing can read it |
|---|---|
| which operations exist and what they return | who each one is for |
| which tables exist and what they hold | why the model came out that way |
| which screens call which operations | what somebody was trying to accomplish |
| **who may call each operation today** | **who *should* be able to** |
| | **how far each feature is actually built** |

**The fourth row is where adoption pays for itself.** "Anyone signed in can call this" is read off an auth filter; whether that was ever anybody's decision usually turns out to be a different question entirely.

**Nothing it reads becomes a requirement on its own.** A reading is shown to you as a check — *"I read it as this; is that right?"* — and only what you confirm or correct is written. What the kit proposes is labelled a proposal, separately, so that a suggestion never enters the document as something the system already does ([`asking.md`](../.claude/skills/hora/references/asking.md)).

**Answers are offered as choices wherever they can be.** Existing row counts come with the retention question, current filters come with the authorization question, and what stage 0 found for a feature comes with the `built:` question. You correct far more than you compose.

Two stages earn their keep more here than anywhere else:

| Stage | Why, when adopting |
|---|---|
| **1, use cases** | the product has behavior nobody ever wrote down. This is where it gets stated, and where the gap between what it does and what anybody wanted becomes visible |
| **6, security** | an operation whose caller was never decided is already deployed. Reading the current filters and putting them in front of somebody finds every one — each surprise is an authorization nobody made, and each becomes a criterion the first acceptance sweep checks |

[`spec-format.md`](../.claude/skills/hora/references/spec-format.md) explains every section. Three of them matter more than usual when adopting.

### 3.1 The repository layout, with a `Directory` column

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

### 3.2 `built:` on every feature that already exists

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

**Checkpoint 18 is never covered by any value.** It stays `[ ]`, whatever you write. That is the whole design: **adopting does not rebuild what works, but it does find out what actually works.** (A feature listed under `Baseline: inventoried` is the exception: checkpoint 18 does not run for it either — instead its name stays on the record as **not accepted**.)

**`/hora-spec` derives it and confirms it with you, one feature at a time.** A half-finished screen and a finished one are indistinguishable from a file listing, so the kit lays out the evidence — the resolvers, the migration, the tests, the screens — and prepares the answer for you to select rather than compose. The `Authority` declaration decides what that looks like:

- **Under `as-built`**, the whole derived table is shown first, then each feature is confirmed by selection with the derived gate as the default. Answering `not finished` puts `<!-- authority: to-spec -->` on that feature instead of a `built:`.
- **Under `to-spec`**, `built:` is never asked and never written — every checkpoint runs and reconciles the code toward the spec. The per-feature conversation still happens, with the evidence shown, but it settles what the spec should say — the use cases, and each spec-vs-code disagreement — and more of the answer is yours to decide.

```
#attendance — derived: frontend (4 resolvers, a migration, 31 tests, and
two screens that call them)

  frontend (derived) / backend / spec / not finished (to-spec)
```

**Writing it by hand still works** — the annotation is the same either way. What is not an option is the kit guessing: a feature nobody declares is planned from checkpoint 1, however finished its code looks.

**Still write the feature's use cases and acceptance criteria**, even for something already built. Checkpoint 18 verifies against them, and a `built:` feature with neither has nothing to be accepted against.

**Keep each feature's criteria to what that feature's own gate can check, and put the flows that cross features in the version's own criteria.** On an adopted product this is where the criteria drafted from existing tests need watching: an integration test spanning four features reads exactly like a criterion for whichever feature you started from, and written into that feature's block it becomes a forward reference the gate can never meet. The version's `Version acceptance criteria` section is the right home for it — **and `none` is a valid answer**, so a version that has no cross-feature flow to state writes that and moves on.

**The one exception is a feature you listed, where writing them is what breaks it.** A feature listed under `Baseline: inventoried` carries a name, one line, and its rows in the data model and the operation list, and nothing else. No checkpoint of it ever runs, so there is nothing for either block to be verified against — and **a listed section carrying them claims to be specified and listed at once, which `/hora` stops on.**

### 3.3 Existing assets

```markdown
## 5. Existing assets

Current implementation: legacy-api, admin-console (adopted in place)
Treatment: keep it — Hora Kit is being adopted onto these repositories, not used to rewrite them
Authority: as-built — what these repositories do is what 1.0.0 is
```

**`Treatment` normally means something else** — "port this old code into the new repository" versus "match its behavior but rewrite it". Under adoption the honest answer is usually neither, and saying so plainly here is what stops a checkpoint from deciding to rewrite something. It stays required whatever `Authority` says.

**`Authority` is the declaration from ["First, decide which of the two adoptions this is"](#first-decide-which-of-the-two-adoptions-this-is)**, and on a project with code it is required — `/hora` stops without it. Features that are exceptions to it carry their own `<!-- authority: -->`.

---

## Step 4 — Run `/hora`

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
| `npm install` | run, and its `postinstall` equips the kit from both hora packages |
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

## Step 5 — Read the plan before building anything

`/hora-plan` runs next. It fixes the version, asks about whatever the spec leaves undecided, and writes the feature list.

**This is the moment to check that `built:` is right.** The plan will show, per feature, how many checkpoints are already marked not-applicable. A feature you thought was finished but declared nothing about will be planned from checkpoint 1; a feature you declared `built: frontend` will sit with only checkpoint 18 open.

**Getting one wrong in either direction is cheap to fix now and expensive later:**

| Wrong how | What follows |
|---|---|
| declared `built:` but it is not really built | the acceptance run fails it, the marks are cleared, and it is built for real — **the safe direction** |
| not declared, but it is built | seventeen checkpoints run against working code. Nothing breaks, but the time is wasted |

---

## Step 6 — The first acceptance sweep

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

The workflows under `.github/workflows/` follow the repository's visibility: a private repository runs them on a self-hosted runner labeled `light`, a public one on GitHub's `ubuntu-latest`. **Nothing is hand-edited to choose between them.** To pin them to a GitHub-hosted runner on a private repository, replace the `runs-on` expression in all four workflows and note that in `specs/<version>/spec.md` — on a private repository, GitHub-hosted means paying for every run. An adopted repository's own existing workflows are left as they are; this is only about the ones the kit brings.

---

## The short version

```
1. Create <myproject>-app from this template. Move the existing repositories inside it
2. Drop your existing documents into specs/1.0.0/sources/ (they ARE the spec —
   requirements, API references) or specs/1.0.0/annex/ (they EXPLAIN it —
   mockups, diagrams, old design docs), and what you want built into
   specs/1.0.0/request/ (your own words; never becomes spec text on its own).
   All three ship empty. None is required.
   Do NOT link into the implementation repositories; they are gitignored and
   the link breaks quietly
3. Decide which side is authoritative: as-built (what runs is what 1.0.0 is)
   or to-spec (the spec is; the code catches up). It goes in Existing assets,
   and it decides how much you get asked
4. Write specs/1.0.0/spec.md — /hora-spec reads what exists, then writes it with you:
     - stage 0 reads the repositories and the documents you placed, confirms
       the sources/annex split you expressed by placing them, writes the tables,
       and records every spec-vs-code disagreement for routing
     - repository layout, with a Directory column for each existing repository
     - as-built: the derived built: table presented whole, then confirmed
       feature by feature by selection — answering "not finished" makes that
       feature authority: to-spec; use cases and acceptance criteria drafted
       from the running system for you to correct
     - to-spec: no built: at all — every checkpoint runs and reconciles the
       code toward the spec; use cases from the conversation, with the
       evidence shown
     - existing assets: keep it, plus the Authority line
5. /hora
     - setup skips cloning, registers the directories in both exclusion lists,
       fills in only what is still a placeholder
     - plan asks about whatever is undecided. An all-as-built version plans
       as one adoption sweep
6. Check the plan: is every built: right?
7. The first acceptance sweep tells you what the product actually does
8. as-built: sweep passes → merge → tag 1.0.0. The baseline is fixed, and new
   work arrives as 1.1.0 — a page of notes in specs/1.1.0/request/ is enough.
   to-spec: the checkpoints reconcile the code toward the spec, feature by feature
```

---

## Where to go next

| | |
|---|---|
| what each command does, in detail | [`commands.md`](./commands.md) |
| why the design is shaped this way | [`architecture.md`](./architecture.md) |
| the skills the checkpoints delegate to | [`skills.md`](./skills.md) |
| the format of a spec | [`spec-format.md`](../.claude/skills/hora/references/spec-format.md) |
| stage 0, then the seven stages a spec is written through | [`stages.md`](../.claude/skills/hora-spec/references/stages.md) |
| what stage 0 may read, and what no reading settles | [`investigation.md`](../.claude/skills/hora-spec/references/investigation.md) |
| how a check differs from a proposal | [`asking.md`](../.claude/skills/hora/references/asking.md) |
| the eighteen checkpoints | [`checkpoints.md`](../.claude/skills/hora-build/references/checkpoints.md) |
