# The seven stages

**The authority on the stage list.** `/hora-spec` copies the list from here into `.hora/spec/<version>/_stages.md`; each stage skill runs one of them.

**This file holds the order and the exit conditions. It does not hold a single design rule.** How a table is shaped, how an SDL is named, where a background job belongs and what a screen must account for all live in `@openreachtech/ai-agent-skills`, and each stage below states the *work* that skill covers. **Never write one of those rules into this file** — the copy would go stale the first time the package is updated, and nothing would announce that it had (`../../hora/references/structure.md`, "The division of labor").

**No stage below names a package skill, and none ever may.** A skill's name belongs to the package, which is free to change it, and a renamed skill does not announce itself — the name stops matching and the stage runs without its design rules while reporting that it passed. Each **Delegate to** row therefore says what has to be covered, and the main session matches that against the equipped skills' own descriptions when it enters the stage (`../../hora/references/structure.md`, "No hora file ever names one of those skills"). Every stage runs in the main session, so there is nobody else to make the match.

**`principles.md` is the other half of this file.** This one says what must be true before a stage is over; that one says what to weigh while getting there, and where the boundary against the package's own skills runs.

---

## What a stage is

A stage is **a gate with one exit condition**, exactly like a checkpoint. Passing it is not "we talked about it" — it is that a stated condition now holds, and that the section it owns is written into `specs/<version>/` with somebody's approval on it.

### Three states, and only three

```markdown
1. [ ] Use cases and actors                                    not passed
2. [x] The horizon                                             passed
5. [x] Screens and interaction  <!-- n/a: this version declares no frontend -->
```

**A stage may only be marked not-applicable with a written reason**, and the reason is checked against that stage's own "not applicable when" line below — never against "the requester did not want to talk about it". Five of the seven have no such line at all.

### The order is a rule

**No stage may be entered until every earlier one is `[x]`.** Each one's answers are the next one's input, and the cost of ignoring that is the work done twice (`../SKILL.md`, "The order of the stages is a rule").

### Every stage runs in the main session

**None of them may be delegated to a subagent.** Every one is a conversation, and a subagent cannot talk to anybody. The mechanical parts of stage 7 — checking that every required section exists, that every `id` is unique, that every operation states a kind — are the one exception, and even there the findings come back to the main session to be settled.

---

## What sends a run back into a stage

| What was found | Returns to |
|---|---|
| a use case nobody stated, or one that turns out to be wrong | **1** |
| a feature that belongs in a later release, or one that has to come forward | **2** |
| a number that makes the design wrong (ten times the users, a heavier operation) | **3** |
| a use case the data model cannot represent, or that no operation can complete | **4** |
| a use case with no screen path, or a screen with nothing behind it | **5** |
| an operation with no stated caller | **6** |

**`/hora-plan` and `/hora-build` use this table too.** A finding at checkpoint 2, 9, 11 or 18 that turns out to be a shortfall in the spec rather than in the code comes back to `/hora-spec`, at the stage this table names, instead of being patched line by line where it was found.

---

# Stage 1. Use cases and actors

| | |
|---|---|
| **Skill** | `/hora-spec-usecases` |
| **Delegate to** | the skills covering how a rough request becomes stated requirements, observable criteria and an out-of-scope list; and the skills covering the shared UI/UX project context both UI skills later read (app type, users, scope) |
| **Exit condition** | every actor is named, with how they are identified; every use case is one person completing one thing end to end; every feature this release will build carries at least one use case; and the project name is written |
| **Not applicable when** | never |
| **Writes** | `Document information` and the project name, `Actors and roles`, `Terminology and domain concepts`, `Existing assets`, and each feature section's `<!-- usecases -->` block |

**A feature list is not a use case list, and the difference is the whole point of this stage.** "Attendance management" is a heading; "a member of staff who forgot to clock in files yesterday's hours the next day, and their manager sees it waiting for approval" is a use case. Three checkpoints and the acceptance review each read the second kind and can do nothing with the first (`../../hora/references/spec-format.md`, "How to write use cases").

---

# Stage 2. The horizon

| | |
|---|---|
| **Skill** | `/hora-spec-horizon` |
| **Delegate to** | the skills covering the out-of-scope list, and what makes a requirement decided rather than assumed |
| **Exit condition** | three separate lists exist — built this time, out of scope for now, permanently out of scope — every "for now" entry names what unblocks it, and every one that needs the design kept open names the seam to keep replaceable |
| **Not applicable when** | never |
| **Writes** | `Implementation scope`, in three parts, and `Implementation plan` |

**The two kinds of out-of-scope are not a formality.** "For now" makes `/hora` leave an extension point; "permanently" makes it exclude the thing from the design. Read the first as the second and the structure cannot take it later; read the second as the first and an abstraction layer gets built that nobody uses.

**This is also the stage that says no.** A release carrying twenty features is the normal failure of this whole process, and narrowing it is cheapest here (`principles.md`, "A release carrying too much is the normal failure").

---

# Stage 3. Non-functional requirements

| | |
|---|---|
| **Skill** | `/hora-spec-nonfunctional` |
| **Delegate to** | **nothing in the package owns this.** No skill states what a project's user count or availability target should be, and none could |
| **Exit condition** | initial and foreseen user counts, the heaviest single operation, the availability expectation, how long data is kept, and the security level are written — as numbers wherever a number exists — and the middleware the project needs is declared with each server's version |
| **Not applicable when** | never |
| **Writes** | `Non-functional requirements`, `Manual verification` |

**A number here changes the design at stage 4; an adjective does not.** "It should be fast" produces nothing. "Two hundred staff now, five thousand within two years, and the monthly close reads every record for the month" decides whether a total is stored or recalculated, and whether one operation gets a seam of its own.

