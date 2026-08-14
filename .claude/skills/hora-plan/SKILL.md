---
name: hora-plan
description: Plan one version of an application from its spec. Fixes which version is being built, verifies the spec for holes and contradictions in conversation with its author, and writes the feature-level task list — feature implementation tasks and acceptance tasks, not implementation-level steps. Runs at the root of the hora repository (myproject-app). Invoked by /hora, or directly as /hora-plan.
---

# hora-plan

**The planner.** Decide which version is being built, get its spec into a state that can actually be built, and write the list of features to build.

Read `../hora/references/structure.md` first — the layout, the invariants and the language rule all come from there. **`../hora/references/asking.md` fixes how anything here is put to a person**, and it is the same file `/hora-spec` reads: a check, a proposal and a question are three different acts, and the question tool is the default for all three.

## The three things this skill does

```
1. Fix the version being implemented
2. Verify the spec for holes and contradictions, and resolve them in conversation
3. Write the task list — one entry per feature, plus the acceptance tasks
```

**The task list is feature-level, never implementation-level.** "Build the attendance feature" is an entry. "Write the `RpaFlow` model" is not — that is a checkpoint inside `/hora-build`, and this skill does not decide it. A planner that writes implementation steps has decided how to build something before anyone has looked at the tree it will be built in.

## This skill may write into `specs/`. Only `/hora-spec` may too

Planning is a conversation with whoever wrote the spec, and asking that person to hand-edit twenty separate holes one at a time defeats the point of having the conversation. So this skill may write into `specs/`, under the procedure in `../hora/references/structure.md`, invariant 1:

```
1. state the hole or contradiction found
2. propose the exact edit, in full
3. wait for that person to approve THAT edit
4. write it
```

**Approval is per edit, never blanket.** "Yes, fix them all" is not approval of edits nobody has read yet. What is protected here is not the act of writing — it is that **no requirement ever enters `specs/` without a human having read the exact words first.**

**Step 2 is a proposal, and it is said as one** — "I suggest this edit; it is yours to decide". **Where the finding is instead that this skill may have misread the document, that is a check** — "I read this as X; is that right?" — and it is settled before any edit is proposed at all (`../hora/references/asking.md`). Half of what looks like a hole in a spec is a hole in the reading of it, and proposing an edit for one of those puts the planner's misunderstanding into the document.

**Step 3 stays in prose.** The edit's exact words have to be read, and an option labelled "approve" is what lets somebody not read them. **Everything around it defaults to the question tool** — which of two readings holds, which of three fixes to take, whether a finding is worth blocking on.

**A finding that needs design work goes to `/hora-spec` instead, at the stage that owns it.** The split is by what the fix is, not by how large it looks:

| The finding | Where it is fixed |
|---|---|
| a missing annotation, a `target` that names no repository, a typo, a section number that drifted | **here**, one edit at a time |
| a missing use case, a use case the design cannot serve, an operation with no kind or no caller, a scope split nobody has made, a contradiction between two designed things | **`/hora-spec`**, at the stage `../hora-spec/references/stages.md` names |

**Why it is not all done here.** A use case written into `specs/` by the planner is a use case no stage ever walked against a data model or a screen — which is the exact failure the seven stages exist to prevent, reintroduced at the point where it is cheapest to reintroduce.

**Never write into a past version's directory.** Past versions are frozen (below). A fix that belongs to an already-released version goes into the version currently being planned, as a full replacement of that section.

---

## 1. Fix the version

**A version directory is one under `specs/` whose name is a semver version, and nothing else.** `specs/skeleton/` holds the blank spec that gets copied from (`../hora/references/spec-format.md`; `/hora-spec` does the copying) — it is never planned, never implemented, and never counted as unfinished. Any other non-semver directory is treated the same way: skipped, and reported once so nobody assumes it was read.

**The target version:** among those directories, the **lowest** one whose `.hora/tasks/<version>/` has not been generated or still holds unfinished features. If all are finished, the lowest version that exists under `specs/` but not under `.hora/tasks/`. If there is no such version either, report that every version is complete.

**Only the directory name counts.** If the version written inside `spec.md` contradicts it, have a human fix it (a document's revision number is not the product's version).

**If the target version's `spec.md` is empty or missing, hand the run to `/hora-spec`** and stop. That skill copies the blank spec and writes it through its seven stages, in conversation, one approved section at a time. **Never write the first spec of a version here** — not because writing it is forbidden, but because writing it without those stages means writing use cases nothing ever walked against a design.

### Resolve the diffs first

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

No `target`, no `depends`, no body. Only `kicked` is overwritten; the rest carries over.

**Deferring is expressed as "`kicked: yes` in this version, `kicked: no` in the next".** `kicked: yes` carries over through diffs, so a section stays kicked until it is explicitly brought back.

**Files of past versions are never rewritten.** The file of the version that kicked it keeps its `kicked: yes` and stands as the record that it was not built then. Carrying bodies over works precisely because past versions are frozen.

A gap in the versions (`1.0.0` → `1.5.0`) does not break the chain. **Only the versions that exist** are applied, in ascending order.

**Annex material is not diffed in parts.** Prose cannot be patched, so **the version that wants to change it places the whole text.** From that version on, that copy is used; versions that do not change it hold no copy.

**Scanning, digests and the judgment about "a section that disappeared" all happen against the resolved document.** Handled per file, every feature would be flagged "the spec changed" on every version bump.

### Judge whether the version number is valid

The first version (`1.0.0`) is not judged. From the second on, the diff in `.hora/contracts/` is the primary evidence.

| Difference in the contract | The valid bump |
|---|---|
| none | patch (if nothing was added) |
| fields or types **only added** | minor |
| removed, renamed, retyped, or a **required field added** | **major** |

Changes that do not appear in a contract (wording fixes, internal refactors) are patch. Something that does not appear in a contract but is visible to users (a new screen, say) is minor.

Also detect: skipped versions (`1.0.0` → `1.5.0`; report only, non-blocking), and versions that go backwards or repeat (blocking).

A version number becomes three directory names and a tag in `release.yml`, so **questions about versioning are `blocking: yes`.**

### How much may be added to a version

**The line is not the kind of change but whether the version has been released.** Judge by **the tag in the hora repository** (`release.yml` creates it when a merge into main happens).

```bash
git fetch --tags && git tag -l '<version>'    # empty = not released
```

A version is an attribute of the spec, not of the code. **app's merge into main comes after every declared repository's merge into main**, so app's tag is evidence that all of them have been released.

| State of the version | Treatment |
|---|---|
| **not released** | additions, changes and deletions are all accepted. The version number does not change |
| **released** | leave it alone. Do it in the next version (whose number comes from the table above) |

An unreleased version has no users, so changing a contract breaks nobody. What happens is rework, not broken compatibility. **A spec change or a withdrawn feature just before release is entirely normal, and this must not be closed off.**

While unreleased, a migration can be rebuilt with `db:refresh`, so editing the existing migration directly is fine. Once released, add a new migration that undoes it.

**A spec change after a child repository has already landed on main** becomes an additional PR to that child's main. The version itself is still unreleased, so it may be accepted.

---

## 2. Verify the spec, in conversation

### What is read

**Reached by a link from `spec.md`, and reached by a link alone — not by name or folder.** Directory shape and file naming are free; a project's own layout does not need to change to be read.

