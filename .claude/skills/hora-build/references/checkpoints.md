# The eighteen checkpoints

**The authority on the checkpoint list.** `/hora-plan` copies the list from here into each feature file; `/hora-build` runs a feature through it.

**This file holds the order and the exit conditions. It does not hold a single procedure.** How to write a migration, a resolver, a component or a test lives in `@openreachtech/ai-agent-skills`, and each checkpoint below states the *work* that skill covers. **Never write one of those procedures into this file** — the copy would go stale the first time the package is updated, and nothing would announce that it had (`../../hora/references/structure.md`, "The division of labor").

**No checkpoint below names a package skill, and none ever may.** A skill's name belongs to the package, which is free to change it, and a name that stops matching does not announce itself — the gate simply runs without its convention and reports a pass. So each checkpoint's **Delegate to** row says what has to be covered, and the main session matches that against the equipped skills' own descriptions at run time, recording what it picked (`../../hora/references/structure.md`, "No hora file ever names one of those skills"). **Skills Hora Kit itself ships — `/hora-accept`, `bank-id` — are named here freely**; they live in this repository.

---

## What a checkpoint is

A checkpoint is **a gate with one exit condition**. It is not a task list, and passing it is not "I did some work on this" — it is that a specific, stated condition now holds.

### Three states, and only three

```markdown
- [ ] 6. Actual API                                        not passed
- [x] 6. Actual API                                        passed
- [x] 7. Worker  <!-- n/a: this feature triggers no background job -->
```

**A checkpoint may only be marked not-applicable with a written reason.** The reason is checked against that checkpoint's own "when it does not apply" line below — never against convenience, never against "this seems small". A bare `n/a` is not a state; it is a checkpoint that was skipped and dressed up as one that was cleared.

**One reason does not come from a checkpoint's own line: `built before Hora Kit was adopted`.** A spec section may declare `<!-- built: spec | backend | frontend -->` when the code already existed before the kit was ever run against it, and `/hora-plan` marks that many checkpoints not-applicable, mechanically. **Checkpoint 18 is never among them** — acceptance is exactly what adoption is for.

**A second does not come from a checkpoint's own line either: `accepted in <earlier version>`.** It is written only on a feature re-scheduled because a listed feature it rested on had its debt paid, and its condition lives in `../../hora/references/done-criteria.md`, "Not applicable is a state, and it needs a reason", which is its authority.

**A third comes from the feature's `target` line: `target names no <frontend | backend> row`.** It is what a whole skipped gate writes into each of its own checkpoints (the gate table below), and its authority is `../../hora/references/spec-format.md`, "`target`". **There are no others.**

**A not-applicable mark is cleared the moment its reason stops holding.** When checkpoint 18 sends the run back into a stretch marked `built before Hora Kit was adopted`, that code is now being changed, so it was not simply inherited after all: reopen from the earliest checkpoint affected and run it for real.

### The order is a rule

**No checkpoint may be entered until every earlier one is `[x]`.** There is no exception, no fast path, and no "do them in parallel because they are independent" — several of them look independent and are not, and the ones that genuinely are still cost nothing by being ordered.

**Inside one checkpoint, its units do run at once, and that is a different claim** (`../SKILL.md`, "Step 5 — splitting a checkpoint into units"). Five of the checkpoints below divide into units — a table, a module, an operation, a component, a screen — that write files of their own, and one agent takes each. The checkpoint remains one gate with one exit condition, entered and passed as a whole.

### Four checkpoints can send the run backwards

2, 9, 11 and 18 are **verification** gates: they check the work against something outside it (the use cases, the spec, the product). When one fails, it does not fail forward — **it clears the checkpoints it invalidates and the run returns to the earliest one cleared.**

| Gate | Checks against | Sends back to |
|---|---|---|
| 2 | the use cases, as the spec states them | checkpoint 1 (the spec itself is what has to change) |
| 9 | the use cases, against the API actually built | whichever of 3–7 has to change. Usually 3, when the API's shape is what falls short |
| 11 | the use cases, against the screen actually designed | 11 itself, or back to 2 when a use case turns out to be wrong |
| 18 | the product, end to end | whichever checkpoint produced the shortfall, in whichever feature |

**Cycling here is the design working, not the design failing.** A run that never goes back has either an unusually complete spec or a verification gate that is not doing its job.

### On a repository that is not empty, a checkpoint reconciles rather than creates

