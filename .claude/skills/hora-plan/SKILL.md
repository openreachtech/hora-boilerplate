---
name: hora-plan
description: Plan one version from its spec. Fixes which version is being built, verifies the spec for holes and contradictions in conversation, and writes the feature-level task list. Invoked by /hora, or directly as /hora-plan.
---

# hora-plan

**The planner.** Decide which version is being built, get its spec into a state that can actually be built, and write the list of features to build.

Read `../hora/references/structure.md` first. **`../hora/references/asking.md` fixes how anything here is put to a person.**

```
1. Fix the version being implemented
2. Verify the spec for holes and contradictions, and resolve them in conversation
3. Write the task list — one entry per feature, plus the acceptance tasks
```

**The task list is feature-level, never implementation-level.** "Build the attendance feature" is an entry. "Write the RpaFlow model" is a checkpoint inside `/hora-build`, and this skill does not decide it.

## This skill may write into `specs/`. Only `/hora-spec` may too

Planning is a conversation with whoever wrote the spec, and asking that person to hand-edit twenty separate holes defeats the point of having it.

```
1. state the hole or contradiction found
2. propose the exact edit, in full
3. wait for that person to approve THAT edit
4. write it
```

**Approval is per edit, never blanket.**

**Step 2 is a proposal, and it is said as one.** **Where the finding is instead that this skill may have misread the document, that is a check** — settled before any edit is proposed. **Half of what looks like a hole in a spec is a hole in the reading of it.**

**Step 3 stays in prose.** The edit's exact words have to be read, and an option labelled "approve" is what lets somebody not read them.

**A finding that needs design work goes to `/hora-spec` instead.** The split is by what the fix is, not by how large it looks:

| The finding | Fixed |
|---|---|
| a missing annotation, a `target` naming no row, a typo, a drifted section number | **here**, one edit at a time |
| a missing use case, a use case the design cannot serve, an operation with no kind or no caller, a scope split nobody made, a contradiction between two designed things | **`/hora-spec`**, at the stage `../hora-spec/references/stages.md` names |

**Why not all of it here:** a use case written into `specs/` by the planner is a use case no stage ever walked against a data model or a surface.

**Never write into a past version's directory.** A fix belonging to a released version goes into the version being planned, as a full replacement of that section.

---

## 1. Fix the version

**A version directory is one under `specs/` whose name is a semver version, and nothing else.** `specs/skeleton/` holds the blank spec — never planned, never implemented, never counted. Any other non-semver directory is skipped, and reported once so nobody assumes it was read.

**The target version:** among those directories, the **lowest** one whose `.hora/tasks/<version>/` has not been generated, or still holds unfinished features. If all are finished, the lowest that exists under `specs/` but not under `.hora/tasks/`. If there is no such version, report that every version is complete.

**Only the directory name counts.** If the version inside `spec.md` contradicts it, have a human fix it.

**If the target version's `spec.md` is empty or missing, hand the run to `/hora-spec`** and stop. **Never write the first spec of a version here.**

### Resolve the diffs first

Sort the version directories ascending and **apply them in turn, each overwriting the last.** The lowest is complete; each later one is a diff against **the version immediately before it**, not against the lowest.

**The key for overwriting is `id`.** A section absent from the diff carries over unchanged. Writing only a heading and annotations overwrites those annotations and carries the body over; writing a body replaces the whole body.

**A gap in the versions does not break the chain.** Only the versions that exist are applied, in order.

**Files of past versions are never rewritten.** Carrying bodies over works precisely because past versions are frozen.

**Scanning, digests and the judgment about a vanished section all happen against the resolved document.** Handled per file, every feature would be flagged "the spec changed" on every version bump.

### Judge whether the version number is valid

The first version is not judged. From the second on, the diff in `.hora/contracts/` is the primary evidence.

| Difference in the contract | The valid bump |
|---|---|
| none | patch |
| fields or types **only added** | minor |
| removed, renamed, retyped, or a **required field added** | **major** |

