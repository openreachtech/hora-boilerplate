# The eighteen checkpoints

**The authority on the checkpoint list.** `/hora-plan` copies it into each feature file; `/hora-build` runs a feature through it.

**This file holds the order and the exit conditions. It holds no procedure.** How to write any piece of the implementation lives in the conventions package, and each checkpoint states the *work* that skill covers.

**No checkpoint names a skill from that package, and none ever may.** Each **Delegate to** row says what has to be covered; the main session matches it against the equipped descriptions at run time. **Skills hora itself ships are named here freely.**

---

## What a checkpoint is

A checkpoint is **a gate with one exit condition**. Passing it is not "I did some work on this" — it is that a specific, stated condition now holds.

### Three states, and only three

```markdown
- [ ] 6. The real implementation                             not passed
- [x] 6. The real implementation                             passed
- [x] 7. Work outside the request path  <!-- n/a: this feature triggers none -->
```

**A checkpoint may be marked not-applicable only against its own "when it does not apply" line.** A bare `n/a` is a skipped checkpoint dressed as a cleared one. **Three reasons do not come from a checkpoint's own line, and there are no others** (`../../hora/references/done-criteria.md`, "Not applicable is a state, and it needs a reason").

**A not-applicable mark is cleared the moment its reason stops holding.** When checkpoint 18 sends a run back into a stretch marked as built before adoption, that code is being changed, so it was not simply inherited: reopen from the earliest checkpoint affected and run it for real.

### The order is a rule

**No checkpoint may be entered until every earlier one is `[x]`.** There is no exception and no fast path — several look independent and are not.

**Inside one checkpoint, its units do run at once** (`../SKILL.md`, "Splitting a checkpoint into units"). The checkpoint remains one gate with one exit condition.

### Four checkpoints can send the run backwards

2, 9, 11 and 18 are **verification** gates: they check the work against something outside it. When one fails, **it clears the checkpoints it invalidates and the run returns to the earliest one cleared.**

| Gate | Checks against | Sends back to |
|---|---|---|
| 2 | the use cases, as the spec states them | checkpoint 1 — the spec itself is what has to change |
| 9 | the use cases, against the interface actually built | whichever of 3–7 has to change. Usually 3 |
| 11 | the use cases, against the surface actually designed | 11 itself, or back to 2 when a use case turns out to be wrong |
| 18 | the product, end to end | whichever checkpoint produced the shortfall, in whichever feature |

**Cycling here is the design working.** A run that never goes back has either an unusually complete spec or a verification gate that is not doing its job.

### On a repository that is not empty, a checkpoint reconciles rather than creates

**Every exit condition below reads the same against existing code; what changes is the work that satisfies it.** Checkpoint 3 against an empty repository writes migrations; against a `to-spec` feature's existing tables it changes them toward the spec's data model. The same holds down the list.

**For a `to-spec` feature, running all seventeen gates against existing code is the work itself.** The waste case is different: **a finished feature run through seventeen gates because nobody declared `Authority: as-built`.** Do not read that case as a reason to skip gates on unfinished code.

### The four gates

| Gate | Checkpoints | Repository written in | Merges when |
|---|---|---|---|
| Spec | 1–2 | none (`specs/` and `.hora/` only) | — |
| Provider | 3–9 | the provider rows this feature names | after 9 |
| Consumer | 10–17 | the consumer rows this feature names | after 17 |
| Acceptance | 18 | none (`.hora/acceptance/` only) | — |

**A feature whose `target` names no consumer row skips 10–17 as a whole; one naming no provider row skips 3–9.** Skipping a whole gate still means marking each of its checkpoints not-applicable, with the reason.

**A row declaring both roles runs both gates in the same repository.**

---

# Spec gate

## 1. Draft or confirm the specification

| | |
|---|---|
| **Delegate to** | the skills covering how a rough request becomes stated requirements with observable criteria. **Anything that has to change goes to `/hora-spec`** |
| **Runs in** | the main session, in conversation |
| **Exit condition** | this feature's requirements, use cases and acceptance criteria are all written in `specs/`, each observable, and **each checkable against a product in which this feature and its `depends` are built and nothing later is** |
| **Not applicable when** | never |

`/hora-plan` has already verified these exist. **This checkpoint is where they are read closely enough to build from**, which is what catches the criterion that reaches forward.

**The version's own acceptance criteria are not this feature's, and nothing here reads them.**

**What is found missing here is fixed where the fix belongs, and this is the only checkpoint that reaches `specs/` at all:**

| What is missing | Fixed by |
|---|---|
| a use case, an operation's caller, a design that cannot serve a use case | **`/hora-spec`**, at the stage that owns it |
| a one-line hole — an annotation, a `target`, a typo | **`/hora-plan`**: state it, propose the exact edit, wait for approval, write it |