```
specs/1.0.0/spec.md                      the entry point
specs/1.0.0/attendance/spec.md           a feature file. Linked from spec.md
specs/1.0.0/attendance/monthly/spec.md   nesting is allowed
specs/1.0.0/spec/00-overview.md          a declared Source. Any name, any location
specs/1.0.0/docs/RPA_CORE_SPEC.md        linked, but not declared. Interpretation material only
specs/1.0.0/request/csv-export.md        what somebody asked for. NOT read here, and not an orphan
```

**A file that is none of `spec.md` / a feature file / a declared Source, and that nothing links to at all, is never read** — and raises a question (`orphan`, `blocking: no`).

**`specs/<version>/request/` is the one directory this does not apply to.** It holds what somebody wanted this version to do, in their own words; `/hora-spec` reads it, drafts sections from it and gets those approved, and **what it produced is in `spec.md` by the time planning starts** (`../hora/references/spec-format.md`, "a drop-off convention"). Reading it here would extract tasks from a wish list nobody was held to, and raising it as an orphan would report the intended arrangement as a defect on every run.

| | Declared under `Sources`, or a `<feature>/spec.md` | Reached, but not declared |
|---|---|---|
| Read for | extraction — `id`/`target`/`depends`, features, contracts | interpretation only |
| Ever produces a task | yes | never |

**A file listed under a `Sources` section acts as a feature file, even if it is not named `spec.md`.** Read each one listed there exactly as a `<feature>/spec.md` — the same search, the same extraction rules.

### Never invent an `id`

`id` is the reference key from `.hora/tasks/`, and once given it never changes.

| Place | How it is decided |
|---|---|
| the H1 of a feature file | **join the path segments relative to `specs/<version>/` with `--`.** Deterministic and unique |
| a `##` section | **somebody states it and it is written** (`/hora-spec`, or by hand). If it is not written, do not infer it |
| a `##` with no `id` | tie that section's content **to the H1's `id`.** The reference stays stable |

```
attendance/monthly/spec.md   →   id: attendance--monthly     -- separates folders
attendance-monthly/spec.md   →   id: attendance-monthly      -  separates words
```

Reserving `--` for separation alone makes the reverse lookup from `id` to path unique. **Folder and file names must not contain `--`.** A `##` section's `id` joins to its feature's `id` with **a single `-`** (`attendance--monthly-data-model`).

**`id` is unique across the whole version.** On a collision, ask with `blocking: yes`.

**`id`/`target` may come from the spec's own existing ID scheme instead of being written as annotations.** Some specs already carry a permanent, unique identifier per requirement or element (`FR-010`, `TBL-01`, `SCR-03`), together with a table mapping each identifier's prefix to a target. When the entry point's Document information declares this (an `Annotation source` row), `<!-- id: -->`/`<!-- target: -->` are not required.

- **`id`** is then the element's own existing identifier, taken as written. The spec's author already assigned it, permanently
- **`target`** is looked up from the declared prefix table, mechanically. A prefix the table does not cover is treated the same as an unstated `target`: infer from content and report `inferred-annotation` (`blocking: no`)

### The annotations

```markdown
## 6. Data model
<!-- id: data-model -->
<!-- target: backend -->
<!-- depends: none -->
```

| Annotation | Content |
|---|---|
| `id` | a stable identifier (kebab-case, unique in the document). **References use `id`, never a section number** |
| `target` | **which repositories this feature touches.** The repository name with the project prefix removed (`myproject-frontend-admin` → `frontend-admin`; the backend is a single repository, so always `backend`). Also `app` and `none`. Several are comma-separated |
| `depends` | the `id` of the sections it depends on. State `none` explicitly when there are none |
| `kicked` | `yes` means withdrawn. **Shown in an annotation rather than by deleting the section** |
| `built` | how far this feature was implemented **before Hora Kit was adopted** — `spec` / `backend` / `frontend`. Absent for anything built under the kit. **Never inferred** |
| `baseline` | `inventoried` says this feature is **listed: not specified, and not accepted.** Admissible only where `Existing assets` declared `Baseline: inventoried`. It **requires `built:`**, which is then recorded and acted on nowhere — no checkpoint of a listed feature is marked at all, in either direction. **Never inferred, and never recommended** |

Subsections inherit from their parent. State it to override.

**`target` decides which checkpoints apply to a feature, and nothing else.** It no longer decides which file a task is written to — one feature is one file, whatever it touches. A feature whose `target` is `backend` alone skips the frontend gate entirely; one that names a frontend row runs it. Getting `target` wrong therefore changes what gets built, not just where a line is filed.

**Check `target`'s value against the repository layout declaration.** Pointing at a repository that does not exist is a typo, so ask (`blocking: yes`).

**Where it is unstated, infer from the content. Never treat it as `none`.** Record the inference as `inferred-annotation` (`blocking: no`).

**`target: none` does not mean "do not read".** Some sections produce no feature and must still be read — non-functional requirements become constraints on every feature, the implementation plan decides the order, terminology becomes the source of the glossary, a future search platform imposes a design constraint.

**The required sections never need `<!-- id: -->`/`<!-- target: -->`/`<!-- depends: -->` at all.** Every one of them always has the same role — `target: none`, `depends: none`, and an `id` fixed by that role. Recognize each one by its role, the same way its content is already read for meaning regardless of exact wording. A required role may be satisfied by a declared `Source`, not only by `spec.md`'s own text — **except the project name and the repository layout, which must be written directly in `spec.md`.** Both are decisions, not facts to locate.

### What to verify, and what stops the run

Work through the resolved document and check every one of these. **The first three are new gates that did not exist before the checkpoint model** — `/hora-build` verifies against them at checkpoints 2, 9 and 11, so a feature missing any of them cannot be built at all.

| Check | Missing means | blocking |
|---|---|---|
| **Use cases per feature** — except a section carrying `<!-- baseline: inventoried -->` | checkpoints 2, 9 and 11 have nothing to verify against | **yes** |
| **Acceptance criteria per feature** — the same exception, and only those two | "what counts as done" would have to be invented | **yes** |
| **The kind of each API operation** — query / mutation / subscription / REST renderer | checkpoints 3, 6 and 14 cannot choose which convention to follow | **yes** |
| **A stated caller per operation**, and an actors table to state it against | the operation gets whatever filter its neighbours had, and nothing says nobody decided | **yes** |
| **A listed section carrying a usecases block, an acceptance block, a screen section or a data-model table of its own** | it is specified and listed at once, and nothing decides which half the checkpoints run against | **yes** |
| **A feature's use cases and acceptance criteria reaching no further than that feature and its `depends`** | four separate runs act on a block that reaches forward: checkpoint 1 builds from it, 6 and 16 write a test for it, and 18 fails it by construction (below) | **yes** |
| **The version's own acceptance criteria** — the section present, `none` or every criterion carrying `spans:` | the whole-version sweep has nothing to check the product against, and a finding it does raise has no feature to name | **yes** |
| **An order that puts every feature after the features it depends on** | `/hora-build` silently builds them in a different order than the document states, and nothing reports it | **yes** |
| The implementation scope, split into "for now" and "permanently" | the design cannot tell an extension point from a dead abstraction | yes |
| Whether existing assets may be used | "reimplement" is implied, but whether the code is visible is unknown | yes |
| Unknown fields in an SDL or a REST payload | it would mean inventing the shape of an API | yes |
| A contradiction in the text | there is no way to choose between them | yes |
| `baseline: inventoried` under `Baseline: verified` | the permission was never granted, and it is the declaration that makes a listed feature legible to every later reader | yes |
| `baseline: inventoried` with no `built:` | nothing makes "this code exists" checkable. The section could be a feature nobody ever built — uncounted, unswept, and with no removal task | yes |
| `baseline: inventoried` with `authority: to-spec` | `to-spec` runs every checkpoint against the existing code; listing says none of them runs | yes |
| `baseline: inventoried` on a section added after the version that declared `Baseline: inventoried` | new work is not inherited code, so there is nothing already running to list (`../hora/references/spec-format.md`, "`baseline`") | yes |
| **A `depends` naming the listed section**, where a feature's own tables or operations sit on those of a section carrying `<!-- baseline: inventoried -->` | the dependent gets no `Rests on:` line and stays outside the transitive set when the debt is paid — a pass resting on unstated behavior, hiding what it rests on | **yes** |
| A missing `target` / `depends` | it classifies content, so it can be derived | no |
| A missing `id` on a `##` | it ties to the H1's `id`, so references hold | no |
| An orphaned file | notice that something will not be read | no |

