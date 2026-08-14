---
name: hora-spec-usecases
description: Stage 1 of /hora-spec. Fix who uses the product and what each of them completes end to end, and — where something already runs — how far each feature is built and whether it is specified or only listed. Writes the document information, the actors, the terminology, the existing assets, and every feature's two blocks. Invoked by /hora-spec, or directly.
---

# hora-spec-usecases

**Stage 1 of `/hora-spec`.** Nothing else in a spec can be decided until this is: a table has nothing to hold, an operation has nobody calling it, and a screen has no reason to exist.

Read `../hora/references/structure.md` and `../hora-spec/references/principles.md` first. **`../hora-spec/references/stages.md` is the authority on this stage's exit condition**, and `../hora/references/spec-format.md` on the format of everything written here.

---

## What this stage decides

```
who uses this product, what each of them is called, and how each is identified
what each of them comes here to complete, start to finish
which of those this release will serve at all
what the product is called
what the words mean
what already exists, whether it may be used, and how much of it this version accepts
```

## What it must not decide

| | Whose it is |
|---|---|
| which table holds any of it | stage 4 |
| which operation serves a use case | stage 4 |
| which screen a use case passes through | stage 5 |
| whether a use case is in this release or the next | **stage 2** — this stage collects them all, including the ones that will be deferred |
| where a behavior that spans several features is checked | **stage 2**, which holds the order. This stage hands it over rather than placing it |
| what a role may and may not do, operation by operation | stage 6 |
| a class name, a table name, an identifier | **`/hora-plan`.** A term and its description are all that belongs here |

**Collect more than this release will build.** A use case that stage 2 defers is what stage 2 weighs, and it is where stage 3's foreseen numbers come from.

---

## The conversation

**Where stage 0 found something running, start from what it read, not from a blank page.** Put the implied feature list and actor candidates up **as checks**, batched per area. A conversation about a list somebody is amending is far shorter than one about a list they must produce (`../hora-spec/references/investigation.md`).

**What no surface implies is question 1, 3, 5 and 6.** Why it exists, what somebody is trying to accomplish, what they do without it, and what must never happen are not in any tree.

**Ask in this order.** Each answer narrows the next question.

```
1. What is this for, in one sentence? Who is worse off if it does not exist?

2. Who uses it? For each one:
     what do you call them (their word, not a generic one)
     how are they identified — a login, an invitation, a device, nothing at all
     roughly how many of them
     inside the organisation, or outside it

3. For each of those: what do they come here to do?
     Push for whole sentences. "Attendance" is a heading; "a member of staff
     who forgot to clock in files yesterday's hours the next day" is a use case

4. Which of those happens every day, and which once a month?

5. What do they do today, without this? Is there code, and may it be used?
   And where there is code: when it and the spec disagree, which one is right —
   as-built (what runs is what this version is) or to-spec (the spec is; the
   code catches up)? And how much of what already runs does this version's tag
   claim — verified (every inherited feature specified and accepted before it)
   or inventoried (a feature may be listed unaccepted, one at a time)?

6. What must never happen?

7. What is the product called?

then, before 8, and only where Baseline: inventoried was declared: which
features are listed rather than specified? Per feature, four at a time, and
never an option inside 8 (below)

8. Only where something is already running: how far is each feature actually
   built? Under as-built the derived table goes up whole, then each feature
   is confirmed by selection; under to-spec it is never asked; without a
   declaration, it is asked per feature, open (below)
```

**Question 3 is the stage.** Everything else supports it.

| Push for | Away from |
|---|---|
| who is doing it | "the system does X" |
| what they are trying to achieve | "there is a button for X" |
| where it starts and where it is done | a step in the middle, with no beginning |
| enough that somebody with no access to the code could follow it | selectors, endpoints, table names |

**Question 4 is not small talk.** Frequency decides what a screen puts first at stage 5, and the once-a-month operation that touches everything is usually the heaviest one stage 3 is about to ask for.