**Never write into `specs/` from this checkpoint by any other route**, and never from an agent.

## 2. Verify the use cases can be met

| | |
|---|---|
| **Delegate to** | the skills covering the shared project context, where the use cases and their context are recorded |
| **Runs in** | **the main session, in conversation. This one cannot be delegated to an agent** |
| **Exit condition** | every use case this feature states is achievable under the spec as written, or has been changed until it is |
| **Not applicable when** | never |

Walk each use case end to end, on paper, against the spec. **Look for the case that cannot be completed** — a step with no operation behind it, a surface with no way to reach it, a state the model cannot represent, two requirements that cannot both hold.

**An unmet use case found here costs a conversation; the same one at checkpoint 18 costs a rebuild.**

**A fix to the spec itself runs through `/hora-spec`.** This checkpoint decides that something must change; that skill changes it.

---

# Provider gate

## 3. Data model and interface definitions

| | |
|---|---|
| **Delegate to** | the data store, in this order: the logical shape of a table → the migration → the model. The interface surface, by the kind of each operation. Type declarations and constants. A new endpoint: what an endpoint is and what its auth filter does |
| **Runs in** | one implementer per table, and per operation's interface |
| **Exit condition** | the migration, the model, the type declarations and the interface surface all exist and agree with `.hora/contracts/<version>/` |
| **Not applicable when** | this feature adds no table and no operation — rare, usually a feature that only composes existing ones |

**The interface surface branches on the kind of each operation, and the kind comes from the spec — never from inference.** **If the spec does not state one, stop.** Raise it rather than picking a kind.

**Type declarations and constants belong here, not with the modules at checkpoint 5.** They are the schema expressed as types, and the stub at checkpoint 4 already needs both. Checkpoint 5 gathers the material the real implementation runs on.

**A constant file two operations both add to is this checkpoint's shared file, and it belongs to one unit.**

## 4. Stub interface

| | |
|---|---|
| **Delegate to** | the skills covering how a stub is written |
| **Runs in** | an implementer agent |
| **Exit condition** | a schema-accurate stub exists for every operation this feature adds, returning fixed data, callable from outside |
| **Not applicable when** | this feature adds no operation at all |

**This is placed before the real implementation on purpose, and it is why the consumer gate does not wait on the provider gate finishing.** Checkpoints 12–14 build a client and a surface against the stub; checkpoint 16 swaps them onto the real thing.

A stub lives beside the real implementation, **under the same name and the same interface.** That sameness makes checkpoint 16 a change of endpoint rather than a rewrite.

## 5. The modules the implementation needs

| | |
|---|---|
| **Delegate to** | first the catalog check (below), then the skills covering whichever of these this feature needs: an external client, a dispatch strategy, a shared container, a named subquery, a seeder |
| **Runs in** | the catalog check first, once for the whole checkpoint, then one implementer per module |
| **Exit condition** | **every module checkpoint 6 will import already exists and works on its own**, and nothing was written that the catalog already provides |
| **Not applicable when** | checkpoint 6 needs nothing beyond the model and the schema. State that; do not assume it |

**The exit condition is "they are there", not "some were written".** Before leaving, list what checkpoint 6 is going to import and confirm each one resolves. **That list is gathered by the main session, from every unit together** — a unit sees the module it wrote and none of its siblings'.

### Check the catalog before writing anything

**Where a project keeps a catalog of reusable packages, the utility layer is the most reinvented thing in it, because no spec ever names it.** This checkpoint is where that check happens, once, for the whole feature.

**"Once" is what makes the delegate order a rule here.** One agent searches for everything this checkpoint is about to write and returns what to reuse; the module units start with that answer in hand. Left to the units, the search runs once per module and can return a different verdict on the same package each time.

**Where the catalog lives, and how it is laid out, is recorded in `.hora/tree/`.** Read it at run time.

- **Match a description of the processing about to be written against a candidate's own documentation, not against a category**
- **Judge which role a package serves from what its docs describe, never from what its name sounds like**
- **The spec overrides this.** When `specs/` states a particular way to implement something, follow that
- When something looks close but there is no confidence, record `reinvention` (`blocking: no`) and proceed with your own implementation

### Explicit row ids come from this feature's prefix

A seeder written here, or a test fixture written later, that carries an explicit id **builds it from the prefix `/hora-build` allocated for this feature** (`../SKILL.md`, "Where to start"), in any table. **Derive an id from that prefix alone, and leave another requester's rows unread.**

## 6. The real implementation

