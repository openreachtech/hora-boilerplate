# Stage 0, then the seven stages

**The authority on the stage list.** `/hora-spec` copies the list from here into `.hora/spec/<version>/_stages.md`; each stage skill runs one of them.

**Stage 0 is numbered 0 because it does not renumber anything.** It gathers what already exists so that the seven stages have something to correct instead of something to dictate. On a new project it passes in a sentence.

**This file holds the order and the exit conditions. It holds no design rule.** How a table is shaped, how an SDL is named, where a background job belongs and what a screen must account for all live in `@openreachtech/ai-agent-skills` (`../../hora/references/structure.md`, "The division of labor").

**No stage below names a package skill, and none ever may.** Each **Delegate to** row says what has to be covered, and the main session matches that against the equipped skills' own descriptions when it enters the stage (`../../hora/references/structure.md`, "No hora file ever names one of those skills").

**`principles.md` is the other half of this file.** This one says what must be true before a stage is over; that one says what to weigh while getting there.

---

## What a stage is

A stage is **a gate with one exit condition**, exactly like a checkpoint. Passing it is that a stated condition now holds, and that the section it owns is written into `specs/<version>/` with somebody's approval on it.

### Three states, and only three

```markdown
0. [x] Assets and sources                                      passed
1. [ ] Use cases and actors                                    not passed
2. [x] The horizon                                             passed
5. [x] Screens and interaction  <!-- n/a: this version declares no frontend -->
```

**A stage may only be marked not-applicable with a written reason**, checked against that stage's own "not applicable when" line. Five of the seven have no such line at all.

### On a diff version, a stage may pass by carrying over

**From the second version on, `spec.md` is a diff** (`../SKILL.md`, "The second version onward"). A stage whose section nothing in this version touches **passes, with the carry-over written next to it**.

```markdown
3. [x] Non-functional requirements  <!-- carried: 1.0.0's numbers, confirmed unchanged -->
6. [x] Security                     <!-- ran on the export operation only -->
```

**Carrying over is a check, and never an assumption.** The stage states what the previous version fixed, in the words it fixed it in, and asks whether what this version adds changes it. **An unexamined carry-over is the one kind of pass that is indistinguishable from not having run**, which is why the reason is written and why the closing report names each one.

**Each stage below states its own `Carried over when`.** Two of them never carry over at all.

### The order is a rule

**No stage may be entered until every earlier one is `[x]`.** Each one's answers are the next one's input (`../SKILL.md`, "The order of the stages is a rule").

### Every stage runs in the main session

**None of them may be delegated to a subagent** — every one is a conversation. The mechanical parts of stage 0 and stage 7 are the one exception, and even there the findings come back to the main session to be settled.

### Every stage reads before it asks

**A stage that has evidence puts its reading up as a check, and only asks about what the evidence cannot settle.** Stage 0 establishes what exists at all; each stage below then reads its own section's evidence at its own depth.

**Which form each thing goes out as is not a stylistic choice** — a fact read off the system is a check, a gap the stage noticed is a proposal, and something nobody has decided is a question (`../../hora/references/asking.md`).

**Default to the question tool, with the likely answer first.**

### Acceptance criteria are drafted by the stage that writes the section

**A section's owner writes its `<!-- acceptance -->` block, in the same approved write as the section itself** — stage 1 for the feature sections, stage 4 for the sections its design owns, stage 5 for the screens. **Stage 6 is the one stage that adds to another stage's block**: one refusal criterion per operation whose refusal matters, proposed and approved like any other text.

**Draft them; never demand them blank.** Whoever wants the product rarely arrives with observable criteria, so the stage derives them from the use cases and puts the draft out **as a proposal** (`../../hora/references/asking.md`). A person handed an empty block writes none, and the missing block is `blocking: yes` at stage 7.

**A block holds only what its own feature's gate can check, and what reaches further belongs to stage 2** (`../../hora/references/spec-format.md`, "A criterion is checked at its own feature's gate"). **The stage that drafted it records it and hands it over; it never places it and never drops it**, because placing it needs the order, and the order is stage 2's. **This binds every stage that writes a block** — 1, 4 and 5 alike.

---

## What sends a run back into a stage