**This stage names the heaviest operation on purpose.** A single heavy operation is the thing that has to be able to scale alone, and it is nearly always known this early — which is the only reason a seam for it can be left cheaply rather than retrofitted.

---

# Stage 4. Data, API and execution

| | |
|---|---|
| **Skill** | `/hora-spec-backend` |
| **Delegate to** | the skills covering each of: the logical shape of a table (what to normalize, how to hold a status, a time, a history); SDL, type and field naming, nullability, enums, pagination; a REST renderer's route and version; whether work belongs in the request path, in a post-worker or in a background job; a queue, a schedule, a retry; a side effect after the response; what an endpoint is and what its auth filter does |
| **Exit condition** | the repository layout and the server table are declared; every use case from stage 1 can be walked against the data model and the operation list, step by step, without a gap; every operation states its kind; and every write states whether it completes inside the request or runs as a job |
| **Not applicable when** | never. A version with no backend row still has to declare that (`../../hora/references/spec-format.md`, "Repository layout") |
| **Writes** | `Repository layout` and its server table, `Data model`, `GraphQL`, `RESTful API`, `Background jobs`, and `Key file map` where anything about placement is already known |

**Walking the use cases is the exit condition, not a review step.** A data model that is internally tidy and cannot represent one stated use case passes every other check in this document. Stage 7 walks them again; this stage walks them first, while changing a table still costs a sentence.

**An operation's kind is never inferred** — query, mutation, subscription and REST renderer are four different conventions on both sides of the wire, and `/hora-build` branches on the value at three separate checkpoints. Ask, and write what was said.

---

# Stage 5. Screens and interaction

| | |
|---|---|
| **Skill** | `/hora-spec-frontend` |
| **Delegate to** | the skills covering the shared UI/UX project context file that the UI generator and the UI auditor both read; and the skills covering what a screen has to account for to be correct by construction — states, empties, failures, accessibility, tokens |
| **Exit condition** | every use case names the screens it passes through, in order; every screen names the operations it calls; nothing on a screen lacks an operation behind it, and no operation is unreachable from every screen |
| **Not applicable when** | **this version declares no frontend repository** — an API-only release for a phone app, say. State the reason, and say which consumer the API is for instead |
| **Writes** | `Screens`, and the per-screen use-case mapping |

**Unreachable in either direction is a defect, and both directions are checked here.** An operation no screen calls is either a missing screen or a feature nobody wants; a button with no operation behind it is a screen designed against a backend that does not exist. The acceptance review looks for exactly these two, at the far end of eighteen checkpoints.

---

# Stage 6. Security

| | |
|---|---|
| **Skill** | `/hora-spec-security` |
| **Delegate to** | the skills covering the security audit — **the authority on what kinds of defect exist**: injection, missing or over-broad auth, exposure, secrets, CORS, rate limiting, logging and PII, uploads, error leakage. They audit code, not a document, so what is borrowed here is the list of kinds, never a verdict. Plus the skills covering what an endpoint's auth filter is, and what a public-operation allowlist means |
| **Exit condition** | every operation names who may call it and what happens when somebody else does; every screen names who may open it; every piece of personal or regulated data is named as such; and the choice between roles on one endpoint and separate endpoints has a written reason |
| **Not applicable when** | never. A release with no authentication at all still has to say that, and why |
| **Writes** | the caller and permission of every operation, the security rows of `Non-functional requirements`, and the reason recorded against the endpoint split |

**Authorization is the thing most often left unsaid, and the most expensive to add late.** An operation whose caller was never stated gets implemented with whatever filter its neighbours had, and nothing in the code says that nobody ever decided.

**A stated reason for the endpoint split is part of the exit condition, not documentation.** `principles.md` holds what to weigh; what this stage records is which way it went and why, because the next version's new role is decided against that reason or against nothing.

---

# Stage 7. Whole-document review

| | |
|---|---|
| **Skill** | `/hora-spec-review` |
| **Delegate to** | the skills covering whether a criterion is observable; the skills covering end-to-end test specification (**not run here** — but the acceptance criteria this stage settles are what they later derive scenarios from); and the skills covering how the document itself is written |
| **Exit condition** | every required section is present; every feature carries use cases and acceptance criteria, each one observable; every use case is satisfiable by what stages 4 to 6 designed; the two out-of-scope lists still match the design; every `id` is unique; and no two statements in the document contradict each other |
| **Not applicable when** | never. **This is the stage that makes the other six mean anything** |
| **Writes** | whatever the review changes, in the section that owns it, through the stage that owns it |

**A shortfall found here is fixed by the stage that owns it, not patched in place.** Stage 7 does not write a use case; it sends the run back to stage 1 and says why. Patching in place is how a document ends up with a use case that no stage ever walked against a data model.

**Run the mechanical checks first, then the reading.** The mechanical ones are cheap and precise — a missing required section, an operation with no kind, a duplicate `id`, a feature with no acceptance criteria, a file nothing links to. What remains needs somebody to read the document as a whole, and it is worth arriving there with the cheap findings already cleared.

---

## References

| File | Content |
|---|---|
| `principles.md` | the thinking every stage applies, and the boundary against the package's design skills |
| `../SKILL.md` | how a stage is run, the approval rule, the state file |
| `../../hora/references/spec-format.md` | **the authority on the format** every stage writes into |
| `../../hora/references/structure.md` | the invariants, the division of labor, the language rule |
| `../../hora-build/references/checkpoints.md` | the eighteen checkpoints, and the four that can send a run back here |