**Use cases and acceptance criteria are not the same thing, and a spec that has one still needs the other.**

| | States | Verified at |
|---|---|---|
| a **use case** | who does what, for what purpose, end to end | checkpoints 2 (does the spec support it), 9 (does the built API support it), 11 (does the screen support it), 18 (does the product support it) |
| an **acceptance criterion** | an observable behavior that is either present or absent | the tests written alongside the code, and checkpoint 18 |
| a **version acceptance criterion** | an observable behavior that spans several features | **the whole-version sweep, and nothing else.** No feature gate reads it |

A feature with acceptance criteria but no use cases builds a set of operations that are each correct and together unreachable — every API returns what it should, and no screen strings them into anything a person can do. **That failure surfaces at acceptance, at the far end of eighteen checkpoints, which is the most expensive place to find it.** This is exactly what the acceptance review looks for, and this gate is what stops it from being found only there.

**A section carrying `<!-- baseline: inventoried -->` is the one exception to the first two rows, and it suspends exactly those two.** `missing-usecase` and `missing-acceptance` are not raised for it: it is listed rather than specified, nothing about it is built or accepted, and there is therefore nothing for either block to be checked against (`../hora/references/spec-format.md`, "`baseline`"). **Nothing else is lifted.** `undefined-api-kind` and `missing-authorization` are raised over the rows a listed feature's operations occupy exactly as over any other feature's, because those rows describe code that is already running and already reachable — an operation whose caller nobody ever stated is reachable today, by whoever the neighbouring filter let in, and a declaration about how much gets verified changes nothing about that.

**The emptiness is checked in the other direction too.** A listed section is a heading, its annotations and one line of prose; one that also carries a usecases block, an acceptance block, a screen section or a data-model table of its own is claiming both states at once, and whichever half gets ignored is the half somebody wrote on purpose. Stop with `contradiction` (`blocking: yes`) rather than pick. **What the feature still owes is a row, not a section**: the tables and operations its running code already has are a row each in the version's data model and operation list, justified by the feature's name in place of a use case — leave those out and the spec stops describing the database that actually exists.

### A block that reaches forward is a stop, not a note

**Every gate that reads a feature's blocks runs at that feature's own position in the order**, so a criterion or a use case naming a feature built afterwards cannot be met wherever it is read (`../hora/references/spec-format.md`, "A criterion is checked at its own feature's gate"). **Four runs act on one anyway**, which is what makes this worth stopping for rather than reporting: checkpoint 1 builds from the criteria, 6 and 16 write a test for each one and run it, `hora-verifier` reports the untestable one as `missingTests`, and 18 fails the feature and sends the run into somebody else's checkpoint.

**Detect it by walking the order once, carrying what is built so far**, and reading each feature's two blocks against that set plus the feature itself. A `depends` on a listed feature is satisfied by the running code and orders nothing, so it counts as already built (`../hora/references/spec-format.md`, "`baseline`").

**The fix is a design decision and it belongs to `/hora-spec`, at stage 2** (`../hora-spec/references/stages.md`) — the order changes, or the behavior moves to the version's own criteria, and which of those is right depends on whether the dependency was real. **Raise `forward-reference` (`blocking: yes`) and route it there. Never move the criterion here**, and never reorder `_plan.md` to make it fit: the order comes from the spec's implementation plan, and a planner that reorders to accommodate a criterion has silently rewritten a milestone somebody planned around.

**Where the order itself contradicts a `depends`, the same category and the same destination.** It is the same finding read from the other side, and the walk above cannot even run until it is settled — "what is built by then" is not what the order says.

### Resolving what was found

**Resolve it here, in conversation, whenever the person who can answer is present.** For each finding: state it, propose the exact edit, wait for approval, write it. Then move to the next.

**Batch the deciding, not the approving.** Which findings are real, and which of several fixes to take, go out through the question tool four at a time; the exact wording of each edit is then shown and approved on its own (`../hora/references/asking.md`). A person asked twenty separate free-text questions answers the first few properly.

**Two things still go to `.hora/questions/<version>/open.md` instead:**

| | Why |
|---|---|
| anything the person present cannot answer now (it needs another team, a client decision, a measurement) | a decision nobody has made cannot be made by conversation either |
| **every finding that was resolved**, recorded after the fact | the question file is the record of what was decided and why. A conversation is not |

```markdown
## Q1. #scope says nothing about what is out of scope for now
<!-- spec: scope -->
<!-- blocking: yes -->
<!-- category: scope -->

There is a "permanently out of scope" part, but no section for "out of scope
for now (to be built later)". Without that distinction there is no way to decide
whether an extension point should be left in place.

- [x] resolved
      Added "Out of scope for now" to #scope, listing payroll, in this session.
```

- **The file is append-only.** Existing questions are never removed, and resolved ones stay as `- [x]`
- **If even one `blocking: yes` is unresolved, `/hora-build` is not entered.** With only `no` left, warn and continue
- A human may also answer by editing `specs/` between runs; on re-entry, re-read `specs/` and tick what is now resolved

### Categories

