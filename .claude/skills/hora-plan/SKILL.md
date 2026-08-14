---
name: hora-plan
description: Plan one version from its spec. Fixes which version is being built, verifies the spec for holes and contradictions in conversation, and writes the feature-level task list. Runs at the root of the hora repository. Invoked by /hora, or directly as /hora-plan.
---

# hora-plan

**The planner.** Decide which version is being built, get its spec into a state that can actually be built, and write the list of features to build.

Read `../hora/references/structure.md` first — the layout, the invariants and the language rule. **`../hora/references/asking.md` fixes how anything here is put to a person**, and it is the same file `/hora-spec` reads.

## The three things this skill does

```
1. Fix the version being implemented
2. Verify the spec for holes and contradictions, and resolve them in conversation
3. Write the task list — one entry per feature, plus the acceptance tasks
```

**The task list is feature-level, never implementation-level.** "Build the attendance feature" is an entry. "Write the `RpaFlow` model" is a checkpoint inside `/hora-build`, and this skill does not decide it.

## This skill may write into `specs/`. Only `/hora-spec` may too

Planning is a conversation with whoever wrote the spec, and asking that person to hand-edit twenty separate holes defeats the point of having it. So this skill may write into `specs/`, under `../hora/references/structure.md`, invariant 1:

```
1. state the hole or contradiction found
2. propose the exact edit, in full
3. wait for that person to approve THAT edit
4. write it
```

**Approval is per edit, never blanket.** What is protected is that **no requirement enters `specs/` without a human having read the exact words first.**

**Step 2 is a proposal, and it is said as one** — "I suggest this edit; it is yours to decide". **Where the finding is instead that this skill may have misread the document, that is a check** — "I read this as X; is that right?" — settled before any edit is proposed (`../hora/references/asking.md`). Half of what looks like a hole in a spec is a hole in the reading of it.

**Step 3 stays in prose.** The edit's exact words have to be read, and an option labelled "approve" is what lets somebody not read them. **Everything around it defaults to the question tool.**

**A finding that needs design work goes to `/hora-spec` instead, at the stage that owns it.** The split is by what the fix is, not by how large it looks:

| The finding | Where it is fixed |
|---|---|
| a missing annotation, a `target` that names no repository, a typo, a section number that drifted | **here**, one edit at a time |
| a missing use case, a use case the design cannot serve, an operation with no kind or no caller, a scope split nobody has made, a contradiction between two designed things | **`/hora-spec`**, at the stage `../hora-spec/references/stages.md` names |

**Why it is not all done here.** A use case written into `specs/` by the planner is a use case no stage ever walked against a data model or a screen.

**Never write into a past version's directory.** A fix that belongs to an already-released version goes into the version currently being planned, as a full replacement of that section.

---

## 1. Fix the version

**A version directory is one under `specs/` whose name is a semver version, and nothing else.** `specs/skeleton/` holds the blank spec — never planned, never implemented, never counted as unfinished. Any other non-semver directory is skipped, and reported once so nobody assumes it was read.

**The target version:** among those directories, the **lowest** one whose `.hora/tasks/<version>/` has not been generated or still holds unfinished features. If all are finished, the lowest version that exists under `specs/` but not under `.hora/tasks/`. If there is no such version either, report that every version is complete.

**Only the directory name counts.** If the version written inside `spec.md` contradicts it, have a human fix it.

**If the target version's `spec.md` is empty or missing, hand the run to `/hora-spec`** and stop. **Never write the first spec of a version here** — writing it without those stages means writing use cases nothing ever walked against a design.

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

No `target`, no `depends`, no body. Only `kicked` is overwritten.

**Deferring is expressed as "`kicked: yes` in this version, `kicked: no` in the next".** `kicked: yes` carries over through diffs.

**Files of past versions are never rewritten.** Carrying bodies over works precisely because past versions are frozen.

A gap in the versions (`1.0.0` → `1.5.0`) does not break the chain. **Only the versions that exist** are applied, in ascending order.

**Annex material is not diffed in parts.** Prose cannot be patched, so **the version that wants to change it places the whole text.**

**Scanning, digests and the judgment about "a section that disappeared" all happen against the resolved document.** Handled per file, every feature would be flagged "the spec changed" on every version bump.

### Judge whether the version number is valid

The first version (`1.0.0`) is not judged. From the second on, the diff in `.hora/contracts/` is the primary evidence.

| Difference in the contract | The valid bump |
|---|---|
| none | patch (if nothing was added) |
| fields or types **only added** | minor |
| removed, renamed, retyped, or a **required field added** | **major** |

Changes that do not appear in a contract (wording fixes, internal refactors) are patch. Something that does not appear in a contract but is visible to users (a new screen) is minor.

