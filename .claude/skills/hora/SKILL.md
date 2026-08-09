---
name: hora
description: Implement an application from its spec. Reads specs/<version>/spec.md, then fetches the boilerplate, extracts tasks, raises questions, implements, and verifies by machine. Runs at the root of the hora repository (myproject-app). Started or restarted only by an explicit `/hora` invocation — each run picks up where the last one stopped.
---

# hora

Implement an application from its spec.

## The structure this assumes

One project is made of several git repositories. The outer one is the hora repository, and the implementation repositories are nested inside it. `/hora` always runs at the outer root.

```
myproject-app/                     ← cwd. Holds specs/ and .claude/. Holds no application code
  myproject-backend/               ← from renchan. Contains several servers. Is gitignored
  myproject-frontend-employee/     ← from furo
  myproject-frontend-admin/        ← from furo
```

**The spec declares the layout. `/hora` must not assume one.**

- **One backend repository.** Keep `one DB system = one repository`. **If a second one is declared, that is outside the policy, so stop and ask** (`blocking: yes`)
- **One backend holds several servers.** An employee GraphQL server, an admin GraphQL server, a REST-API, a JSON-RPC and a Worker can live side by side in separate folders (this is renchan-core's design). **An API server and a Worker server that share a DB also belong in one repository**
- **Frontends do not come in pairs, and there may be several.** Some projects only need an API for a phone app. **furo cannot hold more than one Nuxt app per repository**, so repositories split along groups of screens. One backend against several frontends comes from this asymmetry
- **Names read `<myproject>-<role>-<purpose>`.** It is `myproject-frontend-admin`, not `myproject-admin-frontend`. Putting the role first keeps repositories of the same role adjacent and makes `app` → `backend` → `frontend-*` the order of implementation (verified to be locale-independent)
- **More arrive in later versions.** A project starts with an API for a phone app and gains an admin screen later

The `myproject` part is the project name. **Use the name written in the spec. Do not derive it mechanically from the directory name.** Glued onto `<role>-<purpose>` like this, call it the **project prefix** — the two terms name the same value, but "project prefix" is the word for this specific, repository-naming role.

The nesting is not git's requirement but Claude Code's: a session cannot write outside its cwd.

### Where a per-repository command runs

`/hora` runs at the outer root, but **every command that reads a repository's own config — `npx eslint`, `npx jest`, `npm` — runs with that repository as its working directory**, as one command, with paths relative to it:

```
cd myproject-backend && npx eslint app/... server/...
```

**Run lint from the outer root and it passes every time, having read nothing.** The outer root holds no application code, so its own `eslint.config.js` ignores `*-backend*/` and `*-frontend*/` — each repository lints itself, under its own config. Every implementation file therefore matches an ignore pattern: eslint prints `File ignored because of a matching ignore pattern`, exits `0`, and a check that never ran is indistinguishable from one that passed. Nothing fails, so nothing says so. Jest fails loudly in the same position (a repository's `jest.config.js` is not the root's), but one rule avoids both.

**`--config <repository>/eslint.config.js` from the root is not a substitute.** It does load the right rules, but that config's own relative `ignores` then resolve against the root instead of the repository, so files the repository excludes get linted anyway.

## Invariants

These three must not be broken.

### 1. Ownership is split

| Directory | Who writes | What `/hora` may do |
|---|---|---|
| `specs/` | humans | **read only. Writing is forbidden** |
| `.hora/` | `/hora` | write (humans read only) |

When something is wrong in `specs/`, the response is **always to ask. Never to fix.** A typo and a broken layout are treated the same. Allow "it is minor, I will just fix it" once and the rule is gone.

### 2. The boundary of inference

| | Example | Treatment |
|---|---|---|
| Classifying | `target` / `depends` | **May be inferred.** It only attaches a label, it adds no information |
| Filling in content | requirements / acceptance criteria / implementation scope / how existing assets are used | **Must not be inferred.** It would mean inventing what the spec does not say |
| **A permanent identifier** | **`id`** | **Must not be invented.** Derive it only where it can be derived (Stage 1, section 1) |

**`id` is not `target`.** Getting `target` wrong only sends a task to the wrong file, but `id` is the reference key from `.hora/tasks/` and is permanent — once given, it never changes. Inferred from heading text, the next run after someone edits the heading produces a different `id`, and recorded references come loose in silence. `/hora` cannot write to `specs/`, so it has nowhere to pin an inferred `id`.

**Do not try to keep the number of questions down.** People who are asked start writing it down in advance. Asking is also the mechanism that trains whoever writes the spec.

### 3. Pin things to stay reproducible

Follow upstream only on purpose. Never drift to the newest thing by itself.

- Boilerplates come from `--branch <newest tag>` (not the HEAD of `main`)
- Supporting material referenced from a version's `spec.md` is closed inside that version. It is not shared across versions
- Do not bump versions in `package-lock.json` by yourself (`npm update` is a human's action)

## What language to write for humans

**What stays in a file follows the declaration; what is said in the moment follows the person in front of you.**

| What is written | Language |
|---|---|
| Question text (`.hora/questions/`) | **The spec's declaration. Absent that, the language of whoever ran it** |
| Notes attached to a task (constraints, conflict warnings) | same as above |
| The closing report (conversation in the moment) | **always the language of whoever ran it** |
| Task names | copied from the spec |
| Glossary terms | copied from the spec |
| Glossary identifiers | English (the lint rules assume English naming) |

The declaration lives in the spec's document information section.

```markdown
| Question language | Japanese |
```

**Why it has to be declarable.** Whoever runs this is usually Japanese, so the operator's language is a fine default — but **on a project whose client side includes foreign members, the operator's language leaves someone unable to read it.** A question stays in the file and is read by whoever edits `specs/` next, so it cannot be settled by the operator's convenience alone.

**The closing report does not follow the declaration.** It is conversation aimed at the person who just ran it and it does not stay in a file, so it always uses that person's language.

**Never write two languages side by side.** A single question written twice leaves no original: one copy gets updated and the two disagree.

**Existing questions are not retranslated.** The file is append-only, so once the declaration changes or somebody else runs it, one file holds more than one language. **That is fine.** Retranslating a question somebody else wrote does more harm (it changes what they meant — and resolution is judged by reading `specs/`, which does not depend on the language).

## The stages

```
Stage 0    Fetch the boilerplate and fill in the project's values (idempotent)
Stage 0.5  Read what was cloned, in place
Stage 1    Extract and structure tasks from specs/<version>/spec.md
Stage 1.5  Questions. Write out what is unresolved and stop
           ── a human edits specs/ to answer ──
Stage 2    Implement the unfinished tasks
Stage 3    test / lint (verification by machine)
```

**Re-entrancy is the center of the design.** Specs are assumed to be plentiful, so a single session does not run to the end. Each run decides where it is and continues from there. **Stage 1.5 always stops once**, so `/hora` runs at least twice.

**Serial by default.** No task ever runs alongside another — `.claude/workflows/implement.js`'s batching, chaining and concurrent dispatch stay off. Processing one task still moves through several agents in sequence (`hora-implementer`, an agent for a reported conflict-proof change, the test/lint agents, `hora-verifier`) — one after another, never side by side. Only when a version holds many tasks **and it is explicitly asked for** does Stage 2 delegate to that workflow instead (end of Stage 2) — and even then, read `references/parallel-run-caveats.md` first: this default is not a cautious placeholder, but stands in for a real, currently-unresolved gap in how the parallel run commits its own work.

**Manual verification is not one of the stages.** A human does it whenever they want (in the backend: `./docker.sh start` → `npm run db:refresh` → `npm run dev`). `/hora` does not do it for them.

### Deciding where you are

Do this first, every time — a fresh start and a restart alike.

```
0. git fetch origin --prune, for the hora repository and every declared row that already exists
1. Decide the target version (below)
2. Are all declared repositories present, per that version's spec.md
                                                    if any is missing → Stage 0
3. Always run Stage 1 (generate on the first run, reconcile on re-entry)
4. Does .hora/questions/<version>/open.md still hold an unresolved blocking: yes
                                                    if so → Stage 1.5 (stop)
5. Does .hora/tasks/<version>/ still hold unfinished tasks   if so → Stage 2
6. Everything is done                               → Stage 3
```

**Step 0 is also what catches `release/<version>` up with a `hotfix/*`.** `/hora` has no scheduler and no background process — this fetch, run at the start of every invocation, is one of the only two occasions it ever gets to notice one landed on `main`. The other is right after every merge into `release/<version>` during the run itself (see "Keeping `release/<version>` current", under Commits, for the check itself and what running it there stands in for). Between the two, nothing that changes `origin/main` goes unnoticed for long, without `/hora` ever needing a schedule of its own.

**`/hora` does not ask before running this check, or before acting on an ordinary result.** It only stops and asks once the check turns up something it genuinely cannot resolve on its own (below).

**The target version:** among the version directories under `specs/`, the **lowest** one whose `.hora/tasks/<version>/` has not been generated or still holds unfinished tasks. If all are finished, the lowest version that exists under `specs/` but not under `.hora/tasks/`. If there is no such version either, report that every version is complete.

**Even when every checkbox is `[x]`, do not call that version finished on the spot and move to the next one.** Run Stage 1's reconciliation first. A spec keeps moving while implementation is under way, so sections may have been added after the version was finished. Only once reconciliation shows no difference does the target move on.

Report the decision in one line before starting work (for example: "continuing 1.0.0 from Stage 2. 12 of 34 unfinished").

---

## Stage 0 — Fetch and initialize the boilerplates

**Which repositories to create is declared by the spec's repository layout section.** `/hora` must not carry "a backend and a frontend" as an assumption.

Create **only what is missing** from the declaration (idempotent). Anything already there is passed over. **Re-evaluate this stage for every version.** Repositories arrive in later versions, so passing it once is not the end of it.

If there is no declaration, **stop here and ask.** Adding a repository is an architectural decision, and it is on the side that must not be inferred.

| Detection | Action |
|---|---|
| No repository layout section | **stop and ask** |
| **Zero or two or more** backends (origin `renchan`) | **stop and ask.** For now it is always exactly one |
| Zero frontends (origin `furo`) | **normal.** Some projects are only an API for a phone app |
| No table of servers | **stop and ask.** Contracts cannot be derived |

**The repository layout must be written in the entry point (`specs/<version>/spec.md`).** Written in a feature file, it does not count as the declaration. The layout applies to the whole version, so placing it under a feature leaves no single place to read it from.

Settle the project name first. Use the name written in `specs/<version>/spec.md`. **If it is not written, stop here and ask.** It must not be derived from the directory name (the directory may have been renamed after `git clone`), and — unlike most required roles — **it must not be taken from a declared Source either.** The project name and the repository layout are decisions, not facts to locate; a Source may contain evidence for either, but never the decision itself (Stage 1, "Read the annotations").

**Once it is settled, also fill in this repository's own `package.json`** (`name` / `description`) — it ships with the same placeholder a cloned boilerplate does, and filling it in does not wait for anything to be cloned.

Read `references/boilerplates.md` for the detailed procedure and the values to fill in. The essentials for each declared row (**numbered for this summary alone — these numbers do not line up with `boilerplates.md`'s own step numbers**):

```
1. git ls-remote --tags to find the newest tag
2. git clone --depth 1 --branch <newest tag> ... <project name>-<declared row>
3. rm -rf <dir>/.git && git -C <dir> init && git -C <dir> checkout -b release/<version>
4. git -C <dir> commit --allow-empty -m "Release <version>" (the branch's opening marker — see Commits, below)
5. Rewrite name / description in package.json with the project's name
6. Fill in the values in .env.development (renchan-boilerplate ships keys with empty values)
7. Place docker.sh / docker-compose.development.yml and decide profiles from the spec
8. Write COMPOSE_PROFILES into .env.development (when there is a profile to enable — never into .env)
9. npm install
10. Backend row only: copy `.claude/skills/bank-id/` into `<dir>/.claude/skills/bank-id/`, if it is not already there
```

**If `<project name>-<declared row>` already exists as a directory, skip steps 1–4 for that row** (finding the newest tag, cloning, discarding `.git`, the branch checkout that follows it, and its empty opening marker) — treat it as already fetched, however it got there. The Commits section's own branch rule still applies to it regardless (fetch and branch from `origin/main` if `release/<version>` is missing, with the same empty marker on it once created) — it is just not the fresh-`git init` case that skips straight to a `checkout -b`. This is not only for the ordinary idempotent re-run: the boilerplates are currently private, so `/hora`'s own `git clone` fails for lack of credentials (a non-interactive session has no terminal to authenticate through) until a human either supplies credentials or clones the row manually beforehand. **Still run steps 5 onward for that row** — each is its own idempotent check (`package.json` may still carry the placeholder, `.env.development` may still be empty), not a single all-or-nothing skip.

**Step 10 never overwrites an existing copy.** A human may have customized `bank-id` inside their own backend repository (adjusted retry timing, added a house convention) — this step only bootstraps it once, the same idempotent, leave-it-alone treatment steps 5 onward give a placeholder that a human already filled in. This step is why `bank-id` can be invoked without `/hora`, too: it lands in the backend row's own `.claude/skills/`, reachable by any session working there directly, not only by `hora-implementer`.

**Also run `.claude/skills/hora/scripts/equip-skills.sh`.** It copies every skill shipped by this repository's own `@openreachtech/ai-agent-skills` devDependency into this repository's own `.claude/skills/`, so they become usable for the rest of the session (skill discovery only looks at the session's own `.claude/skills/`, and a package's skills live under `node_modules/`, never under that path). **It does not wait on any declared row being cloned** — like `@openreachtech/hora-ecosystem`, `ai-agent-skills` comes from this repository's own devDependencies, so run it as its own step, independent of the loop above.

`.git` is thrown away and re-initialized so that hundreds of commits from somebody else's repo never land on a product repository's `main`. A clean history wins here.

When Stage 0 finishes, make an initial commit in each repository it created, on the `release/<version>` branch checked out in step 3 above, after the empty marker from step 4 — never on whatever branch `git init` defaulted to (see Commits, below).

---

## Stage 0.5 — Read what was cloned, in place

**This skill does not bake in knowledge of the boilerplates' conventions.** The newest tag is always cloned, so any conventions written down here would eventually disagree with the real thing. Reading the real thing is the only correct move.

The order to read in:

1. If there is a `CLAUDE.md`, read it (the authority, updated by the maintainer along with the code)
2. Otherwise read the tree in place. At minimum, get hold of:

```
Directory layout          where things go
How servers are split     how several servers are separated. Entry points and the pm2 config
Naming conventions        how classes, files and tables are named
How tests are written     placement, naming, helpers, the mocking style
The existing GraphQL schema   how the SDL is written
How things get registered     automatic via directory scanning, or an aggregation file to append to
Existing model definitions    how sequelize is used, and how it maps to migrations
npm scripts               the names of the test / lint / db commands
```

**Do not write down what was learned.** `.hora/` defines no place for it, so it stays as understanding inside the session. On re-entry, read again.

**"How things get registered" deserves particular care.** If registration is automatic through directory scanning — a `BulkClassLoader` and the like — implementation only has to drop its own file in, and the aggregation-file problem disappears entirely. If appending is required, several tasks end up touching the same single place. **It is the highest-value thing to check.**

The real tree beats any assumption. This stage stays even after a `CLAUDE.md` exists.

---

## Stage 1 — Extract and structure tasks

**The spec already holds an implementation plan.** Rather than deriving an order of its own, `/hora` **extracts** it. This stage's job is not "generating a plan" but "extracting and structuring one".

### 1. Scan the sections

#### Resolve the diffs first

Sort the version directories in ascending semver order and **apply them in turn, each overwriting the last.** The lowest version is complete; every one after it is **a diff against the version immediately before it.**

```
1.0.0   full
1.0.1   overwrites 1.0.0
1.1.0   overwrites 1.0.1      ← the previous version is the base, not the lowest one
```

**The key for overwriting is `id`.** A section that does not appear in the diff is carried over **unchanged**.

| What the diff wrote | Result |
|---|---|
| heading and annotations only | **annotations are overwritten one by one; the body carries over from the previous version** |
| heading, annotations and body | the whole body is replaced (partial patches of prose are not supported) |

**Because of this rule, reviving a section takes three lines.**

```markdown
# Payroll
<!-- id: payroll -->
<!-- kicked: no -->
```

No `target`, no `depends`, no body. Only `kicked` is overwritten; the rest carries over from the previous version.

**Deferring is expressed as "`kicked: yes` in this version, `kicked: no` in the next".** `kicked: yes` carries over through diffs, so a section stays kicked until it is explicitly brought back.

**Files of past versions are never rewritten.** The file of the version that kicked it keeps its `kicked: yes` and stands as the record that it was not built then. Carrying bodies over works precisely because past versions are frozen.

A gap in the versions (`1.0.0` → `1.5.0`) does not break the chain. **Only the versions that exist** are applied, in ascending order.

**Annex material is not diffed in parts.** Prose cannot be patched, so **the version that wants to change it places the whole text.** From that version on, that copy is used; versions that do not change it hold no copy. It is the same overwrite rule as `spec.md`.

Past versions are frozen, so reading them from a later version cannot change their meaning retroactively. **There is no need to copy them into every version.**

**Scanning, digests and the judgment about "a section that disappeared" all happen against the resolved document.** Handled per file, every task would be flagged "the spec changed" on every version bump.

#### Decide what tasks are extracted from

**Reached by a link from `spec.md`, and reached by a link alone — not by name or folder.** Directory shape and file naming are free; a project's own layout does not need to change to be read.

```
specs/1.0.0/spec.md                      the entry point.
specs/1.0.0/attendance/spec.md           a feature file. Linked from spec.md
specs/1.0.0/attendance/monthly/spec.md   nesting is allowed
specs/1.0.0/spec/00-overview.md          a declared Source (below). Any name, any location
specs/1.0.0/docs/RPA_CORE_SPEC.md        linked, but not declared. Interpretation material only
```

**A file that is none of `spec.md` / a feature file / a declared Source, and that nothing links to at all, is never read** — and raises a question (`orphan`, `blocking: no`). Ignoring it in silence leaves a spec that somebody forgot to link unnoticed. This is the one thing that stays closed: not the directory's shape, but the requirement that every file `/hora` should read is actually reached from `spec.md`.

**Whether a reached file is extracted from or read for interpretation only is decided by one thing: is it declared under a `Sources` section (or is it a `<feature>/spec.md`)?**

| | Declared under `Sources`, or a `<feature>/spec.md` | Reached, but not declared |
|---|---|---|
| Read for | extraction — `id`/`target`/`depends`, tasks, contracts | interpretation only |
| Ever produces a task | yes | never |

**A file listed under a `Sources` section acts as a feature file, even if it is not named `spec.md`.** Some specs exist as several files under their own naming convention before they ever meet `/hora` (numbered documents, and the like). Read each one listed there exactly as a `<feature>/spec.md` — the same search, the same extraction rules, including deriving `id`/`target` from the spec's own scheme and extracting at row granularity where those apply (above).

#### Never invent an `id`

`id` is the reference key from `.hora/tasks/`, and once given it never changes. **`/hora` must not infer one.**

| Place | How it is decided |
|---|---|
| the H1 of a feature file | **join the path segments relative to `specs/<version>/` with `--`.** Deterministic and unique |
| a `##` section | **a human writes it.** If it is not written, do not infer it |
| a `##` with no `id` | tie that section's tasks **to the H1's `id`.** The reference stays stable |

```
attendance/monthly/spec.md   →   id: attendance--monthly     -- separates folders
attendance-monthly/spec.md   →   id: attendance-monthly      -  separates words
```

Reserving `--` for separation alone makes the reverse lookup from `id` to path unique (`id.split('--')` gives the segments). **Folder and file names must not contain `--`.**

A `##` section's `id` joins to its feature's `id` with **a single `-`** (`attendance--monthly-data-model`).

When a `##` has no `id`, ask for one — "add an `id` if you want this split per section" (`blocking: no`). **Do not stop.** Only the granularity of tasks gets coarser; references do not break.

**`id` is unique across the whole version.** On a collision, ask with `blocking: yes` (for instance when two spellings that produce the same `id` were both written).

Diffs resolve per `id`, so **which file a section lives in does not matter.**

#### Read the annotations

Scan the resolved document by heading. Annotations are in the HTML comments directly under a heading.

```markdown
## 6. Data model
<!-- id: data-model -->
<!-- target: backend -->
<!-- depends: none -->
```

| Annotation | Content |
|---|---|
| `id` | a stable identifier (kebab-case, unique in the document). **References use `id`, never a section number.** Insert one section and every number shifts |
| `target` | where the task goes. **The repository name with the project prefix removed** (`myproject-frontend-admin` → `frontend-admin`; the backend is a single repository, so always `backend`). Also `app` and `none`. Several are comma-separated |
| `depends` | the `id` of the sections it depends on. State `none` explicitly when there are none |
| `kicked` | `yes` means withdrawn. **Shown in an annotation rather than by deleting the section** (section 7) |

Subsections inherit from their parent. State it to override.

**`id`/`target` may come from the spec's own existing ID scheme instead of being written as annotations.** Some specs already carry a permanent, unique identifier per requirement or element (`FR-010`, `TBL-01`, `SCR-03`, and the like), together with a table the spec's own author wrote mapping each identifier's prefix to a target. When the entry point's Document information declares this (an `Annotation source` row pointing at that table, instead of the default), `/hora` does not require `<!-- id: -->`/`<!-- target: -->` to be written.

- **`id`** is then the element's own existing identifier, taken as written. This is not `/hora` inventing an `id` — the spec's author already assigned it, permanently, before `/hora` ever read it. The same permanence rule still applies: if the spec's own numbering ever reuses or renumbers an identifier, `.hora/tasks/`'s references break, exactly as they would with a hand-written `<!-- id: -->`.
- **`target`** is looked up from the declared prefix table, mechanically. A prefix the table does not cover is treated the same as an unstated `target`: infer from content and report `inferred-annotation` (`blocking: no`).

Once derived this way, `id` and `target` behave exactly as they do when hand-written — `id` is still the permanent reference key, `target` still only decides which task-list file a task is written to. Only where the value comes from changes.

**The unit of extraction may be smaller than a heading-delimited section, too.** A spec built around a table of individually-identified requirements (one row per `FR-010`, `TBL-01`, `SCR-03`, and the like) does not have to promote each row to its own heading before `/hora` can extract from it. When `id`/`target` are derived from the spec's own scheme (above), the row itself is the unit — one row becomes one line in `.hora/tasks/`, not the `##`/`###` heading that merely groups several rows together.

- **The digest is taken per row**, not per enclosing heading. Editing one row must not mark every other row in the same table "the spec changed".
- **The row's own content is the task's body.** A column that already states how to verify the requirement (a "verification method" column, and the like) satisfies the acceptance-criteria requirement; there is no need to also write a separate `### Acceptance criteria` subsection per row.
- **`depends` is still inferred per row**, from the same signals as elsewhere (cross-references between identifiers, foreign-key relationships in a data model, the grouping of identifiers themselves) — once per row, not once for the whole table.
- The enclosing heading still needs its own `target`/`depends` **only if it produces a task of its own.** A heading whose entire content is a table of individually-extracted rows produces none.

This does not relax anything else. `id` is still permanent, `target` still only decides which file a task is written to, and a row without a resolvable `target`/`id` is treated exactly as an unstated annotation would be — infer and report, or stop and ask, by the same rules as above.

**The required sections (`references/spec-template.md`'s list — Repository layout, Implementation scope, Terminology, and the like) never need `<!-- id: -->`/`<!-- target: -->`/`<!-- depends: -->` at all, written or derived.** Every one of them always has the same role — `target: none`, `depends: none`, and an `id` fixed by that role, never invented per project. Recognize each one by its role, the same way its content is already read for meaning regardless of exact wording, rather than by matching heading text literally. This is unrelated to the two mechanisms above: those exist for **feature-level** content, whose `id`/`target` genuinely vary per project; a required section's role never does.

**A feature file carries `target` on its H1. The format requires it.** It becomes the default for the whole file, which every `##` inherits. "Which repository is this feature implemented in" is then visible on the first line of the file. The entry point `spec.md` is a document about the whole version, so its H1 needs no `target`.

If the H1 lacks it, infer it from the content and report that through `inferred-annotation` (`blocking: no`). **Do not stop.** `target` is classification, so it is on the side that may be inferred, and one annotation is not worth halting an entire implementation for (invariant 2).

**Where it is unstated, infer from the content. Never treat it as `none`.** Turning it silently into "no tasks" drops a whole section over a forgotten annotation. Record the inference as `inferred-annotation` (`blocking: no`).

**`target: none` does not mean "do not read".** Some sections produce no task and must still be read.

```
Non-functional requirements   become constraints on every task
The implementation plan       decides the order of tasks
Terminology                   becomes the source of glossary.md
A future search platform      imposes a design constraint ("this arrives later")
```

All `target` controls is **which file a task is written to.**

**Check `target`'s value against the repository layout declaration.** Pointing at a repository that does not exist is a typo, so ask (`blocking: yes`). Ignoring it in silence drops that section's tasks entirely.

Supporting material is read by following relative links from `spec.md` or a feature file. **Tasks are extracted only from `spec.md`, feature files, and declared `Sources`**; anything else reached by a link is there for interpretation. A file nobody links to raises `orphan` (`blocking: no`).

**A required `target: none` role (the list above) may be satisfied by a declared `Source`, not only by `spec.md`'s own text.** The same role-recognition that applies to `spec.md`'s own required sections applies there too: a section in a declared Source that is recognizably "the implementation scope", "the terminology", and the like satisfies that role, whether or not `spec.md` repeats it. Only when the role is found in neither `spec.md` nor any declared Source is it missing — ask, at that role's usual `blocking` severity.

**Two roles are the exception and must be written directly in `spec.md`: the project name and the repository layout.** Both are decisions, not facts to locate. Evidence for either might exist scattered inside a declared Source (a database name, a tech-stack table), but that is indirect evidence, not a stated decision, and Stage 0 needs both before it has any occasion to read a Source deeply. Getting either wrong is expensive to undo — every repository gets renamed — so `/hora` never infers them from Source content, however strongly implied.

**This is not an open-ended search either way.** `/hora` reads `spec.md` itself and whatever is reachable from it — a feature file, a declared Source, supporting material linked from either — and nothing else. A role's content sitting in a file `spec.md` does not link to, declare, or reach transitively is exactly as invisible as if it did not exist.

### 2. Derive the contracts

Write them into `.hora/contracts/<version>/`.

**The largest risk of having split into repositories is contract drift.** Let each repository derive its schema from the spec independently and they will disagree, every time. Derive once before implementing, pin it, and have every side involved read that.

The spec's GraphQL / REST tables usually already carry schema names, inputs and results. **When there is no actual SDL:**

```
RpaFlowsInput(pagination)    the contents are indicated in parentheses
                            → derive it after the shape of an existing schema. blocking: no
                              record in a question what was derived, and how

RpaFlowsInput                the fields are unknown
                            → this would mean inventing the shape of an API. blocking: yes
```

#### Contracts are cut per server

**Not per repository.** One backend repository holds several servers, and each has its own contract.

```
myproject-backend/              one DB system
  employee GraphQL          → used by frontend-employee
  admin GraphQL             → used by frontend-admin
  REST-API                  → used by the phone app
```

One file per server. Name it after the server name in the declaration.

```
.hora/contracts/1.0.0/
  employee-graphql.graphql
  admin-graphql.graphql
  public-rest.md
```

**A contract is only made for a server whose consumer is in another repository or outside.** The declaration's `consumer` column is enough to decide.

| Server | Consumer | Contract |
|---|---|---|
| `employee-graphql` | `frontend-employee` (another repository) | **needed** |
| `public-rest` | the phone app (outside) | **needed** |
| `worker` | an API server in the same repository | **not needed** |

**A Worker's Job payload and the DB schema are not contracts.** Both are closed inside the repository, and the same task list of the same `/hora` implements both sides, so there is nothing to gain by pinning one and showing it to both. **A contract is only for what another implementer reads.**

A server with no consumer, and a frontend with no server to match it, are both errors in the declaration, so ask (`blocking: no`).

### 3. Judge whether the version number is valid

The first version (`1.0.0`) is not judged. From the second on, the diff in `.hora/contracts/` is the primary evidence.

| Difference in the contract | The valid bump |
|---|---|
| none | patch (if nothing was added) |
| fields or types **only added** | minor |
| removed, renamed, retyped, or a **required field added** | **major** |

Changes that do not appear in a contract (wording fixes, internal refactors) are patch. Something that does not appear in a contract but is visible to users (a new screen, say) is minor.

**Only the directory name counts.** If the version written inside `spec.md` contradicts it, have a human fix it through a question (a document's revision number is not the product's version).

Also detect: skipped versions (`1.0.0` → `1.5.0`; report only, non-blocking), and versions that go backwards or repeat (blocking).

A version number becomes three directory names and a tag in `release.yml`, so **questions about versioning are `blocking: yes`.**

### 4. Write the glossary

`.hora/glossary.md` (not split per version, append-only). It stops one concept from acquiring two names. A contract pins the type names on an API's surface, but **not class names, method names or internal variable names.** That is the glossary's territory.

**Check names against `@openreachtech/eslint-config`'s naming rules as they are written.** Skip that and implementation walks into lint errors, each of which invents its own local workaround name.

```
Forbidden suffixes  ~Data ~Info ~Helper ~Item ~List ~Manager ~Utils ~Wrapper
Forbidden words     data item list info acc arr attr btn cate cfg cnt col cond ctx
                    err el ev evt ex ext fmt idx img len msg no num obj opt
                    pos prod ret str usr temp tmp tx txt val callback
Enforced spelling   cancelled → canceled
Forbidden syntax    while / do-while / for / for-of / for-in / let / switch
```

```markdown
| Term | Identifier | Kind | Used in | Notes |
|---|---|---|---|---|
| Flow | `RpaFlow` | entity | backend / frontend | table: `rpa_flows` |
| Random string | `RandomTextGenerator` | existing package | backend | `@openreachtech/mentsu-random-text-generator`. Do not reimplement |

## Names avoided, and why
| The naive name | Why it fails | What was used |
|---|---|---|
| `flowList` | `~List` / `list` are on the denylist | `flows` |
```

**Recording what was avoided is the point.** Without the reason a name came out that way, somebody later restores the naive one and lint fails.

Do not write a change log (git holds that). "Why this name" is the current rationale, so it is written; "when it changed from what to what" is history, and git keeps it.

### 5. Write the task lists

**One file per declared repository.** `target`'s value becomes the file name.

```
.hora/tasks/1.0.0/
  backend.md
  frontend-employee.md
  frontend-admin.md
  app.md            ← only when something spans repositories
```

**`app.md` is not created by default.**

**Write to `app.md` only when a task genuinely spans repositories:** reconciling both sides, work that loses its meaning once split, work that depends on the order of deployment. The parent repository is where coordination lives.

The order comes from the spec's implementation plan and from `depends`.

**A section revived with `kicked: no` may have `depends` pointing into a past version.**

```
1.0.0   #aggregation implemented and done        #payroll was kicked: yes
1.1.0   #payroll revived with kicked: no          depends: aggregation ← already done in 1.0.0
```

Look for the dependency inside the target version alone and it is not there. **Look back through past versions in `.hora/tasks/` and treat it as satisfied if it was finished there.** For a deferred feature, its dependencies finishing in an earlier version is the normal case.

```markdown
- [ ] The RpaFlow model and the rpa_flows table  <!-- spec: data-model @ sha256:abc123... -->
      Constraint: this will be reindexed into Elasticsearch later (#search-infra).
                  leave room for a hook when a run completes
```

**Mark the tasks that touch the same file.**

```markdown
- [ ] The AuditLog Scalar  <!-- spec: audit-scalar -->
      Conflict: appends to scalars/index.js. Three other tasks carry the same mark
```

| What overlaps | How it is detected |
|---|---|
| an aggregation file | from how registration works, seen in Stage 0.5. Nothing overlaps if scanning is automatic |
| the same table | several sections name the same table |

**Whether it crosses features does not matter.** As when a family of Scalar classes is implemented together, it is perfectly normal for **N tasks out of one section to touch the same aggregation file.**

If several features add columns to the same table, there is an order. Where `depends` is not written, infer it and report through `inferred-annotation` (`blocking: no`). It is classification, so it is on the side that may be inferred.

While implementation is serial, the mark is no more than a signal to re-read the real file before writing. **Once parallelization is switched on, it becomes the unit that gets serialized.**

**References read `<!-- spec: <id> -->`. No file name, no version.** There is exactly one entry point per version, so the file name would always be the same value, and the version is already carried by the path `.hora/tasks/<version>/`. Only the `id` is worth keeping.

**Digests are taken per section.** Over the whole file, one character's edit marks every task "the spec changed". A section runs "from its heading to the next heading at the same level or above". **Annotation comments (`id` / `target` / `depends`) are excluded from the digest** (fixing a `target` does not make an implementation stale).

### 6. Carry both kinds of "out of scope" as design constraints

**Confusing them wrecks the design.**

| What the spec says | What the task must reflect |
|---|---|
| out of scope for now (**to be built later**) | leave an extension point. Keep it replaceable |
| **permanently** out of scope | do not abstract it. Exclude it from the design |

Read the first as the second and the structure cannot take it later; read the second as the first and an abstraction layer gets built that nobody uses.

```markdown
- [ ] Access to the target site  <!-- spec: terms -->
      Constraint: getting past a CAPTCHA is permanently out of scope (#scope).
                  stop when one is detected. Build no bypass layer
```

If the spec does not let you tell them apart, ask with `scope` (`blocking: yes`).

### 7. Reconcile on re-entry

**Stage 1 runs every time.** It is not skipped just because `.hora/tasks/<version>/` already exists. Skip it and sections added to `specs/` after the list was settled are never read at all.

Reconcile the set of sections in `specs/<version>/spec.md` against the references in `.hora/tasks/<version>/`, and handle the difference in three ways.

| State | Action |
|---|---|
| a section with no task | add a task. **Append it at the end** (do not disturb the existing order) |
| a section whose digest does not match | mark that task "the spec changed". Clear `[x]` if it is set |
| a section that gained `kicked: yes` | move the task into the `## Withdrawn` section. **Raise a removal task** if it was implemented |
| a section that vanished with no annotation | **do not delete anything.** The intent is unknown, so ask (`blocking: no`) |

A digest only detects changes to sections an existing task points at. **A new section has no task pointing at it, so this reconciliation is the only way to detect one.**

The order follows the implementation plan that is already settled. If the plan does not say where an addition belongs, ask.

**A withdrawn task keeps its line — it moves to a `## Withdrawn` section at the end of the file.** It carries no checkbox, so it does not pollute the count of `[x]`, and the fact that something was planned and dropped stays visible.

```markdown
## Withdrawn

- Computing the payment amount  <!-- spec: payroll-calculation -->
      kicked in 1.0.0
```

If it was never implemented, moving it is enough. If it was, raise a removal task and move it once that is done.

**Have withdrawal stated with `kicked: yes`. Never have the section deleted.** Under the diff scheme, every section that was not changed is "absent", so **absent cannot be told from deleted**. Read absent as deleted and every section becomes a withdrawal candidate on each version bump; read absent as unchanged and a deletion is never detected. As an annotation, it also shows a human reading the diff what was withdrawn.

Because of this stage, all a human does is **edit `specs/` and run `/hora` again.** Nobody has to write `.hora/` by hand.

#### How much may be added to a version

**The line is not the kind of change but whether the version has been released.** Judge by **the tag in the hora repository** (`release.yml` creates it when a merge into main happens).

```bash
git fetch --tags && git tag -l '<version>'    # empty = not released
```

A version is an attribute of the spec, not of the code. **app's merge into main comes after every declared repository's merge into main**, so app's tag is evidence that all of them have been released. One tag check is therefore enough (for the order, see `references/done-criteria.md`).

| State of the version | Treatment |
|---|---|
| **not released** | additions, changes and deletions are all accepted. The version number does not change |
| **released** | leave it alone. Do it in the next version (whose number comes from the table in section 3) |

An unreleased version has no users, so changing a contract breaks nobody. What happens is rework, not a broken compatibility. **A spec change or a withdrawn feature just before release is entirely normal, and this must not be closed off.**

The cleanup differs per kind.

| Kind of change | Cleanup |
|---|---|
| addition | add a task |
| change | clear `[x]` and rebuild the implementation. Derive the contract again too |
| deletion | confirm the withdrawal through a question, and **raise a task to remove the code already written** |

**The easiest thing to get wrong about deletion is that removing a task does not remove the code.** The model, the resolver, the tests and the migration all stay. Without a removal task, a feature that is not in the spec lives on in the code.

While unreleased, a migration can be rebuilt with `db:refresh`, so editing the existing migration directly is fine. Once released, add a new migration that undoes it.

**A spec change after a child repository has already landed on main** becomes an additional PR to that child's main. The version itself is still unreleased, so it may be accepted.

---

## Stage 1.5 — Questions

Write what is unresolved into `.hora/questions/<version>/open.md` and **stop.**

```markdown
## Q1. #scope says nothing about what is out of scope for now
<!-- spec: scope -->
<!-- blocking: yes -->
<!-- category: scope -->

There is a "permanently out of scope" part, but no section for "out of scope
for now (to be built later)". Without that distinction there is no way to decide
whether an extension point should be left in place.

- [ ] resolved
```

- **A human answers by editing `specs/` directly.** They are never asked to touch `.hora/`
- **`/hora` ticks the checkbox.** On the next run it re-reads `specs/` and updates the ones it judges resolved to `- [x]`
- If even one `blocking: yes` is unresolved, **Stage 2 is not entered.** With only `no` left, warn and continue
- Existing questions are never removed. They are appended to, and resolved ones stay as `- [x]`

### How blocking is decided

**Not by whether it can be inferred, but by whether it may be.**

| `blocking: yes` | Why |
|---|---|
| whether the version number is valid | getting it wrong renames three directories |
| the implementation scope | without it, everything gets built |
| missing acceptance criteria | `/hora` must not decide what counts as done |
| unknown fields in an SDL | it would mean inventing the shape of an API |
| whether existing assets may be used | "reimplement" is implied, but whether the code is visible is unknown |
| a contradiction in the text | there is no way to choose between them |

| `blocking: no` | Why |
|---|---|
| a missing `target` / `depends` | it classifies content, so it can be derived |
| a missing `id` on a `##` | it ties to the H1's `id`, so references hold. Only the granularity coarsens |
| an SDL that can be derived from the text | no information is being added |
| confirming a reinvention | a safety net against gaps in the catalog |
| an orphaned file | notice that something will not be read |

### Categories

| category | Content | Default blocking |
|---|---|---|
| `versioning` | whether the version number is valid | yes |
| `scope` | confirming the implementation scope | yes |
| `missing-acceptance` | missing acceptance criteria | yes |
| `existing-assets` | whether existing code may be used | yes |
| `contradiction` | a contradiction in the text | yes |
| `dependency-install` | a task's declared dependency failed to install, or a conflict-proof change failed to apply | yes |
| `lacked-environment` | a test failed for a reason no code change could fix — the middleware was not running, a network call reached nothing, the shared SQLite file was missing or altered outside this run, and the like | yes |
| `undefined-detail` | undefined types, SDL, zod definitions, seed values and the like | depends |
| `common-file` | undocumented handwritten content mixed into a file several tasks share (an aggregation file, and the like) | depends |
| `inferred-annotation` | reporting that `id` / `target` / `depends` was inferred | no |
| `spec-assumption` | an ambiguous acceptance criterion was still meetable under some reading; `hora-verifier` assumed one and judged against it (Stage 2, `hora-verifier.md`) | no |
| `reinvention` | checking whether an existing package already does what is about to be written | no |
| `orphan` | a file that nothing links to from `spec.md` | no |
| `eslint-exception` | an `adhoc/` branch disabled one rule of a genuine rule contradiction for one file (Stage 2, "A lint rule contradiction") | no, but **fail-loud** |

When stopping, end by stating the number of blocking questions and "edit `specs/` and run `/hora` again".

**`no, but fail-loud` is not the same as an ordinary `blocking: no`.** It still does not stop Stage 2 — the point of the `adhoc/` branch was to get the task past the contradiction — but it must never be folded into an ordinary tally either. State it by name, on its own, every time the closing report is written (see "The closing report", below) — an ordinary `blocking: no` item may wait for someone to read the question file; this one must not depend on that.

---

## Stage 2 — Implement

Implement the unfinished tasks in `.hora/tasks/<version>/` in order. **Update the checkbox in the list as each task finishes** (progress survives an interruption).

**If a backend row is declared, clear its `bank-id` lock unconditionally before touching any task** (`.claude/skills/bank-id/SKILL.md`, "Clearing a stale lock") — a lock still standing at the very start of a run is always leftover from an earlier one that ended abnormally, never something still in use.

### Processing one task

Every unfinished task goes through the same sequence, one at a time — nothing here ever runs alongside another task's own sequence (that is what "serial" means; see `references/parallel-run-caveats.md` for why the parallel alternative stays opt-in instead of being the default).

```
1.  Cut task/id/<id> from release/<version>'s current tip
2.  Run hora-implementer (the Agent tool — not the Workflow tool) to write the code and tests
3.  A reported dependency or conflict-proof change pauses this task here: a
    separate agent applies it on its own branch (install/, update/ or retake/
    — see "Per-change branches", under Commits), merged into release/<version>
    once done. Rebase task/id/<id> onto release/<version>'s new tip before
    continuing — if task/id/<id> is itself a sub-feature branch (cut from
    another feature branch, not from release/<version> directly), rebase the
    whole chain, back to where it first left release/<version>, not just this
    one branch. Nothing else runs at the same time in the serial run, so this
    rebase has no conflicting concurrent state to reconcile
4.  Lint: cd into this task's repository, then npx eslint on exactly the files
    this task touched (run it from the outer root instead and every one of
    them is ignored, so lint passes without having read anything — see
    "Where a per-repository command runs")
      fails  -> fix it, retry (up to a limit; see "A lint rule contradiction"
                for what it means when the exact same violation resurfaces,
                or the limit is reached either way — resolved there, not by
                stopping this task)
5.  Test: from that same repository, npx jest on exactly the files this task's
    testRequests named (for a saving-category request, the whole _orders/
    tree, matched only on files literally named _.test.js)
      fails, from something code could fix  -> fix it, retry (up to the same
                kind of limit)
      fails, from something no code change could ever fix (the middleware is
                not running, a network call reached nothing, the shared
                SQLite file is missing or was altered outside this run, and
                the like) -> stop retrying immediately, without spending the
                retry limit on it — retrying does not fix an environment,
                and "fixing" code that was never wrong only makes it worse.
                Report it as a `lacked-environment` question and move on to
                the next task; a human fixes the environment and restarts
                /hora
6.  Once lint and test both hold clean, rebase task/id/<id> onto
    release/<version>'s current tip if anything unrelated to this task landed
    there meanwhile (a different task's install/update/retake, a hotfix
    catch-up) — the general "whichever merges second rebases first" rule
    (under "Merging into a trunk branch"), held off on purpose until now:
    rebasing any earlier would risk changing code out from under an
    in-progress lint/test fix. If this rebase changes anything, go back to
    step 4
7.  Once step 6 needed no further rebase, run hora-verifier (the Agent tool)
    against the settled code — never earlier, since anything before this
    point might still change and is not yet the code worth reviewing
8.  Commit task/id/<id>'s own commits (split per kind, as the Commits section
    requires), merge into release/<version> with --no-ff and a Local-merge:
    message, delete the branch
9.  Set the checkbox to [x] once done, satisfied and every testResult hold
    true; otherwise leave it [ ] and write what is missing into a question
10. Move to the next unfinished task
```

### A lint rule contradiction

Rarely, two lint rules conflict outright — fixing one violation only trips the other, in either direction, with no version of the code that satisfies both at once. This is a defect in that repository's own `eslint.config.js` (**never the outer root's, which does not lint that repository at all** — see "Where a per-repository command runs"), never a sign the implementation is wrong, and it has happened for real, not only in theory.

**Never stop and hand this to whoever is running `/hora` for their own project.** That `eslint.config.js` (and the shared `@openreachtech/eslint-config` it very likely traces to) is not something an ordinary user of this template can be expected to untangle — the fix belongs with whoever maintains that config, not with them. This holds whether the contradiction is ever actually confirmed or the fix loop just never converges — either way, the resolution below is what keeps the user's own run moving; the `eslint-exception` report is what routes the real defect back to whoever can actually fix the config.

**Detecting a genuine loop needs every lint error this fix loop has ever seen, not only the latest one.** Keep every reported violation (rule, file, line) from every attempt so far. The moment a newly-reported violation exactly matches one already kept — same rule, same file, same line — that is definitive proof of a loop: fixing forward eventually led right back to a violation already "fixed" once before. Act on it immediately, without waiting for the retry limit below — comparing the code itself is unnecessary and slower to catch a longer cycle (A trips B trips C trips A again) than comparing the errors directly.

**Reaching the retry limit without ever detecting an exact repeat is handled exactly the same way.** A fix loop that keeps producing different violations, never once repeating, is not proven to be a rule contradiction — it may just be a fix that has not yet been found — but there is no way to tell the two apart from here, and stopping to ask a human over what is likely a trivial style rule is not worth it either way.

**Either trigger resolves identically:** from every distinct violation kept so far (not only the two, if more than two rules were involved across the attempts), pick whichever rule sits lowest on the protection order below, cut an `adhoc/<rule-name>-in-<filename>` branch, add a `files`-scoped override disabling that one rule for that one file **in that repository's own `eslint.config.js`** (the outer root's ignores the whole repository, so an override written there would change nothing), and merge it in like any other branch. Report it as an `eslint-exception` question (below) — `blocking: no`, but **fail-loud**: name it on its own in the closing report, never folded into an ordinary count of how many questions are open. **Reset the retry count and run lint again** — the disabled rule can no longer fail, so whatever remains is judged on its own.

**Which rule gets disabled follows a fixed protection order, most-protected first — disable whichever rule sits lower on this list:**

```
1. no-restricted-syntax                         (never disable this over the others)
2. any other no-restricted-*                    (no-restricted-imports, and the like)
3. any rule that is neither no-restricted-* nor @stylistic/*
4. @stylistic/* (formatting only)               (disable this first, given the choice)
```

**When more than one distinct rule lands on the same, lowest tier, break the tie mechanically, in this order:** prefer the rule with no configurable options; if more than one has options, prefer the one with fewer; if the count is equal too, prefer whichever rule name sorts first alphabetically. Never leave this to judgment — a reader of an existing `adhoc/` override has no way to tell whether "the right one" was disabled unless the same fixed order always produces the same answer.

**One override is one self-contained block, a `// TODO:` comment directly above it, never merged into another block:**

```js
// TODO: Kick out this block after resolved the issue.
{
  files: [
    '<filename>',
  ],
  rules: {
    '@stylistic/xxxx': 'off',
  },
},
```

Keeping every `adhoc/` override in its own block, marked this way, is what makes it possible to find and remove later — the comment states plainly that the block is not meant to last.

### Always check before implementing

**Prevent reinvention.** There are more than 40 in-house packages. The utility layer is never named in a spec, which makes it the most reinvented.

**Default to the catalog.** When a feature is about to be implemented, a module already catalogued in `hora-ecosystem` is the first candidate to reach for, not a fallback checked only once stuck.

**The spec overrides this.** When `specs/` states a particular way to implement something — a specific algorithm, a specific shape, an explicit exclusion of a package — follow that instruction and implement it fresh, even when a close catalogued candidate exists.

```
node_modules/@openreachtech/hora-ecosystem/
  config/lookup.js                        package name (no `@openreachtech/` scope) → catalogued (`true`) or known but excluded (`false`). Absent = never a candidate
  lib/docs/<package-name>/README.md       a verbatim copy of that package's own README, when it has one
  lib/docs/<package-name>/API.md          its exported classes/functions, members and signatures, derived from its `.d.ts`/JSDoc
```

It sits in `myproject-app/`'s devDependencies, so it is readable from a backend task and a frontend task alike.

- Read `config/lookup.js` first and keep only the entries that are `true` — that is the current search space
- **Match a description of the processing about to be written against a candidate's `README.md`/`API.md`, not against a category**
- **`surface` is not a field in the catalog — infer it.** A `renchan-*` name is backend-only and a `furo-*` name is frontend-only, decidable from the name alone. A `mentsu-*` name can go either way; judge it from what its `API.md`/`README.md` describes (a Node-only API, a DOM/browser dependency, and the like)
- **When a `mentsu-*` package and a `renchan-*`/`furo-*` package both address the same need, prefer whichever matches the current surface** (`furo-*` for a frontend task, `renchan-*` for a backend task) **over the generic `mentsu-*` one** — unless `specs/` says otherwise
- An identifier whose name starts with `Base` is used by extending it, not directly (also how `API.md` itself notes members: `.staticMethod()` vs `#instanceMethod()`). Anything else is used directly
- The import name restores the scope `lookup.js`'s key omits: `@openreachtech/<package-name>`
- A real package found in the catalog is installed **individually in the repository that uses it** (the catalog itself does not enter the backend's or a frontend's dependencies) — as its own pair of commits, never mixed into the task's own commit (see Commits, below)
- When something looks close but there is no confidence, record it as `reinvention` (`blocking: no`) and proceed with your own implementation
- **Under `.claude/workflows/implement.js`, do not install it yourself.** Another agent may be implementing another task in the same repository at the same time, and installing races with it. Report it as `dependencies` in your return value instead — the workflow's own Install phase installs it, serially, once every task sharing that pass has reported

**Use the glossary's identifiers.** When a new concept gets a name, append it to the glossary (after checking it against the lint rules).

**Follow the contract.** For each server, the contract in `.hora/contracts/<version>/` is authoritative for the providing side and the consuming side both. Wanting to change a contract mid-implementation means raising a question, not changing it.

**The skills from `@openreachtech/ai-agent-skills` are already usable.** Stage 0 ran `.claude/skills/hora/scripts/equip-skills.sh`, which copies every skill the package ships, unchanged, into this repository's own `.claude/skills/` — invoke them through the ordinary `Skill` tool like any other. Each name is already prefixed by surface (`backend-*`, `frontend-*`, `core-*`), so which one applies to the row you are implementing for is visible from the name alone.

### File and folder names

**Only class definitions are PascalCase. Everything else is kebab-case.**

```
lib/models/RpaFlow.js               a class definition. PascalCase
lib/scalars/AuditLog.js             a class definition
docker-compose.development.yml      not a class. kebab-case
.hora/tasks/1.0.0/frontend-admin.md
specs/1.0.0/attendance/spec.md
```

**The intent is for the name itself to say "this is not a class definition."** Keep the tree in a state where starting with a capital reads as "there is exactly one class in here".

Thanks to this convention, the only place locale can affect the order inside an aggregation file is **the folder names** (kebab-case contains `-`, class names do not).

### How to order imports

**Farthest first.** What is farthest from the current file goes on top.

```
1. Native Node modules (node:*)
2. External modules from outside the company. Largest first
3. The company's shared modules (@openreachtech/*)
4. Modules inside the application
5. Constant files (gathered at the end when there are any, since they are not classes)
```

One blank line between groups.

```js
import fs from 'node:fs'

import { z } from 'zod'
import dayjs from 'dayjs'

import RandomTextGenerator from '@openreachtech/mentsu-random-text-generator'

import Base from './lib/Base.js'

import RpaFlow from './lib/models/RpaFlow.js'
import User from './lib/models/User.js'

import { RPA_STATUS } from './constants/rpa.js'
```

**"Largest first" in group 2 cannot be decided mechanically.** Follow the order in existing files. Judgment that wobbles from run to run costs reproducibility, so decide it yourself only where no precedent exists.

**Inside group 4, order by folder as well.**

```
1. Order by the "folder part" of the import path
2. Inside one folder, order by file name
3. One blank line where the folder changes
```

**Never order the path as a single string.** Files in the same folder end up separated by a group of subfolders (measured).

```
Ordered by the whole path         folder → file name (correct)
./lib/Base.js                     ./lib/Base.js
./lib/models/RpaFlow.js           ./lib/zoo.js          ← same folder, so adjacent
./lib/models/User.js
./lib/scalars/AuditLog.js         ./lib/models/RpaFlow.js
./lib/scalars/Email.js            ./lib/models/User.js
./lib/zoo.js  ← ends up far away
                                  ./lib/scalars/AuditLog.js
                                  ./lib/scalars/Email.js
```

**Compare by locale-independent code units** (the order where `LC_ALL=C sort` and JavaScript's `Array#sort()` agree). **This applies inside group 4 only.**

**Never let a code-unit comparison decide the order of the groups themselves.** The list above decides it. Left to the comparison, it comes out backwards.

```
Code-unit comparison   @openreachtech/... (0x40) → dayjs → zod → ./lib/... (0x2E comes first)
Farthest first (right) zod / dayjs → @openreachtech/... → ./lib/...
```

Where the difference shows up is **folder names**. Let locale in and the handling of `-` and `_` changes, so the order wobbles (measured). A folder that holds classes holds nothing but files named after classes, so its file names are PascalCase with no punctuation, and locale makes no difference.

**Lint does not enforce this order.** `sort-imports` is set to `off`. A broken order still passes CI, so it is maintained as a convention.

### When delegating to the parallel run

**Serial is the default.** Delegate only when a version holds many tasks and it is explicitly asked for — see `references/parallel-run-caveats.md` for why this is not a default to lift casually.

Pass `name: 'hora-implement'` to the `Workflow` tool. **The resolved name is `meta.name`, not the file name** (`meta.name` in `.claude/workflows/implement.js` is `hora-implement`).

```
args: {
  version:      the target version
  repositories: the rows built from the repository layout declaration (backend, frontend-admin, ...)
  resolvedIds:  ids finished in past versions (so that depends of a task revived with kicked: no resolves)
}
```

The workflow runs seven phases, each backed by its own agent under `.claude/agents/` (Install, Lint and Test have none — they run as plain agents, not a dedicated type).

| Phase | Agent | Does |
|---|---|---|
| Scout | `hora-scout` | reads one declared repository's task list and returns its unfinished tasks, structured |
| Implement | `hora-implementer` | writes the code and tests for one task |
| Verify | `hora-verifier` | adversarially checks that implementation against its acceptance criteria, right after |
| Install | — | per repository, serially: `npm install` / `npm uninstall` for reported dependencies, and applies reported conflict-proof changes |
| Lint | — | per repository, run from inside it: `npx eslint` on every file touched so far, fixed and retried (up to a limit) when it fails |
| Test | — | a continuous dispatcher shared across the whole run, every command run from inside the backend repository: `logic`-category tests run together immediately; `finding`/`saving` wait for a database refresh; `logic` always cuts in line first |
| Record | `hora-recorder` | folds every report into `.hora/`, once, at the end |

**What does not change.** Contracts, the glossary, regenerating aggregation files, the import order and the check against reinvention are the same rules serial or parallel.

**Installing a dependency, or applying a conflict-proof change, goes through its own branch either way** (`install`/`update`/`retake`, see "Per-change branches", under Commits) — serially, `/hora` cuts and merges it back itself, the moment the need is found, since nothing else is running; in parallel, an implementer only reports the need, and the workflow's Install phase applies it once, after every task sharing that pass has reported. Either way, **`/hora` itself is what commits it** (`package.json`/`package-lock.json` as a pair; a conflict-proof file on its own), never the workflow or an agent inside it; for the parallel path, `hora-recorder`'s report is where `/hora` learns which repositories need them — and, since that commit goes through its own branch, `/hora` merges it into `release/<version>` **before** committing any checkbox in `.hora/tasks/` that depended on it (`references/done-criteria.md`, "When a task is done", point 8) — a task must never be recorded done while what it needed is still sitting on a branch that has not yet landed.

**What does change.**

| | Serial | Parallel |
|---|---|---|
| who writes `.hora/` | `/hora` itself | **`hora-recorder`** (runs once, serially, at the end of the workflow) |
| the backend's tests | may run per task | **implementer and verifier agents do not run them.** Its shared SQLite file gets wiped and reseeded on every run, so a continuous dispatcher runs them, from inside that repository: `logic`-category (no fixture) together, whenever any are pending; `finding`/`saving` after a database refresh, once `logic` is empty |
| lint | may run per task | **implementer and verifier agents do not run it, on either side.** A dedicated agent runs `npx eslint` from inside that repository, scoped to every file touched in it so far this run, once per repository, per resolved batch |
| tasks touching the same file | implemented in turn, so nothing collides | **serialized through the mark** (set in Stage 1) |
| commits | `/hora` itself, directly on `release/<version>` | `/hora` itself (outside the workflow), the Install phase's own through its branch |

**A failing Lint phase fixes and retries itself, up to a limit (3 attempts), before giving up.** On each failure short of the limit, one agent gets the reported violations for that repository and fixes them — never fanned out one-agent-per-violation, since that would risk two agents editing the same file at once. If it still fails at the limit, the batch's tasks for that repository are reported through `hora-recorder` as a `blocking: yes` question (below), but **their own checkbox is unaffected** — `- [x]` is decided exactly as it already was (`done`, `satisfied`, its own test results, pending installs), never from the lint result. What a failing lint blocks is *progress*: the tasks in that batch are not treated as resolved, so anything depending on them does not become ready until it passes.

**The Test phase runs continuously, decoupled from the batch boundary.** An implementer reports each test it wrote, classified into one of three categories — `logic` (no fixture at all), `finding` (a read-only haystack fixture) or `saving` (writes to the database or an output folder) — instead of running it. The moment any task reports one, a shared dispatcher picks it up: `logic` requests run together immediately (no fixture, so nothing else needs to happen first); once `logic` is empty, `finding` requests run together after a database refresh; once both are empty, `saving` requests run.

**Every one of those runs — and every database refresh between them — happens from inside the backend repository** ("Where a per-repository command runs"): its `jest.config.js`, its `test.sh` and its npm scripts are not the outer root's, and from the root the paths a task reported point at nothing. Unlike lint, this does not pass quietly when it is run in the wrong place — it fails, or finds no tests, and says so — but the rule that avoids it is the same one.

**`saving` (and any `finding` fixture it needs) is safe to bundle together because of one discipline, not because anything sorts or groups it.** An assertion may use an `id` to fetch its own row, but never as the thing being asserted, and never asserts over a whole collection (a count, "the latest one", "nothing else exists") — scoped this way, a test cannot be affected by any other task's rows, whatever table they share. This is why `saving` needs no `_orders/`-wide dependency graph: two files are either both self-contained (safe in any order) or one of them violates the discipline (a bug to fix in that file, not a reason to compute an order). Explicit row ids never collide either, for the same structural reason — see the `bank-id` skill, which any task writing an explicit id calls first.

**`_orders/` still exists, and every `saving` file still lives under it** — not to sequence writers against each other, but to keep them structurally apart from `finding`'s stable fixture, which a stray write would otherwise corrupt. Inside it, two kinds of folder appear.

| Folder | Holds | Order |
|---|---|---|
| `_orders/saving/` (the default) | any `saving` file with no dependency on another one | none — file name only |
| `_orders/<scenario-id>/` | files that implement a spec section written the way `references/spec-template.md`'s "A behavior that only exists once two sections cooperate" describes | the numbering the files were given, since only a human decided this dependency exists — `/hora` never infers it |

**`_.test.js` is still a thin, regenerated aggregator** — scan the folder, `import` every sibling in the order above, write the whole file. No model graph, no computed ordering: file-name order is enough once the discipline above holds.

**The whole of `_orders/` runs as one single-process invocation, workers disabled.** The discipline above only rules out *data*-level conflict — the shared SQLite file itself cannot tolerate two connections at once regardless, so Jest's default worker parallelism must stay off for this run specifically.

On a failure, `_orders/`'s fix targets only the file that actually failed — a file whose predecessors in the same run already passed is not the cause, so it is left alone; the third possibility besides a bug in that file or in the code it exercises is that **the file itself violates the discipline above** (an old assertion written before the convention existed, say), and the fix is to narrow it, never the surrounding files. Each of the three categories, on a failure, gets the same fix-and-retry treatment as Lint (up to 3 attempts), one agent per batch. **Unlike lint, a failing test result blocks the task's own checkbox, not only progress** — `- [x]` needs every one of a task's own test results to be `passed: true`, since a test backing the acceptance criteria is what "done" means at its core, not a separate hygiene gate.

**The workflow has no return value.** The state is in `.hora/`. When the workflow ends, read `.hora/tasks/` and `git status` to decide what is next.

If any `stuck` task comes back (a dependency that will not resolve), `hora-recorder` writes it out as a `blocking: yes` question. It is either a dependency cycle or a reference to an `id` that does not exist, and it cannot proceed until the spec is fixed.

### Aggregation files are regenerated

An aggregation file that bundles classes for export (`index.js` and the like) is **derived.** When a class is finished, **scan its folder and rewrite the whole file. Do not insert one line.**

**Every regeneration starts with this banner, unchanged.** It is the only thing that never comes from the folder scan — write it first, every time, then the export lines below it.

```js
/*
 *  ___   ___    _  _  ___ _____   ___ ___ ___ _____
 * |   \ / _ \  | \| |/ _ \_   _| | __|   \_ _|_   _|
 * | |) | (_) | | .` | (_) || |   | _|| |) | |  | |
 * |___/ \___/  |_|\_|\___/ |_|   |___|___/___| |_|
 *
 *  _____ _  _ ___ ___   ___ ___ _    ___
 * |_   _| || |_ _/ __| | __|_ _| |  | __|
 *   | | | __ || |\__ \ | _| | || |__| _|
 *   |_| |_||_|___|___/ |_| |___|____|___|
 *
 * Code generated by /hora. DO NOT EDIT.
 */

export { default as Base } from './lib/Base.js'
export { default as Zoo } from './lib/zoo.js'

export { default as RpaFlow } from './lib/models/RpaFlow.js'
export { default as User } from './lib/models/User.js'

export { default as AuditLog } from './lib/scalars/AuditLog.js'
export { default as Email } from './lib/scalars/Email.js'
```

The order is the one in the previous section. **An export name matches its file name.**

The reason to regenerate is **idempotency.**

| | Inserting | Regenerating |
|---|---|---|
| depends on the previous content | **yes.** It assumes what its own line is added to | no. Decided by the folder's contents alone |
| when writes collide | one side's line is lost | **the content does not break.** With both files present, anyone writing produces the same result |
| a missing export line | goes unnoticed | **is always picked up by the next regeneration** |
| the rule for where to insert | every implementer has to know it | only the generator has to know it |

**It depends on the order tasks finish in not at all, so reproducibility is complete.** The content is a function of the folder's contents.

**Nothing handwritten may be mixed in.**

```
aliased exports (renaming with as)
re-exporting an external package
excluding a particular class
```

Any one of these makes the file underivable, and **the safest move — regenerating — is no longer available.** To use an external package, import it in the file that uses it, not in the aggregation file.

On finding an aggregation file with something underivable mixed in, **do not regenerate: insert only the one line, at the position the previous section gives.** Whether this is a question, and how urgent, depends on whether the mixture is already accounted for.

| Is the mixture documented? | Treatment |
|---|---|
| **Yes** — `specs/` or an already-resolved question says this file is allowed to carry it | Insert and move on. **`blocking: no`** — it is settled |
| **No** — nothing says so | **`blocking: yes`.** `/hora` cannot tell an approved exception from an accidental edit, and only a human decision, recorded in `specs/` or a question, can settle which this is |

**Once a human has documented the mixture as expected, also remove the banner if the file still carries it.** The banner claims the file is purely derived; a file with an approved handwritten element no longer is, so leaving the banner in place would be a false claim.

### Conflict-proof files are reported, not written directly

Some files are neither derivable by a folder scan nor safe to edit directly from more than one task at once — **`package.json`/`package-lock.json` is one instance of this** (the Install phase, above); the pattern is more general.

**The line that decides pattern A (an aggregation file, above) from this: does a task add a new file for a scan to pick up, or edit an existing shared file's own content?** A derived class piling into its own folder is pattern A, no matter how many classes accumulate there — the scope of the scan does not matter. A change to what a shared ancestor itself provides — a getter every derived class should have, added to the `Base` class (or equivalent) — edits one already-existing file, so it is always this pattern, regardless of how narrow or wide that ancestor's reach is.

**Known instances**, beyond `package.json`/`package-lock.json`:

```
.env.development                a new environment-variable key
docker-compose.development.yml  a new profile to enable
the Base class (or equivalent)  a getter/method meant for every derived class
```

More may turn up once Stage 0.5 reads the real tree — the question above decides it, not this list.

**Report the change needed; do not make it yourself.** Same discipline as a dependency: state what the file needs, in the implementer's return value under `conflictProof`, and let the Install phase apply it once, after every task sharing the pass has reported.

**Commit it on its own**, same as `package.json` — never mixed into a task's own commit (see Commits, below).

### Commits

`git log .hora/` becomes the history of what ran, and the checkboxes hold what is done. There is no separate state file. **That is what the commits are for.**

- **Never commit straight to `main`.** Work on `release/<version>` — the version whose `spec.md` is currently being worked on (`main-guard.yml` restricts PRs into main to `release/*`, `hotfix/*`, `dev` and `env`). This applies to the hora repository itself and to every declared row, all under the same branch name
- **In the serial run, an ordinary task's own commits do not land on `release/<version>` directly either — they go on its own `task/id/<id>` branch first** (see "Per-change branches", below), cut from `release/<version>`'s own tip and merged back into it once the task is done. "Work on `release/<version>`" still describes where that branch itself comes from, and where `install`/`update`/`retake` commit directly
- **Create the branch when it does not exist yet.** `git fetch origin --prune`, then branch from `origin/main` if `release/<version>` is still missing after that. For a row Stage 0 just set up with a fresh `git init`, there is no `origin` to fetch from yet — branch from the current `HEAD` instead
- **The first commit on a newly created `release/<version>` is an empty marker**, before anything else lands on it: `git commit --allow-empty -m "Release <version>"`. This departs from `core-git-commit`'s general branch-opening marker, which always begins with `Start` — a deliberate exception for `release/<version>` specifically, not a mistake to reconcile
- **`hotfix/xxxx` skips the opening marker entirely — no empty commit, not even a differently-worded one.** It exists to move fast on one emergency fix; the marker exists to give a human something to point at when a branch's own start matters, and a hotfix branch is disposable and urgent enough that this is not worth the extra commit
- **This exemption holds only as long as `hotfix/xxxx` never itself becomes a trunk branch** — never cut a sub-hotfix or a sub-feature branch from it. A fix that would need one is not a **hot**fix anymore; do it properly instead, as a patch-bumped `release/x.x.+x` with its own real versioning. The marker is waived because nothing complex is supposed to happen on this branch, not as a general discount on ceremony
- **Stamp the spec ID into the commit message.** It is the only way to follow one change across every declared repository

```
Add RpaFlow model and rpa_flows migration

spec: 1.0.0#data-model
```

- **Split per kind. One kind per commit.** Messages are short and imperative
- **`package.json` and `package-lock.json` always go in separate commits**, `package.json` first. The first is intent written by a human, the second is output generated by npm; mixed together, a few lines of intent are buried in thousands
- **This is a different axis from keeping a dependency change off a feature branch entirely.** The latter is how a human team stops a `package-lock.json` conflict from happening at all — one change at a time, merged to the trunk branch before the next one starts. In the parallel run, the Install phase gets that same guarantee the same way: its own branch, cut from `release/<version>`, merged back before the next one starts (see "The Install phase's branch", below) — only one thing ever writes `package.json` at a time (`/hora` itself, directly, when serial; the Install phase, when parallel) — see "What does change" under the parallel run, above
- **The `package-lock.json` commit message is always `Update package-lock.json after npm install`** (or `... after npm uninstall`) — it carries no other information, since the diff itself is not meant to be read
- A dependency left in `package.json` after the feature that needed it was later dropped from the spec is not worth a cleanup commit on its own. It costs nothing to leave unused, and chasing it would only reopen the same `package-lock.json` conflict risk this rule exists to avoid
- **A dependency update can break `npm test` / `npm run lint`.** When it does, a fix commit right after the `package-lock.json` commit is fine — **but only when the fix is dependency-specific**, something the update itself is what makes it necessary. When the identical fix would already have applied before the update too, it is not caused by the update: commit it on its own, before the `package.json` commit, not folded into what comes after it
- **A conflict-proof change (`.env.development`, `docker-compose.development.yml`, the `Base` class, and the like) gets its own commit**, one per file, never mixed into a task's own commit — unlike `package.json`, there is no generated pair to split it from
- An update to a task list (`.hora/tasks/`) does not go in the same commit as the implementation it belongs to. `myproject-app` and the implementation repositories are separate repositories, so they are separated structurally

### Merging into a trunk branch

A trunk branch is one other branches are cut from and merged back into — `main` itself, and, for the run's own purposes, `release/<version>`.

Three more grow from `main` and count as a trunk branch in the narrow sense — each is itself where other branches merge back into, on the way to `main`: **`env`**, bundling the initial environment setup; **`dev`**, used by people on the older development style that predates `/hora`; **`hotfix/xxxx`**, cut for one emergency fix.

**This role is relative, not a fixed list.** Any branch becomes a trunk the moment something is cut from it, for as long as that something has not yet merged back — a feature branch mid-implementation, with its own sub-feature branch cut from it, is a trunk to that sub-feature branch until it merges back. The same rules below (`--no-ff`, `Local-merge:`, rebase-before-merging-second) apply there too, not only at `main`/`release/<version>`.

- **Always `--no-ff`, never fast-forward.** A fast-forward merge leaves no commit a human can point at; if that tracking did not matter, no git-operation rule here would either — everything could just be merged straight into `main`
- **The merge commit's message is `Local-merge: <what merged> [<id>]`** (`[<id1>, <id2>, ...]` when the merge covers more than one task) — the equivalent of GitHub's own `Merge pull request #NNN from <branch>`, for a merge with no real PR behind it. **Never the branch name** — every branch this scheme ever creates (`install/<version>`, a disposable line during hotfix catch-up) is machine-named and carries no information a reader could use; what is worth citing is the content and the spec `id` it traces to, the same as any other commit. **`Local-merge:` is a second exception to `core-git-commit`'s "no type prefix" rule**, alongside `Start …` — a merge commit records an integration event, not a hand-authored description of a change, the same way GitHub's own auto-generated merge message is not held to the imperative-content convention either
  ```
  Local-merge: Install date-fns and add REDIS_URL to .env.development [attendance--monthly, payroll]
  ```
- **Delete the branch once it is merged.** This holds for every branch merged into a trunk, `release/<version>`, `hotfix/*`, `dev` and `env` merged into `main` included
- **When two branches were cut from the same commit on a trunk and both aim to merge into it, whichever merges second rebases onto the trunk's new tip first, then merges.** This keeps the trunk's history from recording a divergence that never had to exist
- **Every rebase in this scheme uses `-r` (`--rebase-merges`), explicit about what moves where:**
  ```bash
  git rebase -r --onto <trunk's new tip> <the commit this branch was cut from> <branch>
  ```
  Without `-r`, `git rebase` flattens history — every merge commit it replays is dropped, and a trunk built entirely of `--no-ff` merges (above) would lose the very thing `--no-ff` exists to keep
- **Immediately after merging anything into `release/<version>`, run the check in "Keeping `release/<version>` current" again.** This is what stands in for periodic monitoring — `/hora` has no scheduler, so a merge it was already doing is the next-best occasion to notice `origin/main` moved

#### Per-change branches

Five kinds of change each get their own branch — cut from `release/<version>`'s current tip, merged back into it with `--no-ff`, deleted once merged, on the same lifecycle as any other branch merging into a trunk (above). Unlike the rule that the merge message never names the branch, **these branch names are deliberately descriptive** — the name is what a reader scans `git branch` for while the work is still in flight; it is gone once merged, which is exactly why the `Local-merge:` message still carries the real content separately, for after that.

| Kind | Name | Example |
|---|---|---|
| a new dependency | `install/<package-name>-<version>` | `install/date-fns-4.1.0` |
| an existing dependency's version bump | `update/<package-name>-to-<version>` | `update/date-fns-to-4.2.0` |
| a conflict-proof file's expected, planned change | `update/<filename>-with-<what>` | `update/Base-with-SampleClassName` |
| reworking something already implemented, found lacking later (a lint rule strengthened after the fact, and the like) | `retake/<member-name>-of-<class-name>-for-<why>`, or `retake/<filename>-for-<why>` when no single member is at fault | `retake/save-of-UserRepository-for-no-restricted-syntax` |
| an ordinary task, serial run only | `task/id/<id>` | `task/id/sign-up-then-sign-in`, `task/id/fr-010` |

**`update` and `retake` read differently even when both touch the same file.** `update` is planned, expected growth — a dependency's version, a `Base` class gaining a method a new derived class needs. `retake` is a redo — existing work that turns out to have been done poorly, surfaced later (most often, `@openreachtech/eslint-config` gaining a new rule that an already-committed file now fails; see the Commits section's own note on a dependency update breaking `npm test`/`npm run lint`). Naming the branch by which of the two it is keeps that distinction visible while the work is still in flight, not only in the commit that follows.

**`task/id/` always holds the `id` verbatim, never a summary in its place — not even where the `id` itself reads as opaque** (`fr-010`, and the like). Judging whether an `id` "is descriptive enough" to skip a summary would make the format depend on that judgment call, and a reader of an existing branch name has no way to tell which case produced it. One fixed shape avoids that: look the `id` up in `.hora/tasks/` or `specs/` for what it means; do not expect the branch name to say it.

**When more than one of these is waiting to merge into `release/<version>`, `install`/`update`/`retake` go first, ahead of any `task/id/`.** A task's own branch may depend on what one of these provides (a package it just added, a `Base` method it needs) — clearing them first avoids a task branch rebasing needlessly more than once.

`install`/`update`/`retake` apply in both the serial and the parallel run — the same shared-write hazard (`package.json`, a shared aggregation target) exists either way. `task/id/` is serial-only: the parallel run's own tasks are committed the way "What does change" (above) describes instead.

### Keeping `release/<version>` current

**`release/<version>` is not rebased, with one exception.** Once created, its own history stays as `/hora` built it — nothing already merged into it is ever reverted or rewritten away.

**The exception is a `hotfix/*` landing on `main` while `release/<version>` is still open.** Check for it at step 0 of every invocation, and again right after every merge into `release/<version>` (above) — `/hora` never asks a human before running the check itself; asking only starts once the check turns up something it cannot resolve on its own (below).

```bash
git merge-base --is-ancestor origin/main release/<version>   # 0 = nothing new landed / 1 = it did
```

A `1` means `origin/main` now holds a commit `release/<version>` does not — ordinarily only possible through a `hotfix/*` merge, since `main` otherwise only moves once every declared repository's own `release/<version>` merges into it (Stage 3, "Merge order").

**If this check runs while `task/id/<id>` (serial run, "Processing one task") still holds uncommitted work, commit that work first, as a single commit, before doing anything else.** Use `saving-YYYYMMDD-HHii` as the message (today's date and the current time, `HH` hours and `ii` minutes) — a plain save point, not a real description, and not split per kind the way a finished task's commits are. Only once that commit exists does `task/id/<id>` have a clean state safe to rebase.

**Once the rebase lands, `git reset --soft` that `saving-YYYYMMDD-HHii` commit away and continue the task from where it left off.** It only ever existed to give the rebase a clean tree to work with — `--soft` keeps every change it held staged, exactly as if the commit had never happened, so the task's own eventual commits (step 8) are still the real, per-kind history, never this placeholder.

#### The catch-up procedure

Never rewrite `release/<version>` directly. Build the caught-up result on a disposable `temp` branch instead, and only ever move `release/<version>` itself once, at the very end, to `temp`'s finished tip.

```
1. Branch temp from release/<version>'s current tip.
2. Attempt the whole thing in one shot:
     git rebase -r --onto origin/main origin/main temp
   Success → temp is release/<version>, fully caught up. Skip to step 6.
   Conflict → git rebase --abort.
3. Walk temp back one commit at a time and retry step 2 at each point,
   until one succeeds:
     git rebase --onto @^ @      # moves temp back one commit; replays nothing
   (Only the Install phase's branch and any hotfix-restacked branch ever touch a
   shared file, so this typically stops right after backing past the most recent
   merge — but it is a plain one-commit-at-a-time walk, not a jump to the nearest
   merge, and does not assume that in general.)
4. Call the point reached C. temp now holds release/<version>'s history up to C,
   rebased cleanly onto origin/main. The next commit after C, in release/<version>'s
   ORIGINAL history, is where catching up stopped working.
5. Handle exactly that next stretch, and no more:
   - An ordinary commit → cherry-pick it onto temp directly.
     Conflict → git cherry-pick --abort, redo it (below), commit the redone
     version onto temp, then continue.
   - A --no-ff merge commit M (some branch B) → reconstruct B on its own
     disposable line branched from temp, cherry-picking B's own commits
     (git log M^1..M^2) onto it one at a time, aborting and redoing (below)
     wherever one conflicts. Once every one of B's commits has landed, merge
     that line into temp the same way any branch merges into a trunk (above:
     --no-ff, message Local-merge: <what B was for> [<id>]) and discard it.
6. Retry the bulk form for whatever remains after the stretch just handled:
     git rebase -r --onto temp temp <original release/<version> tip>
   Success → done. Conflict → go back to step 3, walking back from here instead
   of from origin/main.
7. Once release/<version>'s entire original history has landed on temp with
   nothing lost, fast-forward release/<version> to temp's tip and delete temp
   (and any leftover disposable line from step 5).
```

#### Redoing a conflicting commit

Never hand-resolve a conflict textually. Redo means reproducing the same intent against the tree as it now stands, the same way `/hora` would have produced it in the first place.

| The commit's own kind | How to redo it |
|---|---|
| a task commit (carries a `spec: <id>` trailer) | trace `<id>`, clear its checkbox in `.hora/tasks/<version>/`, and reimplement it through the ordinary Stage 2 flow against the tree as it stands at this point |
| a `package.json`/`package-lock.json` commit (an Install phase dependency change) | **stop instead of redoing it, if the commits `release/<version>` is catching up on (the `hotfix/*` side) also touch this file.** Re-running `npm install` there would silently pick some resolution — neither the hotfix's nor the original task's, and with no conflict to surface the disagreement. Report it in the closing report and wait for a human. Otherwise, safe to redo: re-run the same `npm install`/`npm uninstall` the original commit reported, against the tree as it stands here |
| a conflict-proof file commit | the same distinction as above: stop and ask if the hotfix side also touches this file; otherwise re-apply the same reported change fresh |
| the branch's own empty opening marker | never conflicts — it carries no diff |

---

## Stage 3 — Verification by machine

Get test and lint passing in the backend and in every frontend. Read `references/done-criteria.md` for the criteria and the commands.

**Acceptance criteria are written in the spec's sections.** That `npm run lint && npm test` passes is common to every task, so a spec does not write it down. A section's specific **behavior** is its acceptance criteria. Check that tests actually hold that behavior.

---

## The closing report

**The one real harm of the nested structure is that the outer `git status` shows nothing from inside.** Run `git status` at the root and only updates to `.hora/` are visible. Commits get forgotten.

**Check and report `git status` for the hora repository and for every declared repository.** This cannot be skipped. The number of repositories differs per project, so walk the declaration.

```bash
git status --short --branch
git -C <project name>-<declared row> status --short --branch    # for every row in the declaration
```

**`--branch` matters now, not just `--short`.** Every repository is expected to be on `release/<version>` (see Commits); a repository sitting on anything else is worth surfacing, not silently reported as if it were normal.

What the report includes:

```
the target version and the stage that was reached
how many tasks finished and how many are left
the state of the questions (how many blocking remain)
git status for every repository, including the branch (state it explicitly if anything is uncommitted, or if a branch is not release/<version>)
what the next run of /hora will start from
```

When it stopped with a `blocking: yes` outstanding, **put what the human has to do first** (which section to add what to).

**Every `eslint-exception` question (Stage 1.5, "Categories") gets its own, separate line, by name — never just counted among the ordinary questions.** It records that a real lint rule contradiction forced an `adhoc/` branch through, and that is worth a human's attention on its own even though it never stopped the run.

---

## References

| File | Content |
|---|---|
| `references/spec-template.md` | the template for a design document. The authority on the format of `specs/<version>/spec.md` |
| `references/boilerplates.md` | Stage 0's procedure. Which boilerplate to choose, and what to fill in where |
| `references/done-criteria.md` | Stage 3's criteria, and the conditions for a task to be done |
| `.claude/workflows/implement.js` | Stage 2's parallel run (`meta.name: 'hora-implement'`) |
| `.claude/agents/hora-scout.md` | reads one repository's task list for the parallel run |
| `.claude/agents/hora-implementer.md` | implements one task, via the Agent tool either way — serial one task at a time, parallel through the workflow |
| `.claude/agents/hora-verifier.md` | adversarially verifies one implementation, via the Agent tool either way — serial one task at a time, parallel through the workflow |
| `.claude/agents/hora-recorder.md` | the only agent that writes `.hora/`, parallel run only |

When a human asks about the format of `specs/`, point them at `references/spec-template.md`. **The template must never be copied into `specs/`** (writing to `specs/` is forbidden). `specs/1.0.0/spec.md` ships empty — writing the first spec, with the template as a guide, is a human's job.