**Every exit condition below reads the same against existing code; what changes is the work that satisfies it.** Checkpoint 3 against an empty repository writes migrations; against a `to-spec` feature's existing tables it **changes the existing migrations toward the spec's data model** — same condition, different verb. The same holds down the list: 5 fixes modules that exist before writing ones that do not, 6 brings existing resolvers to the contract, 15 brings existing screens to the design. What already matches the spec is left alone; the checkpoint's own tests still have to pass either way.

**For a `to-spec` feature, running all seventeen gates against existing code is the work itself, never a formality.** The code is somebody's unfinished progress toward the spec, and each gate is where its part of the distance gets closed. The waste case is different and real: **a finished feature run through seventeen gates because nobody declared `Authority: as-built`** — nothing breaks, the time is spent confirming what a declaration and one sweep would have settled (`../../hora/references/spec-format.md`, "Existing assets"). Do not read that case as a reason to skip gates on unfinished code; the two look alike only from the outside.

| Gate | Checkpoints | Repository written in | Merges when |
|---|---|---|---|
| Spec | 1–2 | none (`specs/` and `.hora/` only) | — |
| Backend | 3–9 | the backend row | after 9 |
| Frontend | 10–17 | the frontend row this feature names | after 17 |
| Acceptance | 18 | none (`.hora/acceptance/` only) | — |

A feature whose `target` names no frontend skips 10–17 as a whole; one that names no backend skips 3–9. **Skipping a whole gate still means marking each of its checkpoints not-applicable, with the reason.** A gate that silently vanishes from a feature file is a gate nobody can later confirm was considered.

---

# Spec gate

## 1. Draft or confirm the specification

| | |
|---|---|
| **Delegate to** | the skills covering how a rough request becomes stated requirements with observable criteria. **Anything that has to change goes to `/hora-spec`** (`../../hora-spec/references/stages.md`) |
| **Runs in** | the main session, in conversation |
| **Exit condition** | this feature's requirements, use cases and acceptance criteria are all written in `specs/`, each observable |
| **Not applicable when** | never. Every feature passes this |

`/hora-plan` has already verified that these exist. **This checkpoint is where they are read closely enough to build from** — the planner checks that a spec is buildable at all; this checks that *this one feature's* corner of it is.

**What is found missing here is fixed where the fix belongs**, and this is the only checkpoint that reaches `specs/` at all:

| What is missing | Fixed by |
|---|---|
| a use case, an operation's caller, a design that cannot serve a use case | **`/hora-spec`**, at the stage that owns it. It writes one approved section at a time |
| a one-line hole — an annotation, a `target`, a typo | **`/hora-plan`**'s procedure: state it, propose the exact edit, wait for approval, write it |

**Never write into `specs/` from this checkpoint by any other route**, and never from an agent this checkpoint starts.

## 2. Verify the use cases can be met

| | |
|---|---|
| **Delegate to** | the skills covering the shared UI/UX project context — where the use cases and their context are recorded |
| **Runs in** | **the main session, in conversation. This one cannot be delegated to an agent** |
| **Exit condition** | every use case this feature states is achievable under the spec as written, or has been changed until it is |
| **Not applicable when** | never |

Walk each use case end to end, on paper, against the spec. **Look for the case that cannot be completed** — a step with no operation behind it, a screen with no way to reach it, a state the model cannot represent, two requirements that cannot both hold.

**Where a problem is found, propose the fix and settle it with the person there.** Do not record it and move on: an unmet use case found here costs a conversation, and the same one found at checkpoint 18 costs a rebuild.

**A fix to the spec itself runs through `/hora-spec`**, at the stage `../../hora-spec/references/stages.md` names — stage 4 when the design cannot serve the use case, stage 1 when the use case turns out to be wrong. This checkpoint decides that something must change; that skill is what changes it.

**A subagent cannot do this**, because it cannot talk to anyone. Run it in the main session.

---

# Backend gate

## 3. DB and API schemas

| | |
|---|---|
| **Delegate to** | DB, in this order: the logical shape of a table → the migration → the model. API surface, by kind (below). Types and constants: declaration files, and the constant convention. A new endpoint: what an endpoint is and what its auth filter does |
| **Runs in** | one implementer agent per table, and per operation's API surface (`../SKILL.md`, "Step 5 — splitting a checkpoint into units") |
| **Exit condition** | the migration, the model, the declaration files and the API surface all exist and agree with `.hora/contracts/<version>/` |
| **Not applicable when** | this feature adds no table and no operation (rare — usually a feature that only composes existing ones) |

