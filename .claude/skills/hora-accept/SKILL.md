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
| checkpoint 18 of `/hora-build` — the feature gate | every repository, in full | **the feature at the gate.** The live, browser-driven part of the review is **skipped unless explicitly requested, or unless this run is paying a listed feature's deferred acceptance** (below) | `.hora/acceptance/<version>/<feature-id>.md` — **a new block, whatever reach this run took** (below) |
| the whole-version sweep — `_plan.md`'s `## Acceptance` entry | every repository, in full | **every done feature** — for every version in ascending order, every feature whose entry in `_plan.md` is `[x]`, plus the one at the gate if any, plus — in a version the plan collapsed to one adoption sweep — every entry in that version's feature section whatever its box reads (below) | `.hora/acceptance/<version>/_sweep.md` — a new block |

**"Explicitly requested" means a person asked for it, in the run.** That is the only widening there is, and the run records it with the requester named — the same shape an `acceptance-finding` already uses for a finding the project decides to live with (below). Nothing in this skill upgrades a gate run to a full one on its own judgment, and nothing downgrades the sweep.

**A widening changes the reach and nothing else — least of all where the record lands.** A gate run asked to reach every done feature is still that feature's acceptance, so it appends a block to that feature's own file and says `reach: full` inside it ("Recording the result", below). **There is no third kind of run and no third path**: what varies is the subject and the reach, independently, and only the subject is ever in a filename.

**A standing policy could not live in `_plan.md`, and that is why the widening is a person and not a line.** A lever that is a person's decision may never live in the file a skill writes: `.hora/` holds derivations, written by skills and read by humans (`../hora/references/structure.md`, invariant 1), and a skill that finds a decision waiting for it in its own output has not been handed one — it has made one. `/hora-plan` is the only writer of `_plan.md` and no rule anywhere tells it to produce such a declaration, so honoring one would mean honoring text nothing may write, in the one file that always exists. **If a project ever does want "sweep live at every gate" as policy, it belongs in the spec** — where somebody approves the words, and `/hora-plan` derives the consequence from them like every other line.

**A feature that was implemented before Hora Kit was adopted is in scope like any other.** Its checkpoints are marked not-applicable up to the acceptance gate, never through it — so the first sweep after adoption is the run that says what the existing product actually does. Expect findings there, and expect them to be the reason adopting the kit was worth doing.

**A feature the spec only listed is the opposite case, and this skill does not decide it — the derivation already has.** A section carrying `<!-- baseline: inventoried -->` is listed rather than specified (`../hora/references/spec-format.md`, "`baseline`"), so `/hora-plan` writes its entry under `_plan.md`'s `## Not accepted`, with no checkbox at all (`../hora-plan/SKILL.md`, "`_plan.md` — the order"). **Scope above is read off those checkboxes** — a gate run takes the feature whose gate it is, a sweep takes every entry that is `[x]` — and an entry with no checkbox is neither. **It is therefore out of scope at this version and at every later one, with nothing added here to keep it out.**

**No box at all and an unticked box are two states, and only the first one is this.** `[ ]` says a run is going to close this entry and has not yet — an adopted feature waiting for the sweep that covers it reads exactly that way (`../hora-plan/SKILL.md`, "collapses to one sweep"), which is why the row above takes a collapsed version's feature entries into scope whatever their boxes read. **Absence of the box, never its state, is what puts a feature out of scope.** Read an unticked box as an absent one and the adoption sweep reviews nothing while reporting that nothing failed.

**That section is taken by what it is, not by an exact heading string: the version's feature section, whatever its heading reads.** A collapsed version's is written `## Features — adopted as built`, because the collapse is a fact about the whole version worth reading in the plan (`../hora-plan/SKILL.md`, "collapses to one sweep") — so a scope selector matching a bare `## Features` literally finds no section in precisely the version whose every feature it was supposed to cover, sweeps nothing, and records that nothing failed over twenty features nobody has driven. Match the section, then read its entries.

| | `built:` alone | `built:` with `baseline: inventoried` |
|---|---|---|
| Its entry in `_plan.md` | a checkbox, under `## Features` | **under `## Not accepted`, with no checkbox** |
| A gate run | runs, as its checkpoint 18 | **there is no gate** — 18 stays `[ ]` and nothing marks it |
| A sweep | in scope from the run that finished it onward | **never in scope** |
| What a verdict says about it | passed, or a finding routed to a checkpoint | **its id on the `not-accepted:` line, and nothing else** |