| category | Content | Default blocking |
|---|---|---|
| `versioning` | whether the version number is valid | yes |
| `scope` | confirming the implementation scope | yes |
| `missing-usecase` | a feature with no stated use cases | yes |
| `missing-acceptance` | missing acceptance criteria, or a version with no `Version acceptance criteria` section and no `none` | yes |
| `forward-reference` | a feature's use case or acceptance criterion reaches a feature built after it, or the written order contradicts a `depends`. **Fixed at `/hora-spec`, stage 2 — never here** | yes |
| `undefined-api-kind` | an operation whose kind (query / mutation / subscription / REST) is not stated | yes |
| `missing-authorization` | an operation, a screen or a spec that does not say who may reach it | yes |
| `unmet-usecase` | a stated use case that the design as written cannot complete | yes |
| `spec-proposal` | an improvement `/hora-spec` proposed and whoever decided declined or deferred it. **Recorded so it is not proposed again every run** | no |
| `existing-assets` | whether existing code may be used, which side is authoritative when it and the spec disagree, and how much of the inherited product this version's tag claims (`Authority:` or `Baseline:` missing on a project that has code) | yes |
| `undeclared-behavior` | the code does something no spec states, under `to-spec` — a spec omission or a leftover, and no reading distinguishes them. Both readings offered, neither recommended | no |
| `contradiction` | a contradiction in the text | yes |
| `dependency-install` | a declared dependency failed to install, or a conflict-proof change failed to apply | yes |
| `lacked-environment` | something failed for a reason no code change could fix — the middleware was not running, a network call reached nothing | yes |
| `undefined-detail` | undefined types, SDL, zod definitions, seed values and the like | depends |
| `common-file` | undocumented handwritten content mixed into a file several features share | depends |
| `inferred-annotation` | reporting that `id` / `target` / `depends` was inferred | no |
| `spec-assumption` | an ambiguous criterion was still meetable under some reading; one was assumed and judged against | no |
| `reinvention` | checking whether an existing package already does what is about to be written | no |
| `orphan` | a file that nothing links to from `spec.md` | no |
| `eslint-exception` | an `adhoc/` branch disabled one rule of a genuine rule contradiction for one file | no, but **fail-loud** |
| `acceptance-finding` | an acceptance review found something that is not a spec defect and not yet fixed | depends |

**`no, but fail-loud` is not the same as an ordinary `blocking: no`.** It does not stop anything, but it must never be folded into an ordinary tally either. State it by name, on its own, every time a closing report is written.

---

## 3. Derive the contracts

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

**Every operation's kind belongs in the contract, not only its shape.** A query, a mutation and a subscription are three different conventions on both sides of the wire, and so is a REST renderer. The contract is where checkpoints 3, 6 and 14 each read it from.

### Contracts are cut per server

**Not per repository.** One backend repository holds several servers, and each has its own contract.

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

**A Worker's Job payload and the DB schema are not contracts.** Both are closed inside the repository, and the same feature's own checkpoints implement both sides. **A contract is only for what another implementer reads.**

A server with no consumer, and a frontend with no server to match it, are both errors in the declaration, so ask (`blocking: no`).

---

## 4. Write the glossary

`.hora/glossary.md` (not split per version, append-only). It stops one concept from acquiring two names. A contract pins the type names on an API's surface, but **not class names, method names or internal variable names.** That is the glossary's territory.

**Check names against `@openreachtech/eslint-config`'s naming rules as they are written — read them from the package itself, under the backend row's `node_modules/@openreachtech/eslint-config/`, never from a list restated here.** The denylist of suffixes, words and syntax is the package's to grow, and a copy here would still read as authoritative after it had (`../hora/references/structure.md`, "The division of labor"). Skip the check and implementation walks into lint errors, each of which invents its own local workaround name.

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

Do not write a change log (git holds that).

---

## 5. Write the plan and the feature files

### `_plan.md` — the order

```markdown
# 1.0.0

## Features

1. [ ] #attendance            backend, frontend-employee
2. [ ] #attendance--monthly   backend, frontend-employee   depends: attendance
3. [ ] #payroll               backend, frontend-admin      depends: attendance--monthly, billing
       Rests on: #billing (not accepted)

## Acceptance

- [ ] Sweep the whole version, once every feature above is done
      Version criteria: 4 (#version-acceptance-1-0-0), 1 resting on #billing

## Not accepted

- #billing    listed since 1.0.0, runs in `admin-console`   built: frontend — recorded, not acted on

## Withdrawn

- #year-end   kicked in 1.0.0
```

**The order comes from the spec's implementation plan and from `depends`.** Never derive an order of your own — the spec already holds one, and this skill extracts it.

**A section revived with `kicked: no` may have `depends` pointing into a past version.**

```
1.0.0   #aggregation implemented and done        #payroll was kicked: yes
1.1.0   #payroll revived with kicked: no          depends: aggregation ← already done in 1.0.0
```

Look for the dependency inside the target version alone and it is not there. **Look back through past versions in `.hora/tasks/` and treat it as satisfied if it was finished there.**

**Acceptance appears twice, and the two are different tasks.** Every feature carries its own acceptance as checkpoint 18, covering everything implemented so far; the `## Acceptance` entry above is the whole-version sweep that runs once, at the end, before the merge into main. Write both.

**The sweep entry names the version's own criteria, because it is the only run that checks them.** A feature's criteria are checked at its gate; a criterion that spans several features is written in the spec's `Version acceptance criteria` section and reaches no gate at all (`../hora/references/spec-format.md`, "15. Version acceptance criteria"). The entry carries three things — **how many criteria, the section's `id`, and how many of them rest on a feature under `## Not accepted`** — so that whoever opens the plan can see what the sweep is going to be judged against without opening the spec.

**It is a derivation, re-read off the resolved document on every run, and never carried over.** Count the criteria, take the `id`, count the `rests on:` lines against **this version's** `## Not accepted` (a debt an earlier version paid is no longer in force, and the count says so by shrinking). A version whose section reads `none` gets `Version criteria: none`, written rather than left out — the same reason the section itself may not be omitted.

**The count going up is worth reading, not just recording.** Nine version criteria against eleven features says most of this version's verification has been moved to a single run at the end, which is the shape the feature-at-a-time design exists to avoid (`../hora-build/SKILL.md`, "One feature at a time, never two"). Stage 7 reports the same number while it is still cheap to reorder (`../hora-spec-review/SKILL.md`); this entry is where it stays visible afterwards.

**`## Not accepted` is `## Withdrawn`'s shape applied to the opposite case.** `## Withdrawn` holds a feature that should not exist and was dropped; this holds one that exists, runs, and has never been specified or accepted — every feature carrying `<!-- baseline: inventoried -->` (`../hora/references/spec-format.md`, "`baseline`"). One line each, and the line says three things: **where it runs**, **which version has been listing it**, and its **`built:` value, marked as recorded and not acted on.**

**No checkbox, for the same reason `## Withdrawn` has none.** A listed feature is never selected for building and never counted — not toward the version being done, and not against it (`../hora/references/done-criteria.md`, "When a version is done"). A checkbox would have to mean something, and both meanings are wrong: `[ ]` puts a feature nobody intends to build in front of `/hora-build`, and `[x]` claims a pass over eighteen checkpoints not one of which was ever marked.

**`built:` is written on the line and acted on nowhere.** It is the record of a declaration, not an instruction to mark seventeen checkpoints not applicable — the version that pays the debt restates the value and has it confirmed first (section 6). Writing it here and nothing else is what keeps "the code is there" checkable without letting it mark anything.

**A feature may depend on a listed one, and its entry says what that costs.** New work on an adopted product almost always sits on inherited behavior, so refusing the dependency would make the declaration close to useless. The dependent keeps its ordinary `depends` and adds `Rests on: #<id> (not accepted)`; its own feature file carries the same line (below), and the acceptance record repeats it beside the id in its scope line (`../hora-accept/SKILL.md`, "Recording the result"). **A pass resting on unstated behavior is allowed to exist; a pass that hides what it rests on is not.**

