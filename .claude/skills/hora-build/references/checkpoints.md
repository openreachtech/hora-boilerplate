# The eighteen checkpoints

**The authority on the checkpoint list.** `/hora-plan` copies the list from here into each feature file; `/hora-build` runs a feature through it.

**This file holds the order and the exit conditions. It holds no procedure.** How to write a migration, a resolver, a component or a test lives in `@openreachtech/ai-agent-skills`, and each checkpoint states the *work* that skill covers (`../../hora/references/structure.md`, "The division of labor").

**No checkpoint below names a package skill, and none ever may.** Each checkpoint's **Delegate to** row says what has to be covered, and the main session matches that against the equipped skills' own descriptions at run time (`../../hora/references/structure.md`, "No hora file ever names one of those skills"). **Skills Hora Kit itself ships — `/hora-accept`, `bank-id` — are named here freely.**

---

## What a checkpoint is

A checkpoint is **a gate with one exit condition**. Passing it is not "I did some work on this" — it is that a specific, stated condition now holds.

### Three states, and only three

```markdown
- [ ] 6. Actual API                                        not passed
- [x] 6. Actual API                                        passed
- [x] 7. Worker  <!-- n/a: this feature triggers no background job -->
```

**A checkpoint may only be marked not-applicable with a written reason**, checked against that checkpoint's own "when it does not apply" line below. A bare `n/a` is a skipped checkpoint dressed as a cleared one.

**Three reasons do not come from a checkpoint's own line, and there are no others:**

| Reason | Written by | Authority |
|---|---|---|
| `built before Hora Kit was adopted` | `/hora-plan`, expanding a confirmed `<!-- built: -->`. **Checkpoint 18 is never among them** | `../../hora/references/spec-format.md`, "`built`" |
| `accepted in <earlier version>` | `/hora-plan`, on a feature re-scheduled because a listed feature's debt was paid | `../../hora/references/done-criteria.md`, "Not applicable is a state, and it needs a reason" |
| `target names no <frontend \| backend> row` | a whole skipped gate, into each of its own checkpoints | `../../hora/references/spec-format.md`, "`target`" |

**A not-applicable mark is cleared the moment its reason stops holding.** When checkpoint 18 sends the run back into a stretch marked `built before Hora Kit was adopted`, that code is being changed, so it was not simply inherited: reopen from the earliest checkpoint affected and run it for real.

### The order is a rule

**No checkpoint may be entered until every earlier one is `[x]`.** There is no exception and no fast path — several of them look independent and are not.

**Inside one checkpoint, its units do run at once** (`../SKILL.md`, "Step 5 — splitting a checkpoint into units"). Five of the checkpoints below divide into units — a table, a module, an operation, a component, a screen — and one agent takes each. The checkpoint remains one gate with one exit condition.

### Four checkpoints can send the run backwards

2, 9, 11 and 18 are **verification** gates: they check the work against something outside it. When one fails, **it clears the checkpoints it invalidates and the run returns to the earliest one cleared.**

| Gate | Checks against | Sends back to |
|---|---|---|
| 2 | the use cases, as the spec states them | checkpoint 1 (the spec itself is what has to change) |
| 9 | the use cases, against the API actually built | whichever of 3–7 has to change. Usually 3 |
| 11 | the use cases, against the screen actually designed | 11 itself, or back to 2 when a use case turns out to be wrong |
| 18 | the product, end to end | whichever checkpoint produced the shortfall, in whichever feature |

**Cycling here is the design working.** A run that never goes back has either an unusually complete spec or a verification gate that is not doing its job.

### On a repository that is not empty, a checkpoint reconciles rather than creates

**Every exit condition below reads the same against existing code; what changes is the work that satisfies it.** Checkpoint 3 against an empty repository writes migrations; against a `to-spec` feature's existing tables it changes them toward the spec's data model. The same holds down the list: 5 fixes modules that exist before writing ones that do not, 6 brings existing resolvers to the contract, 15 brings existing screens to the design.

**For a `to-spec` feature, running all seventeen gates against existing code is the work itself.** The waste case is different: **a finished feature run through seventeen gates because nobody declared `Authority: as-built`** (`../../hora/references/spec-format.md`, "Existing assets"). Do not read that case as a reason to skip gates on unfinished code.

| Gate | Checkpoints | Repository written in | Merges when |
|---|---|---|---|
| Spec | 1–2 | none (`specs/` and `.hora/` only) | — |
| Backend | 3–9 | the backend row | after 9 |
| Frontend | 10–17 | the frontend row this feature names | after 17 |
| Acceptance | 18 | none (`.hora/acceptance/` only) | — |

A feature whose `target` names no frontend skips 10–17 as a whole; one that names no backend skips 3–9. **Skipping a whole gate still means marking each of its checkpoints not-applicable, with the reason.**

---

# Spec gate