Changes not visible in a contract are patch; something invisible in a contract but visible to users is minor. Also detect skipped versions (report only) and versions that go backwards or repeat (blocking).

**A version number becomes three directory names and a release tag, so questions about versioning are `blocking: yes`.**

### How much may be added to a version

**The line is not the kind of change but whether the version has been released.** Judge by the tag in the hora repository.

| State | Treatment |
|---|---|
| **not released** | additions, changes and deletions are all accepted. The version number does not change |
| **released** | leave it alone. Do it in the next version |

An unreleased version has no users, so changing a contract breaks nobody. What happens is rework, not broken compatibility. **A spec change or a withdrawn feature just before release is entirely normal, and this must not be closed off.**

**A spec change after a row has already landed on `main`** becomes an additional pull request to that row. The version is still unreleased, so it may be accepted.

---

## 2. Verify the spec, in conversation

### What is read

**Reached by a link from `spec.md`, and by a link alone — not by name or folder.**

**A file that is none of `spec.md`, a feature file or a declared Source, and that nothing links to, is never read** — and raises `orphan` (`blocking: no`).

**`specs/<version>/request/` is the one directory this does not apply to.** `/hora-spec` read it and drafted from it, and what it produced is in `spec.md` by the time planning starts. Reading it here would extract tasks from a wish list nobody was held to.

| | Declared under `Sources`, or a feature file | Reached, but not declared |
|---|---|---|
| Read for | extraction — annotations, features, contracts | interpretation only |
| Ever produces a task | yes | never |

### Never invent an `id`

| Place | How it is decided |
|---|---|
| a feature file's H1 | **join the path segments below `specs/<version>/` with `--`.** Deterministic and unique |
| a `##` section | **somebody states it.** If it is not written, do not infer it |
| a `##` with no `id` | tie that section's content **to the H1's `id`.** The reference stays stable |

**`id` is unique across the whole version.** On a collision, ask (`blocking: yes`).

**`id`/`target` may come from the spec's own identifier scheme** where the document information declares an `Annotation source`. `id` is then the element's own identifier; `target` is looked up from the declared prefix table. A prefix the table does not cover is treated as unstated: infer from content, and report `inferred-annotation`.

### The annotations

`../hora/references/spec-format.md` is the authority on all of them. What matters here:

**`target` decides which checkpoints apply, and nothing else.** One feature is one file whatever it touches. **Check its value against the layout** — pointing at a row that does not exist is a typo, so ask (`blocking: yes`).

**Where `target` is unstated, infer from content. Never treat it as `none`.** Record it as `inferred-annotation` (`blocking: no`).

**`target: none` does not mean "do not read".** Non-functional requirements become constraints on every feature; the implementation plan decides the order; terminology becomes the glossary.

**`built` and `baseline` are never inferred.** Both are `/hora-spec`'s to settle with a person.

**The required sections need no annotations at all.** Recognize each by its role.

### What to verify, and what stops the run

Work through the resolved document and check every one of these.

| Check | Missing means | blocking |
|---|---|---|
| **Use cases per feature** — a listed section excepted | checkpoints 2, 9 and 11 have nothing to verify against | **yes** |
| **Acceptance criteria per feature** — the same exception, and only those two | "what counts as done" would have to be invented | **yes** |
| **The kind of each operation** | checkpoints 3, 6 and 14 cannot choose which convention to follow | **yes** |
| **A stated caller per operation**, and an actors table to state it against | the operation gets whatever filter its neighbours had | **yes** |
| **A listed section carrying a usecases block, an acceptance block, a surface section or a data-model table** | it is specified and listed at once, and nothing decides which half the checkpoints run against | **yes** |
| **Every feature's two blocks reaching no further than that feature and its `depends`** | four separate runs act on a block that reaches forward (below) | **yes** |
| **The version's own acceptance criteria** — present, `none` or every criterion carrying `spans:` | the sweep has nothing to check the product against | **yes** |
| **An order putting every feature after the features it depends on** | `/hora-build` silently builds them in a different order than the document states | **yes** |
| The implementation scope, split into "for now" and "permanently" | the design cannot tell an extension point from a dead abstraction | yes |
| Whether existing assets may be used, and the authority and baseline lines | reimplementation is implied, but nothing says so | yes |
| Unknown fields in an interface definition | it would mean inventing the shape of an interface | yes |
| A contradiction in the text | there is no way to choose between them | yes |
| Any of the `baseline` contradictions | `../hora/references/spec-format.md`, "`baseline`" | yes |
| **A `depends` naming a listed section**, where a feature's own tables or operations sit on that section's | the dependent stays outside the transitive set when the debt is paid | **yes** |
| A missing `target` / `depends` | it classifies content, so it can be derived | no |
| A missing `id` on a `##` | it ties to the H1's `id`, so references hold | no |
| An orphaned file | notice that something will not be read | no |

