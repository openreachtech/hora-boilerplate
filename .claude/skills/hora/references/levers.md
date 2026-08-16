# Every lever, and where it lives

**A lever is anything that reduces how much work happens.** This file is the index: which home each one sits in, and which file owns its rules.

`structure.md`, "Where a lever lives", is the rule that decides a home. This is the map of where that rule has been applied.

- **A row is a pointer, never a rule.** What a lever does, and how far it reaches, lives in the owning file
- **A lever missing from this table is a defect in the table. It is never permission**
- **A row whose file or section no longer exists is reported as a question.** Do not guess where it moved, and do not delete the row

---

## The homes

| Home | What it admits |
|---|---|
| **`spec.md`'s own text** | a whole-project decision, needed before anything is read deeply and expensive to undo |
| **a required section** | this version's whole position. A declared `Source` may satisfy it |
| **an annotation** | one feature, as an exception to that position |
| **`.hora/`** | derivations only. Nothing is ever declared here |
| **the invocation** | one run, plus that run's own record of what it gave up |
| **`request/`** | a page of notes in place of written sections |

---

## In `spec.md`'s own text

| Lever | Owned by |
|---|---|
| the project name | `spec-format.md`, "Required sections" |
| the repository layout — which rows exist, and each row's roles | `spec-format.md`, "2. Repository layout" |
| a row's `Directory` column, which stops a row being created | `spec-format.md`, "`Directory` — for a repository that already exists" |
| the baseline declaration | `spec-format.md`, "5. Existing assets" |

## In a required section

| Lever | Owned by |
|---|---|
| the conventions package, and declaring none | `structure.md`, "The conventions package" |
| the current implementation, and how it may be treated | `spec-format.md`, "5. Existing assets" |
| which side is authoritative when spec and code disagree | `spec-format.md`, "5. Existing assets" |
| the implementation scope, split three ways | `spec-format.md`, "4. Implementation scope" |
| the build order, and what may be left for later | `spec-format.md`, "14. Implementation plan" |
| a criterion checked at the version's sweep instead of at a feature's gate | `spec-format.md`, "15. Version acceptance criteria" |
| a criterion resting on a feature nobody accepted | `spec-format.md`, "`baseline`" |
| the security level | `../../hora-spec-nonfunctional/SKILL.md` |
| an assumed number where nobody had one | `asking.md`, "What is never asked" |
| the services a project declares, and one it omits | `spec-format.md`, "8. Manual verification" |
| a spec's own existing identifier scheme | `spec-format.md`, "1. Document information" |
| a declared source satisfying a required role | `spec-format.md`, "Required sections" |
| supporting material that never becomes a feature file | `spec-format.md`, "Declaring sources and annex" |
| a section this version's diff does not write | `spec-format.md`, "From the second version on, write a diff" |

## In an annotation

| Lever | Owned by |
|---|---|
| how far a feature was already built | `spec-format.md`, "`built`" |
| a feature listed rather than specified | `spec-format.md`, "`baseline`" |
| one feature's authority, against the document's | `spec-format.md`, "`authority`" |
| a withdrawn feature, and a revived one | `spec-format.md`, "`kicked`" |
| which repositories a feature touches, and a section that produces none | `spec-format.md`, "`target`" |
| use cases written once on an H1 and inherited | `spec-format.md`, "The two blocks every feature carries" |
| a section stating in prose that it adds no code of its own | `spec-format.md`, "A behavior that exists only once two sections cooperate" |

## Derived into `.hora/`

| Lever | Owned by |
|---|---|
| a checkpoint marked not applicable against its own line | `done-criteria.md`, "Not applicable is a state, and it needs a reason" |
| a built value expanded into not-applicable marks | `spec-format.md`, "`built`" |
| a whole gate skipped because no row plays that role | `../../hora-build/references/checkpoints.md` |
| an all-built version collapsed to one adoption sweep | `../../hora-plan/SKILL.md`, "Collapsing an all-built version to one sweep" |
| a listed feature's entry, carrying no checkbox and never counted | `../../hora-plan/SKILL.md`, "The plan file" |
| a withdrawn feature's entry, carrying no checkbox and never counted | `../../hora-plan/SKILL.md`, "The plan file" |
| what a feature's pass rests on that nobody accepted | `../../hora-plan/SKILL.md`, "One file per feature" |
| checkpoint 18 cleared for every transitive dependent when a debt is paid | `../../hora-plan/SKILL.md`, "Paying a listed feature's debt" |
| how far a changed section reopens a feature's checkpoints | `../../hora-plan/SKILL.md`, "Reconcile on re-entry" |
| what an as-built declaration lets a stage draft, and confirm in batches | `asking.md`, "What is never asked" |
| a stage carried over on a diff version | `../../hora-spec/references/stages.md`, "On a diff version, a stage may pass by carrying over" |
| the verifier skipped where a passing suite already proves the exit condition | `../../hora-build/SKILL.md`, "When the suite is the verification" |
| a checkpoint's units taken by one agent each, sharing the gate's one commit | `../../hora-build/SKILL.md`, "Splitting a checkpoint into units" |
| a matched skill read through a digest pinned to the package version | `../../hora-build/SKILL.md`, "The digest a matched skill is read through" |
| one id prefix allocated per feature and handed to every unit | `../../bank-id/SKILL.md` |
| the lint fix loop, and its limit | `../../hora-build/SKILL.md`, "A lint rule contradiction" |
| a question that does not stop the run | `../../hora-plan/SKILL.md`, "Categories" |
| a step that ran without the skill that owns it | `../../hora-build/SKILL.md`, "What an implementer may not do" |
| a classification inferred rather than asked | `structure.md`, "2. The boundary of inference" |
| a section with no id, and the coarser task granularity that follows | `spec-format.md`, "The folder name becomes the `id`" |
| a required section recognized by role, needing no annotations | `spec-format.md`, "Required sections" |
| resuming from the first unpassed checkpoint | `../../hora-build/SKILL.md`, "Where to start" |
| a row created only where the layout declares one that is missing | `../SKILL.md`, "Deciding where you are" |

## In the invocation, and that run's record

| Lever | Owned by |
|---|---|
| the acceptance reach — one feature's gate, or the whole-version sweep | `../../hora-accept/SKILL.md`, "What is in scope" |
| the live, driven part of the review, skipped at a gate | `../../hora-accept/SKILL.md`, "The order to run in" |
| the environment confirmation, required only where something is driven | `../../hora-accept/SKILL.md`, "The order to run in" |
| a person widening a run — and nothing narrowing it | `../../hora-accept/SKILL.md`, "What is in scope" |
| a finding the project decides to live with | `../../hora-accept/SKILL.md`, "What a failure does" |
| a proposal declined or deferred | `asking.md`, "What each is recorded as" |
| a sub-command invoked directly instead of the orchestrator | `../SKILL.md`, "The shape of a run" |
| one spec stage invoked alone | `../../hora-spec/references/stages.md`, "What a stage is" |

## In `request/`

| Lever | Owned by |
|---|---|
| a page of notes in place of written sections | `spec-format.md`, "The three drop-off directories" |

---

## What is not a home, and never becomes one

| | Why |
|---|---|
| `docs/` | it explains levers to people and is read by no skill. A pointer to this file is the most it may hold |
| a hora skill's own prose | a skill executes a lever; it does not own one |
| `specs/skeleton/spec.md` | written to by nobody, and not a version. A lever pre-declared there would ship with every project that copies it |
| a conventions package's own text | no hora file may name one or copy a criterion out of it |
