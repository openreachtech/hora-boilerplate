# Stage 0, then the seven stages

**The authority on the stage list.** `/hora-spec` copies it into `.hora/spec/<version>/_stages.md`; each stage skill runs one of them.

**This file holds the order and the exit conditions. It holds no design rule** — those live in the conventions package (`../../hora/references/structure.md`, "The division of labor").

**No stage below names a skill from that package, and none ever may.** Each **Delegate to** row says what has to be covered; the main session matches it against the equipped descriptions when it enters the stage.

---

## What a stage is

A stage is **a gate with one exit condition**, exactly like a checkpoint. Passing it means a stated condition now holds, and the section it owns is written into `specs/<version>/` with somebody's approval on it.

### Three states, and only three

```markdown
0. [x] Assets and sources                                  passed
1. [ ] Use cases and actors                                not passed
5. [x] The consumer surface  <!-- n/a: this version declares no consumer row -->
```

**A stage may be marked not-applicable only against its own "not applicable when" line.** Six of the seven have no such line at all.

### On a diff version, a stage may pass by carrying over

```markdown
3. [x] Non-functional requirements  <!-- carried: 1.0.0's numbers, confirmed unchanged -->
6. [x] Security                     <!-- ran on the export operation only -->
```

**Carrying over is a check, never an assumption.** The stage states what the previous version fixed, in the words it fixed it in, and asks whether what this version adds changes it. **An unexamined carry-over is the one kind of pass indistinguishable from not having run**, which is why the reason is written and the closing report names each one.

### The order is a rule

**No stage may be entered until every earlier one is `[x]`.** Each one's answers are the next one's input:

- A data model designed before the use cases are fixed is designed twice, and the second time a migration is already written against the first
- A table designed before the user counts are known is designed for the wrong number, and nothing in it says so
- A surface designed before the operations exist invents operations, which then exist only in the surface

**Going back is normal, and it is not a failure.** A stage that turns up something an earlier one got wrong says so, names the stage, and the run returns there.

### Every stage runs in the main session

**None may be delegated to a subagent** — every one is a conversation, and **a subagent cannot ask anybody anything.** The mechanical parts of stages 0 and 7 are the one exception, and even there the findings come back to be settled.

### Every stage reads before it asks

**A stage with evidence puts its reading up as a check, and asks only about what the evidence cannot settle.** Stage 0 establishes what exists at all; each stage then reads its own section's evidence at its own depth.

**Which form each thing goes out as is not a stylistic choice** (`../../hora/references/asking.md`).

### Acceptance criteria are drafted by the stage that writes the section

**A section's owner writes its `<!-- acceptance -->` block, in the same approved write as the section itself.** **Stage 6 is the one stage that adds to another stage's block**: one refusal criterion per operation whose refusal matters.

**Draft them; never demand them blank.** Whoever wants the product rarely arrives with observable criteria. A person handed an empty block writes none, and the missing block is `blocking: yes` at stage 7.

**A block holds only what its own feature's gate can check. What reaches further belongs to stage 2** (`../../hora/references/spec-format.md`, "A criterion is checked at its own feature's gate, so it may not reach forward"). **The stage that drafted it records it and hands it over; it never places it and never drops it**, because placing it needs the order, and the order is stage 2's.

---

## What sends a run back into a stage

| What was found | Returns to |
|---|---|
| a document or repository nobody declared, turning up mid-run | **0** |
| a use case nobody stated, or one that turns out to be wrong | **1** |
| a feature that belongs in a later release, or has to come forward | **2** |
| a criterion or use case reaching a feature built after it, or an order contradicting a `depends` | **2** |
| a number that makes the design wrong | **3** |
| a use case the data model cannot represent, or that no operation can complete | **4** |
| a use case with no path through the surface, or a surface element with nothing behind it | **5** |
| an operation with no stated caller | **6** |
| a divergence row with a blank routing | **the stage that owns its subject** |

**`/hora-plan` and `/hora-build` use this table too.** A finding at checkpoint 2, 9, 11 or 18 that turns out to be a shortfall in the spec comes back here, at the stage this table names.

---

# Stage 0. Assets and sources

| | |
|---|---|
| **Skill** | **none — `/hora-spec` runs it itself** |
| **Delegate to** | nothing. Reading a tree is not a procedure a package holds |
| **Exit condition** | everything readable has been read at breadth; each document is declared `Sources` or `Annex` with somebody vouching for it; a request is confirmed as this version's agenda; what was read has been confirmed per section; `_assets.md` is written; and where documents and code both exist, every disagreement is a row in `_divergence.md` |
| **Not applicable when** | **never.** A new project passes it by recording there was nothing to read |
| **Carried over when** | **never.** On a diff version this is exactly what moved |
| **Writes** | `Sources`, `Annex`, `_assets.md`, and `_divergence.md` with every routing cell blank |
| **Reads** | everything, at breadth. **`request/` first** |