Also detect: skipped versions (`1.0.0` → `1.5.0`; report only, non-blocking), and versions that go backwards or repeat (blocking).

A version number becomes three directory names and a tag in `release.yml`, so **questions about versioning are `blocking: yes`.**

### How much may be added to a version

**The line is not the kind of change but whether the version has been released.** Judge by **the tag in the hora repository**.

```bash
git fetch --tags && git tag -l '<version>'    # empty = not released
```

A version is an attribute of the spec, not of the code. **app's merge into main comes after every declared repository's merge into main**, so app's tag is evidence that all of them have been released.

| State of the version | Treatment |
|---|---|
| **not released** | additions, changes and deletions are all accepted. The version number does not change |
| **released** | leave it alone. Do it in the next version |

An unreleased version has no users, so changing a contract breaks nobody. What happens is rework, not broken compatibility. **A spec change or a withdrawn feature just before release is entirely normal, and this must not be closed off.**

While unreleased, a migration can be rebuilt with `db:refresh`, so editing the existing migration directly is fine. Once released, add a new migration that undoes it.

**A spec change after a child repository has already landed on main** becomes an additional PR to that child's main. The version itself is still unreleased, so it may be accepted.

---

## 2. Verify the spec, in conversation

### What is read

**Reached by a link from `spec.md`, and reached by a link alone — not by name or folder.**

```
specs/1.0.0/spec.md                      the entry point
specs/1.0.0/attendance/spec.md           a feature file. Linked from spec.md
specs/1.0.0/attendance/monthly/spec.md   nesting is allowed
specs/1.0.0/spec/00-overview.md          a declared Source. Any name, any location
specs/1.0.0/docs/RPA_CORE_SPEC.md        linked, but not declared. Interpretation material only
specs/1.0.0/request/csv-export.md        what somebody asked for. NOT read here, and not an orphan
```

**A file that is none of `spec.md` / a feature file / a declared Source, and that nothing links to at all, is never read** — and raises a question (`orphan`, `blocking: no`).

**`specs/<version>/request/` is the one directory this does not apply to.** `/hora-spec` reads it and drafts sections from it, and **what it produced is in `spec.md` by the time planning starts**. Reading it here would extract tasks from a wish list nobody was held to.

| | Declared under `Sources`, or a `<feature>/spec.md` | Reached, but not declared |
|---|---|---|
| Read for | extraction — `id`/`target`/`depends`, features, contracts | interpretation only |
| Ever produces a task | yes | never |

**A file listed under a `Sources` section acts as a feature file, even if it is not named `spec.md`.**

### Never invent an `id`

`id` is the reference key from `.hora/tasks/`, and once given it never changes.

| Place | How it is decided |
|---|---|
| the H1 of a feature file | **join the path segments relative to `specs/<version>/` with `--`.** Deterministic and unique |
| a `##` section | **somebody states it and it is written.** If it is not written, do not infer it |
| a `##` with no `id` | tie that section's content **to the H1's `id`.** The reference stays stable |

```
attendance/monthly/spec.md   →   id: attendance--monthly     -- separates folders
attendance-monthly/spec.md   →   id: attendance-monthly      -  separates words
```

**Folder and file names must not contain `--`.** A `##` section's `id` joins to its feature's `id` with **a single `-`** (`attendance--monthly-data-model`).

**`id` is unique across the whole version.** On a collision, ask with `blocking: yes`.

**`id`/`target` may come from the spec's own existing ID scheme instead of being written as annotations.** Where the entry point's Document information declares an `Annotation source` row, `<!-- id: -->`/`<!-- target: -->` are not required.

- **`id`** is then the element's own existing identifier, taken as written
- **`target`** is looked up from the declared prefix table, mechanically. A prefix the table does not cover is treated as an unstated `target`: infer from content and report `inferred-annotation` (`blocking: no`)

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
| `baseline` | `inventoried` says this feature is **listed: not specified, and not accepted.** Admissible only where `Existing assets` declared `Baseline: inventoried`. It **requires `built:`**, which is then recorded and acted on nowhere. **Never inferred, and never recommended** |

Subsections inherit from their parent. State it to override.

**`target` decides which checkpoints apply to a feature, and nothing else.** One feature is one file, whatever it touches. A feature whose `target` is `backend` alone skips the frontend gate entirely, so getting `target` wrong changes what gets built.

**Check `target`'s value against the repository layout declaration.** Pointing at a repository that does not exist is a typo, so ask (`blocking: yes`).

**Where it is unstated, infer from the content. Never treat it as `none`.** Record the inference as `inferred-annotation` (`blocking: no`).

**`target: none` does not mean "do not read".** Non-functional requirements become constraints on every feature, the implementation plan decides the order, terminology becomes the source of the glossary.

