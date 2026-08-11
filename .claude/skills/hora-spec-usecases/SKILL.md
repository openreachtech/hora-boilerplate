---
name: hora-spec-usecases
description: Stage 1 of /hora-spec. Fix who uses the product and what each of them completes end to end, breaking a feature request down into use cases and proposing the ones nobody thought of. Writes the document information, the project name, the actors and roles, the terminology, the existing assets and every feature's use-case block. Runs at the root of the hora repository (myproject-app), in conversation. Invoked by /hora-spec, or directly.
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
what already exists, and whether it may be used
```

## What it must not decide

| | Whose it is |
|---|---|
| which table holds any of it | stage 4 |
| which operation serves a use case | stage 4 |
| which screen a use case passes through | stage 5 |
| whether a use case is in this release or the next | **stage 2** — this stage collects them all, including the ones that will be deferred |
| what a role may and may not do, operation by operation | stage 6 |
| a class name, a table name, an identifier | **`/hora-plan`.** A term and its description are all that belongs here |

**Collect more than this release will build.** A use case that stage 2 defers is still worth stating now: it is what stage 2 weighs, and it is where stage 3's foreseen numbers come from. Filtering at stage 1 hides the choice stage 2 exists to make.

---

## The conversation

**Ask in this order.** Each answer narrows the next question, and the last three are the ones people have never been asked before.

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

6. What must never happen?

7. What is the product called?
```

**Question 3 is the stage.** Everything else supports it.

| Push for | Away from |
|---|---|
| who is doing it | "the system does X" |
| what they are trying to achieve | "there is a button for X" |
| where it starts and where it is done | a step in the middle, with no beginning |
| enough that somebody with no access to the code could follow it | selectors, endpoints, table names |

**Question 4 is not small talk.** Frequency decides what a screen puts first at stage 5, and the once-a-month operation that touches everything is usually the heaviest one stage 3 is about to ask for.

**Question 5 has two halves and both are required.** What exists, and whether it may be read. "Reimplement it" with the code invisible is a different job from "reimplement it" with the code in front of you, and **which one it is may never be inferred** (`../hora/references/structure.md`, invariant 2).

**Question 6 becomes two things**: an acceptance criterion at stage 7, and a permission at stage 6. Write the answer down where it is given; do not decide yet which it becomes.

**Question 7's answer becomes the prefix of every repository name.** Ask for it explicitly and confirm the spelling — it is expensive to change, because changing it renames every repository (`../hora/references/structure.md`).

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

**Then say what is missing, and what could be better.** This is required, not optional (`../hora-spec/references/principles.md`, "Everything starts from a use case"):

| Look for | Because |
|---|---|
| the actor nobody mentioned | somebody has to correct a mistake, and it is rarely the person who made it |
| the flow that is two screens longer than it needs to be | the shortest version is usually available and nobody asked for it |
| the role that is really two roles, or the two that are really one | this is what stage 6's endpoint decision turns on |
| the case with no way back — an approval with no un-approval, a lock with no unlock | it is found at acceptance otherwise, and by then a screen exists |
| the first-run case: no data, no users, nobody set anything up yet | every product has one and no request ever mentions it |

**Mark every one of them as a proposal, and wait.** A proposal that goes in silently is an invented requirement (`../hora-spec/SKILL.md`, "The line this skill must not cross").

---

## Delegates

**This table lists work, not names.** Match each row against the equipped skills' own descriptions under `.claude/skills/` when you reach it — no name is written here, because a name belongs to the package and a renamed skill stops matching without saying so (`../hora/references/structure.md`, "No hora file ever names one of those skills").

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

**`Question language` is asked, not assumed.** It is the language every later question is written in, and it stays in a file that somebody else reads (`../hora/references/structure.md`, "What language to write for humans").

### Actors and roles

```markdown
| Actor | Identified by | Roughly how many | Inside / outside |
|---|---|---|---|
| member of staff | an email and password issued on hire | 200, 5000 foreseen | inside |
| manager | the same login, with a `manager` role | 20 | inside |
| administrator | a separate login, issued by us | 3 | inside |
```

**This table is what stage 4's endpoint decision and stage 6's permissions are both read from.** A missing actor is not a small omission — it is an authentication mechanism nobody designed.

### Use cases, per feature

One `<!-- usecases -->` block per feature section, or **once on a feature file's H1** where the feature spans several `##` sections.

```markdown
### Use cases
<!-- usecases -->

- a member of staff clocks in on arrival, and the day's hours appear in their list
- a manager approves a month's attendance in one pass, and the totals lock
```

### Terminology, and existing assets

```markdown
| Term | Description |
|---|---|
| clock-in | the record a member of staff creates on arrival |

Current implementation: `acme-attendance` (visible, read-only access granted)
Treatment: reference it — match the behavior, rewrite the implementation
```

**Terms only. No identifiers.** `/hora-plan` decides the class and table names, against the lint rules, and a name written here that lint rejects is a name somebody has to unpick later.

---

## Exit condition

Every actor named with how they are identified; every use case a whole sentence somebody could follow; every feature this release may build carrying at least one; the project name written. `../hora-spec/references/stages.md` is the authority.

**Where an actor or a use case cannot be settled because the person who knows is not here**, record it (`undefined-detail`, or `missing-authorization` where it is an actor's identification that is missing) and carry on. Do not invent one to keep the stage moving.

---

## References

| File | Content |
|---|---|
| `../hora-spec/SKILL.md` | the approval rule, the state file, the closing report |
| `../hora-spec/references/stages.md` | this stage's exit condition, and what sends a run back into it |
| `../hora-spec/references/principles.md` | why a use case comes first, and why proposing is required |
| `../hora/references/spec-format.md` | "How to write use cases", and what each section holds |
| `../hora-spec-horizon/SKILL.md` | the next stage — which of these the release will actually build |
