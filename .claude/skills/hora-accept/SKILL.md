---
name: hora-accept
description: Run acceptance over every feature implemented so far — an acceptance review against the running application plus the unit suites — and record what passed and what did not. Runs at the root of the hora repository (myproject-app). Invoked as checkpoint 18 of /hora-build, as the whole-version sweep, or directly as /hora-accept.
---

# hora-accept

**Acceptance.** Take the set of features that are actually implemented, run acceptance over all of them, and record the result.

Read `../hora/references/structure.md` first. **This skill is strictly read-only on `specs/`, and it never fixes code.** It finds and records; fixing is a checkpoint's job, in `/hora-build`.

---

## What this skill does not contain

**The content of an acceptance review, and the criteria it passes or fails on, are not in this file, and must never be written into it.** They live in `@openreachtech/ai-agent-skills`, and this skill delegates to them by name.

| What is needed | The skill that holds it |
|---|---|
| whether the environment satisfies the prerequisite, and how to bring it up | `hb-build-e2e-test-environment` |
| **what the review looks at, phase by phase, and what it fails on** | **`hf-acceptance-review`** |
| the durable list of scenarios, and how coverage is derived from the API surface | `hf-e2e-test-specification` |
| UX, interaction, accessibility and consent findings, with severity | `hf-uiux-audit` |
| the project context those two read (users, scope, tokens, rules) | `hf-uiux-context` |
| driving a failing suite to green without weakening it | `hc-test-execution` |
| where a backend test lives, and how its run order is guaranteed | `hb-backend-testing` |
| how a unit test for a class is written | `hc-jest` |

**What this skill decides is only three things: which features are in scope, in what order the delegates run, and where the result is recorded.** Everything else is theirs.

**Why the split is absolute.** A criterion copied to here disagrees with the original the first time the package is updated, and nothing announces that it has — the copy still reads as authoritative, and an acceptance run judged against a stale criterion passes things it should not. This is the same rule `/hora-setup` follows about the boilerplates: read the real thing, do not bake in what it currently says.

**If a named skill is not there under `.claude/skills/`**, say so and continue without it. Record it in the run's own record as a gap. Do not substitute a guess, and do not invent the missing criteria yourself.

---

## What is in scope

**Every feature implemented so far — not the one that just finished.**

```
1. Read .hora/tasks/*/. For every version, in ascending order, take every
   feature whose entry in _plan.md is [x]
2. Add the feature currently at checkpoint 18, if this run was invoked from
   /hora-build
3. That set is the scope
```

**A feature that was implemented before Hora Kit was adopted is in scope like any other.** Its checkpoints are marked not-applicable up to the acceptance gate, never through it — so the first sweep after adoption is the run that says what the existing product actually does. Expect findings there, and expect them to be the reason adopting the kit was worth doing.

**Cumulative scope is the whole point of running acceptance per feature.** A feature that breaks an earlier one fails here, in the run that broke it, while the change is one commit old — instead of at the end of the version, where it arrives alongside twenty other changes and nobody can say which caused it.

Two invocations differ only in scope and in what is written:

