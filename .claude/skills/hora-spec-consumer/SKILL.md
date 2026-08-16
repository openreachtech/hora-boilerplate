---
name: hora-spec-consumer
description: Stage 5 of /hora-spec. Design the surfaces each use case passes through and the operations each one calls, so nothing on a surface lacks an operation and no operation is unreachable — the empty, failed, waiting and forbidden states included. Invoked by /hora-spec, or directly.
---

# hora-spec-consumer

**Stage 5 of `/hora-spec`.** Turn the use cases into surfaces, and connect every surface to the operations stage 4 designed — in both directions.

A **surface** is wherever a person or a client meets the product: a screen, a command, an SDK entry point. Whatever the project's consumer rows actually serve.

Read `../hora/references/structure.md` and `../hora-spec/references/principles.md` first. `../hora-spec/references/stages.md` is the authority on this stage's exit condition, and `../hora/references/asking.md` on how anything is put to a person.

**Not applicable when no row declares the `consumer` role** — an interface-only release for a client somebody else builds. Mark the stage `n/a` with that reason, and say which consumer the interface is for instead.

---

## What this stage reads

This is the stage that reads the consumer side properly — the entry points, the routes, and which operations each one calls. That mapping goes out as one check per group, not per surface.

**What is absent is the finding, and absence is never a check.** The empty, failed, waiting and forbidden states are the ones an existing product most often does not handle, and every one of them is a proposal.

```
"The list calls listAttendance and renders its rows."       a check
"The list has no empty state. I suggest adding one."        a proposal
```

**Never state the second as though the surface already had it.** This stage is where the mixing is most tempting: a surface that "should obviously" show something when there is nothing reads, in prose, exactly like one that does.

**A listed feature contributes no surface section and no use-case mapping, and its existing surfaces are recorded all the same.** It states no use case by declaration, so there is nothing to map it to. But its surfaces are in the running product, so they are recorded as inherited — one line each, justified by the feature's name in place of a use case, the way stage 4 records its tables. Leave them out and stage 6, which walks every surface this stage wrote, has no line to state a refusal against.

**Nothing is drafted for a listed feature.** Under `Authority: as-built` the running product is legitimate material for a check. For a listed feature it is not: a drafted state for a feature nothing will ever verify reads exactly like a state somebody designed and approved.

**The four states are not asked for it either, and the reason is written rather than left as an omission.** Each goes out as a proposal, a proposal is an invitation to build something, and no run will build this one. The version that pays the debt designs those surfaces properly, four states and all, and asks then.

---

## What this stage decides

```
which surfaces exist, and who reaches each one
which surfaces each use case passes through, in order
which operations each surface calls
what each shows when there is nothing, when it is waiting, when it failed,
  and when the person is not allowed
```

## What it must not decide

| | Whose it is |
|---|---|
| a new use case | stage 1 |
| a new operation | **stage 4.** A surface that needs one sends the run back there |
| a table | stage 4 |
| who may open a surface, as a permission | **stage 6.** This stage writes which actor it is for; stage 6 writes what happens to everybody else |
| a component, a token, a class, a file | **`/hora-build`**, at checkpoints 12 to 16 |
| anything about how a surface is built | the conventions package |

**A surface list is not a design.** What makes this stage worth a gate is the mapping — which use case passes through which surfaces, and which operations each calls. Without it, checkpoint 11 has nothing to verify against.

---

## Unreachable in either direction is a defect

| | What it actually means |
|---|---|
| **a control with no operation behind it** | a surface designed against a provider that does not exist. Either stage 4 is short one operation, or the control should not be there |
| **an operation nothing calls** | either a missing surface, or a feature nobody wants. Ask which |

The acceptance review looks for exactly these two, at the far end of eighteen checkpoints. Finding one here costs a sentence.

**A listed feature sits outside both directions**, which are read over what this version specifies. Its surfaces are inherited lines with no `Calls` table, so read as ordinary rows every one of its operations would look unreachable. The running product already connects the two.

---

## The conversation