**The required sections never need `<!-- id: -->`/`<!-- target: -->`/`<!-- depends: -->` at all.** Recognize each one by its role, the same way its content is already read for meaning. A required role may be satisfied by a declared `Source` — **except the project name and the repository layout, which must be written directly in `spec.md`.** Both are decisions, not facts to locate.

### What to verify, and what stops the run

Work through the resolved document and check every one of these.

| Check | Missing means | blocking |
|---|---|---|
| **Use cases per feature** — except a section carrying `<!-- baseline: inventoried -->` | checkpoints 2, 9 and 11 have nothing to verify against | **yes** |
| **Acceptance criteria per feature** — the same exception, and only those two | "what counts as done" would have to be invented | **yes** |
| **The kind of each API operation** — query / mutation / subscription / REST renderer | checkpoints 3, 6 and 14 cannot choose which convention to follow | **yes** |
| **A stated caller per operation**, and an actors table to state it against | the operation gets whatever filter its neighbours had | **yes** |
| **A listed section carrying a usecases block, an acceptance block, a screen section or a data-model table of its own** | it is specified and listed at once, and nothing decides which half the checkpoints run against | **yes** |
| **A feature's use cases and acceptance criteria reaching no further than that feature and its `depends`** | four separate runs act on a block that reaches forward (below) | **yes** |
| **The version's own acceptance criteria** — the section present, `none` or every criterion carrying `spans:` | the whole-version sweep has nothing to check the product against | **yes** |
| **An order that puts every feature after the features it depends on** | `/hora-build` silently builds them in a different order than the document states | **yes** |
| The implementation scope, split into "for now" and "permanently" | the design cannot tell an extension point from a dead abstraction | yes |
| Whether existing assets may be used | "reimplement" is implied, but whether the code is visible is unknown | yes |
| Unknown fields in an SDL or a REST payload | it would mean inventing the shape of an API | yes |
| A contradiction in the text | there is no way to choose between them | yes |
| `baseline: inventoried` under `Baseline: verified` | the permission was never granted | yes |
| `baseline: inventoried` with no `built:` | nothing makes "this code exists" checkable | yes |
| `baseline: inventoried` with `authority: to-spec` | `to-spec` runs every checkpoint against the existing code; listing says none of them runs | yes |
| `baseline: inventoried` on a section added after the version that declared `Baseline: inventoried` | new work is not inherited code | yes |
| **A `depends` naming the listed section**, where a feature's own tables or operations sit on those of a section carrying `<!-- baseline: inventoried -->` | the dependent gets no `Rests on:` line and stays outside the transitive set when the debt is paid | **yes** |
| A missing `target` / `depends` | it classifies content, so it can be derived | no |
| A missing `id` on a `##` | it ties to the H1's `id`, so references hold | no |
| An orphaned file | notice that something will not be read | no |

**Use cases and acceptance criteria are not the same thing, and a spec that has one still needs the other.**

| | States | Verified at |
|---|---|---|
| a **use case** | who does what, for what purpose, end to end | checkpoints 2 (does the spec support it), 9 (does the built API support it), 11 (does the screen support it), 18 (does the product support it) |
| an **acceptance criterion** | an observable behavior that is either present or absent | the tests written alongside the code, and checkpoint 18 |
| a **version acceptance criterion** | an observable behavior that spans several features | **the whole-version sweep, and nothing else.** No feature gate reads it |

A feature with acceptance criteria but no use cases builds a set of operations that are each correct and together unreachable, and nobody finds out until acceptance — the most expensive place to find it.

**A section carrying `<!-- baseline: inventoried -->` is the one exception to the first two rows, and it suspends exactly those two.** It is listed rather than specified, so there is nothing for either block to be checked against. **Nothing else is lifted** — `undefined-api-kind` and `missing-authorization` are raised over a listed feature's operations exactly as over any other's, because those rows describe code that is already running and already reachable.

**The emptiness is checked in the other direction too.** A listed section is a heading, its annotations and one line of prose; one that also carries a usecases block, an acceptance block, a screen section or a data-model table is claiming both states at once. Stop with `contradiction` (`blocking: yes`) rather than pick. **What the feature still owes is a row, not a section**: its tables and operations are a row each in the version's data model and operation list, justified by the feature's name in place of a use case.

### A block that reaches forward is a stop, not a note

**Every gate that reads a feature's blocks runs at that feature's own position in the order**, so a criterion or a use case naming a feature built afterwards cannot be met wherever it is read (`../hora/references/spec-format.md`, "A criterion is checked at its own feature's gate"). **Four runs act on one anyway**: checkpoint 1 builds from the criteria, 6 and 16 write a test for each one and run it, `hora-verifier` reports the untestable one as `missingTests`, and 18 fails the feature by construction.

