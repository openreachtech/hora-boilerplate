---
name: hora
description: Implement an application from its spec. Decides where a project stands and runs the five skills that do the work — spec, setup, plan, build, accept — one feature at a time, each to acceptance before the next starts. Started or restarted only by an explicit `/hora` invocation.
---

# hora

**The orchestrator.** Decide where this project stands, run the skill that comes next, and own every git operation on the way.

`/hora` implements nothing itself. Five skills do the work:

| Skill | Does | Runs |
|---|---|---|
| **`/hora-spec`** | writes the version's spec, in conversation | once per version, until stage 7 passes |
| **`/hora-setup`** | creates the repositories the spec declares, and reads the real tree | once per version, idempotent |
| **`/hora-plan`** | fixes the version, verifies the spec, writes the feature list | re-entered on every run |
| **`/hora-build`** | takes one feature through the eighteen checkpoints | **once per feature** |
| **`/hora-accept`** | runs the full test suites, plus a review at the reach the invocation calls for | at each feature's checkpoint 18, and once as a whole-version sweep |

**Read `references/structure.md` before anything else** — the layout, where a per-repository command runs, and the three invariants. `references/commits.md` holds every git rule.

---

## The shape of a run

```
/hora-spec ─> /hora-setup ─> /hora-plan ──┬─> /hora-build #A ─> /hora-accept ─┐
                                          ├─> /hora-build #B ─> /hora-accept ─┤
                                          └─> /hora-build #C ─> /hora-accept ─┴─> sweep ─> merge
```

**One feature goes all the way to acceptance before the next starts.** Provider, then consumer, then acceptance — per feature, not per layer. Building every provider task, then every consumer task, then testing, means the first time anyone finds out whether a feature *works* is after all of them are written.

**Re-entrancy is the centre.** One session does not run to the end. Each run decides where it is and continues. **Nothing is ever redone because a session ended** — every checkbox is written the moment it passes.

**Serial down to the checkpoint.** No feature runs alongside another, and no checkpoint alongside another checkpoint. **Inside a checkpoint, its units do run together** (`../hora-build/SKILL.md`, "Splitting a checkpoint into units").

---

## Deciding where you are

Do this first, every time — a fresh start and a restart alike.

```
0. git fetch origin --prune, for the hora repository and every existing row.
   Then check for a hotfix that landed on main
   (references/commits.md, "Keeping release/<version> current")

1. Does the target version have a spec with content in it?
                                    if not -> /hora-spec

2. Are all declared repositories present?
                                    if any is missing -> /hora-setup

3. Always run /hora-plan. It fixes the version, and reconciles the feature
   list against specs/ on every re-entry

4. Does .hora/questions/<version>/open.md hold an unresolved blocking: yes?
                                    if so -> stop. Report what to fix

5. Does _plan.md hold an unfinished feature — an entry with a [ ] box that the
   ## Acceptance entry does not already close?
                                    if so -> /hora-build, on the first one
                                             whose depends are satisfied

6. No such [ ] remains, and _sweep.md's newest block does not read reach: full
   with a passing verdict and a version-criteria: line accounting for every
   criterion the version declared
                                    -> /hora-accept, whole-version

6a. It does, and entries that sweep closes still stand [ ]
                                    -> /hora-plan again, to set them
                                       (../hora-plan/SKILL.md, "Collapsing an
                                       all-built version to one sweep")

7. _sweep.md's newest block reads reach: full with a passing verdict and a
   complete version-criteria: line, and every _plan.md entry is [x]
                                    -> merge (references/commits.md,
                                       "Merge order into main")
```

**Step 0 is also what catches `release/<version>` up with a hotfix.** `/hora` has no scheduler: this fetch and the one after every merge into `release/<version>` are the only two occasions it gets to notice one landed.

**`/hora` does not ask before running this check, or before acting on an ordinary result.** It stops and asks once the check turns up something it cannot resolve on its own.

**Step 1 is not "write the spec for them".** `/hora-spec` writes nothing without somebody reading it first, and a run reaching step 1 with nobody there stops.

**Step 3 runs even when the feature list exists.** A spec keeps moving while implementation is under way.

**Step 5 reads only entries that carry a checkbox.** A listed feature sits under `## Not accepted` with no box, so it is neither done nor unfinished — **a version whose every remaining feature is listed passes step 5 and is swept at step 6.** Paying that debt is a later version's ordinary work, scheduled by a person.

**Step 5 also passes over an entry whose checkpoint 18 the `## Acceptance` entry covers.** Its `[ ]` means *the sweep will close this*, not *hand this to `/hora-build`*.

