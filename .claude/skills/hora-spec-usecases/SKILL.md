---
name: hora-spec-usecases
description: Stage 1 of /hora-spec. Fix who uses the product and what each of them completes end to end, and — where something already runs — how far each feature is built and whether it is specified or only listed. Invoked by /hora-spec, or directly.
---

# hora-spec-usecases

**Stage 1 of `/hora-spec`.** Nothing else in a spec can be decided until this is: a table has nothing to hold, an operation has nobody calling it, and a surface has no reason to exist.

Read `../hora/references/structure.md` and `../hora-spec/references/principles.md` first. **`../hora-spec/references/stages.md` is the authority on this stage's exit condition**, and `../hora/references/spec-format.md` on the format.

---

## What this stage decides

```
who uses this product, what each is called, and how each is identified
what each of them comes here to complete, start to finish
what the product is called
what the words mean
what already exists, whether it may be used, and how much of it this version accepts
```

## What it must not decide

| | Whose it is |
|---|---|
| which table holds any of it, or which operation serves a use case | stage 4 |
| which surface a use case passes through | stage 5 |
| whether a use case is in this release or the next | **stage 2** — this stage collects them all, deferred ones included |
| where a behavior spanning several features is checked | **stage 2**, which holds the order |
| what a role may do, operation by operation | stage 6 |
| a class name, a table name, an identifier | **`/hora-plan`** |

**Collect more than this release will build.** A use case stage 2 defers is what stage 2 weighs, and it is where stage 3's foreseen numbers come from.

---

## The conversation

**Where stage 0 found something running, start from what it read, not from a blank page.** Put the implied feature list and actor candidates up **as checks**, batched per area. A conversation about a list somebody is amending is far shorter than one about a list they must produce.

**Ask in this order.** Each answer narrows the next question.

```
1. What is this for, in one sentence? Who is worse off without it?

2. Who uses it? For each one:
     what do you call them (their word, not a generic one)
     how are they identified — a login, an invitation, a device, nothing
     roughly how many
     inside the organisation, or outside it

3. For each of those: what do they come here to do?
     Push for whole sentences. "Attendance" is a heading; "a member of staff
     who forgot to clock in files yesterday's hours the next day" is a use case

4. Which of those happens every day, and which once a month?

5. What do they do today, without this? Is there code, and may it be used?
   Where there is code: when it and the spec disagree, which is right —
   as-built or to-spec? And how much of what runs does this version's tag
   claim — verified, or inventoried?

6. What must never happen?

7. What is the product called?

then, only where Baseline: inventoried was declared: which features are
listed rather than specified? Per feature, four at a time (below)

8. Only where something is already running: how far is each feature built?
```

**Question 3 is the stage. Everything else supports it.**

| Push for | Away from |
|---|---|
| who is doing it | "the system does X" |
| what they are trying to achieve | "there is a button for X" |
| where it starts and where it is done | a step in the middle, with no beginning |
| enough that somebody with no access to the code could follow it | selectors, endpoints, table names |

**Question 4 is not small talk.** Frequency decides what a surface puts first at stage 5, and the once-a-month operation that touches everything is usually the heaviest one stage 3 is about to ask for.

**Question 5 has four parts wherever code exists, and two on a new project.** **The last two are both asked before question 8, never after, because each decides how question 8 is asked at all.** `Authority` decides its shape; `Baseline` decides whether the listing question is asked and what a `built:` answer then does.

**`verified` is required wherever code exists, and it is what adoption has always done.** Writing it down turns an unstated default into a choice somebody made.

**Both lines are approved in prose, on their own, and neither is ever folded into an option.** `Baseline` goes into `spec.md` itself.

**Question 6 becomes one of three things**: an acceptance criterion in the owning feature's block, a permission at stage 6, or a criterion handed to stage 2. Write the answer down where it is given; do not decide yet which it becomes.

**Question 7's answer becomes the prefix of every repository name.** Confirm the spelling — changing it renames every repository.

---

## The listing question — before question 8, never inside it

**Asked only where `Baseline: inventoried` was declared.** Each feature gets one of two answers: **specified this version**, or **listed: not specified, and not accepted.**

**It is never an option inside question 8, and that is a rule about form.** Under `as-built`, question 8's options are **checks** on a value derived from the tree. "This feature will not be verified" is a decision, not a reading — placed beside three derived gates it becomes a proposal wearing a check's clothing.