**Detect it by walking the order once, carrying what is built so far**, and reading each feature's two blocks against that set plus the feature itself. A `depends` on a listed feature is satisfied by the running code and orders nothing, so it counts as already built.

**The fix is a design decision and it belongs to `/hora-spec`, at stage 2.** The order changes, or the behavior moves to the version's own criteria. **Raise `forward-reference` (`blocking: yes`) and route it there. Never move the criterion here**, and never reorder `_plan.md` to make it fit: the order comes from the spec's implementation plan.

**Where the order itself contradicts a `depends`, the same category and the same destination.** The walk above cannot even run until it is settled.

### Resolving what was found

**Resolve it here, in conversation, whenever the person who can answer is present.** For each finding: state it, propose the exact edit, wait for approval, write it.

**Batch the deciding, not the approving.** Which findings are real, and which of several fixes to take, go out through the question tool four at a time; the exact wording of each edit is then shown and approved on its own (`../hora/references/asking.md`).

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
| `existing-assets` | whether existing code may be used, which side is authoritative when it and the spec disagree, and how much of the inherited product this version's tag claims | yes |
| `undeclared-behavior` | the code does something no spec states, under `to-spec`. Both readings offered, neither recommended | no |
| `contradiction` | a contradiction in the text | yes |
| `dependency-install` | a declared dependency failed to install, or a conflict-proof change failed to apply | yes |
| `lacked-environment` | something failed for a reason no code change could fix | yes |
| `undefined-detail` | undefined types, SDL, zod definitions, seed values and the like | depends |
| `common-file` | undocumented handwritten content mixed into a file several features share | depends |
| `inferred-annotation` | reporting that `id` / `target` / `depends` was inferred | no |
| `spec-assumption` | an ambiguous criterion was still meetable under some reading; one was assumed and judged against | no |
| `reinvention` | checking whether an existing package already does what is about to be written | no |
| `orphan` | a file that nothing links to from `spec.md` | no |
| `eslint-exception` | an `adhoc/` branch disabled one rule of a genuine rule contradiction for one file | no, but **fail-loud** |
| `acceptance-finding` | an acceptance review found something that is not a spec defect and not yet fixed | depends |

**`no, but fail-loud` is not the same as an ordinary `blocking: no`.** State it by name, on its own, every time a closing report is written.

---

## 3. Derive the contracts

Write them into `.hora/contracts/<version>/`.

**The largest risk of having split into repositories is contract drift.** Let each repository derive its schema from the spec independently and they will disagree. Derive once before implementing, pin it, and have every side read that.

The spec's GraphQL / REST tables usually already carry schema names, inputs and results. **When there is no actual SDL:**

```
RpaFlowsInput(pagination)    the contents are indicated in parentheses
                            → derive it after the shape of an existing schema. blocking: no
                              record in a question what was derived, and how

RpaFlowsInput                the fields are unknown
                            → this would mean inventing the shape of an API. blocking: yes
```

**Every operation's kind belongs in the contract, not only its shape.** The contract is where checkpoints 3, 6 and 14 each read it from.

### Contracts are cut per server

**Not per repository.** One backend repository holds several servers, and each has its own contract.

```
.hora/contracts/1.0.0/
  employee-graphql.graphql
  admin-graphql.graphql
  public-rest.md
```

**A contract is only made for a server whose consumer is in another repository or outside.** The declaration's `consumer` column decides it.

| Server | Consumer | Contract |
|---|---|---|
| `employee-graphql` | `frontend-employee` (another repository) | **needed** |
| `public-rest` | the phone app (outside) | **needed** |
| `worker` | an API server in the same repository | **not needed** |

**A Worker's Job payload and the DB schema are not contracts.** Both are closed inside the repository. **A contract is only for what another implementer reads.**

A server with no consumer, and a frontend with no server to match it, are both errors in the declaration, so ask (`blocking: no`).

---

## 4. Write the glossary

`.hora/glossary.md` (not split per version, append-only). It stops one concept from acquiring two names. A contract pins the type names on an API's surface, but **not class names, method names or internal variable names.**

**Check names against `@openreachtech/eslint-config`'s naming rules as they are written — read them from the package itself**, under the backend row's `node_modules/@openreachtech/eslint-config/` (`../hora/references/structure.md`, "The division of labor"). Skip the check and implementation walks into lint errors, each of which invents its own local workaround name.

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

**Recording what was avoided is the point.** Without the reason, somebody later restores the naive name and lint fails.

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

**The order comes from the spec's implementation plan and from `depends`.** Never derive an order of your own.

