---
name: hora-accept
description: Run acceptance and record what passed and what did not — the full test suites every time, plus an acceptance review at the reach the invocation calls for. Invoked as checkpoint 18 of /hora-build, as the whole-version sweep, or directly as /hora-accept.
---

# hora-accept

**Acceptance.** Run the test suites in full, run the acceptance review at the reach this invocation calls for, and record the result — including what that reach was.

Read `../hora/references/structure.md` first. **This skill is read-only on `specs/`, and it never fixes code.** It finds and records; fixing is a checkpoint's job.

---

## What this skill does not contain

**The content of an acceptance review, and the criteria it passes or fails on, are not in this file and must never be written into it.** They live in the conventions package, and this skill delegates the work.

| What is needed | Whose it is |
|---|---|
| whether the environment satisfies the prerequisite, and how to bring it up | the skills covering the local end-to-end stack |
| **what the review looks at, phase by phase, and what it fails on** | **the skills covering the acceptance review** |
| the durable list of scenarios, and how coverage is derived from the interface | the skills covering end-to-end test specification |
| experience, interaction and accessibility findings, with severity | the skills covering the experience audit |
| the project context those two read | the skills covering the shared project context |
| driving a failing suite to green without weakening it | the skills covering test execution |
| where a test lives, and how its run order is guaranteed | the skills covering test placement |

**What this skill decides is only three things: which features are in scope, in what order the delegates run, and where the result is recorded.**

**No name appears above, and none may.** A skill's name belongs to the package, which may rename it — and a renamed skill does not disagree with this file, it just stops matching while the record says the run passed. **So this skill matches at run time, itself**, and records the names it picked in the run's own record. **If nothing covers a row**, say so, continue without it, and record the gap by the work that went uncovered.

---

## What is in scope

**Two invocations, two reaches — and the test suites are the one thing that never shrinks.**

| Invoked as | Test suites | Review scope | Written to |
|---|---|---|---|
| checkpoint 18 of `/hora-build` — the feature gate | every repository, in full | **the feature at the gate.** The live, driven part of the review is **skipped unless explicitly requested, or unless this run is paying a listed feature's deferred acceptance** | `.hora/acceptance/<version>/<feature-id>.md` — **a new block, whatever reach this run took** |
| the whole-version sweep | every repository, in full | **every done feature** — for every version in ascending order, every `[x]` entry, plus the one at the gate if any, plus — in a collapsed version — every entry in its feature section whatever its box reads | `.hora/acceptance/<version>/_sweep.md` — a new block |

**"Explicitly requested" means a person asked for it, in the run.** That is the only widening there is, and the run records it with the requester named. **Nothing upgrades a gate run on its own judgment, and nothing downgrades the sweep.**

**A widening changes the reach and nothing else — least of all where the record lands.** A gate run asked to reach every done feature is still that feature's acceptance, so it appends a block to that feature's own file and says `reach: full` inside it. **There is no third kind of run and no third path.**

**The version's own acceptance criteria are a third thing in scope, and they are the sweep's alone.**

| Invoked as | The version's own criteria |
|---|---|
| the feature gate | **not in scope, at any reach** |
| the whole-version sweep | **in scope, all of them** — including ones earlier versions added, since they stand until somebody removes them |

**A widening does not reach them either.** A widened gate run is still accepting *one feature*, and these criteria are a statement about the version. **Judged at a gate, a criterion spanning three features would fail against a product holding one of them.**

**A standing policy could not live in `_plan.md`, which is why the widening is a person and not a line.** `.hora/` holds derivations, written by skills and read by humans. **If a project wants "sweep live at every gate" as policy, it belongs in the spec.**

**A feature implemented before hora was adopted is in scope like any other.** Its checkpoints are marked not-applicable up to the acceptance gate, never through it — so the first sweep after adoption is the run that says what the existing product actually does. **Expect findings there.**

### A listed feature is out of scope, and the derivation already decided that

`/hora-plan` writes its entry under `## Not accepted`, **with no checkbox at all.** Scope above is read off those checkboxes — a gate run takes the feature whose gate it is, a sweep takes every `[x]` entry — and an entry with no checkbox is neither.

**No box at all and an unticked box are two states, and only the first is this.** `[ ]` says a run is going to close this entry, which is why a collapsed version's entries are in scope whatever their boxes read. **Absence of the box, never its state, is what puts a feature out of scope.**