**`investigation.md` is the authority on this stage.**

**Nothing it reads becomes a requirement.** A draft goes out as a check, and only what somebody confirms is written.

**Ask what exists somewhere a session cannot reach.** The document that would have settled stage 4 is regularly on a wiki nobody mentioned.

---

# Stage 1. Use cases and actors

| | |
|---|---|
| **Skill** | `/hora-spec-usecases` |
| **Delegate to** | the skills covering how a rough request becomes stated requirements with observable criteria; and the skills covering the shared project context the interface skills later read |
| **Exit condition** | every actor named with how they are identified; every use case one person completing one thing end to end; every feature this release builds carrying at least one; every block holding only what that feature's gate can check, with whatever reached further recorded for stage 2; and the project name written — **a listed section excepted**, which exits with a name, one line of prose, its `built:` value, and one recorded listing decision naming whoever made it |
| **Not applicable when** | never |
| **Carried over when** | **the actors are unchanged and this version adds no feature.** Otherwise it runs on what this version adds alone. **A new actor or role is never a carry-over** |
| **Writes** | document information, the project name, actors, terminology, existing assets, and each feature's two blocks and adoption annotations |
| **Reads** | the operation and surface inventory, for the feature list and actor candidates it implies. Never for what a feature is *for* — **except under `Authority: as-built`** |

**A feature list is not a use case list, and the difference is the whole point of this stage.** "Attendance management" is a heading; "a member of staff who forgot to clock in files yesterday's hours the next day" is a use case. Three checkpoints and the acceptance review read the second kind and can do nothing with the first.

---

# Stage 2. The horizon

| | |
|---|---|
| **Skill** | `/hora-spec-horizon` |
| **Delegate to** | the skills covering the out-of-scope list, and what makes a requirement decided rather than assumed |
| **Exit condition** | three separate lists exist; every "for now" entry names what unblocks it and the seam it needs kept replaceable; **the build order puts every feature after the features it depends on**; and the version's own acceptance criteria are written, `none` where there are none, every criterion carrying `spans:` |
| **Not applicable when** | never |
| **Carried over when** | **effectively never on a version that adds anything.** Adding a feature *is* a change of horizon |
| **Writes** | the implementation scope in three parts, the implementation plan, and the version's acceptance criteria |
| **Reads** | nothing new. **What to build next is a decision, and no repository holds one.** The one thing it reads is what stage 1 held back |

**The two kinds of out-of-scope are not a formality.** "For now" leaves an extension point; "permanently" excludes the thing from the design.

**This is also the stage that says no.** A release carrying twenty features is the normal failure of this whole process, and narrowing it is cheapest here.

---

# Stage 3. Non-functional requirements

| | |
|---|---|
| **Skill** | `/hora-spec-nonfunctional` |
| **Delegate to** | **nothing owns this.** No skill states what a project's user count or availability target should be |
| **Exit condition** | initial and foreseen user counts, the heaviest single operation, the availability expectation, how long data is kept, and the security level are written — as numbers wherever a number exists — and every service the project needs is declared with its version |
| **Not applicable when** | never |
| **Carried over when** | **the numbers still hold, confirmed one by one.** The most common carry-over of the seven. **The heaviest operation is the exception and is asked every time** — a new feature is precisely what moves it |
| **Writes** | non-functional requirements, manual verification |
| **Reads** | today's row counts, retention and running services, **as today's numbers**. **What the product must carry tomorrow is nobody's to read** |

**A number here changes the design at stage 4; an adjective does not.**

---

# Stage 4. Data, operations and execution

| | |
|---|---|
| **Skill** | `/hora-spec-provider` |
| **Delegate to** | the skills covering the logical shape of a table; interface definition and naming; whether work belongs in the request path, in a deferred side effect, or in a queued job; a queue, a schedule, a retry; what an endpoint is and what its auth filter does |
| **Exit condition** | the repository layout and server table are declared; every stage-1 use case can be walked against the data model and operation list, step by step, without a gap; every operation states its kind; and every write states whether it completes inside the request or runs as a job |
| **Not applicable when** | never. A version with no provider row still has to declare that |
| **Carried over when** | **this version adds no table, no operation and no job.** **A new row or a new server is never a carry-over** |
| **Writes** | the repository layout and server table, the data model, the operation lists, background jobs, the key file map — with the acceptance blocks those sections carry |
| **Reads** | **deeply** — migrations, models, interface definitions, job definitions, entry points |