| What was found | Returns to |
|---|---|
| a document or a repository nobody declared, turning up mid-run | **0** |
| a use case nobody stated, or one that turns out to be wrong | **1** |
| a feature that belongs in a later release, or one that has to come forward | **2** |
| a criterion or a use case that reaches a feature built after it, or an order that contradicts a `depends` | **2** |
| a number that makes the design wrong (ten times the users, a heavier operation) | **3** |
| a use case the data model cannot represent, or that no operation can complete | **4** |
| a use case with no screen path, or a screen with nothing behind it | **5** |
| an operation with no stated caller | **6** |
| a `_divergence.md` row with a blank `Routed to` | **the stage that owns its subject** — the rows above decide which (`investigation.md`) |

**`/hora-plan` and `/hora-build` use this table too.** A finding at checkpoint 2, 9, 11 or 18 that turns out to be a shortfall in the spec comes back to `/hora-spec`, at the stage this table names.

---

# Stage 0. Assets and sources

| | |
|---|---|
| **Skill** | **none — `/hora-spec` runs it itself.** It gathers and decides nothing |
| **Delegate to** | nothing. Reading a tree is not a procedure the package holds |
| **Exit condition** | everything readable has been read at breadth — the repositories that exist, every document anybody named, and whatever sits in `request/`; each document is declared `Sources` or `Annex` with somebody vouching for it; a request is confirmed as this version's agenda and belongs to neither table; what was read has been confirmed per section; `.hora/spec/<version>/_assets.md` is written; and, where documents and code both exist, every disagreement between them is a row in `.hora/spec/<version>/_divergence.md` |
| **Not applicable when** | **never.** A new project passes it by recording that there was nothing to read |
| **Carried over when** | **never.** On a diff version what this stage establishes is exactly what moved: a release shipped, the repositories changed, and somebody dropped a request in. Its cheapest form is reading `request/` and what changed since the previous version's `_assets.md` — **the tree wins over that file** |
| **Writes** | `Sources` and `Annex` (once confirmed), `.hora/spec/<version>/_assets.md`, and — where documents and code both exist — `.hora/spec/<version>/_divergence.md`, **its every `Routed to` cell left blank** (`investigation.md`) |
| **Reads** | everything, at breadth. No deeper than "what exists". **`request/` first** — what somebody wants is the agenda the seven stages then work through (`investigation.md`) |

**`references/investigation.md` is the authority on this stage.**

**This stage exists because dictation does not scale.** **The system is the better witness for what it does, and no witness at all for what anybody wanted** — so stage 0 reads the first kind and puts it back as something to correct.

**Nothing it reads becomes a requirement.** A draft goes out as a check, and only what somebody confirms is written (`../../hora/references/structure.md`, "This forbids inferring. It does not forbid reading").

**Ask what exists somewhere a session cannot reach.** The document that would have settled stage 4 is regularly on a wiki nobody mentioned.

---

# Stage 1. Use cases and actors

| | |
|---|---|
| **Skill** | `/hora-spec-usecases` |
| **Delegate to** | the skills covering how a rough request becomes stated requirements, observable criteria and an out-of-scope list; and the skills covering the shared UI/UX project context both UI skills later read (app type, users, scope) |
| **Exit condition** | every actor is named, with how they are identified; every use case is one person completing one thing end to end; every feature this release will build carries at least one use case; **every block it wrote holds only what that feature's own gate can check, with whatever reached further recorded for stage 2**; and the project name is written — **a section carrying `<!-- baseline: inventoried -->` excepted, which exits with a name, one line of prose and its `built:` value, and neither block, plus one recorded listing decision naming whoever made it** (`../../hora/references/spec-format.md`, "`baseline`") |
| **Not applicable when** | never |
| **Carried over when** | **the actors are unchanged and this version adds no feature.** Otherwise it runs **on what this version adds alone**: the features already in the resolved document are not re-agreed to. **A new actor or a new role is never a carry-over** |
| **Writes** | `Document information` and the project name, `Actors and roles`, `Terminology and domain concepts`, `Existing assets` — its `Authority` and `Baseline` lines included — and each feature section's `<!-- usecases -->` and `<!-- acceptance -->` blocks, its `<!-- built: -->` annotation, and its `<!-- baseline: -->` annotation where the document declared `inventoried` |
| **Reads** | the operation and screen surface, for the **feature list** it implies and the **actor candidates** the role checks imply. Never for what a feature is *for* — **except under `Authority: as-built`, where the screen-to-operation paths and the existing tests are the material use cases and acceptance criteria are drafted from, as checks** (`../../hora-spec-usecases/SKILL.md`, "Drafting use cases from the running system") |