**Take that section by what it is, not by an exact heading string.** A collapsed version's is written `## Features — adopted as built`, so a selector matching a bare `## Features` literally finds no section in precisely the version whose every feature it was supposed to cover.

| | `built:` alone | `built:` with `baseline: inventoried` |
|---|---|---|
| Its entry | a checkbox, under the feature section | **under `## Not accepted`, with no checkbox** |
| A gate run | runs, as its checkpoint 18 | **there is no gate** — 18 stays `[ ]` and nothing marks it |
| A sweep | in scope from the run that finished it onward | **never in scope** |
| What a verdict says about it | passed, or a finding routed to a checkpoint | **its id on the `not-accepted:` line, and nothing else** |

**Deriving the exclusion rather than writing a rule for it is the point.** A rule would have to hold at two reaches, three invocation forms and every version after this one, and the first place somebody forgot it would put a feature with no acceptance criteria in front of the review skills — which can only report that nothing failed.

### A deferred acceptance runs at full live reach

**A feature whose acceptance was deferred by a listing runs at full live reach when it is finally accepted, whatever the invocation form.** It is decided mechanically, from two facts together:

```
no .hora/acceptance/*/<feature-id>.md holds a block whose verdict is a pass,
in any version
                              AND
an earlier version's _plan.md names this feature under ## Not accepted
```

Such a run is the only acceptance this code will ever have had, so a live-skipped pass would stand as the whole of what was ever said about it.

**Both facts are needed, and the second keeps this from swallowing the gate's own default.** Every feature's checkpoint 18 is its first acceptance, so the missing file alone would widen every gate run ever. **A listing is what makes this run different: the deferral was declared, and this is the run that pays for it.**

**It matters most where the missing record is years old.** The invocation says nothing about the feature never having been accepted, and the person invoking it has no reason to know. **The plan and the absent file are what say so**, identically whether the listing is one version old or four.

---

## The order to run in

**Each step states the work, not a name.** Match it against the equipped descriptions first, then run it, and write the names you matched into the record.

```
1. Confirm the environment — when the live sweep is going to run
     The application must run together with every service behind it, each role
     must be able to sign in, and there must be reviewable data or a command
     that produces it.
     Not satisfied -> stop. Raise `lacked-environment` (blocking: yes). Do not
                      review a consumer served on its own, and do not "work
                      around" a missing service.
     A gate run whose live sweep is skipped neither requires the stack nor
     brings it up — the review's own capability note then records that nothing
     in its verdict rests on a driven product. A gate run paying a deferred
     acceptance drives, so it needs the stack

2. Test suites, per repository, from inside it — EVERY run, at EVERY reach
     cd <repository> && <that repository's own test command>

3. The scenario list
     Reconcile it against the scope: every feature in scope has its scenarios,
     and coverage is derived from the interface, not remembered.
     At a sweep, every one of the version's own criteria has a scenario of its
     own as well — each spans several features, so no feature's list holds it

4. The acceptance review itself
     Its own phases, its own criteria, at the reach this invocation set. Do not
     restate its phases, do not abbreviate the ones that run, and do not stop
     early because the first phases passed.
     At a sweep, the version's own criteria are judged here, one by one

5. Experience findings — at the sweep, or on explicit request; a gate run skips
   this
```

**Step 1 is a gate for any run that drives the product, not a warm-up.** A live review signs in as each role, completes flows to their success condition, and stops dependencies on purpose to watch what the product says. **None of that means anything against a stub.** What a gate run does instead is not a weaker version of the same claim: it keeps the static checks, gives up the driven ones, and its capability note bounds every claim it makes.

**Step 2 comes before the review on purpose.** A test suite is cheap and its failures are precise.

**Never weaken a test to make step 2 pass.** No test skipped, deleted, loosened or waited out. **It is stated twice because "make the suite green" is exactly the instruction that produces a suite that no longer checks anything.**

---

## Recording the result

**The file says what was accepted. A block inside it says what one run found.** The **path** carries the subject; the **block** carries the reach, the scope and the verdict.

| The subject | The path |
|---|---|
| one feature, at its checkpoint 18 — **whatever reach that run took** | `.hora/acceptance/<version>/<feature-id>.md` |
| the version itself | `.hora/acceptance/<version>/_sweep.md` |