```
1. Take one use case. Walk it as the person doing it:
     where do they start — a link, an email, an already-open surface?
     what do they see?
     what do they do?
     how do they know it worked?
     where are they left?

2. Name each surface that appeared, and what it is for

3. For each surface, which operations does it call, from stage 4's list?

4. What does it show when:
     there is nothing yet
     it is waiting
     the call failed
     the person is not allowed to be here
     the data is too large to show at once

5. Repeat for every use case. Then check the operation list for anything no
   surface called
```

**Question 1 is walked as the person, not described as a feature.** "The attendance screen has a list and a button" says nothing about whether anybody can finish anything.

**Question 4 is the one nobody is ever asked, and it is where most of a real surface lives.** Every product has a first run with no data, every call can fail, and every surface somebody is not allowed to open gets opened. Propose these; do not wait to be asked.

**Propose the shorter flow.** A use case that takes four steps usually takes two, and the person describing it has been picturing the four for months.

**Frequency decides prominence.** The daily thing goes where a hand already is; the monthly thing does not have to.

---

## Delegates

**This table lists work, not names.**

| What is needed |
|---|
| the shared project context the interface generator and the auditor both read — app type, users, scope, tokens, accessibility target, project rules |
| what a surface has to account for to be correct by construction — states, empties, failures, accessibility |

**Invoke what you matched; do not summarize it here.** That context file is read again at checkpoints 11 and 18, so this stage is the cheapest place for it to be filled in correctly.

If nothing covers a row, say so by the work it names, carry on, and record the gap.

---

## What it writes

**Show each section in full and wait for approval** (`../hora-spec/SKILL.md`).

```markdown
## 13. Surfaces
<!-- id: surfaces -->
<!-- target: employee -->
<!-- depends: operations -->

### 13.1 The month's attendance

For: a member of staff. Reached from the top navigation, and after clocking in.

| Calls | Kind | When |
|---|---|---|
| `attendances` | query | on open, and after each change |
| `createAttendance` | mutation | the clock-in control |

- nothing yet — "no records this month", with the clock-in control still available
- waiting — the list keeps its height; the control is disabled, not hidden
- failed — the reason, and a way to try again. Never a blank surface
- not allowed — a manager reaching another member of staff's month is told so

### Use cases
<!-- usecases -->

- a member of staff clocks in on arrival, and the day's hours appear in their list

### Acceptance criteria
<!-- acceptance -->

- clocking in twice on one day is refused, and the surface says why
- a month with no records shows the empty state, not an empty list
```

**Write `target` on the section**, naming the consumer row this surface belongs to. A `target` naming a row the layout does not declare stops the run.

**The `Calls` table is what makes the mapping checkable.** Checkpoint 11 reads it, the end-to-end test specification derives scenarios from it, and the acceptance review uses it to find the operation nothing reaches.

**An inherited surface is one line, and never a section of its own** — its name, who reaches it, and the feature it belongs to where a use case would be. No `Calls` table, no state list, neither block.

**Who reaches it is on the line and what it calls is not.** Stage 6 has to state what everybody else sees, and nothing else in the document names its actor; the `Calls` mapping exists for checkpoint 11, and no checkpoint 11 ever runs for a listed feature. **A surface written out in full here is the stop moved somewhere the stop does not look.**

---

## Exit condition

Every use case naming its surfaces in order; every surface naming its operations; nothing unreachable in either direction; every surface's empty, waiting, failed and forbidden states written; every acceptance block checkable at its own feature's gate — **all of it read over the surfaces this version specifies, a listed feature excepted**, which exits with its inherited surfaces as one line each.

---

## When it sends the run back

| Found here | Goes to |
|---|---|
| a surface needs an operation that does not exist | **stage 4** |
| a use case cannot be completed on any surface anybody would build | **stage 1**, to have it restated, or stage 4 |
| the surfaces the release needs are more than the release can hold | **stage 2** |

---

## References

| File | Content |
|---|---|
| `../hora/references/asking.md` | a check, a proposal or a question |
| `../hora-spec/SKILL.md` | the approval rule, the state file, the closing report |
| `../hora-spec/references/stages.md` | this stage's exit condition |
| `../hora-spec/references/principles.md` | why a use case comes first, and why proposing is required |
| `../hora/references/spec-format.md` | the format of a feature section, and its two required blocks |
| `../hora-build/references/checkpoints.md` | checkpoints 11 to 16, which build what this stage designs |