**Question 5 has four parts wherever code exists, and two on a new project.** What exists; whether it may be read (**which one it is may never be inferred** — `../hora/references/structure.md`, invariant 2); **which side is authoritative when the code and the spec disagree**; and **how much of what already runs this version's tag claims** (`../hora/references/spec-format.md`, "Existing assets"). One question each, two options each, and `Authority` is overridable per feature (`<!-- authority: -->`).

**The last two are both asked before question 8, never after, because each decides how question 8 is asked at all.** `Authority` decides its shape — a derived table to confirm, or an open question per feature. `Baseline` decides whether the listing question is asked at all, and what a `built:` answer then does: acted on, or merely recorded.

**`verified` is required wherever code exists, and it is what adoption has always done.** Writing the line down turns it from an unstated default into a choice somebody made; `inventoried` is that choice going the other way.

**Both lines are approved in prose, on their own, and neither is ever folded into an option** (`../hora/references/asking.md`). **`Baseline` carries one rule beyond that**: it goes into `spec.md` itself, since a declaration that leaves features unaccepted is legitimate only while every later reader sees it (`../hora/references/spec-format.md`, "Required sections").

**Question 6 becomes one of three things**: an acceptance criterion in the owning feature's block, a permission at stage 6, or — where the answer is about the product rather than one feature — a criterion handed to stage 2. Write the answer down where it is given; do not decide yet which it becomes.

**Question 7's answer becomes the prefix of every repository name.** Confirm the spelling — changing it renames every repository.

---

## The listing question — asked before question 8, and never inside it

**Asked only where `Baseline: inventoried` was declared.** Under `verified` there is nothing to ask. Where the permission exists, each feature gets one of two answers — **specified this version**, or **listed: not specified, and not accepted** (`../hora/references/spec-format.md`, "`baseline`").

**It is never an option inside question 8, and that is a rule about form.** Under `as-built`, question 8's options are **checks** on a value derived from the tree. "This feature will not be verified" is a decision, not a reading — put beside three derived gates it becomes a proposal wearing a check's clothing, and nothing afterwards distinguishes the two (`../hora/references/asking.md`, "What is never asked").

**Lay out the evidence, batch at most four features per exchange, and recommend nothing.** `Authority: as-built` lifts nothing here.

```
"Baseline: inventoried lets a feature be listed rather than specified. For
 #payroll stage 0 found 6 resolvers, 2 migrations, 4 screens and no tests.

   specified   its use cases and its acceptance criteria get written this
               version, and acceptance covers it
   listed      a name and one line. No checkpoint of it is ever marked, no
               acceptance run has it in scope, and the version that next
               changes it writes both blocks then"
```

**One yes over a table of seventeen features is not an answer, and it is forbidden by name** (`../hora/references/structure.md`, invariant 1). Four per exchange, each one selected.

**Question 8 still runs for a listed feature, and its answer lands differently.**

| A feature answered | What question 8 then does with it |
|---|---|
| **specified** | writes `built:` at the confirmed gate, and the mapping applies — the checkpoints that gate covers go not applicable, 18 stays open |
| **listed** | still asks, and `built:` is still **required** — but the value is **recorded, not acted on.** Nothing is marked, and the version that pays the debt restates it and has it confirmed |

**Record every listing decision in `.hora/spec/<version>/_stages.md`, with the name of whoever made it.** The annotation says a feature is unaccepted; nothing in `specs/` says who chose that, or against what evidence — and paying the debt later begins by asking exactly that.

---

## Question 8 — `built:`, and how the `Authority` answer changes its shape

**`built:` records how far a feature was implemented before Hora Kit was adopted**, and it is what lets an existing product be accepted rather than rebuilt (`../hora/references/spec-format.md`).

**Skip question 8 entirely where stage 0 found nothing running.**

**Question 5's `Authority` answer decides which of the two shapes below this takes.** A `to-spec` feature is skipped in both: it never carries `built:`, and its checkpoints all run. **What it gets instead is not silence** — its use cases are settled in conversation and its divergences routed, put to the person per feature with prepared options, but **with more of the answer left to them**.