**The API surface branches on the kind of each operation, and the kind comes from the spec — never from inference** (`../../hora/references/structure.md`, invariant 2):

| Kind | What has to be designed |
|---|---|
| GraphQL query | the SDL for the operation |
| GraphQL mutation | the SDL for the operation |
| GraphQL subscription | the SDL, plus the schema half of a subscription resolver |
| REST | the renderer's route and version |

**Type interfaces and constants belong here, not with the modules at checkpoint 5.** A `.d.ts` under `types/resolvers/` and an enum-like constant are the schema expressed as types — the stub at checkpoint 4 already needs both. What checkpoint 5 gathers is the *material the real implementation runs on*, which the stub does not need at all.

**A constant file two operations both add to is this checkpoint's shared file, and it belongs to one unit.** Declaration files usually follow their own operation, so they divide cleanly; a single enum-like file that several operations extend does not, and the rule for it is the general one — give it to the unit that owns it, or run this checkpoint whole (`../SKILL.md`, "Step 5 — splitting a checkpoint into units").

**If the spec does not state an operation's kind, stop.** `/hora-plan` should have caught it (`undefined-api-kind`, `blocking: yes`); if one slipped through, raise it now rather than picking a kind.

## 4. Stub API

| | |
|---|---|
| **Delegate to** | the skills covering how a stub API is written |
| **Runs in** | an implementer agent |
| **Exit condition** | a schema-accurate stub exists for every operation this feature adds, returning hardcoded data, callable from outside |
| **Not applicable when** | this feature adds no API operation at all |

**This is placed before the real implementation on purpose, and it is why the frontend gate does not wait on the backend gate finishing.** Checkpoints 12–14 build a client and a screen against the stub; checkpoint 16 swaps them onto the real thing. Skip the stub and the frontend has nothing to develop against until checkpoint 6 lands.

A stub lives beside the real resolver under a `stub/` folder, with the **same class name and interface** the real one will have. That sameness is what makes the swap at checkpoint 16 a change of endpoint rather than a rewrite.

## 5. The modules the implementation needs

| | |
|---|---|
| **Delegate to** | first the catalog (below), then the skills covering whichever of these this feature needs: an external API client, a dispatch strategy, the shared resolver container, a named subquery, a seeder. For an AI feature: agent structure, agent loops, multi-LLM providers, light RAG, prompt document stores |
| **Runs in** | the catalog check first, once for the whole checkpoint, then one implementer agent per module (below; `../SKILL.md`, "Step 5 — splitting a checkpoint into units") |
| **Exit condition** | **every module checkpoint 6 will import already exists and works on its own**, and nothing was written that the catalog already provides |
| **Not applicable when** | checkpoint 6 needs nothing beyond the model and the schema. State that, do not assume it |

**The exit condition is "they are there", not "some were written".** Before leaving this checkpoint, list what checkpoint 6 is going to import and confirm each one resolves. A resolver that turns out mid-implementation to need an external client, a dispatch strategy or a subquery it does not have is exactly the interruption this checkpoint exists to remove.

**That list is gathered by the main session, from every unit together.** A unit sees the module it wrote and none of its siblings', so a per-unit report is never the confirmation this condition asks for.

### Check the catalog before writing anything

**There are more than 40 in-house packages, and the utility layer is never named in a spec, which makes it the most reinvented.** This checkpoint is where that check happens, once, for the whole feature.

**"Once" is what makes the delegate order a rule here, the way checkpoint 7's placement decision is.** One agent searches the catalog for everything this checkpoint is about to write and returns what to reuse, and the module units start after it with that answer in hand. **Left to the units, the search runs once per module and can return a different verdict on the same package each time** — and the whole point of the check is that the answer is one answer, arrived at once, for the feature.

The catalog is `@openreachtech/hora-ecosystem`, a devDependency of the hora repository itself, resolved under its own `node_modules/`. **How the catalog is laid out — where the tracked-package list lives, where each package's docs sit, how an import name is spelled — is that package's own to change: read its README at run time, never a layout restated here** (`../../hora/references/structure.md`, "The division of labor").

- Keep only the packages the catalog currently tracks — that is the search space
- **Match a description of the processing about to be written against a candidate's own docs, not against a category**
- **Judge which surface a package serves from what its docs describe, never from what its name sounds like.** When two candidates address the same need, prefer the one matching the surface — unless `specs/` says otherwise
- An identifier whose name starts with `Base` is used by extending it, not directly
- **The spec overrides this.** When `specs/` states a particular way to implement something — a specific algorithm, an explicit exclusion of a package — follow that and implement it fresh
- When something looks close but there is no confidence, record it as `reinvention` (`blocking: no`) and proceed with your own implementation