## 1. Draft or confirm the specification

| | |
|---|---|
| **Delegate to** | the skills covering how a rough request becomes stated requirements with observable criteria. **Anything that has to change goes to `/hora-spec`** (`../../hora-spec/references/stages.md`) |
| **Runs in** | the main session, in conversation |
| **Exit condition** | this feature's requirements, use cases and acceptance criteria are all written in `specs/`, each observable, and **each one checkable against a product in which this feature and its `depends` are built and nothing later is** |
| **Not applicable when** | never. Every feature passes this |

`/hora-plan` has already verified that these exist. **This checkpoint is where they are read closely enough to build from.**

**Reading them closely is what catches the criterion that reaches forward.** `/hora-plan` stops on it (`forward-reference`, `blocking: yes`); one that arrives here anyway goes back to `/hora-spec` at stage 2, and **this checkpoint does not pass while it stands** (`../../hora/references/spec-format.md`, "A criterion is checked at its own feature's gate").

**The version's own acceptance criteria are not this feature's, and nothing here reads them.** The whole-version sweep is the only run that checks them (`/hora-accept`, "What is in scope").

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

**Where a problem is found, propose the fix and settle it with the person there.** An unmet use case found here costs a conversation; the same one at checkpoint 18 costs a rebuild.

**A fix to the spec itself runs through `/hora-spec`**, at the stage `../../hora-spec/references/stages.md` names. This checkpoint decides that something must change; that skill changes it.

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

**Type interfaces and constants belong here, not with the modules at checkpoint 5.** A `.d.ts` under `types/resolvers/` and an enum-like constant are the schema expressed as types — the stub at checkpoint 4 already needs both. Checkpoint 5 gathers the material the real implementation runs on.

**A constant file two operations both add to is this checkpoint's shared file, and it belongs to one unit.** Give it to the unit that owns it, or run this checkpoint whole (`../SKILL.md`, "Step 5 — splitting a checkpoint into units").

**If the spec does not state an operation's kind, stop.** Raise it rather than picking a kind.

## 4. Stub API

| | |
|---|---|
| **Delegate to** | the skills covering how a stub API is written |
| **Runs in** | an implementer agent |
| **Exit condition** | a schema-accurate stub exists for every operation this feature adds, returning hardcoded data, callable from outside |
| **Not applicable when** | this feature adds no API operation at all |

**This is placed before the real implementation on purpose, and it is why the frontend gate does not wait on the backend gate finishing.** Checkpoints 12–14 build a client and a screen against the stub; checkpoint 16 swaps them onto the real thing.

A stub lives beside the real resolver under a `stub/` folder, with the **same class name and interface** the real one will have. That sameness makes the swap at checkpoint 16 a change of endpoint rather than a rewrite.

## 5. The modules the implementation needs

| | |
|---|---|
| **Delegate to** | first the catalog (below), then the skills covering whichever of these this feature needs: an external API client, a dispatch strategy, the shared resolver container, a named subquery, a seeder. For an AI feature: agent structure, agent loops, multi-LLM providers, light RAG, prompt document stores |
| **Runs in** | the catalog check first, once for the whole checkpoint, then one implementer agent per module (`../SKILL.md`, "Step 5 — splitting a checkpoint into units") |
| **Exit condition** | **every module checkpoint 6 will import already exists and works on its own**, and nothing was written that the catalog already provides |
| **Not applicable when** | checkpoint 6 needs nothing beyond the model and the schema. State that, do not assume it |

**The exit condition is "they are there", not "some were written".** Before leaving, list what checkpoint 6 is going to import and confirm each one resolves.

**That list is gathered by the main session, from every unit together.** A unit sees the module it wrote and none of its siblings'.

### Check the catalog before writing anything

**There are more than 40 in-house packages, and the utility layer is never named in a spec, which makes it the most reinvented.** This checkpoint is where that check happens, once, for the whole feature.

**"Once" is what makes the delegate order a rule here.** One agent searches the catalog for everything this checkpoint is about to write and returns what to reuse; the module units start with that answer in hand. Left to the units, the search runs once per module and can return a different verdict on the same package each time.

The catalog is `@openreachtech/hora-ecosystem`, a devDependency of the hora repository, resolved under its own `node_modules/`. **How it is laid out is that package's own to change: read its README at run time** (`../../hora/references/structure.md`, "The division of labor").

- Keep only the packages the catalog currently tracks — that is the search space
- **Match a description of the processing about to be written against a candidate's own docs, not against a category**
- **Judge which surface a package serves from what its docs describe, never from what its name sounds like.** When two candidates address the same need, prefer the one matching the surface — unless `specs/` says otherwise
- An identifier whose name starts with `Base` is used by extending it, not directly
- **The spec overrides this.** When `specs/` states a particular way to implement something, follow that and implement it fresh
- When something looks close but there is no confidence, record it as `reinvention` (`blocking: no`) and proceed with your own implementation