### Under `as-built`: present the derived table whole, then confirm feature by feature

**The declaration already answered the direction; what remains is each feature's gate, and the exceptions.**

```
"You said the implementation is authoritative. Stage 0 found code for all
 20 features. The gates I derived from the tree:

   #attendance    frontend   (screens call its resolvers)
   #export-api    backend    (no screen calls it)
   ...

 I will confirm each one with you below — answer `not finished` on any
 feature still being worked toward a spec rather than describing itself."
```

**Then confirm feature by feature, by selection, with the derived gate as the default.** Four features per exchange; every feature's options are the derived gate first, the other gates, and `not finished (to-spec)`. The person mostly selects — composing is never asked for.

A feature answered `not finished` becomes `<!-- authority: to-spec -->` — no `built:`, all checkpoints open. **The derivation is allowed by the declaration and by nothing else** (`../hora/references/asking.md`, "What is never asked"), and every derived value is still confirmed before it is written.

**Over-declaring is the recoverable direction** (below), which is why drafted defaults are safe here.

### Where no declaration exists: asked, never concluded

**No amount of reading settles it.** A half-built screen and a finished one look identical from a file listing. **Offer the evidence and leave the choice open — do not recommend an option.**

```
"For #attendance I found: 4 resolvers, a migration, 31 tests, and two screens
 that call them. What the tree cannot tell me is whether that is finished.

   spec       the specification exists; no code does
   backend    the backend work is there
   frontend   the frontend work is there too
   not built  none of it counts as done"
```

**This and the listing question are the only two things in this stage asked per feature rather than per area.** Each is a different answer per feature, and getting one wrong changes which seventeen gates run — or whether any of them runs at all.

**Use the question tool**, four features per exchange, with `not built` always present as an option.

### Which way an error goes

| Wrong how | What follows |
|---|---|
| declared built, but it is not | **acceptance fails it**, the marks are cleared, and it is built for real. The safe direction |
| not declared, but it is | seventeen gates run against finished code. Nothing breaks; the time is spent confirming what a declaration would have settled |

**Checkpoint 18 is never covered by any value.** Whatever is answered, acceptance still runs.

---

## Break it down, then propose

**A request arrives as a feature list, because that is how the person has been thinking about it.** Turning it into things somebody completes is this stage's work, not theirs.

```
they said     "attendance management, approval, payroll"

you return    - a member of staff clocks in on arrival, and the day's hours
                appear in their list
              - a member of staff who forgot to clock in files yesterday's
                hours the next day, and their manager sees it waiting
              - a manager approves a month's attendance in one pass, and the
                totals lock
              - an administrator exports a locked month for payroll
```

**Then say what is missing, and what could be better.** This is required, not optional (`../hora-spec/references/principles.md`):

| Look for | Because |
|---|---|
| the actor nobody mentioned | somebody has to correct a mistake, and it is rarely the person who made it |
| the flow that is two screens longer than it needs to be | the shortest version is usually available and nobody asked for it |
| the role that is really two roles, or the two that are really one | this is what stage 6's endpoint decision turns on |
| the case with no way back — an approval with no un-approval, a lock with no unlock | it is found at acceptance otherwise, and by then a screen exists |
| the first-run case: no data, no users, nobody set anything up yet | every product has one and no request ever mentions it |

**Mark every one of them as a proposal, and wait.**

---

## Delegates

**This table lists work, not names.** Match each row against the equipped skills' own descriptions when you reach it (`../hora/references/structure.md`, "No hora file ever names one of those skills").

| What is needed |
|---|
| turning a rough request into stated requirements, observable criteria and an out-of-scope list |
| the shared UI/UX project context file the UI generator and the UI auditor both read later — app type, users, scope |

**Invoke what you matched; do not summarize it here.** If nothing equipped covers a row, say so by the work it names, carry on without it, and record the gap.

---

## What it writes

**Show each section in full, say which lines are proposals, and wait for approval before writing** (`../hora-spec/SKILL.md`).

### Document information, and the project name