| | |
|---|---|
| **Delegate to** | by the kind of each operation, plus the skills covering input validation |
| **Runs in** | one implementer agent per operation |
| **Exit condition** | the real implementation exists under the same name and interface as its stub, its input is validated, and the unit tests covering this feature's acceptance criteria pass |
| **Not applicable when** | this feature adds no operation |

**Write a test for each acceptance criterion, and run it.** Where a test lives, how it is named, how its run order is guaranteed and how a failing suite is driven to green without weakening it are all the package's. **A test that is loosened, skipped or deleted to make the suite pass fails this checkpoint** — the exit condition is the criteria being backed, not the command exiting 0.

**"Each acceptance criterion" means this feature's own, and only those.**

**Leave the stub in place.** It is what the consumer side is still building against until checkpoint 16.

## 7. Work outside the request path

| | |
|---|---|
| **Delegate to** | **first**, the skills covering where work belongs — the request path, a deferred side effect, or a queued job — since that decides *whether* the rest apply. Then the skills covering whichever it chose |
| **Runs in** | an implementer agent |
| **Exit condition** | every piece of this feature's processing that does not belong in the request path runs where it should, and is implemented there |
| **Not applicable when** | this feature has no processing outside the request path. **Decide that with the placement skill, not by eye** |

**The placement decision comes before the implementation, and it is the part that gets skipped.** A write that looks synchronous, a side effect that looks small, a notification that looks instant — each is a candidate.

**This is the one checkpoint where the delegate order is itself a rule:** the placement skill is what tells the rest of the checkpoint whether it has anything to do.

## 8. Security audit

| | |
|---|---|
| **Delegate to** | the skills covering a read-only security audit — what kinds of defect exist and how they are found |
| **Runs in** | **a verifier agent — read-only.** The audit finds; it does not fix |
| **Exit condition** | the audit produces no finding against this feature's code, or every finding has been fixed or explicitly accepted and recorded |
| **Not applicable when** | never, for a feature that wrote provider code |

**Fixing a finding is a separate act**, done by an implementer afterwards, followed by re-running the audit. **An accepted finding is recorded as a question, never left as a silent pass.**

**Run it against this feature's code, not the whole repository.** Scoping it keeps the finding list attributable to the work that just happened.

## 9. Verify the use cases against what was built

| | |
|---|---|
| **Delegate to** | — |
| **Runs in** | **the main session, in conversation** |
| **Exit condition** | every use case from checkpoint 2 can be completed against the interface as it now exists — operation by operation, in order, with real data shapes |
| **Not applicable when** | never, for a feature that wrote provider code |

Checkpoint 2 verified the use cases against the *spec*. This verifies them against the *thing that got built*. **Walk each use case as a sequence of actual calls** and check that each step has an operation, that it returns what the next step needs, and that the shapes line up.

**Where a use case falls short, go back — usually to checkpoint 3.** Clear the checkpoints and say which were cleared. **Do not patch it at the edge**: adding one field on the way past is how an interface drifts from its contract, which a consumer in another repository is already building against.

**This is the last chance before a consumer starts using it.** After this checkpoint, the provider row's feature branch merges.

---

# Consumer gate

## 10. Open the consumer

| | |
|---|---|
| **Delegate to** | the skills covering the consumer framework's own structure, and its environment configuration |
| **Runs in** | an implementer agent |
| **Exit condition** | the entry points this feature needs exist and are reachable, and the configuration pointing at the provider is wired |
| **Not applicable when** | this feature's `target` names no consumer row |

## 11. Reconfirm the experience and the use cases

| | |
|---|---|
| **Delegate to** | the skills covering the shared project context |
| **Runs in** | **the main session, in conversation** |
| **Exit condition** | the shared context file covers this feature — its users, its surfaces, its rules — and every use case has a path through the interface |
| **Not applicable when** | this feature's `target` names no consumer row |

**This is the third pass over the same use cases, and it is not redundant.** 2 asked whether the spec supports them, 9 whether the interface supports them, and this asks whether **a person can actually do them.**

That context file is what the generator (12, 15) and the auditor (18) both read. **Filling it in is this checkpoint's real output** — skip it and both run without a project context.

**A use case with no path goes back to checkpoint 2**, since either the interface or the use case is wrong, and only the person there can say which.

## 12. Composition units

| | |
|---|---|
| **Delegate to** | the skills covering how a surface is made correct by construction; **every skill covering a unit that already exists**; and the skills covering what must not be built into one |
| **Runs in** | one implementer agent per unit |
| **Exit condition** | each surface is broken into units, and every unit either already exists in the project's own library or has a stated reason for being new |
| **Not applicable when** | this feature's `target` names no consumer row |

**Check the existing skills before designing a new unit.** A package often ships one skill per unit its library already has. **This is the checkpoint where matching against the equipped descriptions is worth doing exhaustively.**

