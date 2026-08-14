# Every lever, and where it lives

**A lever is anything that reduces how much work happens.** This file is the index of them: which home each one sits in, and which file owns its rules. `structure.md`, "Where a lever lives", is the rule that decides the home; this is the map of where the rule has already been applied.

**Three things about every row.**

- **A row is a pointer, never a rule.** There is deliberately no column for what a lever does or how far it reaches — that lives in the owning file
- **A lever missing from this table is a defect in the table. It is never permission.** The owning file decides; a gap here means somebody added a lever without indexing it
- **A row whose file or section no longer exists is reported as a question.** Do not guess where it moved, and do not delete the row. The section titles are written out so a moved section can be found by searching for its title

---

## The homes

| Home | What it admits |
|---|---|
| **`spec.md`** | a whole-project decision needed before anything is read deeply, and expensive to undo. Its own text — never a declared `Source` |
| **a required section** | this version's whole position. Satisfiable by `spec.md`'s text or by a declared `Source` |
| **an annotation** | one feature or one section, as an exception to that position |
| **`.hora/`** | derivations only. Nothing is ever declared here |
| **the invocation** | one run. Plus that run's own record, which says what it gave up |
| **`request/`** | a page of notes in place of written sections. Drafted from as proposals |

---

## In `spec.md`'s own text

| Lever | Owned by |
|---|---|
| the project name (the application prefix) | `spec-format.md`, "Required sections" |
| the repository layout — which rows exist at all | `spec-format.md`, "2. Repository layout" |
| a row's `Directory` column, which stops a clone | `spec-format.md`, "`Directory` — for a repository that already exists under another name" |
| `Baseline: verified \| inventoried` | `spec-format.md`, "5. Existing assets" |

## In a required section

| Lever | Owned by |
|---|---|
| `Current implementation:` | `spec-format.md`, "5. Existing assets" |
| `Treatment: port it \| reference it` | `spec-format.md`, "5. Existing assets" |
| `Authority: as-built \| to-spec` | `spec-format.md`, "5. Existing assets" |
| the implementation scope, split three ways | `spec-format.md`, "4. Implementation scope" |
| the implementation plan's order, and what may be left for later | `spec-format.md`, "14. Implementation plan" |
| a criterion checked at the version's sweep instead of at a feature's gate | `spec-format.md`, "15. Version acceptance criteria" |
| a criterion resting on a feature nobody accepted | `spec-format.md`, "`baseline`" |
| the security level | `../../hora-spec-nonfunctional/SKILL.md` |
| a stated absence in the non-functional requirements | `spec-format.md`, "7. Non-functional requirements" |
| an assumed number where nobody had one | `asking.md`, "What is never asked" |
| the manual verification table, and a middleware it omits | `spec-format.md`, "8. Manual verification" |
| `Annotation source` — a spec's own existing id scheme | `spec-format.md`, "1. Document information" |
| a declared `Source` satisfying a required role | `spec-format.md`, "Required sections" |
| `Annex` — a listed file that never becomes a feature file | `spec-format.md`, "Annex" |
| the RESTful API section, omitted where no server is REST | `spec-format.md`, "9 onward — the feature sections" |
| the background jobs section, omitted where nothing runs outside a request | `spec-format.md`, "9 onward — the feature sections" |
| the diff rule — a section this version does not write | `spec-format.md`, "From the second version on, write a diff" |

## In an annotation

| Lever | Owned by |
|---|---|
| `<!-- built: spec \| backend \| frontend -->` | `spec-format.md`, "`built`" |
| `<!-- baseline: inventoried \| verified -->` | `spec-format.md`, "`baseline`" |
| `<!-- authority: as-built \| to-spec -->` | `spec-format.md`, "`authority`" |
| `<!-- kicked: yes \| no -->` | `spec-format.md`, "`kicked`" |
| `<!-- target: … -->`, and `target: none` | `spec-format.md`, "`target`" |
| use cases written once on an H1 and inherited | `spec-format.md`, "The two blocks every feature carries" |
| a section stating in prose that it adds no code of its own | `../../hora-plan/SKILL.md`, "Carry both kinds of \"out of scope\" as design constraints" |

## Derived into `.hora/`