| | States | Verified at |
|---|---|---|
| a **use case** | who does what, for what purpose, end to end | checkpoints 2, 9, 11 and 18 |
| an **acceptance criterion** | an observable behavior, present or absent | the tests written alongside the code, and 18 |
| a **version acceptance criterion** | a behavior spanning several features | **the whole-version sweep, and nothing else** |

**A listed section suspends exactly the first two rows and nothing else.** `undefined-api-kind` and `missing-authorization` are raised over its operations exactly as over any other's, because those describe code that is already running and already reachable.

**The emptiness is checked in the other direction too.** A listed section that also carries a block, a surface section or a data-model table is claiming both states at once. **Stop with `contradiction` rather than pick.** What it still owes is a row, not a section.

### A block that reaches forward is a stop, not a note

**Every gate that reads a feature's blocks runs at that feature's own position in the order**, so a criterion or use case naming a feature built afterwards cannot be met wherever it is read. **Four runs act on one anyway:** checkpoint 1 builds from the criteria, 6 and 16 write a test for each and run it, the verifier reports the untestable one, and 18 fails the feature by construction.

**Detect it by walking the order once, carrying what is built so far**, and reading each feature's two blocks against that set plus the feature itself. **A `depends` on a listed feature is satisfied by the running code and orders nothing**, so it counts as already built.

**The fix is a design decision and it belongs to `/hora-spec`, at stage 2.** Raise `forward-reference` (`blocking: yes`) and route it there. **Never move the criterion here**, and never reorder `_plan.md` to make it fit — the order comes from the spec.

**Where the order itself contradicts a `depends`, the same category and the same destination.** The walk cannot even run until it is settled.

### Resolving what was found

**Resolve it here, in conversation, whenever the person who can answer is present.**

**Batch the deciding, not the approving.** Which findings are real, and which of several fixes to take, go out through the question tool four at a time; the exact wording of each edit is then shown and approved on its own.

**Two things still go to `.hora/questions/<version>/open.md`:** anything the person present cannot answer now, and **every finding that was resolved**, recorded after the fact. The question file is the record of what was decided and why; a conversation is not.

```markdown
## Q1. #scope says nothing about what is out of scope for now
<!-- spec: scope -->
<!-- blocking: yes -->
<!-- category: scope -->

There is a "permanently out of scope" part, but no section for "out of scope
for now". Without that distinction there is no way to decide whether an
extension point should be left in place.

- [x] resolved
      Added "Out of scope for now" to #scope, listing payroll, in this session.
```

- **The file is append-only.** Resolved questions stay, as `- [x]`
- **If even one `blocking: yes` is unresolved, `/hora-build` is not entered.** With only `no` left, warn and continue
- A human may also answer by editing `specs/` between runs; on re-entry, re-read and tick what is now resolved

### Categories