**A feature list is not a use case list, and the difference is the whole point of this stage.** "Attendance management" is a heading; "a member of staff who forgot to clock in files yesterday's hours the next day, and their manager sees it waiting for approval" is a use case. Three checkpoints and the acceptance review each read the second kind and can do nothing with the first.

---

# Stage 2. The horizon

| | |
|---|---|
| **Skill** | `/hora-spec-horizon` |
| **Delegate to** | the skills covering the out-of-scope list, and what makes a requirement decided rather than assumed |
| **Exit condition** | three separate lists exist — built this time, out of scope for now, permanently out of scope — every "for now" entry names what unblocks it, and every one that needs the design kept open names the seam to keep replaceable; **the build order puts every feature after the features it depends on**; and **the version's own acceptance criteria are written, `none` where there are none, every criterion carrying `spans:`** |
| **Not applicable when** | never |
| **Carried over when** | **effectively never on a version that adds anything.** Adding a feature *is* a change of horizon. **"Built this time" always names this version's own contents** |
| **Writes** | `Implementation scope`, in three parts, `Implementation plan`, and **`Version acceptance criteria`** |
| **Reads** | nothing new. **What to build next is a decision, and no repository holds one.** The one thing it reads is what stage 1 held back: the criteria that reached past the feature they were drafted for |

**The two kinds of out-of-scope are not a formality.** "For now" makes `/hora` leave an extension point; "permanently" makes it exclude the thing from the design.

**This is also the stage that says no.** A release carrying twenty features is the normal failure of this whole process, and narrowing it is cheapest here (`principles.md`, "A release carrying too much is the normal failure").

**A listed section names nothing to build, and it belongs in none of the three lists.** This version builds and accepts no part of it, there is nothing to unblock, and nothing was excluded from the design. **What this stage does with it is leave it alone** (`../../hora/references/spec-format.md`, "`baseline`").

---

# Stage 3. Non-functional requirements

| | |
|---|---|
| **Skill** | `/hora-spec-nonfunctional` |
| **Delegate to** | **nothing in the package owns this.** No skill states what a project's user count or availability target should be |
| **Exit condition** | initial and foreseen user counts, the heaviest single operation, the availability expectation, how long data is kept, and the security level are written — as numbers wherever a number exists — and the middleware the project needs is declared with each server's version |
| **Not applicable when** | never |
| **Carried over when** | **the numbers still hold, confirmed one by one against what this version adds.** This is the most common carry-over of the seven. **The heaviest single operation is the exception, and it is asked every time** — a new feature is precisely what moves it. Middleware a new feature needs is likewise never a carry-over |
| **Writes** | `Non-functional requirements`, `Manual verification` |
| **Reads** | the row counts, the retention already in place and the services the stack runs, **as today's numbers**. Under `Authority: as-built` those go up as one batched check. **What the product must carry tomorrow is nobody's to read** — the foreseen counts and the availability expectation are asked, always |

**A number here changes the design at stage 4; an adjective does not.** "It should be fast" produces nothing. "Two hundred staff now, five thousand within two years, and the monthly close reads every record for the month" decides whether a total is stored or recalculated.

**This stage names the heaviest operation on purpose.** A single heavy operation is the thing that has to be able to scale alone, and it is nearly always known this early.

---

# Stage 4. Data, API and execution