### Explicit row ids come from this feature's `bank-id` prefix

A seeder written here, or a test fixture written later, that carries an explicit `id` **builds it from the prefix `/hora-build` allocated for this feature** (`../SKILL.md`, "Where to start"), in any table. That prefix is allocated once, before this feature's first implementing checkpoint, and handed to every agent — so the units of one checkpoint draw from one slice instead of queueing behind each other for the lock. Derive an id from that prefix alone, and leave another requester's rows unread.

## 6. Actual API

| | |
|---|---|
| **Delegate to** | by kind (below), plus the skills covering resolver input validation |
| **Runs in** | one implementer agent per operation (`../SKILL.md`, "Step 5 — splitting a checkpoint into units") |
| **Exit condition** | the real implementation exists under the same class name and interface as its stub, its input is validated, and the unit tests covering this feature's acceptance criteria pass |
| **Not applicable when** | this feature adds no API operation |

| Kind | What has to be implemented |
|---|---|
| GraphQL query | a query resolver |
| GraphQL mutation | a mutation resolver |
| GraphQL subscription | a subscription resolver |
| REST | the renderer itself |

**Write a test for each acceptance criterion, and run it.** Where a backend test lives, how it is named and how its run order is guaranteed, how one is written, and how a failing suite is driven to green without weakening it are all the package's — delegate each. **A test that is loosened, skipped or deleted to make the suite pass fails this checkpoint** — the exit condition is the criteria being backed, not the command exiting 0.

**Leave the stub in place.** It is what the frontend is still building against until checkpoint 16.

## 7. Worker

| | |
|---|---|
| **Delegate to** | **first**, the skills covering where work belongs — the request path, a post-worker, or a background job — since that decides *whether* the rest apply. Then the skills covering whichever it chose: a side effect after the response, or a queued job with its schedule and retry |
| **Runs in** | an implementer agent |
| **Exit condition** | every piece of this feature's processing that does not belong in the request path runs where it should, and is implemented there |
| **Not applicable when** | this feature has no processing outside the request path. **Decide that with the placement skill, not by eye** |

**The placement decision comes before the implementation, and it is the part that gets skipped.** A write that looks synchronous, a side effect that looks small, a notification that looks instant — each is a candidate for a post-worker or a job, and the skill that decides it is the one to run first. Marking this checkpoint not-applicable without having run that decision is exactly the shortcut the reason line is meant to block.

**This is the one checkpoint where the delegate order is itself a rule**, not a convenience: the placement skill is what tells the rest of the checkpoint whether it has anything to do.

## 8. Security audit

| | |
|---|---|
| **Delegate to** | the skills covering a read-only, repo-wide security audit — what kinds of defect exist and how they are found |
| **Runs in** | **a verifier agent — read-only.** The audit finds; it does not fix |
| **Exit condition** | the audit produces no finding against this feature's code, or every finding it produced has been fixed or explicitly accepted and recorded |
| **Not applicable when** | never, for a feature that wrote backend code |

The audit is read-only by design. **Fixing a finding is a separate act**, done by an implementer agent afterwards, followed by re-running the audit. An accepted finding — one the project decides to live with — is recorded as a question, never left as a silent pass.

**Run it against this feature's code, not the whole repository.** A repository-wide audit belongs to a milestone, not to a feature's gate; scoping it here keeps the finding list attributable to the work that just happened.

## 9. Verify the use cases again, against the built API

| | |
|---|---|
| **Delegate to** | — |
| **Runs in** | **the main session, in conversation** |
| **Exit condition** | every use case from checkpoint 2 can be completed against the API as it now exists — operation by operation, in order, with real data shapes |
| **Not applicable when** | never, for a feature that wrote backend code |

Checkpoint 2 verified the use cases against the *spec*. This verifies them against the *thing that got built*, which is not the same claim. **Walk each use case as a sequence of actual calls** and check that each step has an operation, that the operation returns what the next step needs, and that the shapes line up.

