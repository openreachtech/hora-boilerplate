---
name: hora-plan
description: Plan one version of an application from its spec. Fixes which version is being built, verifies the spec for holes and contradictions in conversation with its author, and writes the feature-level task list — feature implementation tasks and acceptance tasks, not implementation-level steps. Runs at the root of the hora repository (myproject-app). Invoked by /hora, or directly as /hora-plan.
---

# hora-plan

**The planner.** Decide which version is being built, get its spec into a state that can actually be built, and write the list of features to build.

Read `../hora/references/structure.md` first — the layout, the invariants and the language rule all come from there.

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
```

**A file that is none of `spec.md` / a feature file / a declared Source, and that nothing links to at all, is never read** — and raises a question (`orphan`, `blocking: no`).

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
| **Use cases per feature** | checkpoints 2, 9 and 11 have nothing to verify against | **yes** |
| **Acceptance criteria per feature** | "what counts as done" would have to be invented | **yes** |
| **The kind of each API operation** — query / mutation / subscription / REST renderer | checkpoints 3, 6 and 14 cannot choose which convention to follow | **yes** |
| **A stated caller per operation**, and an actors table to state it against | the operation gets whatever filter its neighbours had, and nothing says nobody decided | **yes** |
| The implementation scope, split into "for now" and "permanently" | the design cannot tell an extension point from a dead abstraction | yes |
| Whether existing assets may be used | "reimplement" is implied, but whether the code is visible is unknown | yes |
| Unknown fields in an SDL or a REST payload | it would mean inventing the shape of an API | yes |
| A contradiction in the text | there is no way to choose between them | yes |
| A missing `target` / `depends` | it classifies content, so it can be derived | no |
| A missing `id` on a `##` | it ties to the H1's `id`, so references hold | no |
| An orphaned file | notice that something will not be read | no |

**Use cases and acceptance criteria are not the same thing, and a spec that has one still needs the other.**

| | States | Verified at |
|---|---|---|
| a **use case** | who does what, for what purpose, end to end | checkpoints 2 (does the spec support it), 9 (does the built API support it), 11 (does the screen support it), 18 (does the product support it) |
| an **acceptance criterion** | an observable behavior that is either present or absent | the tests written alongside the code, and checkpoint 18 |

A feature with acceptance criteria but no use cases builds a set of operations that are each correct and together unreachable — every API returns what it should, and no screen strings them into anything a person can do. **That failure surfaces at acceptance, at the far end of eighteen checkpoints, which is the most expensive place to find it.** This is exactly what `hf-acceptance-review` looks for, and this gate is what stops it from being found only there.

### Resolving what was found

**Resolve it here, in conversation, whenever the person who can answer is present.** For each finding: state it, propose the exact edit, wait for approval, write it. Then move to the next.

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
| `missing-acceptance` | missing acceptance criteria | yes |
| `undefined-api-kind` | an operation whose kind (query / mutation / subscription / REST) is not stated | yes |
| `missing-authorization` | an operation, a screen or a spec that does not say who may reach it | yes |
| `unmet-usecase` | a stated use case that the design as written cannot complete | yes |
| `spec-proposal` | an improvement `/hora-spec` proposed and whoever decided declined or deferred it. **Recorded so it is not proposed again every run** | no |
| `existing-assets` | whether existing code may be used | yes |
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

Do not write a change log (git holds that).

---

## 5. Write the plan and the feature files

### `_plan.md` — the order