**Deriving the exclusion rather than writing a rule for it is the point.** A rule would have to hold at two reaches, three invocation forms and every version after this one, and the first place somebody forgot it would put a feature with no acceptance criteria in front of the review skills — which have nothing to review it against and can only report that nothing failed. The checkbox is absent once, in the plan, and every reach reads the same absence.

**Where the plan collapsed a version whose every specified feature carries `built:` into a single sweep** (`../hora-plan/SKILL.md`, "collapses to one sweep"), that adoption sweep is one invocation with every adopted feature in scope, and it stands in for each one's checkpoint 18. It runs the same five steps as any sweep — nothing about the work shrinks, only the number of times it is repeated. Its findings route to checkpoints per feature, exactly as always, and a feature a finding reopens gets its checkpoints back for real.

**A feature whose acceptance was deferred by a listing runs at full live reach when it is finally accepted, whatever the invocation form.** It is the one place the table's reach widens with nobody asking, and it is decided mechanically, from two facts together: **no `.hora/acceptance/*/<feature-id>.md` holds a block whose verdict is a pass, in any version, and an earlier version's `_plan.md` names this feature under `## Not accepted`.** Such a run is an adoption sweep arriving late — the only acceptance this code will ever have had — so a live-skipped pass would stand as the whole of what was ever said about it, and "the static checks held" would be the feature's entire acceptance history.

**Both facts are needed, and the second is what keeps this from swallowing the gate's own default.** Every feature's checkpoint 18 is its first acceptance, so the missing file alone would widen every gate run ever and quietly undo the reach the table sets. A listing is what makes this run different: the deferral was declared, in the spec, and this is the run that pays for it.

**It matters most where the missing record is years old.** A feature the spec once listed pays its debt in whichever version next changes it, and that version reaches it through an ordinary checkpoint 18 (`../hora/references/spec-format.md`, "`baseline`") — the invocation says nothing about the feature never having been accepted, and the person invoking it has no reason to know. **The plan and the absent file are what say so**, identically whether the listing is one version old or four. So this skill never chooses the reach here: it looks for the two facts, and the record says which of them — a person asking, or a debt being paid — widened the run.

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
     nothing in its verdict rests on a driven browser. A gate run that is a
     feature's first acceptance is not one of those: it drives, so it needs
     the stack like any sweep

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

**The file says what was accepted. A block inside it says what one run found.** Two things vary independently — which subject an acceptance run is about, and how far that run reached — and the record keeps them apart: the **path** carries the subject, and never anything else; the **block** carries the reach, the scope and the verdict.

| The subject | The path |
|---|---|
| one feature, at its checkpoint 18 — **whatever reach that run took** | `.hora/acceptance/<version>/<feature-id>.md` |
| the version itself, at its `## Acceptance` sweep entry | `.hora/acceptance/<version>/_sweep.md` |

**A widening never moves the file.** A person may ask for the sweep's reach at a feature's gate ("What is in scope", above), and that run still accepts *that feature* — its scope and its `reach:` line say how much was looked at on the way. Send it to `_sweep.md` instead and two things go wrong at once: the feature never gets the per-feature evidence the next run reads to know what was already covered (below), and `_sweep.md`'s newest block stops being an attempt to accept the whole version — which is exactly what `/hora`'s steps 6 and 7 and `../hora/references/done-criteria.md`'s condition for a done version read it as. **The reach is a property of a run; the path is a statement about what is being accepted, and only the second belongs in a filename.**

**Which is also why `_sweep.md` has exactly one writer.** `/hora`'s steps 6 and 7 and `../hora/references/done-criteria.md`'s condition for a done version both read its newest block for a `reach: full` pass, and they are entitled to assume every block in it was an attempt to accept the whole version (`../hora/SKILL.md`, "Deciding where you are").

### One block per run, appended, newest last

**A subject is accepted more than once, and every one of those runs is kept.** A retake after a finding, a sweep re-run after a failed one, a dependent whose acceptance was cleared and earned again — each appends a block. **Nothing is ever overwritten**, and no run's findings, verdict or requester disappears because a later run reached the same subject.

**Every reader takes the newest block.** That is the current verdict for that subject; the blocks above it are how it got there.