**A widening never moves the file.** Send it to `_sweep.md` instead and the feature never gets the per-feature evidence the next run reads, and `_sweep.md`'s newest block stops being an attempt to accept the whole version — which is what `/hora` reads it as. **Which is also why `_sweep.md` has exactly one writer.**

### One block per run, appended, newest last

**A subject is accepted more than once, and every one of those runs is kept.** A retake after a finding, a sweep re-run, a dependent whose acceptance was cleared and earned again — each appends a block. **Nothing is ever overwritten, and every reader takes the newest block.**

```markdown
# Acceptance — 1.0.0 — #attendance

## Run 1
<!-- reach: full | scoped -->
<!-- scope: attendance (rests on #payroll, not accepted), sign-up, sign-in -->
<!-- live: yes | no (skipped at the gate) -->
<!-- not-accepted: payroll, legacy-import | none -->
<!-- version-criteria: 4 of 4 | not in scope (gate) | none declared -->
<!-- environment: <what was brought up, and when it was seeded> -->
<!-- asked for by: <a person's name, where they widened this run> -->

### Verdict

failed

### What ran

| Step | Delegate | Result |
|---|---|---|
| environment | `<the names you matched>` | ready |
| tests (core) | `<the names you matched>` | 214 passed |
| tests (employee) | `<the names you matched>` | 51 passed |
| scenarios | `<the names you matched>` | 12 scenarios, 12 covered |
| review | `<the names you matched>` | 2 findings |
| version criteria | — | not in scope (gate) |
| experience | `<the names you matched>` | 1 finding (minor) |

### Findings

1. #attendance — a record saved from the monthly surface is not reachable from
   the daily list. Sends back to: #attendance checkpoint 11.
2. #sign-in — an expired session shows a blank surface instead of saying so.
   Sends back to: #sign-in checkpoint 13.

## Run 2                                    ← the retake. The newest block wins
...
```

**Run 1 stays exactly as it was written.** It is the record that the finding was real, that it was routed, and that the code changed because of it — which is what makes the retake's pass mean anything.

**Every finding names the checkpoint it sends the run back to, and in which feature.** A finding with no destination is a note; one with a destination is work. **The destination may be a different feature than the one at the gate.**

**The record is written whether the run passed or failed.**

**`version-criteria:` is written on every block, at every reach, and it has three forms and no fourth** — `<checked> of <declared>` at a sweep, `not in scope (gate)` at a gate, `none declared` where the spec declared none. **A block with no line at all is indistinguishable from a sweep that never looked.** A sweep whose `<checked>` falls short has not passed: name the unchecked criterion and report the run as partial.

**`reach`, `live` and `not-accepted` are not optional lines either.** A scoped, live-skipped pass over eight features and a full sweep over eleven read alike otherwise. **`not-accepted:` is written `none` where there is nothing.**

**`not-accepted:` lists every feature in the version nobody accepted, not only the ones this run's scope touched.** **It is read off `_plan.md`'s `## Not accepted` and out of nothing else — the section of the version being recorded, at both reaches, and no other version's.** That section is complete by construction, and it is the one place where "nobody accepted this" is written down rather than remembered.

**The union over every version is refused, and a sweep reads no released version's section.** A frozen `## Not accepted` records **what that version's tag claimed**, so 1.0.0 names `#billing` forever, including after 1.1.0 pays the debt — **a feature this version's section does not repeat is one whose debt this version paid.**

**A dependent's id in the `scope` line carries what it rests on.** **A pass resting on unstated behavior is allowed to exist; a pass that hides what it rests on is not.**

### The verdict grammar

**The bare `passed` is earned by two lines together — `not-accepted: none` and `reach: full`.** Everything else takes the counted form.

```
passed                                             ← only where both hold
passed over 17 of 20 features; 3 not accepted      ← reach: full, three listed
passed over 8 of 20 features; 0 not accepted       ← reach: scoped, a full run asked for mid-version
passed over 1 of 20 features; 0 not accepted       ← reach: scoped, a feature gate
failed
```

**The reach half is what stops a run that covered part of a version from reading as a whole-version pass.**

**The counts are over the version's whole feature list, whatever this run's scope was:** `<n>` is what this run covered, `<m>` every feature the version's spec carries, `<k>` the length of the `not-accepted:` line.