### Explicit row ids come from this feature's `bank-id` prefix

A seeder written here, or a test fixture written later, that carries an explicit `id` **builds it from the prefix `/hora-build` allocated for this feature** (`../SKILL.md`, "Where to start"), in any table. Derive an id from that prefix alone, and leave another requester's rows unread.

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

**Write a test for each acceptance criterion, and run it.** Where a backend test lives, how it is named, how its run order is guaranteed, and how a failing suite is driven to green without weakening it are all the package's. **A test that is loosened, skipped or deleted to make the suite pass fails this checkpoint** — the exit condition is the criteria being backed, not the command exiting 0.

**"Each acceptance criterion" means this feature's own, and only those.** A behavior spanning several features is the version's, which no gate reads (`../../hora/references/spec-format.md`, "15. Version acceptance criteria").

**Leave the stub in place.** It is what the frontend is still building against until checkpoint 16.

## 7. Worker

| | |
|---|---|
| **Delegate to** | **first**, the skills covering where work belongs — the request path, a post-worker, or a background job — since that decides *whether* the rest apply. Then the skills covering whichever it chose: a side effect after the response, or a queued job with its schedule and retry |
| **Runs in** | an implementer agent |
| **Exit condition** | every piece of this feature's processing that does not belong in the request path runs where it should, and is implemented there |
| **Not applicable when** | this feature has no processing outside the request path. **Decide that with the placement skill, not by eye** |

**The placement decision comes before the implementation, and it is the part that gets skipped.** A write that looks synchronous, a side effect that looks small, a notification that looks instant — each is a candidate for a post-worker or a job.

**This is the one checkpoint where the delegate order is itself a rule**: the placement skill is what tells the rest of the checkpoint whether it has anything to do.

## 8. Security audit

| | |
|---|---|
| **Delegate to** | the skills covering a read-only, repo-wide security audit — what kinds of defect exist and how they are found |
| **Runs in** | **a verifier agent — read-only.** The audit finds; it does not fix |
| **Exit condition** | the audit produces no finding against this feature's code, or every finding it produced has been fixed or explicitly accepted and recorded |
| **Not applicable when** | never, for a feature that wrote backend code |

**Fixing a finding is a separate act**, done by an implementer agent afterwards, followed by re-running the audit. An accepted finding is recorded as a question, never left as a silent pass.

**Run it against this feature's code, not the whole repository.** Scoping it here keeps the finding list attributable to the work that just happened.

## 9. Verify the use cases again, against the built API

| | |
|---|---|
| **Delegate to** | — |
| **Runs in** | **the main session, in conversation** |
| **Exit condition** | every use case from checkpoint 2 can be completed against the API as it now exists — operation by operation, in order, with real data shapes |
| **Not applicable when** | never, for a feature that wrote backend code |

Checkpoint 2 verified the use cases against the *spec*. This verifies them against the *thing that got built*. **Walk each use case as a sequence of actual calls** and check that each step has an operation, that it returns what the next step needs, and that the shapes line up.

**Where a use case falls short, go back — usually to checkpoint 3.** Clear the checkpoints from there and say which were cleared. **Do not patch it at the edge**: adding one field on the way past is how an API drifts from its contract, which a frontend in another repository is already building against.

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

**This is the third pass over the same use cases, and it is not redundant.** 2 asked whether the spec supports them, 9 whether the API supports them, and this asks whether *a person can actually do them on a screen*.

That context file is what the UI generator (checkpoints 12, 15) and the UI auditor (checkpoint 18) both read. **Filling it in is this checkpoint's real output** — skip it and both run without a project context.

**A use case with no path through the interface goes back to checkpoint 2**, since either the interface or the use case is wrong, and only the person there can say which.

## 12. Component design

| | |
|---|---|
| **Delegate to** | the skills covering how a screen is made correct by construction; **every skill covering a component that already exists**; and the skills covering what must not be built in a component |
| **Runs in** | one implementer agent per component (`../SKILL.md`, "Step 5 — splitting a checkpoint into units") |
| **Exit condition** | each screen is broken into components, and every component either already exists in the app's own library or has a stated reason for being new |
| **Not applicable when** | this feature's `target` names no frontend row |

**Check the existing component skills before designing a new component.** The package ships one skill per component the library already has — buttons, dialogs, tables, selects, tabs, toasts and much else. **This is the checkpoint where matching against the equipped descriptions is worth doing exhaustively.**

## 13. The frontend modules the implementation needs

| | |
|---|---|
| **Delegate to** | the skills covering shared frontend logic as utility classes, and mapping backend error codes to user-facing messages |
| **Runs in** | an implementer agent |
| **Exit condition** | logic used by more than one component or page exists as a class under the app's modules folder, and this feature's backend error codes map to user-facing messages |
| **Not applicable when** | nothing in this feature is shared between two places, and it introduces no new error code. State which of the two, do not assume both |