**Walking the use cases is the exit condition, not a review step.** A data model that is internally tidy and cannot represent one stated use case passes every other check in this document.

---

# Stage 5. The consumer surface

| | |
|---|---|
| **Skill** | `/hora-spec-consumer` |
| **Delegate to** | the skills covering the shared project context the interface generator and auditor both read; and the skills covering what a surface has to account for to be correct by construction — states, empties, failures, accessibility |
| **Exit condition** | every use case names the surfaces it passes through, in order; every surface names the operations it calls; nothing on a surface lacks an operation behind it, and no operation is unreachable — **read over what this version specifies, a listed section excepted**, which exits with its inherited surfaces as one line each |
| **Not applicable when** | **no row declares the `consumer` role** — an interface-only release for a client somebody else builds. State the reason, and say which consumer it is for instead |
| **Carried over when** | **this version adds and changes no surface.** Otherwise it runs on the new ones **and on every existing one the new operations touch**, which is the part a diff hides |
| **Writes** | the surface sections, their two blocks, and the per-surface use-case mapping |
| **Reads** | **deeply** — the entry points, the routes, and which operations each calls. **What is absent is the finding**: the empty, failed, waiting and forbidden states, each of which goes out as a proposal, never as a check |

**Unreachable in either direction is a defect, and both directions are checked here.** An operation nothing calls is either a missing surface or a feature nobody wants; a control with no operation behind it is a surface designed against a provider that does not exist.

---

# Stage 6. Security

| | |
|---|---|
| **Skill** | `/hora-spec-security` |
| **Delegate to** | the skills covering the security audit — **the authority on what kinds of defect exist.** They audit code, not a document, so what is borrowed is the list of kinds, never a verdict. Plus the skills covering what an auth filter is |
| **Exit condition** | every operation names who may call it and what happens when somebody else does; every surface names who may open it; every piece of personal or regulated data is named as such; and the choice between roles on one endpoint and separate endpoints has a written reason |
| **Not applicable when** | never. A release with no authentication still has to say that, and why |
| **Carried over when** | **never, for anything this version adds.** Operations this version does not touch carry over untouched — that is the only free part |
| **Writes** | the caller and permission of every operation, the security rows of the non-functional requirements, the endpoint-split reason — and the refusal criteria it adds to other stages' blocks |
| **Reads** | **deeply** — the auth filters and role checks, to establish **who may call each operation today.** That is a fact and goes out as a check. **Who *should* be able to is a decision nobody has made**, and goes out as a question |

**Authorization is the thing most often left unsaid, and the most expensive to add late.**

**A listed feature's operations get this stage's full work, undiminished.** Listing suspends exactly two checks, and neither is this stage's.

---

# Stage 7. Whole-document review

| | |
|---|---|
| **Skill** | `/hora-spec-review` |
| **Delegate to** | the skills covering whether a criterion is observable; end-to-end test specification (**not run here**); and how the document itself is written |
| **Exit condition** | every required section present; every feature carrying two blocks, each criterion observable — **a listed section excepted, and every one of those counted and named**; every use case satisfiable by what stages 4 to 6 designed; **no block reaching forward, and the version's own criteria present**; the out-of-scope lists still matching the design; every `id` unique; no two statements contradicting each other; and **every divergence row naming where it was routed** |
| **Not applicable when** | never. **This is the stage that makes the other six mean anything** |
| **Carried over when** | **never, and on a diff version it reads the RESOLVED document.** A new operation contradicting something 1.0.0 wrote is invisible in a diff and plain in the resolution. **A carry-over any earlier stage claimed is checked here** |
| **Writes** | whatever the review changes, in the section that owns it, through the stage that owns it |
| **Reads** | the document against itself, and `_assets.md` against the document |

**A shortfall found here is fixed by the stage that owns it, not patched in place.** Stage 7 does not write a use case; it sends the run back to stage 1 and says why.

**Run the mechanical checks first, then the reading.** The mechanical ones are cheap and precise.

---

## References

| File | Content |
|---|---|
| `investigation.md` | **stage 0's authority** |
| `principles.md` | the thinking every stage applies |
| `../SKILL.md` | how a stage is run, the approval rule, the state file |
| `../../hora/references/asking.md` | a check, a proposal or a question |
| `../../hora/references/spec-format.md` | **the authority on the format** every stage writes into |
| `../../hora-build/references/checkpoints.md` | the four checkpoints that can send a run back here |
