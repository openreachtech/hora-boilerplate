---
name: hora-spec-frontend
description: Stage 5 of /hora-spec. Design the screens each use case passes through and the operations each screen calls, so that nothing on a screen lacks an operation behind it and no operation is unreachable — including the empty, failed, waiting and forbidden states every screen has and no request ever mentions. Writes the screen sections — their use-case and acceptance blocks included — and the per-screen use-case mapping. Runs at the root of the hora repository (myproject-app), in conversation. Invoked by /hora-spec, or directly.
---

# hora-spec-frontend

**Stage 5 of `/hora-spec`.** Turn the use cases into screens, and connect every screen to the operations stage 4 designed — in both directions.

Read `../hora/references/structure.md` and `../hora-spec/references/principles.md` first. **`../hora-spec/references/stages.md` is the authority on this stage's exit condition.**

**`../hora/references/asking.md` fixes how anything here is put to a person** — a check, a proposal or a question, each with the question tool as its default.

**Not applicable when this version declares no frontend repository** — an API-only release for a phone app, say. Mark the stage `n/a` with that reason, and say which consumer the API is for instead.

## What this stage reads

**This is the stage that reads the frontend properly** — the pages, the routes, and which operations each screen calls. That mapping goes out as one check per screen group, not per screen.

**What is absent is the finding, and absence is never a check.** The empty, failed, waiting and forbidden states are the ones an existing product most often does not handle, and every one of them is **a proposal**: nobody decided against them, nobody decided for them, and the screen simply does not have them.

```
"The list screen calls listAttendance and renders its rows."       a check
"The list screen has no empty state. I suggest adding one."        a proposal
```

**Never state the second as though the screen already had it.** That is the mixing this whole design exists to stop (`../hora/references/asking.md`), and this stage is where it is most tempting — a screen that "should obviously" show something when there is nothing reads, in prose, exactly like one that does.

---

## What this stage decides

```
which screens exist, and who reaches each one
which screens each use case passes through, in order
which operations each screen calls
what each screen shows when there is nothing, when it is waiting, when it
  failed, and when the person is not allowed
```

## What it must not decide

| | Whose it is |
|---|---|
| a new use case | stage 1 |
| a new operation | **stage 4.** A screen that needs one sends the run back there |
| a table | stage 4 |
| who may open a screen, as a permission | **stage 6.** This stage writes which actor a screen is for; stage 6 writes what happens to everybody else |
| a component, a token, a CSS class, a Vue file | **`/hora-build`**, at checkpoints 12 to 16 |
| anything about how a screen is built | the package's own frontend skills |

**A screen list is not a design.** What makes this stage worth a gate is the mapping — which use case passes through which screens, and which operations each screen calls. Without it, checkpoint 11 has nothing to verify against.

---

## Unreachable in either direction is a defect

**Both directions are checked here, and both are found at acceptance otherwise.**

| | What it actually means |
|---|---|
| **a button with no operation behind it** | a screen designed against a backend that does not exist. Either stage 4 is short one operation, or the button should not be there |
| **an operation no screen calls** | either a missing screen, or a feature nobody wants. Ask which |

**The acceptance review looks for exactly these two**, at the far end of eighteen checkpoints. Finding one here costs a sentence.

---

## The conversation

```
1. Take one use case. Walk it as the person doing it:
     where do they start — a link, an email, an already-open screen?
     what do they see?
     what do they do?
     how do they know it worked?
     where are they left?

2. Name each screen that appeared, and what it is for

3. For each screen, which operations does it call, from stage 4's list?

4. What does this screen show when:
     there is nothing yet
     it is loading
     the call failed
     the person is not allowed to be here
     the data is too large to show at once

5. Repeat for every use case. Then check the operation list for anything no
   screen called
```

**Question 1 is walked as the person, not described as a feature.** "The attendance screen has a list and a button" says nothing about whether anybody can finish anything.

**Question 4 is the one nobody is ever asked, and it is where most of a real screen lives.** Every product has a first run with no data, every call can fail, and every screen someone is not allowed to open gets opened. **Propose these; do not wait to be asked.** The skills covering correct-by-construction screens hold what a screen has to account for — invoke them and design against them.

**Propose the shorter flow.** A use case that takes four screens usually takes two, and the person describing it has been picturing the four for months. Say which two, and why.

**Frequency decides prominence.** Stage 1 asked what happens daily and what happens monthly; the daily thing goes where a hand already is, and the monthly thing does not have to.

---

## Delegates

**This table lists work, not names.** Match each row against the equipped skills' own descriptions under `.claude/skills/` when you reach it — no name is written here, because a name belongs to the package and a renamed skill stops matching without saying so (`../hora/references/structure.md`, "No hora file ever names one of those skills").

| What is needed |
|---|
| the shared UI/UX project context file the UI generator and the UI auditor both read — app type, users, scope, tokens, accessibility target, project UX rules |
| what a screen has to account for to be correct by construction — states, empties, failures, accessibility, tokens, consent |

**Invoke what you matched; do not summarize it here.** That context file is read again at checkpoints 11 and 18, and by the UI auditor, so **this stage is the cheapest place for it to be filled in correctly** — the users, the scope and the project's own UX rules are all already settled by stages 1 to 3.

If nothing equipped covers a row, say so by the work it names, carry on, and record the gap.

---

## What it writes

**Show each section in full and wait for approval** (`../hora-spec/SKILL.md`).

```markdown
## 13. Screens
<!-- id: screens -->
<!-- target: frontend-employee -->
<!-- depends: graphql -->

### 13.1 The month's attendance

For: a member of staff. Reached from the top navigation, and after clocking in.

| Calls | Kind | When |
|---|---|---|
| `attendances` | query | on open, and after each change |
| `createAttendance` | mutation | the clock-in button |

- nothing yet — "no records this month", with the clock-in button still available
- loading — the list keeps its height; the button is disabled, not hidden
- failed — the reason, and a way to try again. Never a blank screen
- not allowed — a manager reaching another member of staff's month is told so

### Use cases
<!-- usecases -->

- a member of staff clocks in on arrival, and the day's hours appear in their list

### Acceptance criteria
<!-- acceptance -->

- clocking in twice on one day is refused, and the screen says why
- a month with no records shows the empty state, not an empty table
```

**Write `target` on the section**, naming the frontend repository this screen belongs to. A screen section whose `target` names a repository the layout does not declare stops the run.

**The `Calls` table is what makes the mapping checkable.** Checkpoint 11 reads it, the end-to-end test specification derives scenarios that pass through it, and the acceptance review uses it to find the operation nothing reaches.

---

## Exit condition

Every use case naming its screens in order; every screen naming its operations; nothing unreachable in either direction; every screen's empty, loading, failed and forbidden states written. `../hora-spec/references/stages.md` is the authority.

---

## When it sends the run back

| Found here | Goes to |
|---|---|
| a screen needs an operation that does not exist | **stage 4** |
| a use case cannot be completed on any screen anybody would build | **stage 1**, to have it restated, or stage 4 |
| the screens the release needs are more than the release can hold | **stage 2** |

---

## References

| File | Content |
|---|---|
| `../hora/references/asking.md` | **a check, a proposal or a question** — and the question tool this stage defaults to |
| `../hora-spec/SKILL.md` | the approval rule, the state file, the closing report |
| `../hora-spec/references/stages.md` | this stage's exit condition |
| `../hora-spec/references/principles.md` | why a use case comes first, and why proposing is required |
| `../hora/references/spec-format.md` | the format of a feature section, and its two required blocks |
| `../hora-build/references/checkpoints.md` | checkpoints 11 to 16, which build what this stage designs |
