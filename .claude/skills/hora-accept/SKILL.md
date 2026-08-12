---
name: hora-accept
description: Run acceptance and record what passed and what did not — the full unit suites every time, plus an acceptance review whose reach follows the invocation, scoped to the feature at the gate (checkpoint 18) or covering every feature implemented so far (the whole-version sweep, or on explicit request). Runs at the root of the hora repository (myproject-app). Invoked as checkpoint 18 of /hora-build, as the whole-version sweep, or directly as /hora-accept.
---

# hora-accept

**Acceptance.** Run the unit suites in full, run the acceptance review at the reach this invocation calls for, and record the result — including what that reach was.

Read `../hora/references/structure.md` first. **This skill is strictly read-only on `specs/`, and it never fixes code.** It finds and records; fixing is a checkpoint's job, in `/hora-build`.

---

## What this skill does not contain

**The content of an acceptance review, and the criteria it passes or fails on, are not in this file, and must never be written into it.** They live in `@openreachtech/ai-agent-skills`, and this skill delegates the work to whichever of its skills covers it.

| What is needed | Whose it is |
|---|---|
| whether the environment satisfies the prerequisite, and how to bring it up | the skills covering the local end-to-end container stack |
| **what the review looks at, phase by phase, and what it fails on** | **the skills covering the acceptance review itself** |
| the durable list of scenarios, and how coverage is derived from the API surface | the skills covering end-to-end test specification |
| UX, interaction, accessibility and consent findings, with severity | the skills covering the UI/UX audit |
| the project context those two read (users, scope, tokens, rules) | the skills covering the shared UI/UX project context |
| driving a failing suite to green without weakening it | the skills covering test execution |
| where a backend test lives, and how its run order is guaranteed | the skills covering backend test placement |
| how a unit test for a class is written | the skills covering how a unit test is written |

**What this skill decides is only three things: which features are in scope, in what order the delegates run, and where the result is recorded.** Everything else is theirs.

**Why the split is absolute.** A criterion copied to here disagrees with the original the first time the package is updated, and nothing announces that it has — the copy still reads as authoritative, and an acceptance run judged against a stale criterion passes things it should not. This is the same rule `/hora-setup` follows about the boilerplates: read the real thing, do not bake in what it currently says.

### No name appears above, and none may

**A skill's name belongs to the package, which is free to change it** (`../hora/references/structure.md`, "No hora file ever names one of those skills"). A renamed skill does not disagree with this file — the name simply stops matching, and the step is skipped while the record says the run passed. That failure is silent in exactly the place a gate must not be.

**So this skill matches at run time, itself.** It runs in the main session, which is handed the equipped skills' own descriptions, so it reads those and picks whichever cover the row above, before running the step. **Record the names it picked in the run's own record** — the `Delegate` column below is that record.

**If nothing equipped covers a row**, say so and continue without it. Record the gap in the run's own record, by the work that went uncovered. Do not substitute a guess, and do not invent the missing criteria yourself.

---

## What is in scope

**Two invocations, two reaches — and the unit suites are the one thing that never shrinks.**