**A section revived with `kicked: no` may have `depends` pointing into a past version.** Look back through past versions in `.hora/tasks/` and treat it as satisfied if it was finished there.

**Acceptance appears twice, and the two are different tasks.** Every feature carries its own acceptance as checkpoint 18, covering everything implemented so far; the `## Acceptance` entry is the whole-version sweep that runs once, before the merge into main. Write both.

**The sweep entry names the version's own criteria, because it is the only run that checks them.** The entry carries three things — **how many criteria, the section's `id`, and how many of them rest on a feature under `## Not accepted`** — so that whoever opens the plan can see what the sweep will be judged against.

**It is a derivation, re-read off the resolved document on every run, and never carried over.** Count the criteria, take the `id`, count the `rests on:` lines against **this version's** `## Not accepted`. A version whose section reads `none` gets `Version criteria: none`, written rather than left out.

**The count going up is worth reading.** Nine version criteria against eleven features says most of this version's verification has moved to a single run at the end, which is the shape the feature-at-a-time design exists to avoid (`../hora-build/SKILL.md`, "One feature at a time, never two").

**`## Not accepted` is `## Withdrawn`'s shape applied to the opposite case.** `## Withdrawn` holds a feature that should not exist and was dropped; this holds one that exists, runs, and has never been specified or accepted. One line each, saying three things: **where it runs**, **which version has been listing it**, and its **`built:` value, marked as recorded and not acted on.**

**No checkbox, for the same reason `## Withdrawn` has none.** A checkbox would have to mean something, and both meanings are wrong: `[ ]` puts a feature nobody intends to build in front of `/hora-build`, and `[x]` claims a pass over eighteen checkpoints not one of which was ever marked.

**`built:` is written on the line and acted on nowhere.** The version that pays the debt restates the value and has it confirmed first (section 6).

**A feature may depend on a listed one, and its entry says what that costs.** New work on an adopted product almost always sits on inherited behavior. The dependent keeps its ordinary `depends` and adds `Rests on: #<id> (not accepted)`; its own feature file carries the same line, and the acceptance record repeats it beside the id in its scope line. **A pass resting on unstated behavior is allowed to exist; a pass that hides what it rests on is not.**

**That kind of `depends` is satisfied by the running code, never by a checkbox.** Nothing is scheduled ahead of a listed feature and nothing is blocked behind one.

**`Rests on:` is derived from more than `depends`, because `depends` is a line the kit is allowed to infer.** An inference reading prose misses what a table states plainly: a feature whose data model reads a table stage 4 justified by a listed feature's name rests on that listing whether or not anybody wrote `depends: payroll`. **So read both — every `depends` edge, and every data-model or operation row a listed feature justifies by name that this feature's own tables or operations sit on — and write `Rests on:` from the union.** Where that second reading finds one the annotation does not name, the omitted `depends` is a stop (`existing-assets`, `blocking: yes`, section 2).

**Derive the section again on every run, from the resolved document's annotations. Never carry it over.** `baseline` is an annotation, so it is excluded from the digest (below): a feature that gained `inventoried` changes no digest at all, and reconciliation watching only digests would never see one move between `## Features` and here.

**Nothing in the section is declared. All of it follows from two lines in `specs/`** — `Baseline: inventoried` in `Existing assets`, and the per-feature annotation (`../hora/references/structure.md`, "Where a lever lives"). Delete the section and the next run rebuilds it identically; hand-edit it and the next run overwrites it.

### A version whose every specified feature carries `built:` collapses to one sweep

**The normal shape of an `as-built` adoption is twenty features with checkpoints 1–17 not applicable and 18 open** — twenty per-feature acceptance runs over an ever-growing cumulative scope, each finding mostly what the one before it found. The per-feature gate exists to catch a feature breaking its predecessors **while the change is one commit old**; here nothing is changing.

**The qualifying test is specified and built, never built alone.**

| The feature | What it gets |
|---|---|
| **specified, and `built:` up to some gate** | **collapses.** Its entry goes under the heading below with a `[ ]` box, and the adoption sweep closes it |
| **listed — `built:` and `<!-- baseline: inventoried -->`** | **does not qualify, and never had a gate.** It keeps its `## Not accepted` entry, its absent checkbox and its eighteen `[ ]` |
| **specified, with no `built:`** — a `to-spec` exception, a new feature riding along | **does not qualify.** It keeps its own open checkpoints and its own gate-18 run, and the sweep entry stays as well |

**The gate could not be keyed on `built:` alone, because a listed feature carries it by requirement.** That test cannot tell the two states apart — and **the adoption sweep is the one lever that deliberately overrides the box-state rule**, taking every entry under a collapsed version's feature section whatever its box reads (`../hora-accept/SKILL.md`, "What is in scope"). Write a listed feature in there and it goes to the review skills with no use cases and no acceptance criteria.

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