```markdown
# 1.0.0

## Features

1. [ ] #attendance            backend, frontend-employee
2. [ ] #attendance--monthly   backend, frontend-employee   depends: attendance
3. [ ] #payroll               backend, frontend-admin      depends: attendance--monthly

## Acceptance

- [ ] Sweep the whole version, once every feature above is done

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

**Do not infer `built` from the repository.** A feature nobody declared is planned from checkpoint 1, however finished its code looks; a half-built screen and a finished one are indistinguishable from a file listing, and guessing wrong here silently skips the gates that would have caught it.

**Write every checkpoint, including the ones that will obviously not apply.** `/hora-build` marks one not applicable with a written reason; a checkpoint this skill leaves out instead is indistinguishable from one that was forgotten. `../hora-build/references/checkpoints.md` is the authority on the list and its wording — copy it from there, do not paraphrase it.

**Digests are taken per section**, and **annotation comments (`id` / `target` / `depends`) are excluded from the digest** (fixing a `target` does not make an implementation stale). A section runs "from its heading to the next heading at the same level or above". Where a spec is built around a table of individually-identified requirements, the row is the unit, and the digest is taken per row.

### Mark what overlaps

**Mark the features that touch the same file.**

| What overlaps | How it is detected |
|---|---|
| an aggregation file | from how registration works, seen by `/hora-setup`. Nothing overlaps if scanning is automatic |
| the same table | several sections name the same table |

Features are built one at a time, so the mark is a signal to re-read the real file before writing, not a lock. If several features add columns to the same table, there is an order — where `depends` is not written, infer it and report through `inferred-annotation`.

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
| a section with no feature file | create one. **Append it to `_plan.md`'s end** (do not disturb the existing order) |
| a section whose digest does not match | **clear the checkpoints its change invalidates, and say which** (below) |
| a section that gained `kicked: yes` | move its entry to `_plan.md`'s `## Withdrawn`. **Raise a removal task** if it was implemented |
| a section that vanished with no annotation | **do not delete anything.** The intent is unknown, so ask (`blocking: no`) |

A digest only detects changes to sections an existing feature points at. **A new section has no feature pointing at it, so this reconciliation is the only way to detect one.**

**Which checkpoints a spec change invalidates depends on what changed, and this skill decides it, not `/hora-build`.**

| What changed in the section | Clear from |
|---|---|
| a use case | checkpoint 2 — everything after it |
| the data model, or an API's shape or kind | checkpoint 3 |
| an acceptance criterion only | checkpoint 18 |
| a screen or an interaction only | checkpoint 11 |
| wording, with no change to any of the above | nothing. Record the new digest and move on |

**When it cannot be told apart, clear from checkpoint 2.** Rebuilding more than was necessary costs time; leaving a checkpoint marked passed against a spec it no longer satisfies costs correctness.

**A withdrawn feature keeps its record — its entry moves to `_plan.md`'s `## Withdrawn` section and its file stays.** It carries no checkbox there, so it does not pollute the count, and the fact that something was planned and dropped stays visible. If it was never implemented, moving it is enough. If it was, raise a removal task and move it once that is done.

**Have withdrawal stated with `kicked: yes`. Never have the section deleted.** Under the diff scheme every unchanged section is "absent", so **absent cannot be told from deleted**. Read absent as deleted and every section becomes a withdrawal candidate on each version bump; read absent as unchanged and a deletion is never detected.

**The easiest thing to get wrong about deletion is that removing a task does not remove the code.** The model, the resolver, the tests and the migration all stay.

---

## When this skill finishes

State, in one report:

```
the version fixed, and why that one
how many findings were raised, how many were resolved in conversation, how many were written to the question file
how many blocking questions remain
how many features are in the plan, and how many are already done
what /hora will start on next
```

When it stopped with a `blocking: yes` outstanding, **put what the human has to do first** — which section needs what added, and the path to `.hora/questions/<version>/open.md`.

---

## References

| File | Content |
|---|---|
| `../hora/references/structure.md` | the layout, the invariants, the language rule |
| `../hora/references/spec-format.md` | the authority on the format of `specs/<version>/spec.md` |
| `../hora-spec/SKILL.md` | **who writes a spec, and what to hand back to it.** Run it when a version's `spec.md` is still empty |
| `../hora-spec/references/stages.md` | which stage a design-level finding goes back to |
| `specs/skeleton/spec.md` | the blank spec that gets copied. `/hora-spec` does the copying |
| `../hora-build/references/checkpoints.md` | the checkpoint list to write into each feature file |
| `../hora/references/done-criteria.md` | what "done" means for a checkpoint, a feature and a version |