```markdown
| Item | Content |
|---|---|
| Product version | 1.0.0 |
| Document revision | 1 |
| Author | <the person in the conversation> |
| Question language | Japanese |
```

**`Question language` is asked, not assumed.** It stays in a file that somebody else reads (`../hora/references/structure.md`, "What language to write for humans").

### Actors and roles

```markdown
| Actor | Identified by | Roughly how many | Inside / outside |
|---|---|---|---|
| member of staff | an email and password issued on hire | 200, 5000 foreseen | inside |
| manager | the same login, with a `manager` role | 20 | inside |
| administrator | a separate login, issued by us | 3 | inside |
```

**This table is what stage 4's endpoint decision and stage 6's permissions are both read from.** A missing actor is an authentication mechanism nobody designed.

### Use cases, per feature

One `<!-- usecases -->` block per feature section, or **once on a feature file's H1** where the feature spans several `##` sections.

```markdown
### Use cases
<!-- usecases -->

- a member of staff clocks in on arrival, and the day's hours appear in their list
- a manager approves a month's attendance in one pass, and the totals lock
```

**Where something is already running, the feature's `built:` annotation is written here too**, from question 8's answer and from nowhere else:

```markdown
## Attendance
<!-- id: attendance -->
<!-- target: backend, frontend-admin -->
<!-- built: frontend -->
```

**Absent is a valid and common state** — it is what every feature on a new project carries.

**A listed feature carries `<!-- baseline: inventoried -->` beside its `built:` value**, written from the listing question's answer and from nowhere else. **`built:` is not optional there**: without it the section could as easily be a feature nobody ever built (`../hora/references/spec-format.md`, "`baseline`").

**A feature carrying `built:` still needs its use cases and its acceptance criteria — unless it is listed**, in which case it carries a name, one line of prose, its rows in the data model and the operation list, and one line in the screens section of each repository its screens belong to (`../hora-spec-frontend/SKILL.md`). Checkpoint 18 verifies against those two blocks, so a built feature with neither has nothing to be accepted against. **A listed feature is the exception because nothing accepts it either.**

### Drafting use cases from the running system — under `as-built` only

**The twenty use-case blocks are the real cost of adopting, not question 8.** A person asked to compose them from memory for twenty features that already work is being asked to dictate. Under `Authority: as-built` they do not compose; **this stage drafts, and they correct.**

| | |
|---|---|
| **Allowed for** | features covered by `as-built` — the declaration, or their own `<!-- authority: -->`. **Nothing else** |
| **Drafted from** | the screen-to-operation paths stage 0 read, the role checks on them, and what the existing tests exercise |
| **Put up as** | **checks** — "these are the paths the system carries; is that what people do with it?" — three or four features per exchange |
| **Forbidden for** | **a `to-spec` feature, always.** There the code is unfinished work toward a spec, and a use case drafted from it canonizes the state the spec exists to move past |
| **Forbidden for** | **a listed feature, always — nothing is drafted for it at all.** A criterion derived for a feature nothing will ever verify reads exactly like a criterion somebody accepted. Its one line of prose is a reading, put up as a check like any other |

**Why a check and not a proposal, and why that is safe here and nowhere else:** the person who wrote `as-built` declared the running system to be the requirement. After that, "this is what the system carries" and "this is what is wanted" are the same claim — which is what makes the same draft a **proposal** everywhere else.

**A drafted use case still cannot say what a path is *for*.** Where the purpose is not legible from the path, ask.

**Acceptance criteria draft from the existing tests, and only from tests that exist.** What a test asserts is observable by construction. **A feature with no tests gets no drafted criteria — ask instead**: "the tests pass" is not "it is right".

**That unbatchable question is the cost listing actually removes**, and it is worth saying plainly so somebody can decline the setting. An untested feature's criteria have to be composed in conversation, one feature at a time, with nothing to correct. **So listing pays for itself in proportion to how untested the inherited product is, and buys close to nothing on a well-tested one.**

### Acceptance criteria, per feature