**Every entry under that heading stays `[ ]` until the adoption sweep passes, and then they are set together.** An entry is `[x]` only once every checkpoint of that feature is, and checkpoint 18 always stays `[ ]` here whatever `built:` says. **`_plan.md` derives its checkboxes from the checkpoints; it does not announce results ahead of them.**

**This skill is what sets them, and it is a reconciliation row like every other one in section 6.** The trigger is a state, not an invocation: `.hora/acceptance/<version>/_sweep.md` exists and its **newest block** reads a passing verdict, and entries under the collapsed heading still stand `[ ]`. On finding it, **set checkpoint 18 in each of those features' files and their entries in `_plan.md` in the same write, off that one record** — 18 first, so no entry ever claims more than its own file does.

```markdown
- [x] 18. Acceptance (E2E and unit both)  <!-- the adoption sweep: .hora/acceptance/1.0.0/_sweep.md -->
```

**The writer has to be named here, because neither skill a reader would expect can do it.** `/hora-accept` writes acceptance records and never `_plan.md`; `/hora-build`'s own "set the feature's entry to `[x]`" step never fires, because step 2 of its "Where to start" skips exactly the entries a sweep entry covers. With no writer named, twenty entries stand `[ ]` over a sweep that passed, and the version can never be finished.

**It stays a derivation, and that is why it waits for the record rather than for the run.** A pass the record does not carry sets nothing, however certain the run that produced it was — and since `/hora` enters this skill on every invocation, the record and the boxes are never more than one invocation out of step.

**So those entries are `[ ]`, and the entry that closes them is the sweep's.** Two things read those boxes and would otherwise draw opposite conclusions:

| Reads the box | What an unticked entry under `## Features — adopted as built` means |
|---|---|
| whatever selects the next feature to build | **not a candidate.** Its checkpoint 18 is covered by the `## Acceptance` entry (`../hora-build/SKILL.md`, "Where to start") |
| the acceptance sweep, deciding its scope | **in scope.** A collapsed version's sweep covers every entry under the heading, whatever its box reads (`../hora-accept/SKILL.md`, "What is in scope") |

**The heading keeps the suffix: a collapsed version's feature section is written `## Features — adopted as built`, here and in every other line of this file that names it.** The suffix is the only place in `_plan.md` where the collapse is written down. **And every reader takes the version's feature section whatever its heading reads** — a run matching the string `## Features` literally finds no section in a collapsed version, sweeps nothing, and reports that nothing failed.

**An unticked box and no box at all are different states, and the difference is the whole of both mechanisms.** `[ ]` says a run is going to close this and has not yet; no box says no run will.

**Every feature file is still written, in full.** The n/a marks, the reasons and the spec digests are what a later version reopens a checkpoint against; collapsing the *runs* must not collapse the *records*.

**The collapse reaches the features that qualify and stops at each one that does not.** A specified feature without `built:` keeps its own gate-18 run alongside the sweep entry; a listed feature is not written into the section at all. **A collapsed version is an ordinary version with fewer acceptance runs in it, never one where the sweep stands in for everything.**

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

**Checkpoint 18 always stays `[ ]`.** No reading of an existing repository can stand in for an acceptance review.

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

**Eighteen `[ ]`, and not one of them marked not applicable.** Not `[x]`, and not `n/a` either — a listed feature's checkpoints are marked as *nothing at all* (`../hora/references/spec-format.md`, "`baseline`").

**The header is what stops eighteen empty boxes being read as "never started".** A feature sitting at checkpoint 1 with a screen already in production invites exactly one action: build it. The header says the code exists, says nothing about it has been verified, and says which version listed it.

**That file is written into every version's `.hora/tasks/<version>/` for as long as the feature stays listed.** Leave it out on the grounds that nothing is being built and reconciliation fires on entry to the next version, appending the section under `## Features` with a checkbox.

**A dependent's file carries `Rests on:` beside its constraints.**

```markdown
Rests on: #billing (not accepted). Its behavior is listed, never specified — a
          pass here claims nothing about it
```

**It is not a constraint, and it does not come off when the dependent passes.** A `Constraint:` line tells an implementer what to leave room for; `Rests on:` tells whoever reads an acceptance record what that pass did not cover. It stays until the debt is paid and the dependent's own checkpoint 18 has been re-earned.

**Do not infer `built` from the repository.** A feature nobody declared is planned from checkpoint 1, however finished its code looks.

**Write every checkpoint, including the ones that will obviously not apply.** A checkpoint this skill leaves out is indistinguishable from one that was forgotten. `../hora-build/references/checkpoints.md` is the authority on the list and its wording — copy it from there, do not paraphrase it.