```markdown
# Acceptance — 1.0.0 — #attendance

## Run 1
<!-- reach: full | scoped -->
<!-- scope: attendance (rests on #payroll, not accepted), sign-up, sign-in -->
<!-- live: yes | no (skipped at the gate) -->
<!-- not-accepted: payroll, legacy-import | none -->
<!-- environment: e2e/docker, seeded 2026-08-10 -->
<!-- asked for by: <a person's name, where they widened this run> -->

### Verdict

failed

### What ran

| Step | Delegate | Result |
|---|---|---|
| environment | `<the names you matched>` | ready |
| unit (backend) | `<the names you matched>` | 214 passed |
| unit (frontend-employee) | `<the names you matched>` | 51 passed |
| scenarios | `<the names you matched>` | 12 scenarios, 12 covered |
| review | `<the names you matched>` | 2 findings |
| UX | `<the names you matched>` | 1 finding (minor) |

### Findings

1. #attendance — a record saved from the monthly screen is not reachable
   from the daily list. Sends back to: #attendance checkpoint 11.
2. #sign-in — an expired session shows a blank screen instead of saying so.
   Sends back to: #sign-in checkpoint 13.

## Run 2                                    ← the retake. The newest block wins
<!-- reach: scoped -->
<!-- scope: attendance -->
<!-- live: no (skipped at the gate) -->
<!-- not-accepted: payroll, legacy-import -->
<!-- environment: e2e/docker, seeded 2026-08-14 -->

### Verdict

passed over 1 of 20 features; 2 not accepted

### What ran

…
```

**Run 1 stays exactly as it was written.** It is the record that the finding was real, that it was routed, and that the code changed because of it — which is what makes the retake's pass mean anything. **A record that a later run overwrote would leave the checkpoint's history readable only as "it passed", with nothing saying it had not.**

**The `Delegate` column is written with the real names, resolved at run time.** It is left as a placeholder here because this file is a hora file, and the rule it states applies to it too. That column is what makes an acceptance run re-derivable: it says which conventions the verdict was actually reached against, and a package rename shows up as a diff in it rather than as a step that quietly stopped running.

**Every finding names the checkpoint it sends the run back to, and in which feature.** A finding with no destination is a note; a finding with one is work. The destination may be a different feature than the one at the gate — that is the normal shape of a regression.

**The record is written whether the run passed or failed.** A passing run is the evidence that a feature's gate was actually cleared, and the next run needs it to know what was already covered. **A failing one is why the work that followed it happened**, and it is the block a later reader compares the retake against. **Which is why the test above is a passing block and not the file**: a first gate run that failed creates the file, and a test keyed on its existence would then read the retake as ordinary — paying a listing's debt with the browser-less reach the table defaults to.

**The record names its own reach and its own gaps — `reach`, `live` and `not-accepted` are not optional lines.** A scoped, live-skipped pass over eight features and a full sweep over eleven produce records that read alike otherwise, and the difference is exactly what the next reader needs: which claims rest on a driven browser, and which features the verdict is not about at all. **`not-accepted:` is written `none` where there is nothing**, because a line left out is indistinguishable from a run in which nobody considered it — and `none` is the answer on almost every project, which is precisely why the line has to be there on the one where it is not. This is the same rule the review skills apply to their own reports, kept here so the acceptance record cannot lose it.

**`not-accepted:` lists every feature in the version nobody accepted, not only the ones this run's scope touched.** A gate record is what somebody opens to find out what that gate meant, and one that stayed silent about the three features nothing has ever verified would have answered the question by not raising it.

**It is read off `_plan.md`'s `## Not accepted`, and out of nothing else — the section of the version being recorded, at both reaches, and no other version's.** That one section is complete by construction: a listing lives in the resolved document and carries forward until some version writes `<!-- baseline: verified -->` (`../hora/references/spec-format.md`, "`baseline`"), and `/hora-plan` re-derives the section from those annotations on every run rather than carrying the section itself over (`../hora-plan/SKILL.md`, "`_plan.md` — the order") — so a debt still outstanding stands in this version's section whether it was listed here or four versions ago. It is therefore the one place where "nobody accepted this" is written down rather than remembered by whoever invoked the run. **The whole verdict grammar below hangs on this line**, and a line composed from what a run happened to notice would decide the wording of the verdict out of the run's own recollection — which is why a `not-accepted:` line that disagrees with that section fails the run ("Three things that are always checked", below).