## 13. The consumer modules the implementation needs

| | |
|---|---|
| **Delegate to** | the skills covering shared consumer-side logic, and mapping the provider's error codes to messages a person can read |
| **Runs in** | an implementer agent |
| **Exit condition** | logic used in more than one place exists as a shared module, and this feature's error codes map to user-facing messages |
| **Not applicable when** | nothing in this feature is shared between two places, and it introduces no new error code. State which of the two; do not assume both |

**Error mapping is part of this checkpoint, not of the presentation one.** An error code with no message surfaces as a raw string, and checkpoint 18's review fails it under "does it tell the truth when something goes wrong".

## 14. Interface client

| | |
|---|---|
| **Delegate to** | by the kind of each operation |
| **Runs in** | an implementer agent |
| **Exit condition** | a client exists for every operation this feature uses, matching `.hora/contracts/<version>/` exactly, and it works against the stub from checkpoint 4 |
| **Not applicable when** | this feature's surface calls no operation |

**The contract is authoritative for both sides.** Wanting to change it here means raising a question, not changing it.

**"Works against the stub" is the exit condition, not "works against the real thing".** Testing against the stub proves the client matches the *contract* rather than whatever the implementation happens to return.

## 15. Presentation

| | |
|---|---|
| **Delegate to** | the skills covering how a surface is made correct by construction, and **every skill covering this project's presentation conventions** — writing style, layering, units, prohibitions, naming, ordering, spacing, animation |
| **Runs in** | one implementer agent per surface |
| **Exit condition** | every surface this feature needs is built and accessible, in its waiting, empty and failed states as well as its filled one |
| **Not applicable when** | this feature's `target` names no consumer row |

**The three states other than "filled" are the ones that get skipped and the ones acceptance fails on.** **Each of the four states belongs to its surface's own unit** — splitting them across agents would give one surface four authors and none of them the whole condition.

**What the surfaces share is styling, and it goes to one unit.** **The conventions themselves are a shared *reading*, never a shared file.**

## 16. Connect to the real interface

| | |
|---|---|
| **Delegate to** | the skills covering the consumer's data-access patterns, its clients, and how a consumer-side test is written and placed |
| **Runs in** | an implementer agent |
| **Exit condition** | the surface shows real data from the **actual** interface, not the stub, its waiting and error paths are driven by real responses, and the unit tests covering this feature's consumer-side acceptance criteria pass |
| **Not applicable when** | this feature's surface calls no operation |

**Write a test for each criterion, and run it.** **A test loosened, skipped or deleted to make the suite pass fails this checkpoint**, and the criteria are this feature's own.

**This is where the stub is left behind.** Since the stub and the real implementation share a name and an interface, this is a change of endpoint, not a rewrite. **After this checkpoint, confirm the stub is still intact** — it stays, and other features and later versions develop against it.

## 17. Local end-to-end environment

| | |
|---|---|
| **Delegate to** | the skills covering how the local end-to-end stack is built and brought up |
| **Runs in** | the main session |
| **Exit condition** | the application runs locally **together with every service behind it**, each role can sign in, and there is reviewable data or a command that produces it |
| **Not applicable when** | one already exists and this feature added no service, no role and no seed data it needs |

**This is the live acceptance run's prerequisite, which is why it sits here and not inside checkpoint 18.** Three runs need it: the whole-version sweep, a gate run whose live sweep was requested, and a gate run paying a listed feature's deferred acceptance. **A gate run that skips the live sweep does not exercise it, but the sweep always will** — so the environment is built here, while the feature that changed it is fresh.

**A feature that adds a service, a role or a fixture updates the environment here**, even when the environment as a whole already exists.

**This checkpoint's changes do not go on the feature's own branch.** They get their own `update/e2e-…` branch.

---

# Acceptance gate

## 18. Acceptance

| | |
|---|---|
| **Delegate to** | **the `/hora-accept` skill** |
| **Runs in** | the main session |
| **Exit condition** | `/hora-accept`, in its feature-gate form, reports a pass — the test suites across **every repository in full**, and the acceptance review scoped to this feature |
| **Not applicable when** | never |

**The gate is scoped; the regression net is not.** The test suites run whole repositories every time, so a feature that broke an earlier one fails here, in the run that broke it. What a gate run does not do by default is drive earlier features end to end.

**What this gate judges is this feature's own acceptance criteria. The version's own are the sweep's, at every reach.**

**Everything about what is reviewed and what fails lives in `/hora-accept`.** Do not restate any of it here.

**On a failure, the run goes back to whichever checkpoint produced the shortfall — in whichever feature.** Clear those checkpoints, say which, and rebuild through a `retake/` branch.