**Digests are taken per section**, and **annotation comments are excluded from the digest** — `id`, `target`, `depends` and every other one. A section runs "from its heading to the next heading at the same level or above". Where a spec is built around a table of individually-identified requirements, the row is the unit.

**So a change to `built:` or `baseline:` is invisible to a digest, and is caught by re-reading the resolved document instead** (section 6). Both change what runs rather than what is built.

### Mark what overlaps

**Mark the features that touch the same file.**

| What overlaps | How it is detected |
|---|---|
| an aggregation file | from how registration works, seen by `/hora-setup`. Nothing overlaps if scanning is automatic |
| the same table | several sections name the same table |

Features are built one at a time, so the mark is a signal to re-read the real file before writing, not a lock. If several features add columns to the same table, there is an order — where `depends` is not written, infer it and report through `inferred-annotation`.

**A mark here is about two features, and the concurrent case lives elsewhere.** Inside one checkpoint, a file two units would both write is assigned to one of them there (`../hora-build/SKILL.md`, "Step 5 — splitting a checkpoint into units").

### Carry both kinds of "out of scope" as design constraints

**Confusing them wrecks the design.**

| What the spec says | What the feature file must reflect |
|---|---|
| out of scope for now (**to be built later**) | leave an extension point. Keep it replaceable |
| **permanently** out of scope | do not abstract it. Exclude it from the design |

```markdown
Constraint: getting past a CAPTCHA is permanently out of scope (#scope).
            stop when one is detected. Build no bypass layer
```

If the spec does not let you tell them apart, ask with `scope` (`blocking: yes`).

---

## 6. Reconcile on re-entry

**This skill runs every time `/hora` runs.** Skip it and sections added to `specs/` after the list was settled are never read at all.

Reconcile the set of sections in the resolved document against the feature files in `.hora/tasks/<version>/`.

| State | Action |
|---|---|
| a section with no feature file | create one. **Append it to `_plan.md`'s end** (do not disturb the existing order). **One carrying `<!-- baseline: inventoried -->` is appended to `## Not accepted` instead, with no checkbox**, and its file gets the provenance header and all eighteen `[ ]` (section 5) |
| a section whose digest does not match | **clear the checkpoints its change invalidates, and say which** (below) |
| a section that gained `kicked: yes` | move its entry to `_plan.md`'s `## Withdrawn`. **Raise a removal task** if it was implemented |
| a section that gained `baseline: inventoried` | move its entry to `## Not accepted`, and **bring every checkpoint back to `[ ]`** — an `[x]` reading `<!-- n/a: built before Hora Kit was adopted -->` is cleared; an `[x]` recording a checkpoint that actually ran is a stop (below) |
| a section that **lost** `baseline: inventoried` | **the debt is being paid** (below). Do not plan it for building until `built:` has been restated and confirmed, or `authority: to-spec` declared |
| the `Version acceptance criteria` section's digest does not match | **clear the `## Acceptance` sweep entry, and nothing else** (below). Re-derive the entry's `Version criteria:` line in the same write |
| a section that vanished with no annotation | **do not delete anything.** The intent is unknown, so ask (`blocking: no`) |
| a collapsed version whose `_sweep.md` has a newest block reading a pass, over entries still standing `[ ]` | **set checkpoint 18 in each of those features' files and their entries under `## Features — adopted as built`, off that one block** (section 5). Nothing else sets them |

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

**The version's own criteria reach no feature's checkpoint, so a change to them may not clear one.** No gate ever read them, so no feature's pass was measured against them. What has gone stale is the sweep's.

**When it cannot be told apart, clear from checkpoint 2.** Rebuilding more than was necessary costs time; leaving a checkpoint marked passed against a spec it no longer satisfies costs correctness.

**A withdrawn feature keeps its record** — its entry moves to `## Withdrawn` and its file stays. It carries no checkbox there, so it does not pollute the count. If it was implemented, raise a removal task and move it once that is done.

**Have withdrawal stated with `kicked: yes`. Never have the section deleted.** Under the diff scheme every unchanged section is "absent", so **absent cannot be told from deleted**.

**Removing a task does not remove the code.** The model, the resolver, the tests and the migration all stay.

**A section that gains `baseline: inventoried` almost always arrives with checkpoints already marked — up to seventeen of them — and every one of those comes off.** A not-applicable mark is cleared the moment its reason stops holding (`../hora-build/references/checkpoints.md`). The reason here was `built:` expanded into marks, and listing makes `built:` a value recorded and acted on nowhere.