**Lay out the evidence, batch at most four features per exchange, and recommend nothing.** `Authority: as-built` lifts nothing here.

```
"Baseline: inventoried lets a feature be listed rather than specified. For
 #payroll stage 0 found 6 operations, 2 migrations, 4 screens and no tests.

   specified   its use cases and acceptance criteria get written this version,
               and acceptance covers it
   listed      a name and one line. No checkpoint is ever marked, no acceptance
               run has it in scope, and the version that next changes it writes
               both blocks then"
```

**One yes over a table of seventeen features is not an answer, and it is forbidden by name** (`../hora/references/structure.md`, invariant 1).

**Question 8 still runs for a listed feature, and its answer lands differently.**

| A feature answered | What question 8 does with it |
|---|---|
| **specified** | writes `built:` at the confirmed gate, and the mapping applies |
| **listed** | still asks, `built:` is still **required** — but the value is **recorded, not acted on** |

**Record every listing decision in `_stages.md`, with the name of whoever made it.** The annotation says a feature is unaccepted; nothing in `specs/` says who chose that, or against what evidence — and paying the debt later begins by asking exactly that.

---

## Question 8 — `built:`, and how `Authority` changes its shape

**Skip it entirely where stage 0 found nothing running.**

**A `to-spec` feature is skipped in both shapes below:** it never carries `built:`, and all its checkpoints run. What it gets instead is not silence — its use cases are settled in conversation, with more of the answer left to the person.

### Under `as-built`: present the derived table, then confirm feature by feature

**The declaration already answered the direction; what remains is each feature's gate, and the exceptions.**

```
"You said the implementation is authoritative. Stage 0 found code for all
 20 features. The gates I derived from the tree:

   #attendance    consumer   (screens call its operations)
   #export-api    provider   (nothing calls it from a screen)
   ...

 I will confirm each one below — answer `not finished` on any feature still
 being worked toward a spec rather than describing itself."
```

**Then confirm by selection, four features per exchange, with the derived gate as the default** and `not finished (to-spec)` always among the options. The person mostly selects; composing is never asked for.

**The derivation is allowed by the declaration and by nothing else**, and every derived value is still confirmed before it is written.

### Where no declaration exists: asked, never concluded

**No amount of reading settles it.** A half-built surface and a finished one look identical from a file listing. **Offer the evidence and leave the choice open — recommend nothing.**

```
"For #attendance I found: 4 operations, a migration, 31 tests, and two screens
 that call them. What the tree cannot tell me is whether that is finished.

   spec       the specification exists; no code does
   provider   the provider work is there
   consumer   the consumer work is there too
   not built  none of it counts as done"
```

**This and the listing question are the only two things asked per feature rather than per area.** Getting one wrong changes which seventeen gates run — or whether any runs at all.

### Which way an error goes

| Wrong how | What follows |
|---|---|
| declared built, but it is not | **acceptance fails it**, the marks are cleared, and it is built for real. The safe direction |
| not declared, but it is | seventeen gates run against finished code. Nothing breaks; the time is spent confirming what a declaration would have settled |

**Checkpoint 18 is never covered by any value.**

---

## Break it down, then propose

```
they said     "attendance management, approval, payroll"

you return    - a member of staff clocks in on arrival, and the day's hours
                appear in their list
              - a member of staff who forgot to clock in files yesterday's
                hours the next day, and their manager sees it waiting
              - a manager approves a month in one pass, and the totals lock
              - an administrator exports a locked month for payroll
```

**Then say what is missing, and what could be better.** This is required, not optional:

| Look for | Because |
|---|---|
| the actor nobody mentioned | somebody has to correct a mistake, and it is rarely the person who made it |
| the flow two steps longer than it needs to be | the shortest version is usually available and nobody asked for it |
| the role that is really two, or the two that are really one | this is what stage 6's endpoint decision turns on |
| the case with no way back — an approval with no un-approval | it is found at acceptance otherwise, and by then a surface exists |
| the first-run case: no data, no users, nobody set anything up | every product has one and no request ever mentions it |

**Mark every one of them as a proposal, and wait.**

---

## Delegates

**This table lists work, not names.** Match each row against the equipped skills' descriptions when you reach it.

| What is needed |
|---|
| turning a rough request into stated requirements, observable criteria and an out-of-scope list |
| the shared project context the interface generator and auditor both read later |

