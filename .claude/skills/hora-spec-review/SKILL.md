---
name: hora-spec-review
description: Stage 7 of /hora-spec. Read the whole spec against itself — required sections, observable criteria, nothing reaching forward, every use case satisfiable, no contradiction — and send each shortfall back to the stage that owns it. Invoked by /hora-spec, or directly.
---

# hora-spec-review

**Stage 7 of `/hora-spec`.** Every earlier stage wrote a section that agreed with its own conversation. This is the only stage that asks whether they agree with each other.

Read `../hora/references/structure.md` and `../hora-spec/references/principles.md` first. `../hora-spec/references/stages.md` is the authority on this stage's exit condition, `../hora/references/spec-format.md` on every rule the mechanical pass checks, and `../hora/references/asking.md` on how anything is put to a person.

**This stage is never not applicable.** A document that six stages wrote and nothing reviewed is a document nobody has read whole.

**Besides the document it reads `_assets.md` and `_divergence.md`** — and, only where the version has already been planned, `.hora/tasks/<version>/_plan.md`'s `## Not accepted`, to compare against a count this stage takes for itself. Anything stage 0 recorded under "read but not settled here" that no stage ever settled is a shortfall found here. A `_divergence.md` row whose `Routed to` is still blank is the same kind of shortfall, and this is the last gate that can catch it.

---

## What this stage decides

Nothing. **It finds, and the stage that owns the section fixes.**

| | |
|---|---|
| a required section is missing | **the stage that owns it** re-runs |
| a `_divergence.md` row nobody routed | **the stage that owns its subject** fills in the `Routed to` |
| a use case cannot be completed under the design | **stage 4**, or 5 |
| an acceptance criterion is not observable | this stage rewrites it, with approval — it owns no section, but a criterion's wording is not a design change |
| a criterion or a use case reaches a feature built after it, or the order contradicts a `depends` | **stage 2** — which reading holds is a horizon decision, never a rewording |
| two statements contradict each other | whichever stage wrote the later one |

**A shortfall is never patched in place.** Writing a missing use case here means writing one that no stage ever walked against a data model.

---

## Run the mechanical pass first

Cheap, precise, and worth clearing before anybody reads prose. Every rule below belongs to `../hora/references/spec-format.md`.

```
1. Every required section present:
     the project name, written directly in spec.md
     the repository layout, written directly in spec.md
     actors and roles / implementation scope / existing assets / terminology /
     non-functional requirements / manual verification / implementation plan /
     version acceptance criteria (check 10 below)
     — each in spec.md's own text or in a declared Source

2. Every feature section:
     a <!-- usecases --> block, or one on its feature file's H1
     an <!-- acceptance --> block
     id, target, depends — and target naming a repository the layout declares
     — a section carrying <!-- baseline: inventoried --> owes neither block:
       missing-usecase and missing-acceptance are not raised for it, and
       nothing else is suspended. Checks 4 and 5 below apply to it in full,
       and a use case, an acceptance criterion, a screen section or a
       data-model table INSIDE it is itself a finding, blocking: yes

3. Every id unique across the version. No `--` in any file or folder name

4. Every operation states its kind. No input whose fields are unknown

5. Every operation states a caller (stage 6)

6. Every file under specs/<version>/ reachable by a link from spec.md —
     except request/ and its contents, and an empty directory's .gitkeep,
     which raise nothing (spec-format.md, "a drop-off convention")

7. The version in the document matches the directory name

8. Nothing written into a past version's directory

9. Every row of .hora/spec/<version>/_divergence.md names where it was
     routed — a blank Routed to cell goes back to the stage that owns the
     row's subject (stages.md, "What sends a run back into a stage")

10. The version's own acceptance criteria are there — the section present,
     `none` or every criterion carrying `spans:`, every named id a feature
     the document holds, and `rests on:` on every criterion that reaches a
     listed one

11. No feature's block reaches forward (below). Walk the implementation
     plan's order once, and check each feature's use cases and acceptance
     criteria against what is built by then
```

**A listed section carrying any of those four is itself the finding**, and it goes back to the stage that wrote the offending block — stage 1 for a use-case or acceptance block, stage 4 for a data-model table, stage 5 for a screen — **and to stage 1 whenever the resolution is that the feature should never have been listed**, since the annotation is stage 1's to remove. What made the section admissible was that it claims nothing, and a criterion sitting inside it is a pass waiting to be claimed. **Where nobody present can say which half was meant, record a `contradiction` (`blocking: yes`) rather than pick.**

**Report the count, not just the findings.** "17 sections, 6 features, 3 listed, 0 missing blocks, 4 version criteria" is what says the pass actually ran.

**Check 11 needs two sections at once, so it is worth stating how it runs:**

```
1. Take the implementation plan's order, and check it against `depends`
     first: every feature after the features it depends on. An edge
     pointing forward makes the rest of this check meaningless, because
     "what is built by then" is not what the order says
2. Walk the features in that order, carrying the set built so far
3. For each feature, read its two blocks against that set plus the feature
     itself. A criterion or a use case naming anything outside it is a
     forward reference
4. A `depends` on a listed feature is satisfied by the running code and
     orders nothing — treat it as already in the set
```

**Both findings go back to stage 2, which owns the order and the version's own criteria.** It is the one stage that can settle either reading: reorder the features, or move the behavior to the version's block. **Do not pick between them here** — the difference is whether the dependency was real.

**Report how many criteria ended up in the version's own block, beside the section counts.** A version whose features hold three criteria each and whose own block holds nine has moved most of its verification to the far end of the version (`../hora-build/SKILL.md`, "One feature at a time, never two"). The number is the only thing that makes that visible while it is still cheap to reorder.