| category | Content | Default blocking |
|---|---|---|
| `versioning` | whether the version number is valid | yes |
| `scope` | confirming the implementation scope | yes |
| `missing-usecase` | a feature with no stated use cases | yes |
| `missing-acceptance` | missing acceptance criteria, or a version with no criteria section and no `none` | yes |
| `forward-reference` | a block reaching a feature built after it, or an order contradicting a `depends`. **Fixed at `/hora-spec`, stage 2 — never here** | yes |
| `undefined-api-kind` | an operation whose kind is not stated | yes |
| `missing-authorization` | an operation, a surface or a spec that does not say who may reach it | yes |
| `unmet-usecase` | a use case the design as written cannot complete | yes |
| `existing-assets` | whether existing code may be used, which side is authoritative, and how much of the inherited product this tag claims | yes |
| `contradiction` | a contradiction in the text | yes |
| `dependency-install` | a declared dependency failed to install, or a conflict-proof change failed to apply | yes |
| `lacked-environment` | something failed for a reason no code change could fix | yes |
| `spec-proposal` | an improvement proposed and declined or deferred. **Recorded so it is not proposed again every run** | no |
| `undeclared-behavior` | the code does something no spec states, under `to-spec`. Both readings offered, neither recommended | no |
| `inferred-annotation` | reporting that a classification was inferred | no |
| `spec-assumption` | an ambiguous criterion was met under an assumed reading | no |
| `reinvention` | checking whether something existing already does what is about to be written | no |
| `orphan` | a file nothing links to | no |
| `undefined-detail` | undefined types, definitions, seed values | depends |
| `common-file` | undocumented handwritten content in a file several features share | depends |
| `acceptance-finding` | an acceptance finding that is not a spec defect and not yet fixed | depends |
| `lint-exception` | one lint rule disabled for one file, to break a genuine rule contradiction | no, but **fail-loud** |

**`no, but fail-loud` is not an ordinary `blocking: no`.** State it by name, on its own, every time a closing report is written.

---

## 3. Derive the contracts

Write them into `.hora/contracts/<version>/`.

**The largest risk of having split into repositories is contract drift.** Let each repository derive its own interface from the spec and they will disagree. Derive once before implementing, pin it, and have every side read that.

**When there is no actual definition:**

```
RpaFlowsInput(pagination)   contents indicated in parentheses
                            → derive after an existing shape. blocking: no,
                              recording what was derived and how
RpaFlowsInput               fields unknown
                            → inventing the shape of an interface. blocking: yes
```

**Every operation's kind belongs in the contract, not only its shape.** Checkpoints 3, 6 and 14 each read it from there.

**Contracts are cut per server, not per repository.** One provider row holds several servers, each with its own contract.

**A contract is made only for a server whose consumer is in another repository or outside.** The server table's `Consumer` column decides it — a server consumed inside its own repository needs none, and neither a job payload nor the database schema is a contract. **A contract is only for what another implementer reads.**

A server with no consumer, and a consumer row with no server to match it, are both errors in the declaration, so ask (`blocking: no`).

---

## 4. Write the glossary

`.hora/glossary.md` — not split per version, append-only. **It stops one concept from acquiring two names.** A contract pins the type names on an interface's surface, but not class names, method names or internal variable names.

**Check names against the project's own lint rules, read from the linted repository's own configuration** (`../hora/references/structure.md`, "The division of labor"). Skip the check and implementation walks into lint errors, each of which invents its own local workaround name.

```markdown
| Term | Identifier | Kind | Used in | Notes |
|---|---|---|---|---|
| Flow | `RpaFlow` | entity | core / admin | table: `rpa_flows` |

## Names avoided, and why
| The naive name | Why it fails | What was used |
|---|---|---|
| `flowList` | list-suffixed names are on the denylist | `flows` |
```

**Recording what was avoided is the point.** Without the reason, somebody later restores the naive name and lint fails.

**Do not write a change log** — git holds that.

---

## 5. Write the plan and the feature files

### The plan file