**That kind of `depends` is satisfied by the running code, never by a checkbox.** A listed entry has none, and it never acquires one, so a planner waiting for `#billing` to go `[x]` before starting `#payroll` waits forever — nothing is scheduled ahead of a listed feature and nothing is blocked behind one. `Rests on:` is what keeps the dependency from becoming invisible once the order stops carrying it.

**`Rests on:` is derived from more than `depends`, because `depends` is a line the kit is allowed to infer.** An unstated one is inferred from content and reported (`inferred-annotation`, `blocking: no`), and an inference reading prose misses what a table states plainly: a feature whose data model reads a table stage 4 justified by a listed feature's name in place of a use case rests on that listing whether or not anybody wrote `depends: payroll` (`../hora-spec-backend/SKILL.md`). **So read both — every `depends` edge, and every data-model or operation row a listed feature justifies by name that this feature's own tables or operations sit on — and write `Rests on:` from the union.** Where that second reading finds one the annotation does not name, the omitted `depends` is not the ordinary `blocking: no` but a stop (`existing-assets`, `blocking: yes`, section 2): a feature left out of the union gets no `Rests on:` line and sits outside the transitive set when the debt is paid, so its pass rests on unstated behavior and hides that it does.

**Derive the section again on every run, from the resolved document's annotations. Never carry it over.** Each version writes its own `_plan.md`, and `baseline` is an annotation, so it is excluded from the digest (below): a feature that gained `inventoried` — or lost it — changes no digest at all, and reconciliation watching only digests would never see one move between `## Features` and here. Re-reading the annotation off the resolved document is the only thing that catches it.

**Nothing in the section is declared. All of it follows from two lines in `specs/`** — `Baseline: inventoried` in `Existing assets`, and the per-feature annotation (`../hora/references/structure.md`, "Where a lever lives"). Delete the section and the next run rebuilds it identically; hand-edit it and the next run overwrites it. A permission that lived here instead would be a decision this skill found waiting for it in the file this skill writes itself, which is no decision at all.

### A version whose every specified feature carries `built:` collapses to one sweep

**The normal shape of an `as-built` adoption is twenty features with checkpoints 1–17 not applicable and 18 open** — and run literally, that is twenty per-feature acceptance runs over an ever-growing cumulative scope, each finding mostly what the one before it found. The per-feature gate exists to catch a feature breaking its predecessors **while the change is one commit old**; here nothing is changing, so there is nothing for twenty runs to catch that one cannot.

**The qualifying test is specified and built, never built alone.** Three states arrive in one adoption, and only the first of them collapses:

| The feature | What it gets |
|---|---|
| **specified, and `built:` up to some gate** | **collapses.** Its entry goes under the heading below with a `[ ]` box, and the adoption sweep is the run that closes it |
| **listed — `built:` and `<!-- baseline: inventoried -->`** | **does not qualify, and never had a gate.** It keeps its `## Not accepted` entry, its absent checkbox and its eighteen `[ ]`, and the collapse runs over the rest |
| **specified, with no `built:`** — a `to-spec` exception, a new feature riding along | **does not qualify.** It keeps its own open checkpoints and its own gate-18 run, and the sweep entry stays as well |

**The gate could not be keyed on `built:` alone, because a listed feature carries it by requirement** (`../hora/references/spec-format.md`, "`baseline`"). That test cannot tell the two states apart — and it lets the listed one through at the exact point where the mistake becomes a pass, because **the adoption sweep is the one lever that deliberately overrides the box-state rule**: it takes every entry under a collapsed version's feature section whatever its box reads (`../hora-accept/SKILL.md`, "What is in scope"). Write a listed feature in there and it goes to the review skills with no use cases and no acceptance criteria, which "can only report that nothing failed" — and that report then ticks eighteen checkpoints not one of which was ever marked. The same run's reconciliation puts the same section under `## Not accepted` with no checkbox (section 6), so a gate keyed on `built:` has one run writing two contradictory states for one id.

Twenty sections carry `built:` and three of them are listed, so seventeen entries stand under the heading and three sit below it with no box:

```markdown
## Features — adopted as built

1. [ ] #attendance            built: frontend    ← 1–17 n/a, 18 open until the sweep below passes
...
17. [ ] #payroll              built: frontend

## Acceptance

- [ ] Sweep the whole version — the adoption sweep. Covers checkpoint 18 of every entry above
      Version criteria: 2 (#version-acceptance-1-0-0), 0 resting on a not-accepted feature

## Not accepted

- #billing    listed since 1.0.0, runs in `admin-console`   built: frontend — recorded, not acted on
```

**Every entry under that heading stays `[ ]` until the adoption sweep passes, and then they are set together.** An entry is `[x]` only once every checkpoint of that feature is (`../hora-build/SKILL.md`, "When a feature finishes"; `../hora/references/done-criteria.md`, "When a feature is done"), and checkpoint 18 always stays `[ ]` here whatever `built:` says (below) — so an entry marked while planning reports an acceptance that has not run, over code nobody has driven yet, which is the one thing adopting the kit was supposed to find out. **`_plan.md` derives its checkboxes from the checkpoints; it does not announce results ahead of them** (`../hora/references/structure.md`, "Where a lever lives"). When the sweep passes, its own record is the evidence they are all set on — one run, named in `.hora/acceptance/<version>/_sweep.md`.

**This skill is what sets them, and it is a reconciliation row like every other one in section 6.** The trigger is a state, not an invocation: `.hora/acceptance/<version>/_sweep.md` exists and its **newest block** reads a passing verdict (`../hora-accept/SKILL.md`, "Recording the result"), and entries under the collapsed heading still stand `[ ]`. On finding it, **set checkpoint 18 in each of those features' files and their entries in `_plan.md` in the same write, off that one record** — 18 first, so no entry ever claims more than its own file does.

```markdown
- [x] 18. Acceptance (E2E and unit both)  <!-- the adoption sweep: .hora/acceptance/1.0.0/_sweep.md -->
```

**The writer has to be named here, because neither skill a reader would expect can do it.** `/hora-accept` writes acceptance records and never `_plan.md` — it reports, and it is `/hora-build` that acts (`../hora-accept/SKILL.md`); and `/hora-build`'s own "set the feature's entry to `[x]`" step never fires here, because step 2 of its "Where to start" skips exactly the entries a sweep entry covers, which *is* the collapse (`../hora-build/SKILL.md`). So with no writer named, nothing sets them: twenty entries stand `[ ]` over a sweep that passed, `../hora/references/done-criteria.md`'s first condition — every entry in `_plan.md` is `[x]` — can never be met, and the one version that did all its work in a single run is the one version that can never be finished.

**It stays a derivation, and that is why it waits for the record rather than for the run.** The verdict is the evidence and the marks are its consequence, read off a file that already exists; nothing is declared in `.hora/` and nothing is remembered from an earlier invocation (`../hora/references/structure.md`, "Where a lever lives"). A pass the record does not carry sets nothing, however certain the run that produced it was — and since `/hora` enters this skill on every invocation, before any box is read (`../hora/SKILL.md`, step 3), the record and the boxes are never more than one invocation out of step.

**This is the rule `## Not accepted` follows from the other side: an entry may never claim more than a run gave it** — whether the run is still pending, as here, or was never in scope at all.

