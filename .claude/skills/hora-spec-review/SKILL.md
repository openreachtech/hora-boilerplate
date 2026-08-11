---
name: hora-spec-review
description: Stage 7 of /hora-spec. Read the whole spec against itself — every required section present, every feature carrying observable acceptance criteria, every use case satisfiable by the design, the two out-of-scope lists still matching it, no contradiction — and send each shortfall back to the stage that owns it. The stage that makes the other six mean anything. Runs at the root of the hora repository (myproject-app). Invoked by /hora-spec, or directly.
---

# hora-spec-review

**Stage 7 of `/hora-spec`.** Every earlier stage wrote a section that agreed with its own conversation. This is the only stage that asks whether they agree with each other.

Read `../hora/references/structure.md` and `../hora-spec/references/principles.md` first. **`../hora-spec/references/stages.md` is the authority on this stage's exit condition**, and `../hora/references/spec-format.md` on every rule the mechanical pass below checks.

**This stage is never not applicable.** A document that six stages wrote and nothing reviewed is a document nobody has read whole.

---

## What this stage decides

Nothing. **It finds, and the stage that owns the section fixes.**

| | |
|---|---|
| a required section is missing | **stage that owns it** re-runs |
| a use case cannot be completed under the design | **stage 4**, or 5 |
| an acceptance criterion is not observable | this stage rewrites it, with approval — it owns no section, but a criterion's wording is not a design change |
| two statements contradict each other | whichever stage wrote the later one |

**A shortfall is never patched in place.** Writing a missing use case here means writing one that no stage ever walked against a data model — which is exactly the failure the seven stages exist to prevent, reintroduced at the last possible moment.

---

## Run the mechanical pass first

**Cheap, precise, and worth clearing before anybody reads prose.** Every rule below belongs to `../hora/references/spec-format.md`; this is the list of what to check, not a restatement of why.

```
1. Every required section present:
     the project name, written directly in spec.md
     the repository layout, written directly in spec.md
     actors and roles / implementation scope / existing assets / terminology /
     non-functional requirements / manual verification / implementation plan
     — each in spec.md's own text or in a declared Source

2. Every feature section:
     a <!-- usecases --> block, or one on its feature file's H1
     an <!-- acceptance --> block
     id, target, depends — and target naming a repository the layout declares

3. Every id unique across the version. No `--` in any file or folder name

4. Every operation states its kind. No input whose fields are unknown

5. Every operation states a caller (stage 6)

6. Every file under specs/<version>/ reachable by a link from spec.md

7. The version in the document matches the directory name

8. Nothing written into a past version's directory
```

**Report the count, not just the findings.** "17 sections, 6 features, 0 missing blocks" is what says the pass actually ran.

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

**This is the same walk checkpoints 2, 9 and 11 make, three times over, and then the acceptance review makes for real.** Each of those costs more than this one.

### 2. Is every acceptance criterion observable?

**Delegate to `hc-requirement-definition`** — it owns what makes a criterion observable rather than an intention.

```
✅  clocking in twice on one day is refused, and the screen says why
❌  attendance is recorded reliably
```

**Do not write a criterion common to every feature.** That `npm run lint && npm test` passes is true of all of them, so it is written for none.

**Criteria and use cases are checked as a pair.** A feature with criteria and no use cases produces operations that are each correct and together unreachable; a feature with use cases and no criteria leaves the implementer grading their own work.

### 3. Do the three scope lists still match the design?

| Look for | Because |
|---|---|
| a "for now" item whose seam stage 4 did not leave | the deferral is a wish. Either the seam goes in, or the item moves to "permanently" |
| a "permanently out" item the design abstracted anyway | an abstraction layer nobody will use |
| something built this time that no list mentions | it arrived without a decision. Ask whose it is |
| a seam left for something now in "permanently out" | remove the seam, or move the item |

### 4. Does anything contradict anything?

**The pairs worth checking, because these are the ones that actually happen:**

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

**The last reading, and the one that catches what fluent prose hides.** An abbreviation nobody expanded, a screen named two ways, a step that assumes a habit only the requester has. Delegate the document's own conventions to `hc-documentation`.

---

## Delegates

| What is needed | The skill that holds it |
|---|---|
| whether a criterion is observable, and what makes a requirement decided | `hc-requirement-definition` |
| how the document itself is written | `hc-documentation` |
| **not run here** — but the criteria this stage settles are what it later derives scenarios from | `hf-e2e-test-specification` |

If one is not under `.claude/skills/`, say so by name, carry on, and record the gap.

---

## What it writes

**Its own findings, in `.hora/spec/<version>/_stages.md`**, and whatever the re-run stages then write into `specs/`.

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

**A `blocking: yes` question does not stop this stage from finishing.** It stops `/hora-build`. Finish the review, record the hole, and say so in the closing report — one unanswerable question must not cost the whole document.

**Re-run this stage after any stage it sent the run back into.** A fix at stage 4 can contradict something stage 6 wrote, and the only thing that would notice is this pass, run again.

---

## References

| File | Content |
|---|---|
| `../hora-spec/SKILL.md` | the approval rule, the state file, the closing report |
| `../hora-spec/references/stages.md` | this stage's exit condition, and the table of what sends a run back where |
| `../hora/references/spec-format.md` | **every rule the mechanical pass checks** |
| `../hora-plan/SKILL.md` | what it verifies next, and the question categories |
| `../hora-build/references/checkpoints.md` | checkpoints 2, 9, 11 and 18, which walk the use cases again |