| Invoked as | Scope | Written to |
|---|---|---|
| checkpoint 18 of `/hora-build` | every done feature, plus the one at the gate | `.hora/acceptance/<version>/<feature-id>.md` |
| the whole-version sweep (`_plan.md`'s `## Acceptance` entry) | every done feature in the version | `.hora/acceptance/<version>/_sweep.md` |

---

## The order to run in

**Every name below is the skill's own, in full.** Invoke it exactly as written — there is nothing to strip and nothing to expand (`../hora/references/structure.md`, "Invoking one of those skills").

```
1. Confirm the environment
     hb-build-e2e-test-environment
     The application must run together with every service behind it, each
     role must be able to sign in, and there must be reviewable data or a
     command that produces it.
     Not satisfied -> stop. Report `lacked-environment` (blocking: yes).
                      Do not review a frontend served on its own, and do not
                      "work around" a missing service

2. Unit suites, per repository, from inside it
     hb-backend-testing (placement and order), hc-jest (how
     one is written), hc-test-execution (driving them green)
     cd <repository> && <that repository's own test command>

3. The scenario list
     hf-e2e-test-specification
     Reconcile it against the scope: every feature in scope has its
     scenarios, and coverage is derived from the API surface, not remembered

4. The acceptance review itself
     hf-acceptance-review
     Its own phases, its own criteria. Do not restate them, do not
     abbreviate them, and do not stop early because the first phases passed

5. UX findings
     hf-uiux-audit, against the context hf-uiux-context produced
```

**Step 1 is a gate, not a warm-up.** The review drives the real application against real services — it signs in as each role, completes flows to their success condition, and stops dependencies on purpose to watch what the screen says. None of that means anything against a stub or a frontend with nothing behind it, and a review run that way reports a pass it has not earned.

**Step 2 comes before the review on purpose.** A unit suite is cheap and its failures are precise; finding the same defect through an end-to-end flow costs far more to localize.

**Never weaken a test to make step 2 pass.** No test skipped, deleted, loosened or waited out. `hc-test-execution` is the authority on this, and it is the one rule from a delegate worth stating twice — because "make the suite green" is exactly the instruction that produces a suite that no longer checks anything.

---

## Recording the result

```markdown
# Acceptance — 1.0.0 — after #attendance
<!-- scope: attendance, sign-up, sign-in -->
<!-- environment: e2e/docker, seeded 2026-08-10 -->

## Verdict

failed

## What ran

| Step | Delegate | Result |
|---|---|---|
| environment | hb-build-e2e-test-environment | ready |
| unit (backend) | hc-test-execution | 214 passed |
| unit (frontend-employee) | hc-test-execution | 51 passed |
| scenarios | hf-e2e-test-specification | 12 scenarios, 12 covered |
| review | hf-acceptance-review | 2 findings |
| UX | hf-uiux-audit | 1 finding (minor) |

## Findings

1. #attendance — a record saved from the monthly screen is not reachable
   from the daily list. Sends back to: #attendance checkpoint 11.
2. #sign-in — an expired session shows a blank screen instead of saying so.
   Sends back to: #sign-in checkpoint 13.
```

**Every finding names the checkpoint it sends the run back to, and in which feature.** A finding with no destination is a note; a finding with one is work. The destination may be a different feature than the one at the gate — that is the normal shape of a regression.

**The record is written whether the run passed or failed.** A passing run is the evidence that a feature's gate was actually cleared, and the next run needs it to know what was already covered.

---

## What a failure does

**This skill never fixes anything.** It reports, and `/hora-build` acts.

| Kind of finding | What happens |
|---|---|
| the implementation falls short | the named checkpoints are cleared in the named features, and rebuilt through a `retake/` branch (`../hora/references/commits.md`) — the `feature/` branch has already merged by this point |
| the implementation falls short, **in a feature marked `built before Hora Kit was adopted`** | the same, and **the not-applicable marks it lands on are cleared too.** Code that has to change was not simply inherited; from the earliest checkpoint affected, it is built for real |
| the spec cannot be satisfied under any reading | a `contradiction` question (`blocking: yes`), and the spec is changed through **`/hora-spec`**, at the stage `../hora-spec/references/stages.md` names. `/hora-plan` then re-reads it and clears whatever the change invalidated |
| an ambiguous criterion was met under one reading | a `spec-assumption` question (`blocking: no`), naming the reading assumed |
| the environment was not there | a `lacked-environment` question (`blocking: yes`). **No code change is attempted** |
| a real finding the project decides to live with | an `acceptance-finding` question, recording the decision and who made it |

**A finding is never resolved by deciding it is acceptable inside this skill.** That decision belongs to a person, and it goes into the question file with their name on it. Silently downgrading a finding is how an acceptance gate stops meaning anything.

---

## Two things that are always checked, whatever the delegates find

These are not criteria — they are properties of *this run* rather than of the product, so no delegate owns them.

- **Was every feature in scope actually exercised?** A review that covered eight of eleven features passed eight features, not the version. Say which were not reached and why
- **Did any step get skipped because a delegate was missing?** Record the gap by name. A run with a step missing is not a pass with a footnote — it is a partial run, and the record has to say so

---

## References

| File | Content |
|---|---|
| `../hora/references/structure.md` | the layout, the invariants, the division of labor, how a skill is named |
| `../hora/references/done-criteria.md` | what "done" means for a checkpoint, a feature and a version |
| `../hora-build/references/checkpoints.md` | checkpoint 18, and the checkpoints a finding sends the run back to |