```markdown
# 1.0.0

## Features

1. [ ] #attendance            core, employee
2. [ ] #attendance--monthly   core, employee   depends: attendance
3. [ ] #payroll               core, admin      depends: attendance--monthly, billing
       Rests on: #billing (not accepted)

## Acceptance

- [ ] Sweep the whole version, once every feature above is done
      Version criteria: 4 (#version-acceptance-1-0-0), 1 resting on #billing

## Not accepted

- #billing    listed since 1.0.0, runs in `admin-console`   built: consumer — recorded, not acted on

## Withdrawn

- #year-end   kicked in 1.0.0
```

**The order comes from the spec's implementation plan and from `depends`. Never derive an order of your own.**

**A revived section may have `depends` pointing into a past version.** Look back through past versions in `.hora/tasks/` and treat it as satisfied if it finished there.

**Acceptance appears twice, and the two are different tasks.** Every feature carries its own as checkpoint 18, covering everything implemented so far; the `## Acceptance` entry is the whole-version sweep that runs once, before the merge into `main`. **Write both.**

**The sweep entry names the version's own criteria, because it is the only run that checks them** — how many, the section's `id`, and how many rest on a feature under `## Not accepted`. **It is a derivation, re-read on every run and never carried over.** A version whose section reads `none` gets `Version criteria: none`, written rather than left out.

**The count going up is worth reading.** Nine version criteria against eleven features says most of this version's verification has moved to a single run at the end, which is the shape the feature-at-a-time design exists to avoid.

**`## Not accepted` is `## Withdrawn`'s shape applied to the opposite case.** `## Withdrawn` holds a feature that should not exist and was dropped; this holds one that exists, runs, and has never been specified or accepted. One line each, saying **where it runs**, **which version has been listing it**, and its **`built:` value, marked as recorded and not acted on.**

**Neither section carries a checkbox**, for the same reason: a checkbox would have to mean something, and both meanings are wrong. `[ ]` puts a feature nobody intends to build in front of `/hora-build`; `[x]` claims a pass over eighteen checkpoints not one of which was marked.

**A feature may depend on a listed one, and its entry says what that costs.** The dependent keeps its ordinary `depends` and adds `Rests on: #<id> (not accepted)`. **That kind of `depends` is satisfied by the running code, never by a checkbox** — nothing is scheduled ahead of a listed feature and nothing is blocked behind one.

**`Rests on:` is derived from more than `depends`, because `depends` is a line the kit is allowed to infer.** An inference reading prose misses what a table states plainly: a feature whose data model reads a table stage 4 justified by a listed feature's name rests on that listing whether or not anybody wrote the edge. **So read both — every `depends` edge, and every data-model or operation row a listed feature justifies by name that this feature sits on — and write `Rests on:` from the union.** Where the second reading finds one the annotation does not name, the omitted `depends` is a stop.

**Derive `## Not accepted` again on every run, from the resolved document.** `baseline` is an annotation, so it is excluded from the digest: a feature that gained `inventoried` changes no digest at all, and reconciliation watching only digests would never see one move.

**Nothing in the section is declared. All of it follows from two lines in `specs/`.** Delete the section and the next run rebuilds it identically; hand-edit it and the next run overwrites it.

### Collapsing an all-built version to one sweep

**The normal shape of an `as-built` adoption is twenty features with checkpoints 1–17 not applicable and 18 open** — twenty acceptance runs over an ever-growing scope, each finding mostly what the one before it found. The per-feature gate exists to catch a feature breaking its predecessors **while the change is one commit old**; here nothing is changing.

**The qualifying test is specified and built, never built alone.**

| The feature | What it gets |
|---|---|
| **specified, and `built:` up to some gate** | **collapses.** Its entry goes under the heading below with a `[ ]` box, and the adoption sweep closes it |
| **listed** | **does not qualify, and never had a gate.** It keeps its `## Not accepted` entry and its eighteen `[ ]` |
| **specified, with no `built:`** | **does not qualify.** It keeps its own open checkpoints and its own gate-18 run, and the sweep entry stays as well |

**The gate could not be keyed on `built:` alone, because a listed feature carries it by requirement.**