| | |
|---|---|
| **Skill** | `/hora-spec-backend` |
| **Delegate to** | the skills covering each of: the logical shape of a table (what to normalize, how to hold a status, a time, a history); SDL, type and field naming, nullability, enums, pagination; a REST renderer's route and version; whether work belongs in the request path, in a post-worker or in a background job; a queue, a schedule, a retry; a side effect after the response; what an endpoint is and what its auth filter does |
| **Exit condition** | the repository layout and the server table are declared; every use case from stage 1 can be walked against the data model and the operation list, step by step, without a gap; every operation states its kind; and every write states whether it completes inside the request or runs as a job |
| **Not applicable when** | never. A version with no backend row still has to declare that |
| **Carried over when** | **this version adds no table, no operation and no job.** Otherwise it runs **on the new ones alone**, reading the existing model as context. **A new repository row or a new server is never a carry-over** |
| **Writes** | `Repository layout` and its server table, `Data model`, `GraphQL`, `RESTful API`, `Background jobs`, and `Key file map` where anything about placement is known — with the `<!-- acceptance -->` blocks those sections carry |
| **Reads** | **deeply** — migrations, models, SDL, REST routes, job definitions and the entry points. The whole existing data model and operation list can go out as one check per area |

**Walking the use cases is the exit condition, not a review step.** A data model that is internally tidy and cannot represent one stated use case passes every other check in this document. Stage 7 walks them again; this stage walks them first, while changing a table still costs a sentence.

**An operation's kind is never inferred** — `/hora-build` branches on the value at three separate checkpoints. Ask, and write what was said.

---

# Stage 5. Screens and interaction

| | |
|---|---|
| **Skill** | `/hora-spec-frontend` |
| **Delegate to** | the skills covering the shared UI/UX project context file that the UI generator and the UI auditor both read; and the skills covering what a screen has to account for to be correct by construction — states, empties, failures, accessibility, tokens |
| **Exit condition** | every use case names the screens it passes through, in order; every screen names the operations it calls; nothing on a screen lacks an operation behind it, and no operation is unreachable from every screen — **every one of those read over the screens this version specifies, a section carrying `<!-- baseline: inventoried -->` excepted, which exits with its inherited screens as one line each — the screen's name, who reaches it, and the feature it belongs to where a use case would be — no `Calls` table, no state list, neither block, and no screen section of its own** (`../../hora/references/spec-format.md`, "`baseline`") |
| **Not applicable when** | **this version declares no frontend repository** — an API-only release for a phone app. State the reason, and say which consumer the API is for instead |
| **Carried over when** | **this version adds no screen and changes none.** Otherwise it runs on the new ones alone — **and on every existing screen the new operations touch**, which is the part a diff hides |
| **Writes** | `Screens` — each screen section's `<!-- usecases -->` and `<!-- acceptance -->` blocks included — and the per-screen use-case mapping |
| **Reads** | **deeply** — the pages, the routes and which operations each screen calls. **What is absent is the finding**: the empty, failed, waiting and forbidden states a screen does not handle, each of which goes out as a proposal, never as a check |

**Unreachable in either direction is a defect, and both directions are checked here.** An operation no screen calls is either a missing screen or a feature nobody wants; a button with no operation behind it is a screen designed against a backend that does not exist.

**Both are read over what this version specifies, and a listed section sits outside them.** Its operations were recorded by stage 4 and justified by the feature's name, and its screens are inherited lines with no `Calls` table — read as ordinary rows, every one of those operations would look unreachable. **The running product already connects the two** (`../../hora-spec-frontend/SKILL.md`, which states the same reach).

---

# Stage 6. Security

| | |
|---|---|
| **Skill** | `/hora-spec-security` |
| **Delegate to** | the skills covering the security audit — **the authority on what kinds of defect exist**: injection, missing or over-broad auth, exposure, secrets, CORS, rate limiting, logging and PII, uploads, error leakage. They audit code, not a document, so what is borrowed here is the list of kinds, never a verdict. Plus the skills covering what an endpoint's auth filter is, and what a public-operation allowlist means |
| **Exit condition** | every operation names who may call it and what happens when somebody else does; every screen names who may open it; every piece of personal or regulated data is named as such; and the choice between roles on one endpoint and separate endpoints has a written reason |
| **Not applicable when** | never. A release with no authentication at all still has to say that, and why |
| **Carried over when** | **never, for anything this version adds.** Every new operation and every new screen states its caller and its refusal at the version that introduced it. Operations this version does not touch carry over untouched — that is the only part that is free |
| **Writes** | the caller and permission of every operation, the security rows of `Non-functional requirements`, the reason recorded against the endpoint split — and the refusal criteria it adds to other stages' `<!-- acceptance -->` blocks, the one write into another stage's section any stage is allowed |
| **Reads** | **deeply** — the auth filters, the role checks and the public-operation allowlists, to establish **who may call each operation today.** That is a fact and goes out as a check. **Who *should* be able to is a decision nobody has made yet**, and it goes out as a question, one per operation whose current answer surprises anybody |