| Invoked as | Unit suites (step 2) | Review scope (steps 3–5) | Written to |
|---|---|---|---|
| checkpoint 18 of `/hora-build` — the feature gate | every repository, in full | **the feature at the gate.** The live, browser-driven part of the review is **skipped unless explicitly requested** | `.hora/acceptance/<version>/<feature-id>.md` |
| the whole-version sweep (`_plan.md`'s `## Acceptance` entry), or an explicitly requested full run | every repository, in full | **every done feature** — for every version in ascending order, every feature whose entry in `_plan.md` is `[x]`, plus the one at the gate if any — live sweep always on | `.hora/acceptance/<version>/_sweep.md` |

**"Explicitly requested" means a person asked for it, or the version's `_plan.md` acceptance entry declares it.** Nothing in this skill upgrades a gate run to a full one on its own judgment, and nothing downgrades the sweep.

**A feature that was implemented before Hora Kit was adopted is in scope like any other.** Its checkpoints are marked not-applicable up to the acceptance gate, never through it — so the first sweep after adoption is the run that says what the existing product actually does. Expect findings there, and expect them to be the reason adopting the kit was worth doing.

**Where the plan collapsed an all-`built:` version to a single sweep** (`../hora-plan/SKILL.md`, "collapses to one sweep"), that adoption sweep is one invocation with every adopted feature in scope, and it stands in for each one's checkpoint 18. It runs the same five steps as any sweep — nothing about the work shrinks, only the number of times it is repeated. Its findings route to checkpoints per feature, exactly as always, and a feature a finding reopens gets its checkpoints back for real.

**The regression net at a feature gate is the unit suites plus the review's own static checks, and it is cumulative by construction.** The suites run whole repositories, so a feature that breaks an earlier one still fails here, in the run that broke it, while the change is one commit old — and a unit failure is far cheaper to localize than the same defect found through a browser. What a gate run gives up is driving every earlier feature's screens end to end; that is the sweep's job, and the record says which reach its verdict was reached at (below), so a scoped pass is never read later as a clean bill of health for the whole version.

---

## The order to run in

**Each step below states the work, not a name.** Match it against the equipped skills' descriptions first, then run it, and write the names you matched into the record's `Delegate` column.

```
1. Confirm the environment — when the live sweep is going to run
     the skills covering the local end-to-end container stack
     The application must run together with every service behind it, each
     role must be able to sign in, and there must be reviewable data or a
     command that produces it.
     Not satisfied -> stop. Report `lacked-environment` (blocking: yes).
                      Do not review a frontend served on its own, and do not
                      "work around" a missing service
     A gate run whose live sweep is skipped neither requires the stack nor
     brings it up — the review's own capability note then records that
     nothing in its verdict rests on a driven browser

2. Unit suites, per repository, from inside it — EVERY run, at EVERY reach
     the skills covering backend test placement and run order, how a unit
     test is written, and driving a failing suite to green
     cd <repository> && <that repository's own test command>

3. The scenario list
     the skills covering end-to-end test specification
     Reconcile it against the scope: every feature in scope has its
     scenarios, and coverage is derived from the API surface, not remembered

4. The acceptance review itself
     the skills covering the acceptance review
     Their own phases, their own criteria, at the reach this invocation set —
     their scoped mode at a feature gate, their full mode at the sweep. Do
     not restate their phases, do not abbreviate the ones that run, and do
     not stop early because the first phases passed

5. UX findings — at the sweep, or on explicit request; a gate run skips this
     the skills covering the UI/UX audit, against the context the shared
     UI/UX context skills produced
```

**Step 1 is a gate for any run that drives the product, not a warm-up.** A live review runs against real services — it signs in as each role, completes flows to their success condition, and stops dependencies on purpose to watch what the screen says. None of that means anything against a stub or a frontend with nothing behind it, and a review run that way reports a pass it has not earned. What a gate run does instead is not a weaker version of the same claim: its review keeps the static checks and gives up the driven-browser ones, and its own capability note is what bounds every claim it makes.

**Step 2 comes before the review on purpose.** A unit suite is cheap and its failures are precise; finding the same defect through an end-to-end flow costs far more to localize.

**Never weaken a test to make step 2 pass.** No test skipped, deleted, loosened or waited out. The skills covering test execution are the authority on this, and it is the one rule from a delegate worth stating twice — because "make the suite green" is exactly the instruction that produces a suite that no longer checks anything.

---

## Recording the result

```markdown
# Acceptance — 1.0.0 — after #attendance
<!-- reach: full | scoped -->
<!-- scope: attendance, sign-up, sign-in -->
<!-- live: yes | no (skipped at the gate) -->
<!-- environment: e2e/docker, seeded 2026-08-10 -->

## Verdict

failed

## What ran

| Step | Delegate | Result |
|---|---|---|
| environment | `<the names you matched>` | ready |
| unit (backend) | `<the names you matched>` | 214 passed |
| unit (frontend-employee) | `<the names you matched>` | 51 passed |
| scenarios | `<the names you matched>` | 12 scenarios, 12 covered |
| review | `<the names you matched>` | 2 findings |
| UX | `<the names you matched>` | 1 finding (minor) |

## Findings

1. #attendance — a record saved from the monthly screen is not reachable
   from the daily list. Sends back to: #attendance checkpoint 11.
2. #sign-in — an expired session shows a blank screen instead of saying so.
   Sends back to: #sign-in checkpoint 13.
```

**The `Delegate` column is written with the real names, resolved at run time.** It is left as a placeholder here because this file is a hora file, and the rule it states applies to it too. That column is what makes an acceptance run re-derivable: it says which conventions the verdict was actually reached against, and a package rename shows up as a diff in it rather than as a step that quietly stopped running.

**Every finding names the checkpoint it sends the run back to, and in which feature.** A finding with no destination is a note; a finding with one is work. The destination may be a different feature than the one at the gate — that is the normal shape of a regression.

**The record is written whether the run passed or failed.** A passing run is the evidence that a feature's gate was actually cleared, and the next run needs it to know what was already covered.

**The record names its own reach — `reach` and `live` are not optional lines.** A scoped, live-skipped pass and a full sweep produce records that read alike otherwise, and the difference between them is exactly what the next reader needs: which claims rest on a driven browser and which do not. This is the same rule the review skills apply to their own reports, kept here so the acceptance record cannot lose it.

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

**Every question this run raised is reported by name, with a link to the file** — its `Q<n>` id, its category, its blocking value and one line of what it is (`../hora/references/structure.md`, "Citing a question in a report"). **Never a count.** An acceptance run is exactly where a question is easiest to lose: the verdict and the findings are what everyone reads, and a `spec-assumption` recorded alongside them disappears into the margin unless it is named and linked like everything else.

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