```markdown
## Features — adopted as built

1. [ ] #attendance            built: consumer    ← 1–17 n/a, 18 open until the sweep passes
...
17. [ ] #payroll              built: consumer

## Acceptance

- [ ] Sweep the whole version — the adoption sweep. Covers checkpoint 18 of every entry above
      Version criteria: 2 (#version-acceptance-1-0-0), 0 resting on a not-accepted feature
```

**Every entry under that heading stays `[ ]` until the adoption sweep passes, and then they are set together.** `_plan.md` derives its checkboxes from the checkpoints; it does not announce results ahead of them.

**This skill is what sets them, as a reconciliation row like any other.** The trigger is a state, not an invocation: `_sweep.md` exists and its **newest block** reads a passing verdict, and entries under the collapsed heading still stand `[ ]`. On finding it, **set checkpoint 18 in each of those features' files and their entries in the same write, off that one record** — 18 first, so no entry claims more than its own file does.

```markdown
- [x] 18. Acceptance  <!-- the adoption sweep: .hora/acceptance/1.0.0/_sweep.md -->
```

**The writer has to be named here, because neither skill a reader would expect can do it.** `/hora-accept` writes acceptance records and never `_plan.md`; `/hora-build` skips exactly the entries a sweep entry covers. With no writer named, twenty entries stand `[ ]` over a sweep that passed, and the version can never be finished.

**Two readers read those boxes and would otherwise draw opposite conclusions:**

| Reads the box | What an unticked entry here means |
|---|---|
| whatever selects the next feature to build | **not a candidate.** Its checkpoint 18 is the sweep's |
| the acceptance sweep, deciding its scope | **in scope**, whatever the box reads |

**The heading keeps its suffix, here and everywhere it is named.** It is the only place in `_plan.md` where the collapse is written down, and **every reader takes the version's feature section whatever its heading reads** — a run matching a bare `## Features` literally finds no section in a collapsed version, sweeps nothing, and reports that nothing failed.

**An unticked box and no box at all are different states, and the difference is the whole of both mechanisms.** `[ ]` says a run is going to close this and has not yet; no box says no run will.

**Every feature file is still written, in full.** Collapsing the *runs* must not collapse the *records*.

### One file per feature

```markdown
# #attendance  Recording and listing attendance
<!-- spec: attendance @ sha256:abc123... -->
<!-- repositories: core, employee -->

Constraint: this will be reindexed for search later (#search-infra).
            leave room for a hook when a record is saved

Conflict: appends to a shared registration file. Two other features carry the same mark

## Spec gate
- [ ] 1. Draft or confirm the specification
- [ ] 2. Verify the use cases can be met

## Provider gate
- [ ] 3. Data model and interface definitions
- [ ] 4. Stub interface
...
```

**`../hora-build/references/checkpoints.md` is the authority on the list and its wording — copy it from there, do not paraphrase it.**

**Write every checkpoint, including ones that will obviously not apply.** A checkpoint left out is indistinguishable from one that was forgotten.

**A feature carrying `built:` starts with that much already marked not applicable** — 1–2 for `spec`, 1–9 for `provider`, 1–17 for `consumer`, each reading `<!-- n/a: built before hora was adopted -->`. **Checkpoint 18 always stays `[ ]`.**

**Do not infer `built` from the repository.** A feature nobody declared is planned from checkpoint 1, however finished its code looks.

**A listed feature gets the same file, and not one line of it is dropped.** What changes is the header and the marks:

```markdown
# #billing  Invoicing and payment collection
<!-- spec: billing @ sha256:def456... -->
<!-- repositories: core, admin -->

Listed, not specified: carries `baseline: inventoried`, listed since 1.0.0, and
                       sits in _plan.md's `## Not accepted`. Runs in
                       `admin-console`. Nothing below has been marked

Built (recorded, not acted on): consumer. The version that specifies this feature
                       restates the value and has it confirmed, and only then
                       does anything below get marked