**`<m>` counts the listed features too.** Seventeen specified and three listed is `17 of 20` — never `17 of 17`, which reads as a run that covered everything there was to cover. **`/hora-plan`'s own report counts the other way, on purpose.** The two are not the same number, and neither is wrong.

**A listed feature is not what makes a run scoped, and it may not be**, because no run can reach one. **`reach:` says how much of what was reachable this run reached; `not-accepted:` says what nothing reached.**

**The verdict word is where this is enforced, and the header lines above it are no substitute.** The verdict is what every downstream reader consumes.

---

## What a failure does

**This skill never fixes anything.** It reports, and `/hora-build` acts.

| Kind of finding | What happens |
|---|---|
| the implementation falls short | the named checkpoints are cleared in the named features, and rebuilt through a `retake/` branch — the feature branch has already merged by this point |
| the same, **in a feature marked as built before adoption** | the same, and **the not-applicable marks it lands on are cleared too.** Code that has to change was not simply inherited |
| the spec cannot be satisfied under any reading | `contradiction` (`blocking: yes`), and the spec is changed through **`/hora-spec`** |
| an ambiguous criterion was met under one reading | `spec-assumption` (`blocking: no`), naming the reading assumed |
| the environment was not there | `lacked-environment` (`blocking: yes`). **No code change is attempted** |
| **a version acceptance criterion did not hold** | the named checkpoints are cleared in the features its `spans:` names — **the earliest, where a finding could land in more than one** |
| **a version criterion failed in the part it `rests on:`** | **there is no checkpoint to clear**, so the finding names the debt: pay it in this version, or change the criterion through `/hora-spec`. **Both readings recorded, neither recommended**, as `contradiction` (`blocking: yes`) |
| a real finding the project decides to live with | `acceptance-finding`, recording the decision and who made it |

**The rested-on row is the one destination that is not a checkpoint, and it has to be, because a listed feature has none.** Re-scheduling the feature to make one would hand code already serving users to `/hora-build` from checkpoint 1.

**Which of the two readings holds cannot be settled here.** Either the inherited code does not do what the criterion claimed, or the criterion claimed something nobody ever stated. **That is the price of the criterion having been allowed to rest on unstated behavior.**

**A finding is never resolved by deciding it is acceptable inside this skill.** That decision belongs to a person, and it goes into the question file with their name on it.

**Every question this run raised is reported by name, with a link. Never a count.**

---

## Four things always checked, whatever the delegates find

These are properties of *this run* rather than of the product, so no delegate owns them.

- **Was every feature in the version actually exercised — the version's whole feature list, not this run's scope?** Checking against scope can only ever answer yes. Say which features were not reached and why. **For every feature this run did not drive, name the last version in which it was driven**, read out of `.hora/acceptance/` as the newest block whose `live:` reads yes and whose `scope:` names it. **`never` is an answer, and it is the one worth reading**
- **Did any step get skipped because a delegate was missing?** Record the gap by name. A run with a step missing is a partial run, not a pass with a footnote
- **Does `version-criteria:` account for every criterion the resolved document holds?** The denominator is read off the spec, and `_plan.md`'s sweep entry is what it is checked against — two derivations of one source, so a disagreement means one was not re-derived
- **Does the `not-accepted:` line say what `_plan.md`'s `## Not accepted` says?** **A disagreement fails the run.** Name both readings and leave the reconciling to `/hora-plan`

**The first is checked against the whole list because the sweep was the only backstop for code no spec mentions.** A sweep that drove every feature also walked over the hand edits and the hotfixes nothing in `specs/` describes. Reading scope off checkboxes takes the listed features out of that net, and putting it back is not this skill's to do — a run cannot review a feature that has no criteria. **What it can do is leave the hole visible and dated**: eleven features, eight driven here, two last driven in 1.2.0, one never.

---

## References

| File | Content |
|---|---|
| `../hora/references/structure.md` | the layout, the invariants, the division of labor |
| `../hora/references/spec-format.md` | `baseline`, and the version's own acceptance criteria |
| `../hora/references/done-criteria.md` | what done means for a checkpoint, a feature and a version |
| `../hora-build/references/checkpoints.md` | checkpoint 18, and the checkpoints a finding sends the run back to |