**The stop is an `[x]` recording a checkpoint that actually ran, and that mark is the one never unmarked here.** A run did that work and the file is its only record of it. Ask (`blocking: yes`) — either the annotation is wrong or the version means to throw away a verified checkpoint, and choosing between those is a decision.

### Paying a listed feature's debt

**Paying it is a version's ordinary work — and it is the one reconciliation that refuses to act on what the document already says.** The single fact the listing recorded, `built:`, was recorded precisely so that nothing would act on it, and acting on it now would mark up to seventeen checkpoints not applicable on the strength of a value nobody has confirmed since the day it was written. So restate the value, have it confirmed through the question tool with the evidence laid out (`../hora/references/asking.md`), and only then expand it into not-applicable marks.

**Or that version declares `authority: to-spec` for the feature, and all eighteen run against the existing code.** The two never appear on one feature.

**Inside the paid feature there is nothing to clear.** No checkpoint of it was ever marked. And its checkpoint 18, when it comes, is that feature's first acceptance ever: `/hora-accept` decides that run's reach itself, from the absence of any passing record together with the earlier version's `## Not accepted` entry naming it.

**What the payment clears lands on other features: checkpoint 18 of every feature that reaches the paid one transitively — through the same union `Rests on:` was derived from, never through `depends` alone** (section 5). Each of them passed acceptance while resting on behavior nobody had stated, and stating that behavior changes what the pass was measured against.

**A dependent that is itself listed is not in that set, and the exclusion belongs here, where the set is defined.** Re-schedule it and it gets a fresh `## Features` entry with a `[ ]` box, seventeen not-applicable marks and a scheduled acceptance over a feature with no use cases and no acceptance criteria — every state the listing denies. **It never passed anything, so there is nothing to clear and nothing to re-earn**: it keeps its `## Not accepted` entry and its eighteen `[ ]` until its own debt is paid.

**Nothing else of theirs is cleared.** Checkpoints 1 to 17 stay as they were, because their code did not change — only what they were accepted against did.

**Where that clearing lands is the paying version's own plan, and nowhere else.** A dependent finished in 1.1.0 has its checkpoint 18 in a released version's task file, which this reconciliation never opens and which `/hora` never revisits. So each transitive dependent gets **a fresh entry in the paying version's `_plan.md`, under `## Features` with a `[ ]` box, and its own file in `.hora/tasks/<paying version>/<id>.md`** — checkpoints 1–17 marked not applicable against a stated reason, 18 left `[ ]`, and its `Rests on:` line carried across.

```markdown
- [x] 1. Draft or confirm the specification  <!-- n/a: accepted in 1.1.0; re-accepted because #billing's debt was paid -->
                                    ← and 2 through 17 the same, each with the reason
- [ ] 18. Acceptance (E2E and unit both)
```

**The box is `[ ]` rather than absent because a run is going to close it.** The reason line is what stops 1–17 being run again over code nothing touched, and it names the earlier version so the second acceptance can be read against the first.

**No released version's task files or `_plan.md` are ever rewritten** (section 1). **The version that caused the re-earning is the version that schedules it**, which is also the version whose closing report somebody is going to read.

**One payment can reopen a dozen acceptances, and that has to be visible before it happens.** `depends` is followed transitively, so a feature three hops away is reopened as surely as a direct dependent. **Name every feature the clearing will reach, and what each one now owes, before clearing anything** — then clear.

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

**Findings resolved in conversation may be counted. Questions may not.** A resolved finding is over; an open question is work somebody still has to do.

**A listed feature may not be counted either.** "3 not accepted" says that this version claims nothing about part of the product and not which part. **They are also outside the feature count** — a plan of twenty with three listed is seventeen to build.

**Seventeen here and twenty in the acceptance record are not a discrepancy.** This report counts what there is to build; the sweep's verdict counts what the tag claims about the product, so it keeps all twenty in its denominator (`../hora-accept/SKILL.md`, "Recording the result"). Two questions, two numbers.

When it stopped with a `blocking: yes` outstanding, **put what the human has to do first**.

---

## References

| File | Content |
|---|---|
| `../hora/references/structure.md` | the layout, the invariants, the language rule |
| `../hora/references/asking.md` | **a check, a proposal or a question** — and the question tool this skill defaults to |
| `../hora/references/spec-format.md` | the authority on the format of `specs/<version>/spec.md` |
| `../hora-spec/SKILL.md` | **who writes a spec, and what to hand back to it** |
| `../hora-spec/references/stages.md` | which stage a design-level finding goes back to |
| `specs/skeleton/spec.md` | the blank spec that gets copied. `/hora-spec` does the copying |
| `../hora-build/references/checkpoints.md` | the checkpoint list to write into each feature file |
| `../hora/references/done-criteria.md` | what "done" means for a checkpoint, a feature and a version |