**Furo is OOP: shared logic is a class, not a function and not a composable.**

**Error mapping is part of this checkpoint, not of the UI checkpoint.** A backend error code with no locale entry surfaces as a raw dotted string, and checkpoint 18's review fails it under "does it tell the truth when something goes wrong".

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

**The contract is authoritative for both sides.** Wanting to change it here means raising a question, not changing it.

**"Works against the stub" is the exit condition, not "works against the real API".** Testing against the stub proves the client matches the *contract* rather than whatever the implementation happens to return.

## 15. UI

| | |
|---|---|
| **Delegate to** | the skills covering how a screen is made correct by construction, and **every skill covering this project's CSS conventions** — writing style, layers, units, prohibitions, custom-property naming and prohibitions, property order within a selector, line height, `z-index`, spacing and margins, animation |
| **Runs in** | one implementer agent per screen (`../SKILL.md`, "Step 5 — splitting a checkpoint into units") |
| **Exit condition** | every screen this feature needs is built, accessible, responsive, and in its loading, empty and error states as well as its filled one |
| **Not applicable when** | this feature's `target` names no frontend row |

**The three states other than "filled" are the ones that get skipped and the ones acceptance fails on.** **Each of the four states belongs to its screen's own unit** — splitting them across agents would give one screen four authors and none of them the whole condition.

**What the screens here share is styling, and it goes to one unit.** A custom-property declaration, a layer or global stylesheet, and the place a screen's labels are written are each one already-existing file. **The CSS conventions themselves are a shared *reading*, never a shared file.**

## 16. Wire the data-fetching logic in

| | |
|---|---|
| **Delegate to** | the skills covering the frontend's context patterns, its GraphQL operation clients, and how a frontend test is written and placed |
| **Runs in** | an implementer agent |
| **Exit condition** | the screen shows real data from the **actual** API, not the stub, its loading and error paths are driven by real responses, and the unit tests covering this feature's frontend acceptance criteria pass |
| **Not applicable when** | this feature's screen calls no API |

**Write a test for each frontend acceptance criterion, and run it.** **A test that is loosened, skipped or deleted to make the suite pass fails this checkpoint**, and **the criteria are this feature's own**, never the version's (`../../hora/references/spec-format.md`, "15. Version acceptance criteria").

**This is where the stub is left behind.** Since the stub and the real implementation share a class name and an interface, this is a change of endpoint, not a rewrite.

**After this checkpoint, confirm the stub is still intact.** It stays in the repository — other features and later versions develop against it.

## 17. Local test environment

| | |
|---|---|
| **Delegate to** | the skills covering how the local end-to-end container stack is built and brought up |
| **Runs in** | the main session |
| **Exit condition** | the application runs locally **together with every service behind it**, each role can sign in, and there is reviewable data or a command that produces it |
| **Not applicable when** | one already exists and this feature added no service, no role and no seed data it needs |

**This is the live acceptance run's prerequisite, which is why it sits here and not inside checkpoint 18.** Three runs need it: the whole-version sweep, a gate run whose live sweep was explicitly requested, and a gate run paying a listed feature's deferred acceptance (`../../hora-accept/SKILL.md`, "What is in scope"). A gate run that skips the live sweep does not exercise it, but the sweep always will — so the environment is built here, while the feature that changed it is fresh.

**A feature that adds a service, a role or a fixture updates the environment here**, even when the environment as a whole already exists.

**This checkpoint's changes do not go on the feature's own branch.** They get their own `update/e2e-<what>-for-<feature-id>` branch (`../../hora/references/commits.md`).

---

# Acceptance gate

## 18. Acceptance (E2E and unit both)

| | |
|---|---|
| **Delegate to** | **the `/hora-accept` skill** |
| **Runs in** | the main session |
| **Exit condition** | `/hora-accept`, in its feature-gate form, reports a pass — the unit suites across **every repository in full**, and the acceptance review scoped to this feature |
| **Not applicable when** | never |

**The gate is scoped; the regression net is not.** The unit suites run whole repositories every time, so a feature that broke an earlier one fails here, in the run that broke it. What a gate run does not do by default is drive earlier features' screens end to end (`/hora-accept`, "What is in scope").

**What this gate judges is this feature's own acceptance criteria. The version's own are the sweep's, at every reach** (`../../hora/references/spec-format.md`, "A criterion is checked at its own feature's gate").

**Everything about what is reviewed and what fails lives in `/hora-accept` and the skills it delegates to.** Do not restate any of it here.

**On a failure, the run goes back to whichever checkpoint produced the shortfall — in whichever feature.** Clear those checkpoints, say which, and rebuild through a `retake/` branch (`../../hora/references/commits.md`).