**So those entries are `[ ]`, and the entry that closes them is the sweep's.** Write that on the sweep line, because two things now read those boxes and would otherwise draw opposite conclusions from them:

| Reads the box | What an unticked entry under `## Features — adopted as built` means |
|---|---|
| whatever selects the next feature to build | **not a candidate.** Its checkpoint 18 is covered by the `## Acceptance` entry, so running its gate individually is the twenty runs this collapse exists to avoid (`../hora-build/SKILL.md`, "Where to start") |
| the acceptance sweep, deciding its scope | **in scope.** A collapsed version's sweep covers every entry under `## Features — adopted as built`, whatever its box reads (`../hora-accept/SKILL.md`, "What is in scope") |

**The heading keeps the suffix: a collapsed version's feature section is written `## Features — adopted as built`, here and in every other line of this file that names it.** The suffix is the only place in `_plan.md` where "this version's gates were collapsed into one sweep" is written down — a bare `## Features` says a version has features, which every version does — so whoever opens the file two years later reads the collapse off the heading or not at all. **And every reader takes the version's feature section whatever its heading reads**, the suffixed form included: a run matching the string `## Features` literally finds no section in a collapsed version, sweeps nothing, and reports that nothing failed — the twenty features that were the entire point of the sweep, passed by a run that opened none of them.

**An unticked box and no box at all are different states, and the difference is the whole of both mechanisms.** `[ ]` says a run is going to close this and has not yet; no box says no run will. Read the first as the second and the adoption sweep reviews nothing; read the second as the first and a listed feature gets built from checkpoint 1 over code already serving users.

**Every feature file is still written, in full.** The n/a marks, the reasons and the spec digests are what a later version reopens a checkpoint against; collapsing the *runs* must not collapse the *records*.

**The collapse reaches the features that qualify and stops at each one that does not — both kinds, and for opposite reasons.** A specified feature without `built:` keeps its own open checkpoints and its own gate-18 run alongside the sweep entry, because there is work here for a gate to close; a listed feature is not written into the section at all, because there is none, and its eighteen `[ ]` are what say so. **A collapsed version is therefore an ordinary version with fewer acceptance runs in it, never one where the sweep stands in for everything** — and what the sweep finds comes back as findings routed to checkpoints, exactly as any sweep's do (`../hora-accept/SKILL.md`).

### One file per feature

```markdown
# #attendance  Recording and listing attendance
<!-- spec: attendance @ sha256:abc123... -->
<!-- repositories: backend, frontend-employee -->

Constraint: this will be reindexed into Elasticsearch later (#search-infra).
            leave room for a hook when a record is saved

Conflict: appends to scalars/index.js. Two other features carry the same mark

## Spec gate
- [ ] 1. Draft or confirm the specification
- [ ] 2. Verify the use cases can be met

## Backend gate
- [ ] 3. DB and API schemas
- [ ] 4. Stub API
- [ ] 5. The modules the implementation needs
- [ ] 6. Actual API
- [ ] 7. Worker
- [ ] 8. Security audit
- [ ] 9. Verify the use cases again, against the built API

## Frontend gate
- [ ] 10. Open the frontend
- [ ] 11. Reconfirm UI/UX and the use cases
- [ ] 12. Component design
- [ ] 13. The frontend modules the implementation needs
- [ ] 14. API client
- [ ] 15. UI
- [ ] 16. Wire the data-fetching logic in
- [ ] 17. Local test environment

## Acceptance gate
- [ ] 18. Acceptance (E2E and unit both)
```

**A feature carrying `built:` starts with that much already marked not applicable.**

| `built` | Checkpoints written `[x] <!-- n/a: built before Hora Kit was adopted -->` |
|---|---|
| `spec` | 1–2 |
| `backend` | 1–9 |
| `frontend` | 1–17 |

**Checkpoint 18 always stays `[ ]`.** No value of `built` reaches it, and no reading of an existing repository can stand in for an acceptance review — that is the whole reason the annotation stops one short of the end.

**A listed feature gets the same file, and not one line of it is dropped.** What changes is the header and the marks: two non-checkbox lines say what the listing recorded, and all eighteen checkpoints stay `[ ]`.

```markdown
# #billing  Invoicing and payment collection
<!-- spec: billing @ sha256:def456... -->
<!-- repositories: backend, frontend-admin -->

Listed, not specified: carries `baseline: inventoried`, listed since 1.0.0, and
                       sits in _plan.md's `## Not accepted`. Runs in
                       `admin-console`. Nothing below has been marked

Built (recorded, not acted on): frontend. The version that specifies this
                       feature restates the value and has it confirmed, and
                       only then does anything below get marked (section 6)

## Spec gate
- [ ] 1. Draft or confirm the specification
- [ ] 2. Verify the use cases can be met
                                    ← and the remaining sixteen, written out in
                                      full and verbatim, every one of them [ ]
```

**Eighteen `[ ]`, and not one of them marked not applicable.** Not `[x]`, and not `n/a` either — a listed feature's checkpoints are marked as *nothing at all* (`../hora/references/spec-format.md`, "`baseline`"). This is why `built:` sits in a header line here instead of expanding through the table above: those marks are a claim that some gate's work already exists, and no such claim has been confirmed for this feature.

**The header is what stops eighteen empty boxes being read as "never started".** Whoever opens this file next sees the checkboxes before anything else, and a feature sitting at checkpoint 1 with a screen already in production invites exactly one action: build it. Two models, a resolver and a screen later, somebody notices that it was already there. The header says the code exists, says nothing about it has been verified, and says which version listed it — so the next move is to specify the feature, not to write it again.

**That file is written into every version's `.hora/tasks/<version>/` for as long as the feature stays listed.** The annotation carries forward under the diff rule, so a listing written in 1.0.0 still stands in 1.4.0 (`../hora/references/spec-format.md`, "`baseline`"), and reconciliation creates a file for any section that has none (section 6). Leave the file out on the grounds that nothing is being built and that row fires on entry to the next version — appending the section under `## Features` with a checkbox, and handing code already serving users to `/hora-build` from checkpoint 1.

**A dependent's file carries `Rests on:` beside its constraints.**

```markdown
Rests on: #billing (not accepted). Its behavior is listed, never specified — a
          pass here claims nothing about it
```

**It is not a constraint, and it does not come off when the dependent passes.** A `Constraint:` line tells an implementer what to leave room for; `Rests on:` tells whoever reads an acceptance record what that pass did not cover. It stays until the debt is paid and the dependent's own checkpoint 18 has been re-earned (section 6).

**Do not infer `built` from the repository.** A feature nobody declared is planned from checkpoint 1, however finished its code looks; a half-built screen and a finished one are indistinguishable from a file listing, and guessing wrong here silently skips the gates that would have caught it.

**Write every checkpoint, including the ones that will obviously not apply.** `/hora-build` marks one not applicable with a written reason; a checkpoint this skill leaves out instead is indistinguishable from one that was forgotten. `../hora-build/references/checkpoints.md` is the authority on the list and its wording — copy it from there, do not paraphrase it.

**Digests are taken per section**, and **annotation comments are excluded from the digest** — `id`, `target`, `depends` and every other one (fixing a `target` does not make an implementation stale). A section runs "from its heading to the next heading at the same level or above". Where a spec is built around a table of individually-identified requirements, the row is the unit, and the digest is taken per row.