**Steps 6 and 7 read the newest block's own `reach:`, never whether `_sweep.md` exists.** A sweep may be invoked before every feature is done, and every run appends a block. **Whatever fails step 7's test satisfies step 6's**, so the run goes back to `/hora-accept` and there is no gap between them.

**Step 6a exists because the run that earns a collapsed version's checkboxes must also set them.** `/hora-accept` records and never writes `_plan.md`; `/hora-build` never opens those entries. `/hora-plan` is the writer.

Report the decision in one line before starting work — "continuing 1.0.0. 4 of 11 features done, building #payroll from checkpoint 6".

---

## What `/hora` owns, and what it never does

| | Who does it |
|---|---|
| git, in every repository | **the main session** — `/hora` and the skills it runs. Never an agent |
| writing `.hora/` | the skill whose work it records |
| writing `specs/` | **`/hora-spec`, one approved section at a time, and `/hora-plan`, one approved edit at a time. Nobody else** |
| writing code and tests | the agents `/hora-build` starts |

**Manual verification is not one of the phases.** A human does it whenever they want, with the commands `/hora-setup` recorded in `.hora/tree/<repository>.md`. What *is* required is the local end-to-end environment checkpoint 17 builds: whenever a run drives the product, `/hora-accept` stops without it.

---

## Where the procedures live

**`/hora` holds the order. It holds no procedure and no pass/fail criterion.** How to write any piece of the implementation — and what an acceptance review looks at — lives in the conventions package the spec declares, which `/hora-setup` equips (`references/structure.md`, "The division of labor").

**Never write one of those procedures into a hora skill.**

---

## The closing report

**The outer `git status` shows nothing from inside the nested repositories.** Check and report it for the hora repository and for every declared row.

```bash
git status --short --branch
git -C <row> status --short --branch    # for every row
```

**`--branch` matters, not just `--short`.** Every repository is expected to be on `release/<version>`; one sitting elsewhere is worth surfacing.

What the report includes:

```
the target version, and which skill the run reached
how many features are done, how many are left, and which checkpoint the
  current one stopped at
every open question — its Q<n> id, its category, its blocking value, one line
  of what it is, and a link. Never a bare count
the last acceptance verdict, and what it sent back
every feature this version listed rather than accepted — by id, never a count,
  and with what rests on each one
git status for every repository, including the branch
what the next run will start from
```

**Write it in the language of whoever ran it** (`references/structure.md`, "What language to write for humans").

**Every question is named and linked, whatever its blocking value.** "Two questions remain" is not a report.

**Every feature the version listed is named by id too, and never counted.** **This report is where such a debt is most easily lost** — the verdict is what everybody reads, and a report ending at "passed" is the sentence somebody remembers a month later.

### When a version cannot proceed, lay out the choices

A version with unfinished features blocks the next one. **State the ways out.**

```
1.0.0 has 3 unfinished features. 1.1.0 exists under specs/, but versions run
serially, so it cannot start yet.

Remaining: #payroll #bonus #year-end

  build it   -> just run /hora again
  drop it    -> mark the section kicked: yes in specs/1.0.0/spec.md
  defer it   -> kicked: yes in 1.0.0, kicked: no on the specs/1.1.0/ side
```

**A listed feature is never one of the remaining ones**, and it is never offered these three. It is running code nobody has specified, and the way out is a later version writing its two blocks.

**`/hora` only lays out the choices. It does not decide.**

---

## References

| File | Content |
|---|---|
| `references/structure.md` | **read first.** The layout, the invariants, the division of labor, the language rule |
| `references/commits.md` | branches, commits, merging, hotfix catch-up |
| `references/done-criteria.md` | what done means for a checkpoint, a feature, a version and a session |
| `references/asking.md` | **how anything is put to a person** — a check, a proposal or a question |
| `references/spec-format.md` | **the authority on the format** of a spec |
| `references/levers.md` | every lever, and which file owns its rules |
| `specs/skeleton/spec.md` | **the blank spec.** Headings and table headers only. Not a version |
| `../hora-spec/SKILL.md` | how a version's spec gets written |
| `../hora-setup/SKILL.md` | creating the repositories, and reading the real tree |
| `../hora-plan/SKILL.md` | the planner |
| `../hora-build/SKILL.md` | one feature through the checkpoints |
| `../hora-build/references/checkpoints.md` | the eighteen checkpoints themselves |
| `../hora-accept/SKILL.md` | acceptance |

**When a human asks how to write a spec, run `/hora-spec`.** Point them at `references/spec-format.md` and the skeleton when what they want is the format itself, or when they would rather write it by hand. Both routes produce the same document.