```

**Eighteen `[ ]`, and not one marked not applicable.** **The header is what stops eighteen empty boxes being read as "never started"** — a feature sitting at checkpoint 1 with a surface already in production invites exactly one action: build it.

**That file is written into every version's `.hora/tasks/` for as long as the feature stays listed.**

**A dependent's file carries `Rests on:` beside its constraints.** It is not a constraint, and it does not come off when the dependent passes: a `Constraint:` tells an implementer what to leave room for; `Rests on:` tells whoever reads an acceptance record what that pass did not cover.

**Digests are taken per section, and annotation comments are excluded from them.** A section runs from its heading to the next heading at the same level or above. **So a change to `built:` or `baseline:` is invisible to a digest, and is caught by re-reading the resolved document instead** — both change what runs rather than what is built.

### Mark what overlaps

**Mark the features that touch the same file** — an aggregation file, or the same table. Features are built one at a time, so the mark is a signal to re-read the real file before writing, not a lock. Where several add columns to the same table there is an order; where `depends` is not written, infer it and report it.

**A mark here is about two features. The concurrent case lives elsewhere** — inside one checkpoint, a file two units would both write is assigned to one of them there.

### Carry both kinds of "out of scope" as constraints

| What the spec says | What the feature file must reflect |
|---|---|
| out of scope **for now** | leave an extension point. Keep it replaceable |
| **permanently** out of scope | do not abstract it. Exclude it from the design |

```markdown
Constraint: getting past a CAPTCHA is permanently out of scope (#scope).
            stop when one is detected. Build no bypass layer
```

If the spec does not let you tell them apart, ask with `scope` (`blocking: yes`).

---

## 6. Reconcile on re-entry

**This skill runs every time `/hora` runs.** Skip it and sections added to `specs/` after the list was settled are never read at all.

Reconcile the resolved document's sections against the feature files.

| State | Action |
|---|---|
| a section with no feature file | create one, and **append it to `_plan.md`'s end**. **A listed one is appended to `## Not accepted` instead, with no checkbox** |
| a section whose digest does not match | **clear the checkpoints its change invalidates, and say which** (below) |
| a section that gained `kicked: yes` | move its entry to `## Withdrawn`. **Raise a removal task** if it was implemented |
| a section that gained `baseline: inventoried` | move its entry to `## Not accepted`, and **bring every checkpoint back to `[ ]`** — an `[x]` reading the built-before-adoption reason is cleared; an `[x]` recording a checkpoint that actually ran is a stop |
| a section that **lost** `baseline: inventoried` | **the debt is being paid** (below) |
| the version-criteria section's digest does not match | **clear the `## Acceptance` sweep entry, and nothing else.** Re-derive its `Version criteria:` line in the same write |
| a section that vanished with no annotation | **do not delete anything.** The intent is unknown, so ask (`blocking: no`) |
| a collapsed version whose sweep passed over entries still `[ ]` | **set checkpoint 18 in those files and their entries**, off that one block |

**A digest only detects changes to sections an existing feature points at. A new section has no feature pointing at it, so this reconciliation is the only way to detect one.**

**Which checkpoints a spec change invalidates depends on what changed, and this skill decides it, not `/hora-build`.**

| What changed | Clear from |
|---|---|
| a use case | checkpoint 2 — everything after it |
| the data model, or an interface's shape or kind | checkpoint 3 |
| an acceptance criterion only | checkpoint 18 |
| a surface or an interaction only | checkpoint 11 |
| **the version's own acceptance criteria** | **the sweep entry alone — not one feature's checkpoint 18** |
| wording only | nothing. Record the new digest and move on |

**The version's own criteria reach no feature's checkpoint, so a change to them may not clear one.** No gate ever read them, so no feature's pass was measured against them.

**When it cannot be told apart, clear from checkpoint 2.** Rebuilding more than necessary costs time; leaving a checkpoint marked passed against a spec it no longer satisfies costs correctness.

**Have withdrawal stated with `kicked: yes`. Never have a section deleted** — under the diff scheme every unchanged section is absent, so absent cannot be told from deleted. **Removing a task does not remove the code.**

**A section gaining `baseline: inventoried` almost always arrives with checkpoints already marked, and every one of those comes off.** A not-applicable mark is cleared the moment its reason stops holding, and the reason here was `built:` expanded into marks. **The stop is an `[x]` recording a checkpoint that actually ran** — a run did that work and the file is its only record of it. Ask (`blocking: yes`).

### Paying a listed feature's debt

**It is a version's ordinary work — and the one reconciliation that refuses to act on what the document already says.** The single fact the listing recorded, `built:`, was recorded precisely so nothing would act on it. **So restate the value, have it confirmed with the evidence laid out, and only then expand it into not-applicable marks.** Or that version declares `authority: to-spec` and all eighteen run against the existing code. The two never appear on one feature.

**Inside the paid feature there is nothing to clear** — no checkpoint of it was ever marked. Its checkpoint 18, when it comes, is that feature's first acceptance ever.

**What the payment clears lands on other features: checkpoint 18 of every feature that reaches the paid one transitively — through the same union `Rests on:` was derived from, never through `depends` alone.** Each of them passed acceptance while resting on behavior nobody had stated, and stating that behavior changes what the pass was measured against.

**A dependent that is itself listed is not in that set.** Re-schedule it and it gets a fresh entry, seventeen not-applicable marks and a scheduled acceptance over a feature with no criteria — every state the listing denies. **It never passed anything, so there is nothing to clear and nothing to re-earn.**

**Nothing else of theirs is cleared.** Checkpoints 1 to 17 stay as they were, because their code did not change — only what they were accepted against did.

**Where that clearing lands is the paying version's own plan, and nowhere else.** A dependent finished in 1.1.0 has its checkpoint 18 in a released version's task file, which this reconciliation never opens. So each transitive dependent gets **a fresh entry under `## Features` with a `[ ]` box, and its own file in the paying version's `.hora/tasks/`** — checkpoints 1–17 marked not applicable against a stated reason, 18 left `[ ]`, and its `Rests on:` line carried across.

```markdown
- [x] 1. Draft or confirm the specification  <!-- n/a: accepted in 1.1.0; re-accepted because #billing's debt was paid -->
- [ ] 18. Acceptance
```

**No released version's task files are ever rewritten. The version that caused the re-earning is the version that schedules it**, which is also the version whose closing report somebody is going to read.

**One payment can reopen a dozen acceptances, and that has to be visible before it happens.** **Name every feature the clearing will reach, and what each now owes, before clearing anything** — then clear.

---

## When this skill finishes

```
the version fixed, and why that one
how many findings were raised, and how many were resolved in conversation
every question written — id, category, blocking value, one line, and a link
how many features are in the plan to build, and how many are already done
how many version criteria the sweep will be judged against, and how many rest
  on a feature nobody accepted
every feature in ## Not accepted, BY NAME — where it runs, and what rests on it
what /hora will start on next
```

**Findings resolved in conversation may be counted. Questions may not.** A resolved finding is over; an open question is work somebody still has to do.

**A listed feature may not be counted either**, and it is outside the feature count — a plan of twenty with three listed is seventeen to build.

**Seventeen here and twenty in the acceptance record are not a discrepancy.** This report counts what there is to build; the sweep's verdict counts what the tag claims about the product. Two questions, two numbers.

---

## References

| File | Content |
|---|---|
| `../hora/references/structure.md` | the layout, the invariants, the language rule |
| `../hora/references/asking.md` | a check, a proposal or a question |
| `../hora/references/spec-format.md` | the authority on the format |
| `../hora-spec/SKILL.md` | who writes a spec, and what to hand back to it |
| `../hora-spec/references/stages.md` | which stage a design-level finding goes back to |
| `../hora-build/references/checkpoints.md` | the checkpoint list to copy into each feature file |
| `../hora/references/done-criteria.md` | what done means for a checkpoint, a feature and a version |