**So a change to `built:` or `baseline:` is invisible to a digest, and is caught by re-reading the resolved document instead** (section 6). Both change what runs rather than what is built, which is exactly why they are excluded — and exactly why reconciliation may never rely on a digest to notice that one of them moved.

### Mark what overlaps

**Mark the features that touch the same file.**

| What overlaps | How it is detected |
|---|---|
| an aggregation file | from how registration works, seen by `/hora-setup`. Nothing overlaps if scanning is automatic |
| the same table | several sections name the same table |

Features are built one at a time, so the mark is a signal to re-read the real file before writing, not a lock. If several features add columns to the same table, there is an order — where `depends` is not written, infer it and report through `inferred-annotation`.

**A mark here is about two features, and the concurrent case lives elsewhere.** Inside one checkpoint, several units do run at once, and a file two of them would both write is assigned to one of them there rather than marked here (`../hora-build/SKILL.md`, "Step 5 — splitting a checkpoint into units"). This table's reason for being a signal rather than a lock holds for the feature-to-feature case it describes.

### Carry both kinds of "out of scope" as design constraints

**Confusing them wrecks the design.**

| What the spec says | What the feature file must reflect |
|---|---|
| out of scope for now (**to be built later**) | leave an extension point. Keep it replaceable |
| **permanently** out of scope | do not abstract it. Exclude it from the design |

Read the first as the second and the structure cannot take it later; read the second as the first and an abstraction layer gets built that nobody uses.

```markdown
Constraint: getting past a CAPTCHA is permanently out of scope (#scope).
            stop when one is detected. Build no bypass layer
```

If the spec does not let you tell them apart, ask with `scope` (`blocking: yes`).

---

## 6. Reconcile on re-entry

**This skill runs every time `/hora` runs.** It is not skipped just because `.hora/tasks/<version>/` already exists. Skip it and sections added to `specs/` after the list was settled are never read at all.

Reconcile the set of sections in the resolved document against the feature files in `.hora/tasks/<version>/`.

| State | Action |
|---|---|
| a section with no feature file | create one. **Append it to `_plan.md`'s end** (do not disturb the existing order). **One carrying `<!-- baseline: inventoried -->` is appended to `## Not accepted` instead, with no checkbox**, and its file gets the provenance header and all eighteen `[ ]` (section 5) |
| a section whose digest does not match | **clear the checkpoints its change invalidates, and say which** (below) |
| a section that gained `kicked: yes` | move its entry to `_plan.md`'s `## Withdrawn`. **Raise a removal task** if it was implemented |
| a section that gained `baseline: inventoried` | move its entry to `_plan.md`'s `## Not accepted`, and **bring every checkpoint back to `[ ]`** — an `[x]` reading `<!-- n/a: built before Hora Kit was adopted -->` is cleared; an `[x]` recording a checkpoint that actually ran is a stop (below) |
| a section that **lost** `baseline: inventoried` | **the debt is being paid** (below). Do not plan it for building until `built:` has been restated and confirmed, or `authority: to-spec` declared. Then mark from the confirmed value, move its entry into `## Features`, and clear checkpoint 18 of every transitive dependent **in this version's own plan and task files** (below) |
| the `Version acceptance criteria` section's digest does not match | **clear the `## Acceptance` sweep entry, and nothing else** (below). Re-derive the entry's `Version criteria:` line in the same write |
| a section that vanished with no annotation | **do not delete anything.** The intent is unknown, so ask (`blocking: no`) |
| a collapsed version whose `.hora/acceptance/<version>/_sweep.md` has a newest block reading a pass, over entries still standing `[ ]` | **set checkpoint 18 in each of those features' files and their entries under `## Features — adopted as built`, off that one block** (section 5). Nothing else sets them, and until they are set the version cannot be read as done |

A digest only detects changes to sections an existing feature points at. **A new section has no feature pointing at it, so this reconciliation is the only way to detect one.**

**Which checkpoints a spec change invalidates depends on what changed, and this skill decides it, not `/hora-build`.**

| What changed in the section | Clear from |
|---|---|
| a use case | checkpoint 2 — everything after it |
| the data model, or an API's shape or kind | checkpoint 3 |
| an acceptance criterion only | checkpoint 18 |
| a screen or an interaction only | checkpoint 11 |
| **the version's own acceptance criteria** | **the `## Acceptance` sweep entry alone — not one feature's checkpoint 18** |
| wording, with no change to any of the above | nothing. Record the new digest and move on |

**The version's own criteria reach no feature's checkpoint, so a change to them may not clear one.** No gate ever read them (`../hora/references/spec-format.md`, "15. Version acceptance criteria"), so no feature's pass was measured against them and none of those passes has become stale — what has is the sweep's, which is the one run that checked them. **Clear a feature's 18 for this and the version rebuilds acceptance for every feature it holds, over criteria not one of those runs was ever judged against.**

**When it cannot be told apart, clear from checkpoint 2.** Rebuilding more than was necessary costs time; leaving a checkpoint marked passed against a spec it no longer satisfies costs correctness.

**A withdrawn feature keeps its record — its entry moves to `_plan.md`'s `## Withdrawn` section and its file stays.** It carries no checkbox there, so it does not pollute the count, and the fact that something was planned and dropped stays visible. If it was never implemented, moving it is enough. If it was, raise a removal task and move it once that is done.

**Have withdrawal stated with `kicked: yes`. Never have the section deleted.** Under the diff scheme every unchanged section is "absent", so **absent cannot be told from deleted**. Read absent as deleted and every section becomes a withdrawal candidate on each version bump; read absent as unchanged and a deletion is never detected.

**The easiest thing to get wrong about deletion is that removing a task does not remove the code.** The model, the resolver, the tests and the migration all stay.

**A section that gains `baseline: inventoried` almost always arrives with checkpoints already marked — up to seventeen of them — and every one of those comes off.** An inherited feature's ordinary state is checkpoints 1–17 written `[x] <!-- n/a: built before Hora Kit was adopted -->`, or 1–9, or 1–2, from whatever `built:` said (section 5) — a not-applicable mark, never a claim that anything ran — and **a not-applicable mark is cleared the moment its reason stops holding** (`../hora-build/references/checkpoints.md`). The reason here was `built:` expanded into marks; listing makes `built:` a value recorded and acted on nowhere (`../hora/references/spec-format.md`, "`baseline`"), so the reason is gone and the marks go with it. Read those seventeen as the stop instead and the row fires on every ordinary adoption, leaving a choice between stopping forever and leaving seventeen `[x]` standing on a listed feature — the pass nothing earned, in the file that exists to deny it.

**The stop is an `[x]` recording a checkpoint that actually ran, and that mark is the one never unmarked here.** A run did that work and the file is its only record of it, so a section claiming both states is a contradiction between the annotation and the file: the annotation says nothing about this feature has ever been verified, and the checkpoint says something was. Ask (`blocking: yes`) — either the annotation is wrong or the version means to throw away a verified checkpoint, and choosing between those two is a decision, not a derivation.

### Paying a listed feature's debt