**Authorization is the thing most often left unsaid, and the most expensive to add late.** An operation whose caller was never stated gets implemented with whatever filter its neighbours had.

**A stated reason for the endpoint split is part of the exit condition, not documentation.** The next version's new role is decided against that reason or against nothing.

**A listed feature's operations get this stage's full work, undiminished.** Listing suspends exactly two checks, and neither is this stage's (`../../hora/references/spec-format.md`, "`baseline`"). **Anything reachable without authentication is still asked about one operation at a time**, never batched.

**What changes is only where the refusal is written: the operation's own row, never an appended criterion.** A listed section has no `<!-- acceptance -->` block to append to, and writing one would produce a criterion nothing will ever verify. The version that pays the debt writes the block, and this stage's refusal criteria land in it then.

---

# Stage 7. Whole-document review

| | |
|---|---|
| **Skill** | `/hora-spec-review` |
| **Delegate to** | the skills covering whether a criterion is observable; the skills covering end-to-end test specification (**not run here** — but the acceptance criteria this stage settles are what they later derive scenarios from); and the skills covering how the document itself is written |
| **Exit condition** | every required section is present; every feature carries use cases and acceptance criteria, each one observable — **a section carrying `<!-- baseline: inventoried -->` excepted, which carries a name and one line and neither block, and every one of those is counted and named**; every use case is satisfiable by what stages 4 to 6 designed; **no feature's block reaches a feature built after it, and the version's own acceptance criteria are present — `none` or every criterion carrying `spans:`, and every one that reaches a listed feature carrying `rests on:`**; the two out-of-scope lists still match the design; every `id` is unique; no two statements in the document contradict each other; and **every row of `_divergence.md` names where it was routed** |
| **Not applicable when** | never. **This is the stage that makes the other six mean anything** |
| **Carried over when** | **never, and on a diff version it reads the RESOLVED document rather than the diff.** A new operation that contradicts something 1.0.0 wrote is invisible in a diff and plain in the resolution. **A carry-over any earlier stage claimed is checked here** |
| **Writes** | whatever the review changes, in the section that owns it, through the stage that owns it |
| **Reads** | the document against itself, and **`_assets.md` against the document** — anything stage 0 recorded as read but not settled that no stage ever settled, **a line of a request nobody placed included** |

**A shortfall found here is fixed by the stage that owns it, not patched in place.** Stage 7 does not write a use case; it sends the run back to stage 1 and says why.

**Run the mechanical checks first, then the reading.** The mechanical ones are cheap and precise — a missing required section, an operation with no kind, a duplicate `id`, a feature with no acceptance criteria, a file nothing links to.

**A listed section is mechanical in both directions.** That it carries neither block raises nothing — that is what the declaration bought. That it carries *anything else* is a stop: a usecases block, an acceptance block, a screen section or a data-model table of its own means somebody specified a feature the document says nobody will verify.

**Counting them is part of the exit condition**, because the count is what `/hora-plan`'s `## Not accepted` entries and every acceptance verdict's `not-accepted:` line are checked against.

---

## References

| File | Content |
|---|---|
| `investigation.md` | **stage 0's authority** — what may be read, what reading never settles, `Sources` and `Annex`, `_assets.md` |
| `../../hora/references/asking.md` | **a check, a proposal or a question** — and the question tool every stage defaults to |
| `principles.md` | the thinking every stage applies, and the boundary against the package's design skills |
| `../SKILL.md` | how a stage is run, the approval rule, the state file |
| `../../hora/references/spec-format.md` | **the authority on the format** every stage writes into |
| `../../hora/references/structure.md` | the invariants, the division of labor, the language rule |
| `../../hora-build/references/checkpoints.md` | the eighteen checkpoints, and the four that can send a run back here |
