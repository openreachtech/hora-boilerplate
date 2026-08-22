<!-- 日本語版: [commands.ja.md](./commands.ja.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# What each command does

The six main commands, described the same way each time: what it does, what it reads, what it writes, when it stops, and when you would run it on its own. Alongside them, and also invocable directly: `/bank-id` (at the end of this page), and the seven stage skills `/hora-spec` runs (named under `/hora-spec`, below).

**In normal use you only ever type `/hora`.** It decides which of the others to run. The rest are documented because you will sometimes want one directly — to redo an acceptance run, to re-plan after a spec change, to fix a setup that half-finished.

**Two of them want you at the keyboard; the rest can be left to run.** `/hora-spec` is conversation from end to end, and `/hora-plan` asks about whatever the spec left undecided. `/hora-setup`, `/hora-build` and `/hora-accept` need nobody watching — **they stop and ask rather than deciding**, which is what makes leaving them alone safe. The recommendation, and what "unattended" does and does not mean, is in [`README.md`](../README.md#recommended-converse-through-the-spec-let-the-implementation-run).

Every command runs **at the root of the hora repository** (`<myproject>-app`).

---

## `/hora`

**The orchestrator.** Works out where the project stands, runs whichever skill comes next, and owns every git operation.

| | |
|---|---|
| **Reads** | `specs/`, `.hora/`, and `git` state in every declared repository |
| **Writes** | nothing directly — but **every branch, commit and merge in every repository is its own** |
| **Stops when** | no implementation skill is equipped at all (below); a blocking question is unresolved; a decision it must not make on its own is needed; a hotfix catch-up hits something it cannot resolve |
| **Run it directly** | always. This is the normal entry point |

### What it does first, every time

```
   is any skill under .claude/skills/ named hb- / hf- / hc-?
                                              no → stop, and ask for the
                                                   implementation skills to
                                                   be equipped
0. git fetch origin --prune, everywhere. Then: did a hotfix land on main?
1. does the target version have a spec at all?  no → /hora-spec
2. are all declared repositories present?     missing → /hora-setup
3. always run /hora-plan
4. any unresolved blocking question?          yes → stop, and say what to fix
5. any unfinished feature in _plan.md?        yes → /hora-build on the first ready one
6. every feature done, and _sweep.md's newest block not a reach: full pass?
                                              → /hora-accept, whole-version
7. newest block reads reach: full and a pass  → merge into main
```

It reports the decision in one line before starting: *"continuing 1.0.0. 4 of 11 features done, building #payroll from checkpoint 6."*

**Step 0 is also the hotfix check.** `/hora` has no scheduler, so this fetch — plus the one after every merge into `release/<version>` — is the only way it ever notices that `origin/main` moved.

### What it never does

- **decide scope.** When a version cannot proceed it lays out the choices (build it / drop it / defer it) and waits
- **write `specs/`.** Only `/hora-spec` may, a section at a time, and `/hora-plan`, an edit at a time — both with your approval on the exact text
- **run manual verification for you.** It is yours to run whenever you want, with the commands `/hora-setup` recorded in `.hora/tree/<repository>.md`

---

## `/hora-spec`

**The author.** Reads whatever already exists, then writes the version's spec with you through the seven stage skills.

| | |
|---|---|
| **Reads** | `specs/`, `.hora/spec/`, **the existing repositories and any document you point it at**, and what you tell it |
| **Writes** | `specs/<version>/spec.md` and the version's feature files — **one section at a time, each one shown to you in full and written only once you approve it.** Also `.hora/spec/<version>/_stages.md`, `_assets.md` and `.hora/questions/` |
| **Stops when** | there is nobody there to answer; a decision needs somebody who is not present |
| **Run it directly** | to start a new version's spec, to continue one half-written, or to change a design decision without touching the plan |

### Stage 0, then the seven stages

```
0. Assets and sources        what already exists — the repositories, and every
                             document anybody names. Over in a sentence on a
                             new project
1. Use cases and actors      who uses this, and what each completes end to end
2. The horizon               what this release carries, what is deferred with a
                             seam kept open, what is never built
3. Non-functional            users now and foreseen, the heaviest operation,
                             availability, retention, the middleware
4. Data, API and execution   the repositories and servers, the tables, the
                             operations and their kinds, what runs as a job
5. Screens and interaction   which screens each use case passes through, and
                             what each screen calls
6. Security                  who may call each operation, and what happens when
                             somebody else does
7. Whole-document review     whether it all holds together, and every use case
                             is satisfiable
```

**Each stage from 1 to 7 is its own skill, and each may be run directly**: `/hora-spec-usecases`, `/hora-spec-horizon`, `/hora-spec-nonfunctional`, `/hora-spec-backend`, `/hora-spec-frontend`, `/hora-spec-security`, `/hora-spec-review`. `/hora-spec` runs them in order; run one alone to redo just that stage's conversation. Stage 0 has no skill of its own — `/hora-spec` runs it itself.

**The order is a rule, and each stage is a gate.** A data model designed before the use cases are fixed is designed twice; a table designed before the user counts are known is designed for the wrong number. Each stage's exit condition is in [`stages.md`](../.claude/skills/hora-spec/references/stages.md).

**Going back is normal.** Stage 7 exists to send the run back into whichever stage owns a shortfall — and so does checkpoint 2, 9, 11 or 18 when what it finds turns out to be the spec rather than the code.

**Stage 0 is what stops a running product from having to be dictated.** It reads the repositories and the documents, drafts what they show, and hands it back for you to correct. On a project with nothing to read it records that and moves on ([`investigation.md`](../.claude/skills/hora-spec/references/investigation.md)).

**On a project with code, one declaration decides how much of that conversation you get: `Authority:`** — `as-built` (what runs is what this version is; questions drop to a handful, and use cases are drafted from the system for you to correct) or `to-spec` (the spec is the truth; the code catches up through the checkpoints). It is asked once at stage 1, overridable per feature, and required — the whole procedure is in [`adopting.md`](./adopting.md), "First, decide which of the two adoptions this is".

### Adding a feature to a version that already shipped

**From the second version on, `spec.md` is a diff against the version before it** — only the sections this version changes. Everything else carries over by being absent, and past versions are never rewritten ([`spec-format.md`](../.claude/skills/hora/references/spec-format.md), "From the second version on"). **The blank spec is not copied into a diff version**: it would land twenty empty headings in a document that needed one new feature.

**Write the outline, not the document.** Drop what you want into `specs/<version>/request/` — a mail, a ticket, a page of bullets, in your own words, written by whoever wanted it — and run `/hora-spec`. Stage 0 reads it first and treats it as this version's agenda; the seven stages turn it into sections, each one shown to you in full before it is written.

```
specs/1.1.0/
  request/
    csv-export.md    "the admin wants a month of attendance as a CSV"
  spec.md            ← what /hora-spec writes from it. A diff: document
                       information, and the CSV export feature. Nothing else
```

| | `sources/` | `annex/` | `request/` |
|---|---|---|---|
| What putting a file here says | **it is the spec** | **it explains the spec** | **this is what I want; work it out** |
| Declared in a table, and linked from `spec.md` | yes | yes | **never** |
| `/hora-plan` extracts tasks from it | yes | no | **never reads it at all** |

**A request is never held to like a source.** It may contradict itself, ask for two incompatible things, or describe a screen without saying who opens it — each of those becomes a question, not a defect in your file. **Being able to hand over rough notes is the whole point of the directory.** Saying the same thing in conversation works identically; the directory exists because a request is often longer than a message and written by somebody who is not in the session.

**The stages do not make you re-agree to what shipped.** A stage whose section this version does not touch passes as a **carry-over** — the previous version's answer, stated back to you in the words it was fixed in, and confirmed. It is checked, never assumed, and the closing report names every one, because a carry-over is the one kind of pass that looks the same as not having run.

**Two stages never carry over, and they are why the rest may be brief.** Stage 6 states the caller and the refusal of every operation this version adds, at the version that adds it; stage 7 reviews the **resolved** document rather than the diff — a new operation contradicting a rule 1.0.0 wrote is invisible in two pages and plain in the whole. Which stages may carry over is per stage in [`stages.md`](../.claude/skills/hora-spec/references/stages.md).

### How it asks: a check, a proposal, a question

**These are three different things and they are never phrased alike** ([`asking.md`](../.claude/skills/hora/references/asking.md)).

| | What it means | What you are deciding |
|---|---|---|
| **a check** | "I read it as this. Is that right?" | right, or wrong |
| **a proposal** | "I suggest this. It is yours to decide." | take it, or not |
| **a question** | "Nothing decides this. What is it?" | what it is |

**A confirmed check goes in as fact; an approved proposal goes in as your decision.** Mixing them matters in one direction especially: a proposal phrased as a check would put the kit's own idea into the spec as something the system already does, and nothing afterwards could tell them apart.

**Answers are offered as choices wherever they can be**, so you correct rather than compose — with "other" always available. What is never folded into a choice is approving a section: that is the one place the exact words have to be read.

### How it writes

**It proposes, and you decide.** Anything the skill thought of itself — a use case nobody mentioned, a shorter flow, a role that is really two roles — is shown as a proposal and stays out of the file until you say yes.

```
hora  Stage 1. You described "attendance management, approval, payroll".
      Breaking that into what somebody completes:

        - a member of staff clocks in on arrival, and the day's hours appear
        - a manager approves a month in one pass, and the totals lock
        ...

      Two proposals, neither of them yours:

        - a member of staff who forgot to clock in files yesterday's hours.
          You have four use cases and none of them handles a mistake.
        - the first run: no staff, no records, nobody set anything up.

      Add either?
```

**Approval is per section, never per document.** One "yes" over a whole spec is worse than none, because the record then says it was read. The reasoning is in [`structure.md`](../.claude/skills/hora/references/structure.md), invariant 1.

### What it never does

- **invent a requirement.** A proposal that goes in silently is exactly that
- **let something it read become a requirement on its own.** Reading is what stage 0 is for; a reading is put up as a check, and only what you confirm is written
- **conclude how far a feature is already built.** It lays out what it found and recommends nothing — a half-built screen and a finished one look identical from a file listing
- **decide scope.** It says when a release is carrying too much, proposes the narrowing, records the answer
- **plan, clone, or write code or touch git.** The spec is all it writes

---

## `/hora-setup`

**Code setup.** Creates the repositories the spec declares, fills in this project's values, and reads the real tree that arrived.

| | |
|---|---|
| **Reads** | the spec's repository layout and project name; the real tree of every repository |
| **Writes** | the implementation repositories; this repository's `package.json`, `.gitignore` and `eslint.config.js`; `.hora/tree/` |
| **Stops when** | there is no repository layout section; no project name; zero or ≥2 backends; no server table; a declared `Directory` points at something that is not there |
| **Run it directly** | after adding a repository row to a later version; after a failed or half-finished first run |

### What it does

```
1. Create only what is missing, per the declaration      (idempotent)
2. Fill in the values that carry this project's name
3. Read what was cloned, in place, and record it in .hora/tree/
```

**It re-evaluates on every version.** Repositories arrive later — a project starts as an API for a phone app and gains an admin screen — so passing this once is not the end of it.

**Equipping the skills is no longer a step here.** `npm install` places them, through this repository's `postinstall` ([`skills.md`](./skills.md)), so there is nothing for `/hora-setup` to do about it and nothing for a half-finished run to leave undone. `npm run hora:init` re-equips on demand.

**Step 3 does not bake anything in.** The newest tag is always cloned, so any convention written into Hora Kit would eventually disagree with the real thing. What it reads is cached in `.hora/tree/<repository>.md` with the tag it was read at, and re-read when that tag changes. **On any disagreement, the tree wins.**

### What it never does

vendoring the boilerplate, keeping an upstream remote, making it a submodule, `npm update`, starting the middleware, or overwriting a value a human already filled in.

---

## `/hora-plan`

**The planner.** Fixes which version is being built, gets its spec into a state that can actually be built, and writes the feature list.

| | |
|---|---|
| **Reads** | every version directory under `specs/`, resolved as diffs; `.hora/tasks/`, `.hora/questions/` |
| **Writes** | `.hora/tasks/<version>/_plan.md` and one file per feature; `.hora/contracts/`; `.hora/questions/`; `.hora/glossary.md`. **And `specs/`, one approved edit at a time — a one-line hole only. Anything that needs design work goes back to `/hora-spec`** |
| **Stops when** | a blocking question cannot be answered by whoever is present |
| **Run it directly** | after editing `specs/`, to see what changed and what it invalidates, without starting a build |

### What it does

```
1. Fix the version being implemented
2. Verify the spec for holes and contradictions — and resolve them in conversation
3. Derive the contracts, per server
4. Write the glossary
5. Write the plan and one file per feature
6. On re-entry, reconcile specs/ against what is already there
```

### Which version, and whether it may be a new one

**Step 1 is where a new version number is judged, and the line is not the size of the change — it is whether the version has been released.** The tag in the hora repository decides it, and `release.yml` creates that tag when a merge into main happens.

```bash
git fetch --tags && git tag -l '1.0.0'    # empty = not released
```

| | Treatment |
|---|---|
| **not released** | additions, changes and removals are all accepted, and **the version number does not change.** No users, so a changed contract breaks nobody — what happens is rework, not broken compatibility. A spec change right before release is entirely normal |
| **released** | leave it alone. Do it in the next version, whose number comes from the table below |

**From the second version on, the number is judged against the contract diff** in `.hora/contracts/`, not against how the change feels:

| Difference in the contract | The valid bump |
|---|---|
| none | patch (if nothing was added) |
| fields or types **only added** | minor |
| removed, renamed, retyped, or a **required field added** | **major** |

Changes that appear in no contract (wording, an internal refactor) are patch; something visible to users but absent from every contract — a new screen — is minor. **A version number becomes three directory names and a tag, so anything unclear about it is `blocking: yes`.** Skipped numbers are reported; numbers that go backwards or repeat are blocking.

**Then it resolves the versions as diffs**: sorted ascending, each one overwriting the last, keyed on `id`, **each a diff against the version immediately before it** — not against the lowest. Everything after that step, including every digest and every "this section disappeared" judgment, runs against the resolved document.

### The part that talks to you

**This is the command that asks questions.** It works through the resolved spec and checks, among others:

| Missing | Because |
|---|---|
| **use cases**, per feature | checkpoints 2, 9 and 11 have nothing to verify against |
| **acceptance criteria**, per feature | "what counts as done" would have to be invented |
| **the kind of each API operation** — query / mutation / subscription / REST | checkpoints 3, 6 and 14 cannot choose which convention to follow |
| the implementation scope, split into "for now" and "permanently" | the design cannot tell an extension point from a dead abstraction |
| **the version's own acceptance criteria** — or `none` | the whole-version sweep has nothing to judge the product against |
| **a criterion reaching a feature built later**, or an order that contradicts a `depends` | four runs act on it — checkpoint 1 builds from it, 6 and 16 write a test for it, 18 fails it |

For each finding it **states it, proposes the exact edit, waits for you to approve that edit, and writes it.** Approval is per edit. Anything you cannot answer on the spot is written to `.hora/questions/<version>/open.md` instead, and answered later by editing `specs/`.

**Use cases and acceptance criteria are not the same thing.** A feature with criteria but no use cases produces a set of operations that are each correct and together unreachable — every API returns what it should, and no screen strings them into anything a person can do. That failure otherwise surfaces at acceptance, at the far end of eighteen checkpoints.

**Acceptance criteria come in two tiers, and the split is what keeps a feature's gate meetable.** A feature's own criteria are checked at its checkpoint 18, against a product in which that feature and its `depends` are built and nothing later is — so they may lean on a predecessor and may never name a feature built afterwards. **A behavior that spans several features goes to the spec's `Version acceptance criteria` section instead**, which no gate reads and the whole-version sweep checks. A criterion in the wrong tier is a `forward-reference` stop, fixed at `/hora-spec` stage 2 by reordering the features or by moving the behavior up a tier — never by the planner quietly reordering the plan.

### The plan it writes

Feature-level, never implementation-level. *"Build the attendance feature"* is an entry; *"write the RpaFlow model"* is not — that is a checkpoint, and the planner does not decide it.

```markdown
## Features
1. [ ] #attendance            backend, frontend-employee
2. [ ] #attendance--monthly   backend, frontend-employee   depends: attendance
3. [ ] #payroll               backend, frontend-admin      depends: attendance--monthly

## Acceptance
- [ ] Sweep the whole version, once every feature above is done
      Version criteria: 4 (#version-acceptance-1-0-0), 1 resting on #billing
```

The sweep entry carries the version's own criteria — how many, the section's `id`, and how many rest on a feature nobody accepted — re-derived on every run.

### On re-entry

**It runs every time `/hora` runs**, and reconciles. A section added to `specs/` after the plan was settled reaches the plan only here. A section whose digest changed has its checkpoints cleared — **and how far back depends on what changed**: a use case clears from checkpoint 2, an API's shape from 3, an acceptance criterion only from 18, **and the version's own criteria clear the sweep entry alone, never a feature's 18** — no gate ever read them, so no feature's pass has gone stale. When it cannot be told apart, it clears from 2, because rebuilding more than necessary costs time and leaving a checkpoint marked passed against a spec it no longer satisfies costs correctness.

---

## `/hora-build`

**One feature, through the eighteen checkpoints, in order.**

| | |
|---|---|
| **Reads** | `_plan.md`, the feature's own file, the contracts, the glossary, `.hora/tree/` |
| **Writes** | code and tests in the implementation repositories (through agents); the feature's checkpoint checkboxes; questions |
| **Stops when** | a checkpoint's exit condition cannot be met; a test fails for a reason no code change could fix; no feature is ready and some are unfinished (a dependency cycle) |
| **Run it directly** | to continue one specific feature without `/hora`'s whole state check |

### What it does

```
1. Take the first feature whose entry is [ ] and whose depends are satisfied
2. Take the first checkpoint that is [ ]
3. Run it, verify its exit condition, write [x]
4. Repeat. Commit .hora/ at each gate boundary
```

It reports in one line before starting: *"building #attendance, from checkpoint 6 of 18."*

### The eighteen, in four gates

| Gate | Checkpoints | Written in | Merges after |
|---|---|---|---|
| **Spec** | 1 specification · 2 use cases | nothing | — |
| **Backend** | 3 DB and API schemas · 4 stub API · 5 modules · 6 actual API · 7 worker · 8 security audit · 9 use cases again | the backend row | 9 |
| **Frontend** | 10 open the frontend · 11 UI/UX and use cases · 12 component design · 13 frontend modules · 14 API client · 15 UI · 16 wire the data in · 17 local test environment | a frontend row | 17 |
| **Acceptance** | 18 acceptance | nothing | — |

Each one's exit condition, delegate skill and not-applicable rule is in [`checkpoints.md`](../.claude/skills/hora-build/references/checkpoints.md).

**Three things about the order are deliberate:**

- **4 (stub) comes before the frontend gate** so that 12–14 can build a client and a screen against something real-shaped, without waiting for 6. 16 swaps them onto the actual API — a change of endpoint, not a rewrite, because the stub and the real resolver share a class name and interface
- **5 and 13 gather the modules the next checkpoint will import**, before it starts — and 5 first checks the in-house package catalog (`@openreachtech/hora-ecosystem`, a devDependency of this repository) so nothing the company already ships gets reinvented. A resolver that turns out mid-implementation to need an external client it does not have is exactly the interruption those exist to remove
- **2, 9, 11 and 18 verify against the use cases** — not three rehearsals and one real run. They fail in different ways: 2 asks whether the spec supports them, 9 whether the API does, 11 whether a screen does, 18 whether the product does

### Going backwards is normal

When a verification gate fails it clears the checkpoints it invalidates and the run returns to the earliest one cleared. **A run that never goes back has either an unusually complete spec, or a verification gate that is not doing its job.**

---

## `/hora-accept`

**Acceptance — the full unit suites every time, the review at the invocation's reach.** A feature gate (checkpoint 18) reviews its own feature, with the live browser sweep skipped unless explicitly requested; the whole-version sweep reviews every feature implemented so far and always drives the product.

| | |
|---|---|
| **Reads** | `.hora/tasks/` (to work out the scope), the running application, the test suites |
| **Writes** | `.hora/acceptance/<version>/<feature-id>.md`, or `_sweep.md` for the whole-version run |
| **Stops when** | a run that drives the product finds the local end-to-end environment missing or incomplete — it reports `lacked-environment` rather than reviewing something that is not really running |
| **Run it directly** | to re-run acceptance after fixing something, or to get a current picture of what the product actually does |

### What it does

```
1. Confirm the environment      the local end-to-end container stack — live runs only
2. Unit suites, per repository  test placement, and driving a suite green — EVERY run
3. The scenario list            end-to-end test specification
4. The acceptance review        the review itself, with its own criteria, at the run's reach
5. UX findings                  the UI/UX audit — the sweep, or on explicit request
```

**Each step names the work, not a skill.** No hora file writes down a package skill's name — the match is made at run time against the equipped skills' own descriptions, and the names that were matched go into the run's record. [`skills.md`](./skills.md) has the reasoning.

**It contains no criteria of its own.** What a review looks at and what it fails on lives in those skills; this command decides only which features are in scope, what order the delegates run in, and where the result is recorded.

**The version's own acceptance criteria are the sweep's, and no gate run reads them — not even one a person widened.** They span several features, so judged at a gate they would fail against a product holding one of them. Every record says which it was: `version-criteria: 4 of 4` at a sweep, `not in scope (gate)` at a gate, `none declared` where the version declared none. **A sweep that checked fewer than the version declared has not passed**, and the version cannot be done on it.

**Step 1 is a gate, not a warm-up.** The review signs in as each role, completes flows to their success condition, and stops dependencies on purpose to watch what the screen says. None of that means anything against a frontend served on its own, and a review run that way reports a pass it has not earned.

**Step 2 comes before the review on purpose.** A unit suite is cheap and its failures are precise; finding the same defect through an end-to-end flow costs far more to localize.

### Every finding names where it sends the run back to

```markdown
1. #attendance — a record saved from the monthly screen is not reachable
   from the daily list. Sends back to: #attendance checkpoint 11.
2. #sign-in — an expired session shows a blank screen instead of saying so.
   Sends back to: #sign-in checkpoint 13.
```

**A finding with no destination is a note; a finding with one is work.** The destination is often a different feature than the one at the gate — that is the normal shape of a regression.

**It never fixes anything, and it never decides that a finding is acceptable.** That decision belongs to a person, and it goes into the question file with their name on it.

---

## `/bank-id`

**A supporting skill, not a phase.** Hands out an exclusive row-id prefix inside one backend repository, so two writers never pick the same explicit `id`.

| | |
|---|---|
| **Called by** | checkpoint 5, before writing an explicit `id` into a seeder or a test fixture |
| **Also usable** | by a person working in the backend repository directly — `/hora-setup` copies it in there for exactly that reason |

---

## What a session actually looks like

### The first run

```
you   /hora
      →  specs/1.0.0/spec.md is empty. Runs /hora-spec: copies the blank spec
         and works through its seven stages with you, writing each section
         once you have read it.
      →  no repositories yet. Runs /hora-setup: clones the boilerplates at their
         newest tags, fills in the project's values, reads the trees.
      →  Runs /hora-plan. It reads specs/1.0.0/spec.md and starts asking.

hora  #attendance states three use cases but no acceptance criteria.
      Without them there is no way to tell "implemented" from "working".
      Proposed addition to specs/1.0.0/attendance/spec.md:

        ### Acceptance criteria
        - a second punch on the same day is rejected
        - ...

      Add this?

you   yes

hora  ...

      Planned 1.0.0: 11 features, 2 questions written to .hora/questions/
      (both blocking). Please edit specs/ and run /hora again.
```

### A later run, mid-feature

```
you   /hora
hora  continuing 1.0.0. 4 of 11 features done, building #payroll from
      checkpoint 6.

      ... [checkpoint 6: actual API] ...
      ... [checkpoint 7: worker — placement says a post-worker] ...
      ... [checkpoint 8: security audit — 1 finding, fixed, re-run clean] ...

      Checkpoint 9. Walking the three use cases against the API as built:

        "an admin corrects a confirmed payroll line"  — no operation exists
        for reopening a confirmed line. The spec's use case assumes it.

      Adding a mutation is a change to the contract, so this goes back to
      checkpoint 3. Clearing 3 through 8. Is reopening in scope for 1.0.0?

you   yes, add it
```

### The run where acceptance catches something

```
hora  Checkpoint 18 for #payroll. Scope: 5 features.

      environment      ready
      unit (backend)   214 passed
      unit (frontend)  51 passed
      scenarios        18 of 18 covered
      review           2 findings
      UX               1 finding (minor)

      1. #attendance — the monthly screen no longer reaches the daily list.
         Sends back to: #attendance checkpoint 11.
      ...

      #attendance was done three features ago. Its feature/ branch has
      merged, so this is a retake/. Reopening #attendance from 11.
```

**That last one is the design paying for itself.** The break is in a feature that was finished three features earlier, and it is found in the run that caused it rather than at the end of the version.

---

## Where to go next

| | |
|---|---|
| why it is shaped this way | [`architecture.md`](./architecture.md) |
| the skills the checkpoints delegate to | [`skills.md`](./skills.md) |
| putting this on a project that already exists | [`adopting.md`](./adopting.md) |