**Paying it is a version's ordinary work — and it is the one reconciliation that refuses to act on what the document already says.** The annotation is gone, both blocks are there, and the section now reads like any other feature. But the single fact the listing recorded, `built:`, was recorded precisely so that nothing would act on it, and acting on it now would mark up to seventeen checkpoints not applicable on the strength of a value nobody has confirmed since the day it was written — against code that has had every version since to drift. So restate the value, have it confirmed (`built:` per feature, through the question tool, with the evidence laid out — `../hora/references/asking.md`), and only then expand it into not-applicable marks, from wherever the confirmed value puts them.

**Or that version declares `authority: to-spec` for the feature, and all eighteen run against the existing code.** That is the other complete answer, and it needs no confirmation of `built:` because it carries none — the two never appear on one feature (`../hora/references/spec-format.md`, "`authority`").

**Inside the paid feature there is nothing to clear.** No checkpoint of it was ever marked, so the clearing table above has nothing to act on there, however much of the section is new. And its checkpoint 18, when it comes, is that feature's first acceptance ever: `/hora-accept` decides that run's reach itself, from the absence of any passing record for the id together with the earlier version's `## Not accepted` entry naming it, and this skill neither narrows it nor has to ask for it (`../hora-accept/SKILL.md`, "What is in scope").

**What the payment clears lands on other features: checkpoint 18 of every feature that reaches the paid one transitively — through the same union `Rests on:` was derived from, never through `depends` alone** (section 5). Each of them passed acceptance while resting on behavior nobody had stated — which is exactly what its `Rests on:` line records — and stating that behavior changes what the pass was measured against. It is the rule for a not-applicable mark cleared the moment its reason stops holding (`../hora-build/references/checkpoints.md`), applied to a reason that lived in another feature's annotation: "nothing about #billing is specified" has stopped being true.

**A dependent that is itself listed is not in that set, and the exclusion belongs here, where the set is defined.** A listed feature may carry `depends`, and it owes the version's data model and operation list a row each justified by its name (section 2) — so on the reading above it falls inside the union like any other dependent. Re-schedule it and it gets a fresh `## Features` entry with a `[ ]` box, seventeen not-applicable marks and a scheduled acceptance over a feature with no use cases and no acceptance criteria: every state the listing denies, produced by the mechanism that exists to protect what the listing protects. **The justification does not reach it either** — it did not pass acceptance while resting on unstated behavior, because it never passed anything, and it carries no `Rests on:` line recording that it did. **Its checkpoint 18 was never marked, so there is nothing to clear and nothing to re-earn**: it keeps its `## Not accepted` entry, its absent checkbox and its eighteen `[ ]` until its own debt is paid, in whichever version next changes it.

**Nothing else of theirs is cleared.** Checkpoints 1 to 17 stay as they were, because their code did not change — only what they were accepted against did.

**Where that clearing lands is the paying version's own plan, and nowhere else.** A dependent finished in 1.1.0 has its checkpoint 18 in `.hora/tasks/1.1.0/<id>.md` — a file this reconciliation never reads (it runs against the version being planned), belonging to a released version whose done-ness must not be revoked retroactively, and which `/hora` never revisits. Untick a box there and nothing ever executes against it: the sentence above would name a dozen features and fire on none of them. So each transitive dependent gets **a fresh entry in the paying version's `_plan.md`, under `## Features` with a `[ ]` box, and its own file in `.hora/tasks/<paying version>/<id>.md`** — checkpoints 1–17 marked not applicable against a stated reason, 18 left `[ ]`, and its `Rests on:` line carried across.

```markdown
- [x] 1. Draft or confirm the specification  <!-- n/a: accepted in 1.1.0; re-accepted because #billing's debt was paid -->
                                    ← and 2 through 17 the same, each with the reason
- [ ] 18. Acceptance (E2E and unit both)
```

**The box is `[ ]` rather than absent because a run is going to close it** — that entry is what `/hora-build` picks up, and with only 18 unmarked, closing it is the whole of what the entry asks for (`../hora-build/SKILL.md`, "Where to start"). The reason line is what stops 1–17 being run again over code nothing touched, and it names the earlier version so the second acceptance can be read against the first.

**No released version's task files or `_plan.md` are ever rewritten** (section 1, "Files of past versions are never rewritten"). 1.1.0 keeps its entry, its marks and its acceptance record, so what it claimed at its tag stays what it claimed; **the version that caused the re-earning is the version that schedules it**, which is also the version whose closing report somebody is actually going to read.

**One payment can reopen a dozen acceptances, and that has to be visible before it happens.** `depends` is followed transitively, so a feature three hops away is reopened as surely as a direct dependent, and a version that pays two debts at once can reopen most of what it inherited. **Name every feature the clearing will reach, and what each one now owes, before clearing anything** — then clear. Where the count comes as a surprise, that is the price of the listing having been paid late; it is not a reason to stop at the first hop.

---

## When this skill finishes

State, in one report:

```
the version fixed, and why that one
how many findings were raised, and how many were resolved in conversation
every question written to the question file — its Q<n> id, its category, its
  blocking value, one line of what it is, and a link to the file
  (../hora/references/structure.md, "Citing a question in a report")
how many features are in the plan to build, and how many are already done
how many version acceptance criteria the sweep will be judged against, and how
  many of them rest on a feature nobody accepted
every feature in ## Not accepted, BY NAME — where it runs, and which features
  rest on it
what /hora will start on next
```

**Findings resolved in conversation may be counted. Questions may not.** A resolved finding is over — the edit is in `specs/` and the question file records it after the fact. An open question is work somebody still has to do, and a number is not something anybody can act on.

**A listed feature may not be counted either, for the same reason.** "3 not accepted" says that this version claims nothing about part of the product and not which part, and the person reading the report is the one who could still decide to pay one of those debts now (`../hora/references/structure.md`, "Citing a question in a report"). **They are also outside the feature count** — a plan of twenty with three listed is seventeen to build, and a report that says twenty has promised three features nobody is going to build.

**Seventeen here and twenty in the acceptance record are not a discrepancy, and neither number is the other one written wrong.** This report counts what there is to build; the sweep's verdict counts what the tag claims about the product, so it keeps all twenty in its denominator and reads `passed over 17 of 20 features; 3 not accepted` (`../hora-accept/SKILL.md`, "Recording the result"). Two questions, two numbers — fold them into one figure and either this report promises three features nobody is going to build, or the verdict shrinks the product it claims about down to the part that passed.

When it stopped with a `blocking: yes` outstanding, **put what the human has to do first** — which section needs what added, and a link to `.hora/questions/<version>/open.md`.

---

## References

| File | Content |
|---|---|
| `../hora/references/structure.md` | the layout, the invariants, the language rule |
| `../hora/references/asking.md` | **a check, a proposal or a question** — and the question tool this skill defaults to |
| `../hora/references/spec-format.md` | the authority on the format of `specs/<version>/spec.md` |
| `../hora-spec/SKILL.md` | **who writes a spec, and what to hand back to it.** Run it when a version's `spec.md` is still empty |
| `../hora-spec/references/stages.md` | which stage a design-level finding goes back to |
| `specs/skeleton/spec.md` | the blank spec that gets copied. `/hora-spec` does the copying |
| `../hora-build/references/checkpoints.md` | the checkpoint list to write into each feature file |
| `../hora/references/done-criteria.md` | what "done" means for a checkpoint, a feature and a version |