**The union over every version in ascending order is refused, and a sweep reads no released version's section.** Scope is read that way because a `[x]` in 1.0.0 records work that really happened, but a frozen `## Not accepted` records something else — **what that version's tag claimed**, and no released `_plan.md` is ever rewritten (`../hora-plan/SKILL.md`, "Resolve the diffs first"). So 1.0.0 names `#billing` for as long as the repository exists, including after 1.1.0 writes the feature's two blocks, drives it at full live reach and re-derives its own section without it. **A feature this version's section does not repeat is one whose debt this version paid**, and folding the frozen entry in would fail the sweep of the only version that could ever clear it: `not-accepted: none` against 1.0.0's `#billing` is a disagreement, a disagreement fails the run, and the reconciling belongs to `/hora-plan`, which may not touch 1.0.0 — leaving a hand-edit of a derivation, or naming a feature this run just verified, as the only ways to a pass.

**A dependent's id in the `scope` line carries what it rests on.** A feature may depend on one the spec only listed (`../hora/references/spec-format.md`, "`baseline`"), and its own pass then rests on behavior nobody ever stated — so the id is written with that beside it, saying in the record's own scope line what the feature file's `Rests on:` says in the place `/hora-plan` owns (`../hora-plan/SKILL.md`, "One file per feature"). **A pass resting on unstated behavior is allowed to exist; a pass that hides what it rests on is not.** When the debt is later paid, that dependent's checkpoint 18 is cleared and its acceptance is earned again — and **that re-run is not a first acceptance**: its record already holds a passing block, so it takes whatever reach its invocation calls for, like any other.

**The bare `passed` is earned by two lines together — `not-accepted: none` and `reach: full` — and everything else takes the counted form.** The word makes one claim, that this version is accepted, and there are two ways for it to be false: a feature the spec listed that nobody ever accepted, or a run that stopped short of the features it could have covered. Key the grammar to the first alone and the second walks straight through it — the listing is the rarer of the two, and the reach is the one every project meets.

```
passed                                             ← only where not-accepted: none AND reach: full
passed over 17 of 20 features; 3 not accepted      ← reach: full, three features listed
passed over 8 of 20 features; 0 not accepted       ← reach: scoped — a full run asked for mid-version
passed over 1 of 20 features; 0 not accepted       ← reach: scoped — a feature gate
failed
```

**The reach half is what stops a run that covered part of a version from reading as a whole-version pass.** A person may ask for the sweep's reach at any gate, and mid-version that run's scope is the eight features finished by then — read off `_plan.md`'s `[x]` boxes, `reach: scoped`, `not-accepted: none`, nothing listed anywhere in the spec. Under a grammar keyed on the listing alone it writes a bare `passed`. **Two things then have to hold for that not to release the version**, and they are separate: the path keeps it out of `_sweep.md` in the first place, since it accepted one feature however far it looked (above); and `../hora/references/done-criteria.md` reads `reach:` beside the verdict, so the same wording in `_sweep.md` — where the version's own sweep can also be invoked before every feature is done — is not a done version either. **Rely on the path alone and a directly invoked sweep walks through; rely on the reach alone and a widened gate run appends a scoped block to the version's own record, where every newest-block reader takes it for the version's own attempt.**

**The counts are over the version's whole feature list, whatever this run's scope was:** `<n>` is what this run covered, `<m>` every feature the version's spec carries, `<k>` the length of the `not-accepted:` line. At a gate the first number is small by design, and `reach: scoped` beside it is what says so; what the grammar refuses is a verdict whose wording is compatible with every feature having been accepted.

**`<m>` counts the listed features too, and that is what keeps the two numbers from meeting.** Seventeen specified and three listed is `17 of 20` — never `17 of 17`, which reads as a run that covered everything there was to cover and so puts the refused wording back inside the counted form, where nothing catches it. **`/hora-plan`'s own closing report counts the other way, on purpose**: a plan of twenty with three listed is seventeen to build, because a report promising twenty has promised three features nobody is going to build (`../hora-plan/SKILL.md`, "When this skill finishes"). **The two are not the same number, and neither is wrong** — a verdict says how much of the product it is a statement about, a plan says how much work the version holds.

**And a sweep that covered less than it could have writes `reach: scoped`, never `full`.** `full` is a claim about what was covered, not about what was invoked: it says the run reached every feature acceptance can reach in this version — every entry `_plan.md` gives a checkbox to, for every version in ascending order — so a run that took the sweep's reach over the eight features finished so far is scoped, however it was asked for and however completely it did the eight.