One `<!-- acceptance -->` block per feature section, beside the use cases — the format requires both, and a missing block is `blocking: yes`.

**Draft them and propose them; never hand over an empty block to fill.** Derive each one from a use case or a stated must-never-happen, keep it observable, and put the draft out **as a proposal** (`../hora/references/asking.md`). Stage 6 later appends a refusal criterion per operation whose refusal matters.

```markdown
### Acceptance criteria
<!-- acceptance -->

- clocking in twice on one day is refused, and the second attempt changes nothing
- a manager's approval locks the month: no clock-in for it succeeds afterwards
```

**A criterion written here is checked at this feature's own gate, so it may only reach what that feature adds and what its `depends` already provide** (`../hora/references/spec-format.md`, "A criterion is checked at its own feature's gate"). The same holds for a use case.

**A behavior that reaches further is written down and handed to stage 2, never placed here and never dropped.** This stage has no order to place it against — reordering two features can turn what looked like a cross-feature behavior into an ordinary criterion.

```markdown
Held for stage 2 — reaches past its own feature

| Drafted for | The behavior | Reaches |
|---|---|---|
| #sign-up | a signed-up user appears in the admin's list | #user-admin |
```

**Write that list into `.hora/spec/<version>/_stages.md`, and name it in the closing report.**

**Say which it is when the draft goes out.** A criterion put up as a proposal and a behavior being handed to the next stage are two different things to approve.

**The drafting routes are where these appear most.** Under `as-built` an integration test spanning four features reads exactly like a criterion for whichever feature the reader started from. Question 6's "what must never happen" is the other one: "a deleted employee must never appear anywhere" belongs to the version rather than to the first feature it was mentioned beside.

### Terminology, and existing assets

```markdown
| Term | Description |
|---|---|
| clock-in | the record a member of staff creates on arrival |

Current implementation: `acme-attendance` (visible, read-only access granted)
Treatment: reference it — match the behavior, rewrite the implementation
Authority: as-built — what runs is what this version is
Baseline: verified — every inherited feature is specified and accepted before the tag
```

**The `Authority` line is required whenever `Current implementation` is not `none`** — leaving it out is an `existing-assets` stop (`blocking: yes`). **The `Baseline` line is required under the same rule and stops the same way**, and it is the one line a declared `Source` may never satisfy.

**Terms only. No identifiers.** `/hora-plan` decides the class and table names, against the lint rules.

---

## Exit condition

Every actor named with how they are identified; every use case a whole sentence somebody could follow; every feature this release may build carrying at least one, and an `<!-- acceptance -->` block this stage drafted and got approved — **each block holding only what that feature's own gate can check, with everything that reaches further recorded and handed to stage 2**; the project name written; and — **where stage 0 found something running** — every feature carrying either a `built:` value somebody chose or a stated answer that it is not built.

**A section carrying `<!-- baseline: inventoried -->` is excepted from the use-case and acceptance halves of that, and from nothing else**: it exits with a name, one line of prose and its `built:` value. **What it owes instead is a recorded decision per listed feature**, naming whoever decided it. `../hora-spec/references/stages.md` is the authority.

**Where an actor or a use case cannot be settled because the person who knows is not here**, record it (`undefined-detail`, or `missing-authorization` where it is an actor's identification that is missing) and carry on. Do not invent one to keep the stage moving.

---

## References

| File | Content |
|---|---|
| `../hora/references/asking.md` | **a check, a proposal or a question** — and the question tool this stage defaults to |
| `../hora-spec/references/investigation.md` | what stage 0 read, and why `built:` is the one thing no reading settles |
| `../hora-spec/SKILL.md` | the approval rule, the state file, the closing report |
| `../hora-spec/references/stages.md` | this stage's exit condition, and what sends a run back into it |
| `../hora-spec/references/principles.md` | why a use case comes first, and why proposing is required |
| `../hora/references/spec-format.md` | "How to write use cases", and what each section holds |
| `../hora-spec-horizon/SKILL.md` | the next stage — which of these the release will actually build |