**Where a use case falls short, go back — usually to checkpoint 3** (the API's shape is what is wrong), sometimes to 5 or 6. Clear the checkpoints from there and say which were cleared. **Do not patch it at the edge**: adding one field on the way past is how an API drifts from its contract, and the contract is what a frontend in another repository is already building against.

**This is the last chance before a frontend starts consuming it.** After this checkpoint, the backend row's `feature/<id>` branch merges into `release/<version>`.

---

# Frontend gate

## 10. Open the frontend

| | |
|---|---|
| **Delegate to** | the skills covering the frontend framework's own structure, and its environment variables |
| **Runs in** | an implementer agent |
| **Exit condition** | the pages and routes this feature needs exist and are reachable, and the environment variables pointing at the backend are wired |
| **Not applicable when** | this feature's `target` names no frontend row |

## 11. Reconfirm UI/UX and the use cases

| | |
|---|---|
| **Delegate to** | the skills covering the shared UI/UX project context |
| **Runs in** | **the main session, in conversation** |
| **Exit condition** | the shared UI/UX context file covers this feature — its users, its screens, its rules — and every use case has a path through the interface |
| **Not applicable when** | this feature's `target` names no frontend row |

**This is the third pass over the same use cases, and it is not redundant.** 2 asked whether the spec supports them, 9 whether the API supports them, and this asks whether *a person can actually do them on a screen*. The three fail in different ways.

That context file is what the UI generator (checkpoints 12, 15) and the UI auditor (checkpoint 18) both read. **Filling it in is this checkpoint's real output** — skip it and both of those run without a project context and produce generic results.

**A use case with no path through the interface goes back to checkpoint 2**, since it means either the interface or the use case is wrong, and only the person there can say which.

## 12. Component design

| | |
|---|---|
| **Delegate to** | the skills covering how a screen is made correct by construction; **every skill covering a component that already exists**; and the skills covering what must not be built in a component |
| **Runs in** | one implementer agent per component (`../SKILL.md`, "Step 5 — splitting a checkpoint into units") |
| **Exit condition** | each screen is broken into components, and every component either already exists in the app's own library or has a stated reason for being new |
| **Not applicable when** | this feature's `target` names no frontend row |

**Check the existing component skills before designing a new component.** The package ships one skill per component the library already has — buttons, dialogs, tables, selects, tabs, toasts and much else — and a feature that quietly reimplements one of them has produced a second, slightly different version of something the app already has. **This is the checkpoint where matching against the equipped descriptions is worth doing exhaustively**, rather than against the handful that seem obvious.

## 13. The frontend modules the implementation needs

| | |
|---|---|
| **Delegate to** | the skills covering shared frontend logic as utility classes, and mapping backend error codes to user-facing messages |
| **Runs in** | an implementer agent |
| **Exit condition** | logic used by more than one component or page exists as a class under the app's modules folder, and this feature's backend error codes map to user-facing messages |
| **Not applicable when** | nothing in this feature is shared between two places, and it introduces no new error code. State which of the two, do not assume both |

**Furo is OOP: shared logic is a class, not a function and not a composable.** A helper written inline in a component because "it is only used here" is the first half of the same helper written again in the next component.

**Error mapping is part of this checkpoint, not of the UI checkpoint.** A backend error code with no locale entry surfaces to the user as a raw dotted string, and checkpoint 18's acceptance review fails it under "does it tell the truth when something goes wrong" — a failure that is much cheaper to prevent here.

## 14. API client

| | |
|---|---|
| **Delegate to** | by kind (below) |
| **Runs in** | an implementer agent |
| **Exit condition** | a client exists for every operation this feature uses, matching `.hora/contracts/<version>/` exactly, and it works against the stub from checkpoint 4 |
| **Not applicable when** | this feature's screen calls no API |

| Kind | What has to be built |
|---|---|
| GraphQL query / mutation | a GraphQL operation client |
| GraphQL subscription | a GraphQL operation client, its subscription side |
| REST | a RESTful client |

**The contract is authoritative for both sides.** Wanting to change it here means raising a question, not changing it — the backend has already been built against the same file.

**"Works against the stub" is the exit condition, not "works against the real API".** The real one arrives at checkpoint 16. Testing against the stub here is what proves the client matches the *contract* rather than matching whatever the implementation happens to return.

## 15. UI

| | |
|---|---|
| **Delegate to** | the skills covering how a screen is made correct by construction, and **every skill covering this project's CSS conventions** — writing style, layers, units, prohibitions, custom-property naming and prohibitions, property order within a selector, line height, `z-index`, spacing and margins, animation |
| **Runs in** | one implementer agent per screen (`../SKILL.md`, "Step 5 — splitting a checkpoint into units") |
| **Exit condition** | every screen this feature needs is built, accessible, responsive, and in its loading, empty and error states as well as its filled one |
| **Not applicable when** | this feature's `target` names no frontend row |

**The three states other than "filled" are the ones that get skipped and the ones acceptance fails on.** A screen that only exists in its happy state has no way to tell a user that something is loading, that there is nothing yet, or that something went wrong. **Each of the four states belongs to its screen's own unit** — splitting a screen's states across agents would give one screen four authors and no single one of them the whole of this condition.

**What the screens here share is styling, and it goes to one unit.** A custom-property declaration every screen draws on, a layer or global stylesheet, and the place a screen's labels are written are each one already-existing file that several screens would extend — so the general rule applies: give it to the unit that owns it, or run this checkpoint whole (`../SKILL.md`, "Step 5 — splitting a checkpoint into units"). **The CSS conventions themselves are a shared *reading*, never a shared file**, so every unit follows the same ones without any of them writing where another does.

## 16. Wire the data-fetching logic in

| | |
|---|---|
| **Delegate to** | the skills covering the frontend's context patterns, its GraphQL operation clients, and how a frontend test is written and placed |
| **Runs in** | an implementer agent |
| **Exit condition** | the screen shows real data from the **actual** API, not the stub, its loading and error paths are driven by real responses, and the unit tests covering this feature's frontend acceptance criteria pass |
| **Not applicable when** | this feature's screen calls no API |

**Write a test for each frontend acceptance criterion, and run it.** Where a frontend test lives, how it is named, and how one is written are the package's — delegate each. **A test that is loosened, skipped or deleted to make the suite pass fails this checkpoint**, the same as at checkpoint 6.

**This is where the stub is left behind.** Because the stub and the real implementation share a class name and an interface (checkpoint 4), this is a change of which endpoint is being called, not a rewrite of the client.

**After this checkpoint, confirm the stub is still intact.** It stays in the repository — other features, and later versions, develop against it.

## 17. Local test environment

| | |
|---|---|
| **Delegate to** | the skills covering how the local end-to-end container stack is built and brought up |
| **Runs in** | the main session |
| **Exit condition** | the application runs locally **together with every service behind it**, each role can sign in, and there is reviewable data or a command that produces it |
| **Not applicable when** | one already exists and this feature added no service, no role and no seed data it needs |

**This is the live acceptance run's prerequisite, which is why it sits here and not inside checkpoint 18.** A live review drives the real application against real services, signs in as each role, and stops dependencies on purpose to watch what the screen says. None of that is possible against a frontend served on its own. The runs that need it are three: the whole-version sweep, any gate run whose live sweep was explicitly requested, and any gate run paying a listed feature's deferred acceptance, which drives at full live reach whatever the invocation form (`../../hora-accept/SKILL.md`, "What is in scope") — a gate run that skips the live sweep does not exercise this environment, but the sweep always will, so the environment is still built here, while the feature that changed it is fresh.

**A feature that adds a service, a role or a fixture updates the environment here**, even when the environment as a whole already exists. That is the common case, and it is why the not-applicable condition names all three.

**This checkpoint's changes do not go on the feature's own branch.** The environment lives in the backend repository, whose `feature/<feature-id>` branch merged back at checkpoint 9 — and an environment is shared by every feature anyway, so a change to it is planned growth of something common. It gets its own `update/e2e-<what>-for-<feature-id>` branch (`../../hora/references/commits.md`).

---

# Acceptance gate

## 18. Acceptance (E2E and unit both)

| | |
|---|---|
| **Delegate to** | **the `/hora-accept` skill** |
| **Runs in** | the main session |
| **Exit condition** | `/hora-accept`, in its feature-gate form, reports a pass — the unit suites across **every repository in full**, and the acceptance review scoped to this feature |
| **Not applicable when** | never |

**The gate is scoped; the regression net is not.** The unit suites run whole repositories every time, so a feature that broke an earlier one still fails here, in the run that broke it, rather than at the end of the version. What a gate run does not do by default is drive earlier features' screens end to end — that is the whole-version sweep's job, and a live sweep at a gate happens when explicitly requested, and when the run is paying a listed feature's deferred acceptance (`/hora-accept`, "What is in scope").

**Everything about what is reviewed and what fails lives in `/hora-accept` and the skills it delegates to.** Do not restate any of it here.

**On a failure, the run goes back to whichever checkpoint produced the shortfall — in whichever feature.** That may not be this one. Clear those checkpoints, say which, and rebuild through a `retake/` branch (`../../hora/references/commits.md`) — the feature's own `feature/` branch has already merged by this point.