**A listed feature is not what makes a run scoped, and it may not be**, because no run can reach one: it has no checkbox to be in scope by and no criteria to be reviewed against ("What is in scope", above). Read the other way, a version holding a single listed feature could never record a full reach and so could never be done — the same dead end `../hora/references/done-criteria.md` avoids by not counting the entry. **`reach:` says how much of what was reachable this run reached; `not-accepted:` and the `<k>` taken from it say what nothing reached** — so a final sweep over 17 with 3 listed is `reach: full` and `passed over 17 of 20 features; 3 not accepted`, and `reach: full` is what makes that verdict a statement about the version rather than about somebody's request.

**The verdict word is where this has to be enforced, and the header three lines above it is no substitute.** The verdict is the one thing every downstream reader consumes: `../hora/references/done-criteria.md` checks it to decide whether the version is done, a release note quotes it, and whoever opens the file reads it first and often reads nothing else. **A header comment loses to the verdict every time the two disagree**, so they are never allowed to disagree — the reduction is written into the word that actually gets read, and `not-accepted:` names which features it was.

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

## Three things that are always checked, whatever the delegates find

These are not criteria — they are properties of *this run* rather than of the product, so no delegate owns them.

- **Was every feature in the version actually exercised — the version's whole feature list, not this run's scope?** Scope is what the run set out to cover, so checking against it can only ever answer yes. A review that covered eight of eleven features passed eight features, not the version. Say which were not reached and why — out of scope at this reach, listed and never accepted, or in scope and missed. **For every feature this run did not drive, name in the record the last version in which it was driven**, read out of `.hora/acceptance/` as the newest block, in any record there, whose `live:` reads yes and whose `scope:` names that feature — the version being the directory that block sits in. A file's mere existence dates nothing: a live-skipped gate run creates one too. `never` is an answer, and it is the one worth reading
- **Did any step get skipped because a delegate was missing?** Record the gap by name. A run with a step missing is not a pass with a footnote — it is a partial run, and the record has to say so
- **Does the `not-accepted:` line say what `_plan.md`'s `## Not accepted` says?** The line is a copy of that section ("Recording the result", above), so it is checked against the source it was copied from and against nothing else — **the section of the version being recorded, at a gate and at a sweep alike, never a released version's frozen one**, which names what that version's tag claimed and would fail the sweep of the very version that paid the debt (above). **A disagreement fails the run.** Name both readings and leave the reconciling to `/hora-plan`, the only skill that writes `_plan.md`; three entries in the plan against `not-accepted: none` in the record is a bare `passed` that `../hora/references/done-criteria.md` accepts over three features nothing has ever verified, so this is the run's result and not a footnote on a pass

**The first is checked against the whole list because the sweep was the only backstop for code no spec mentions.** Nobody designed it as one: a sweep that drove every feature also, incidentally, walked over the hand edits and the hotfixes nothing in `specs/` describes, and it caught them because the browser went everywhere. Reading scope off `_plan.md`'s checkboxes takes the listed features out of that net by construction, and putting the net back is not this skill's to do — a run cannot review a feature that has no criteria. **What it can do is leave the hole visible and dated**: eleven features, eight driven here, two last driven in 1.2.0, one never. A gap somebody can read and a gap nobody wrote down are the same size, and they cost differently.

**The third is a copy checked against its source, and that is the most a run can check here.** Whether the plan itself matches the spec is stage 7's, and it counts the listed sections off the resolved document without reference to `_plan.md` for exactly this reason — one source checked against itself agrees however wrong both readings are (`../hora-spec-review/SKILL.md`, "Run the mechanical pass first"). What this run can catch is the drift it introduces itself: a `not-accepted:` line assembled from this run's scope, or from a plan nobody re-derived after a version took the annotation off.

---

## References

| File | Content |
|---|---|
| `../hora/references/structure.md` | the layout, the invariants, the division of labor, how a skill is named |
| `../hora/references/spec-format.md` | `<!-- baseline: inventoried -->`, and what a listed feature does and does not owe |
| `../hora/references/done-criteria.md` | what "done" means for a checkpoint, a feature and a version |
| `../hora-build/references/checkpoints.md` | checkpoint 18, and the checkpoints a finding sends the run back to |