**Invoke what you matched; do not summarize it here.** If nothing covers a row, say so by the work it names, carry on, and record the gap.

---

## What it writes

**Show each section in full, say which lines are proposals, and wait for approval** (`../hora-spec/SKILL.md`).

Document information and the project name; the actors table; terminology; existing assets with its `Authority` and `Baseline` lines; and each feature's two blocks plus its adoption annotations. `../hora/references/spec-format.md` holds every format.

**`Question language` is asked, not assumed.** It stays in a file somebody else reads.

**Terms only, no identifiers.** `/hora-plan` decides class and table names, against the lint rules.

### Drafting use cases from the running system — under `as-built` only

**The twenty use-case blocks are the real cost of adopting, not question 8.** A person asked to compose them from memory for twenty working features is being asked to dictate. Under `Authority: as-built` they do not compose; **this stage drafts, and they correct.**

| | |
|---|---|
| **Allowed for** | features covered by `as-built`. **Nothing else** |
| **Drafted from** | the surface-to-operation paths stage 0 read, the role checks on them, and what the existing tests exercise |
| **Put up as** | **checks** — "these are the paths the system carries; is that what people do with it?" — three or four features per exchange |
| **Forbidden for** | **a `to-spec` feature, always.** There the code is unfinished work toward a spec, and a use case drafted from it canonizes the state the spec exists to move past |
| **Forbidden for** | **a listed feature, always — nothing is drafted for it at all.** A criterion derived for a feature nothing will ever verify reads exactly like one somebody accepted |

**Why a check and not a proposal, and why that is safe here and nowhere else:** the person who wrote `as-built` declared the running system to be the requirement. After that, "this is what the system carries" and "this is what is wanted" are the same claim.

**A drafted use case still cannot say what a path is *for*.** Where the purpose is not legible from the path, ask.

**Acceptance criteria draft from existing tests, and only from tests that exist.** What a test asserts is observable by construction. **A feature with no tests gets no drafted criteria — ask instead**: "the tests pass" is not "it is right".

**That unbatchable question is the cost listing actually removes.** An untested feature's criteria have to be composed in conversation, one feature at a time, with nothing to correct. **So listing pays for itself in proportion to how untested the inherited product is, and buys close to nothing on a well-tested one.** Say that plainly, so somebody can decline the setting.

### A behavior that reaches past its own feature

**A criterion written here is checked at this feature's own gate**, so it may only reach what that feature adds and what its `depends` already provide. The same holds for a use case.

**A behavior that reaches further is written down and handed to stage 2, never placed here and never dropped.** This stage has no order to place it against.

```markdown
Held for stage 2 — reaches past its own feature

| Drafted for | The behavior | Reaches |
|---|---|---|
| #sign-up | a signed-up user appears in the admin's list | #user-admin |
```

**Write that list into `_stages.md`, and name it in the closing report.**

**Say which it is when the draft goes out.** A criterion put up as a proposal and a behavior handed to the next stage are two different things to approve.

**The drafting routes are where these appear most.** Under `as-built`, an integration test spanning four features reads exactly like a criterion for whichever feature the reader started from. Question 6 is the other one: "a deleted employee must never appear anywhere" belongs to the version, not to the first feature it was mentioned beside.

---

## Exit condition

Every actor named with how they are identified; every use case a whole sentence somebody could follow; every feature this release may build carrying at least one, and an approved acceptance block — **each block holding only what that feature's gate can check, with everything reaching further handed to stage 2**; the project name written; and, where stage 0 found something running, every feature carrying either a `built:` value somebody chose or a stated answer that it is not built.

**A listed section is excepted from the use-case and acceptance halves of that, and from nothing else.** What it owes instead is a recorded listing decision naming whoever made it.

**Where an actor or use case cannot be settled because the person who knows is not here**, record it and carry on. Do not invent one to keep the stage moving.

---

## References

| File | Content |
|---|---|
| `../hora/references/asking.md` | **a check, a proposal or a question** |
| `../hora-spec/references/investigation.md` | what stage 0 read, and why `built:` is the one thing no reading settles |
| `../hora-spec/references/stages.md` | this stage's exit condition |
| `../hora-spec/references/principles.md` | why a use case comes first, and why proposing is required |
| `../hora/references/spec-format.md` | the format of everything written here |
| `../hora-spec-horizon/SKILL.md` | the next stage |