**Count the listed sections off the resolved document, before opening `_plan.md` and without reference to it.** A count taken from the ledger and a ledger checked against that count are two readings of one source, and they agree however wrong both are. Read `_plan.md`'s `## Not accepted` afterwards, and **report a mismatch as a finding naming both numbers** — three listed in the document and two in the ledger means a version listed a feature that nothing is tracking. This stage does not edit `_plan.md` (`../hora/references/structure.md`, invariant 1); `/hora-plan` reconciles it on its next entry.

---

## Then read it whole

**Five readings, each looking for one thing.** They find different failures, and doing them at once finds the first of each and stops.

### 1. Can every use case be completed?

**Walk each one against the tables, the operations, the jobs and the screens together.** Stage 4 walked them against the backend and stage 5 against the screens; this is the first time anything walks them against both.

| Look for | Sends back to |
|---|---|
| a step with no operation | stage 4 |
| a step with no screen | stage 5 |
| a state nothing can represent | stage 4 |
| a use case that completes, but only if somebody does something the spec never mentions | stage 1 |

This is the same walk checkpoints 2, 9 and 11 make, and then the acceptance review makes for real. Each of those costs more than this one.

### 2. Is every acceptance criterion observable?

Delegate to the skills covering requirement definition — they own what makes a criterion observable rather than an intention.

```
✅  clocking in twice on one day is refused, and the screen says why
❌  attendance is recorded reliably
```

**Do not write a criterion common to every feature.** That `npm run lint && npm test` passes is true of all of them, so it is written for none.

**Criteria and use cases are checked as a pair.** A feature with criteria and no use cases produces operations that are each correct and together unreachable; a feature with use cases and no criteria leaves the implementer grading their own work.

**Observable is not the same as observable *there*, and the mechanical pass only catches the crude case.** Check 11 finds a criterion that names a later feature; what it cannot find is one whose wording names nothing and still cannot be watched until something later exists — "the total matches what payroll pays out" reads as one feature's criterion and is not. **Read each criterion asking where somebody would stand to watch it hold**, and where that place only exists after a later feature, it goes back to stage 2.

**The version's own criteria are read the same way, at their own reach**: whether somebody could follow each one end to end across the features it names, and whether `spans:` names every feature it actually passes through.

### 3. Do the three scope lists still match the design?

| Look for | Because |
|---|---|
| a "for now" item whose seam stage 4 did not leave | the deferral is a wish. Either the seam goes in, or the item moves to "permanently" |
| a "permanently out" item the design abstracted anyway | an abstraction layer nobody will use |
| something built this time that no list mentions | it arrived without a decision. Ask whose it is |
| a seam left for something now in "permanently out" | remove the seam, or move the item |

### 4. Does anything contradict anything?

The pairs worth checking, because these are the ones that actually happen:

```
a retention period against a permanent lock
a user count against a design that stores what it should compute
a role's permissions against a screen that shows it more than it may see
a job's trigger against an operation that no longer exists
an actor named in one section and absent from the actors table
a term used in two sections with two meanings
```

**Where two statements cannot both hold, ask** (`contradiction`, `blocking: yes`). Choosing between them is inventing a requirement.

### 5. Would somebody who was not in the room understand it?

The last reading, and the one that catches what fluent prose hides. An abbreviation nobody expanded, a screen named two ways, a step that assumes a habit only the requester has.

---

## Delegates

**This table lists work, not names.** Match each row against the equipped skills' own descriptions when you reach it (`../hora/references/structure.md`, "No hora file ever names one of those skills").

| What is needed |
|---|
| whether a criterion is observable, and what makes a requirement decided |
| how the document itself is written |
| end-to-end test specification — **not run here**, but the criteria this stage settles are what it later derives scenarios from |

If nothing equipped covers a row, say so by the work it names, carry on, and record the gap.

---

## What it writes

Its own findings, in `.hora/spec/<version>/_stages.md`, and whatever the re-run stages then write into `specs/`.

```markdown
## Stage 7 — review

| # | Finding | Sends back to | Result |
|---|---|---|---|
| 1 | `closeMonth` has no caller | 6 | fixed: a manager, own team only |
| 2 | "a manager reopens a locked month" has no operation | 4 | fixed: `reopenMonth` added |
| 3 | search is deferred with no seam named | 2 | fixed: the list query is one class |
| 4 | retention says 7 years; #scope permanently excludes deletion | — | Q7, `contradiction`, blocking: yes |
```

**A finding with a destination is work; a finding without one is a note.** Every row names a stage or a question.

---

## Exit condition

The mechanical pass clean; all five readings done; every finding either fixed by the stage that owns it or recorded as a question. `../hora-spec/references/stages.md` is the authority.

**A `blocking: yes` question does not stop this stage from finishing.** It stops `/hora-build`. Finish the review, record the hole, and say so in the closing report.

**Re-run this stage after any stage it sent the run back into.** A fix at stage 4 can contradict something stage 6 wrote, and the only thing that would notice is this pass, run again.

---

## References

| File | Content |
|---|---|
| `../hora/references/asking.md` | a check, a proposal or a question — and the question tool this stage defaults to |
| `../hora-spec/SKILL.md` | the approval rule, the state file, the closing report |
| `../hora-spec/references/stages.md` | this stage's exit condition, and the table of what sends a run back where |
| `../hora/references/spec-format.md` | **every rule the mechanical pass checks** |
| `../hora-plan/SKILL.md` | what it verifies next, and the question categories |
| `../hora-build/references/checkpoints.md` | checkpoints 2, 9, 11 and 18, which walk the use cases again |