| Lever | Owned by |
|---|---|
| a checkpoint marked not-applicable against its own line | `../../hora-build/references/checkpoints.md`; `done-criteria.md`, "Not applicable is a state, and it needs a reason" |
| `built:` expanded into not-applicable marks, with the reason | `spec-format.md`, "`built`" |
| a whole gate skipped because `target` names no such row | `spec-format.md`, "`target`"; `../../hora-build/references/checkpoints.md` |
| an all-`built:` version collapsed to one adoption sweep | `../../hora-plan/SKILL.md`, "collapses to one sweep" |
| `## Not accepted` — a listed feature's entry, no checkbox, never counted | `../../hora-plan/SKILL.md`, "`_plan.md` — the order"; `done-criteria.md`, "When a version is done" |
| `## Withdrawn` — a withdrawn feature's entry, no checkbox, never counted | `../../hora-plan/SKILL.md`, "`_plan.md` — the order"; `done-criteria.md`, "When a feature is done" |
| `Rests on:` — what a feature's pass rests on that nobody accepted | `../../hora-plan/SKILL.md`, "One file per feature" |
| checkpoint 18 cleared for every transitive dependent when a debt is paid | `../../hora-plan/SKILL.md`, "6. Reconcile on re-entry" |
| what `Authority: as-built` lets a stage draft, and confirm in batches | `asking.md`, "What is never asked"; `../../hora-spec-usecases/SKILL.md` |
| a stage carried over on a diff version | `../../hora-spec/references/stages.md` |
| the digest-driven clearing table — how far a changed section reopens | `../../hora-plan/SKILL.md`, "6. Reconcile on re-entry" |
| the sweep entry alone cleared when the version's own criteria change | `../../hora-plan/SKILL.md`, "6. Reconcile on re-entry" |
| a not-applicable mark cleared the moment its reason stops holding | `../../hora-build/references/checkpoints.md` |
| the verifier skipped where a passing suite already proves the exit condition | `../../hora-build/SKILL.md`, "Step 9 — when the suite is the verification (checkpoints 6 and 16)" |
| a checkpoint's units taken by one agent each, sharing the gate's one commit | `../../hora-build/SKILL.md`, "Step 5 — splitting a checkpoint into units" |
| a matched skill read through a digest pinned to the package version | `../../hora-build/SKILL.md`, "Step 3 — the digest each matched skill is read through"; `structure.md`, "How the match is made" |
| one `bank-id` prefix allocated per feature and handed to every unit | `../../hora-build/SKILL.md`, "Step 5 — splitting a checkpoint into units" |
| `eslint --fix` before an agent round trip, and the fix loop's limit | `../../hora-build/SKILL.md`, "Running one checkpoint" |
| a retry abandoned on a failure no retry can fix | `../../hora-build/SKILL.md`, "Running one checkpoint", step 8 |
| `blocking: no` — the run continues with the question open | `../../hora-plan/SKILL.md`, "Categories" |
| `missingSkill` — a step ran without the skill that owns it | `../../hora-build/SKILL.md`, "Step 3 — matching a checkpoint to the skills that cover it"; `../../hora-accept/SKILL.md`, "No name appears above, and none may" |
| `target` / `depends` inferred rather than asked | `structure.md`, invariant 2 |
| a `##` with no `id` — coarser task granularity | `spec-format.md`, "The folder name becomes the `id`" |
| a required section recognized by role, needing no annotations | `spec-format.md`, "Required sections" |
| resuming from the first `[ ]` checkpoint | `../../hora-build/SKILL.md`, "Where to start" |
| a listed feature never entered, and never resumed from its eighteen empty boxes | `../../hora-build/SKILL.md`, "Where to start" |
| a collapsed version's features not taken individually, the sweep closing them | `../../hora-build/SKILL.md`, "Where to start"; `../../hora-plan/SKILL.md`, "collapses to one sweep" |
| `/hora-setup` invoked only where a declared row is missing | `../SKILL.md`, "Deciding where you are" |

## In the invocation, and that run's record

| Lever | Owned by |
|---|---|
| the acceptance reach — the feature gate, or the whole-version sweep | `../../hora-accept/SKILL.md`, "What is in scope" |
| the live, browser-driven part of the review, skipped at a gate | `../../hora-accept/SKILL.md`, "The order to run in" |
| the environment confirmation, required only where something is driven | `../../hora-accept/SKILL.md`, "The order to run in" |
| the UX audit, skipped at a gate | `../../hora-accept/SKILL.md`, "The order to run in" |
| the version's own criteria, out of scope at every gate and at every widening | `../../hora-accept/SKILL.md`, "What is in scope" |
| a person widening a run — and nothing narrowing it | `../../hora-accept/SKILL.md`, "What is in scope" |
| a listed feature's deferred acceptance — the run that pays it is never browser-less | `../../hora-accept/SKILL.md`, "What is in scope" |
| a finding the project decides to live with | `../../hora-accept/SKILL.md`, "What a failure does" |
| a proposal declined or deferred | `asking.md` |
| a sub-command invoked directly instead of `/hora` | `../SKILL.md`, "The shape of a run" |
| one `/hora-spec-*` stage invoked alone | `../../hora-spec/references/stages.md` |

## In `request/`

| Lever | Owned by |
|---|---|
| a page of notes in place of written sections | `spec-format.md`, "Directory layout"; `../../hora-spec/references/investigation.md` |

---

## What is not a home, and never becomes one

| | Why |
|---|---|
| `docs/` | it explains levers to people, is read by no skill, and comes in `ja`/`en` pairs. **A pointer to this file is the most `docs/` may hold** |
| a hora skill's own prose | a skill executes a lever; it does not own one. Where a skill's file is named above, it is named as the owner of a derivation |
| `specs/skeleton/spec.md` | written to by nobody, and not a version (`structure.md`, invariant 1). A lever pre-declared there would ship with every project that copies it |
| a package skill's mode | no hora file may name one or copy a criterion out of it ("The division of labor", `structure.md`) |
