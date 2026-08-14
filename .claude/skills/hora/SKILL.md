---
name: hora
description: Implement an application from its spec. Decides where a project stands and runs the five skills that do the work — spec, setup, plan, build, accept — one feature at a time, each to acceptance before the next starts. Runs at the root of the hora repository. Started or restarted only by an explicit `/hora` invocation.
---

# hora

**The orchestrator.** Decide where this project stands, run the skill that comes next, and own every git operation on the way.

`/hora` does no implementation of its own. Five skills do the work:

| Skill | Does | Runs |
|---|---|---|
| **`/hora-spec`** | writes the version's spec, in conversation — stage 0 reads what already exists, then its own seven stages | once per version, until stage 7 passes |
| **`/hora-setup`** | creates the repositories the spec declares, fills in the project's values, reads the real tree | once per version, idempotent |
| **`/hora-plan`** | fixes the version, verifies the spec in conversation, writes the feature list | once per version, re-entered every run |
| **`/hora-build`** | takes one feature through the eighteen checkpoints | **once per feature** |
| **`/hora-accept`** | runs the full unit suites every time, and the acceptance review at the invocation's reach | at each feature's checkpoint 18 (scoped), and once as a whole-version sweep (full) |

Read `references/structure.md` before anything else — the repository layout, where a per-repository command runs, and the three invariants all come from there. `references/commits.md` holds every git rule.

---

## The shape of a run

```
/hora-spec ─> /hora-setup ─> /hora-plan ──┬─> /hora-build #A ─> /hora-accept ─┐
                                          ├─> /hora-build #B ─> /hora-accept ─┤
                                          └─> /hora-build #C ─> /hora-accept ─┴─> sweep ─> merge
```

**One feature goes all the way to acceptance before the next one starts.** Backend, then frontend, then acceptance — per feature, not per layer. Building every backend task, then every frontend task, then testing, means the first time anyone finds out whether a feature *works* is after all of them are written.

**Re-entrancy is the center.** A single session does not run to the end. Each run decides where it is and continues from there. **Nothing is ever redone because a session ended** — every checkpoint's checkbox is written the moment it passes.

**Serial down to the checkpoint.** No feature ever runs alongside another, and no checkpoint alongside another checkpoint.

**Inside a checkpoint, its units do run together.** Five of the eighteen divide into units whose files are exclusive — a table, a module, an operation, a component, a screen — and each gets an implementer of its own. The checkpoint stays one gate with one exit condition (`../hora-build/SKILL.md`, "Step 5 — splitting a checkpoint into units").

---

## Deciding where you are

Do this first, every time — a fresh start and a restart alike.

```
0. git fetch origin --prune, for the hora repository and every declared row
   that already exists. Then check for a hotfix that landed on main
   (references/commits.md, "Keeping release/<version> current")

1. Does the target version have a spec at all — a specs/<version>/spec.md with
   content in it?                             if not → /hora-spec.
                                              A version with no spec declares no
                                              layout, so /hora-setup has nothing
                                              to read and /hora-plan nothing to
                                              verify

2. Are all declared repositories present, per the current spec's layout?
                                              if any is missing  → /hora-setup

3. Always run /hora-plan. It fixes the version, and reconciles the feature
   list against specs/ on every re-entry

4. Does .hora/questions/<version>/open.md still hold an unresolved
   blocking: yes?                             if so → stop. Report what to fix

5. Does .hora/tasks/<version>/_plan.md still hold an unfinished feature — an
   entry with a [ ] box that the ## Acceptance sweep entry does not already
   close?                                     if so → /hora-build, on the
                                                      first one that is ready

6. No [ ] entry remains that the ## Acceptance sweep entry does not close, and
   _sweep.md's newest block does not read reach: full with a passing verdict
   and a version-criteria: line accounting for every criterion the version
   declared                                   → /hora-accept, whole-version

6a. It does, and entries that sweep closes still stand [ ]
                                              → /hora-plan again, to set them
                                                and their checkpoint 18 off
                                                that block (../hora-plan/
                                                SKILL.md, "collapses to one
                                                sweep")

7. _sweep.md's newest block reads reach: full with a passing verdict and a
   version-criteria: line accounting for every criterion the version
   declared, and every entry in _plan.md is [x]
                                              → merge (references/commits.md,
                                                "Merge order into main";
                                                references/done-criteria.md,
                                                "When a version is done",
                                                conditions 1 and 3)
```

**Step 0 is also what catches `release/<version>` up with a `hotfix/*`.** `/hora` has no scheduler: this fetch and the one right after every merge into `release/<version>` are the only two occasions it gets to notice one landed on `main`.

**`/hora` does not ask before running this check, or before acting on an ordinary result.** It stops and asks once the check turns up something it cannot resolve on its own.

**Step 1 is not "write the spec for them".** `/hora-spec` writes nothing without somebody reading it first, and a run that reaches step 1 with nobody there to answer stops there.

**Step 3 runs even when the feature list already exists.** A spec keeps moving while implementation is under way. Only once `/hora-plan`'s reconciliation shows no difference does a version move on.

**Step 5 reads only the entries that carry a checkbox, so a listed feature is never a candidate.** A feature listed under `Baseline: inventoried` sits under `_plan.md`'s `## Not accepted` with no box at all, so it is neither done nor unfinished. **A version whose every remaining feature is listed passes step 5 and is swept at step 6** (`references/spec-format.md`, "`baseline`"). Paying the debt is a later version's ordinary work, scheduled by a person.

**Step 5 also passes over an entry whose checkpoint 18 the `## Acceptance` sweep entry covers.** Its `[ ]` means *the sweep will close this*, not *hand this to `/hora-build`* (`../hora-plan/SKILL.md`, "collapses to one sweep"; `../hora-build/SKILL.md`, "Where to start").

**Steps 6 and 7 read the newest block's own `reach:`, never whether `_sweep.md` exists.** That sweep may be invoked before every feature is done, and every run appends a block, so the file's presence says only that it ran at least once. A sweep invoked at the eighth of twenty gates writes a truthful `reach: scoped`.

**They read `version-criteria:` beside `reach:`, for the same reason one level up.** `reach: full` says the run reached every feature acceptance could reach; the version's own criteria reach no feature's gate at all (`references/spec-format.md`, "15. Version acceptance criteria").

**Keyed that way the two steps leave no gap.** Whatever fails step 7's test — no record, `reach: scoped`, a `failed` verdict, a short `version-criteria:` line — satisfies step 6's predicate, so the run goes back to `/hora-accept`.

**Step 6a exists because the run that earns a collapsed version's checkboxes must also set them.** `/hora-accept` records and never writes `_plan.md`; `/hora-build` never opens those entries, which is the collapse; so `/hora-plan` is the writer, off the sweep's own record. Left to the next invocation's step 3, the merge happens first — and a released version's plan is never rewritten (`../hora-plan/SKILL.md`, "Resolve the diffs first").

**Step 7 tests condition 1 as well, and not condition 3 alone.** A passing sweep says the work was accepted; the checkboxes say the record caught up.

Report the decision in one line before starting work — for example, "continuing 1.0.0. 4 of 11 features done, building #payroll from checkpoint 6".

---

## What `/hora` owns, and what it never does

**Every git operation happens in the main session** — whether `/hora` runs it directly or a skill it invoked does (`/hora-setup` initializing a row, `/hora-build` cutting a feature branch). **No agent any skill starts ever touches git.**

| | Who does it |
|---|---|
| git, in every repository | **the main session** — `/hora` and the skills it runs. Never an agent |
| writing `.hora/` | the skill whose work it records (`/hora-plan` the plan, `/hora-build` the checkpoints, `/hora-accept` the acceptance records) |
| writing `specs/` | **`/hora-spec`, one approved section at a time, and `/hora-plan`, one approved edit at a time. Nobody else** (`references/structure.md`, invariant 1) |
| writing code and tests | the agents `/hora-build` starts |

**Manual verification is not one of the phases.** A human does it whenever they want, in the backend row, with the commands `/hora-setup` recorded in `.hora/tree/<repository>.md`. What *is* required is the local end-to-end environment checkpoint 17 builds: whenever a run drives a browser, `/hora-accept` stops without it. A gate run that skips the live review is the one run that neither requires the stack nor brings it up, and its record says so (`../hora-accept/SKILL.md`, "What is in scope").

---

## Where the procedures live

**`/hora` holds the order. It holds no procedure and no pass/fail criterion.** How to write a resolver, a migration, a component or a test — and what an acceptance review looks at — all live in `@openreachtech/ai-agent-skills`, which `/hora-setup` equips into this repository's own `.claude/skills/`.

**Never write one of those procedures into a hora skill** (`references/structure.md`, "The division of labor").

---

## The closing report

**The outer `git status` shows nothing from inside the nested repositories.** Run it at the root and only updates to `.hora/` are visible, so commits get forgotten.

**Check and report `git status` for the hora repository and for every declared repository.** The number of repositories differs per project, so walk the declaration.

```bash
git status --short --branch
git -C <project name>-<declared row> status --short --branch    # for every row
```

**`--branch` matters now, not just `--short`.** Every repository is expected to be on `release/<version>`; one sitting on anything else is worth surfacing.

What the report includes:

```
the target version, and which skill the run reached
how many features are done, how many are left, and which checkpoint the
  current one stopped at
every open question — its Q<n> id, its category, its blocking value, one line
  of what it is, and a link to the file it is in (references/structure.md,
  "Citing a question in a report"). Never a bare count
the last acceptance verdict, and what it sent back
every feature this version listed rather than accepted — by id, never a count,
  and with what rests on each one
git status for every repository, including the branch (state it explicitly if
  anything is uncommitted, or if a branch is not release/<version>)
what the next run of /hora will start from
```

**Write it in the language of whoever ran it**, always (`references/structure.md`).

**Every question is named and linked, whatever its blocking value** (`references/structure.md`, "Citing a question in a report"). "Two questions remain" is not a report.

When it stopped with a `blocking: yes` outstanding, **put what the human has to do first** — which section to add what to, and the link, at the top.

**Every `eslint-exception` question gets its own line, by name, with its link** — never counted among the ordinary questions.

**Every feature the version listed rather than accepted is named by id too, and never counted.** Name each one, and name what rests on it: a dependent records `Rests on: #x (not accepted)` in its own feature file (`../hora-plan/SKILL.md`, "One file per feature").

**This report is where such a debt is most easily lost.** The verdict and the findings are what everybody reads, and a closing report that ends at "passed" is the sentence somebody remembers a month later (`../hora-accept/SKILL.md`, "Recording the result").

### When a version cannot proceed, lay out the choices

A version with unfinished features blocks the next one from starting. **State the ways out.**

```
1.0.0 has 3 unfinished features. 1.1.0 exists under specs/, but versions run
serially, so it cannot start yet.

Remaining: #payroll #bonus #year-end

  build it        → just run /hora again
  drop it         → mark the section kicked: yes in specs/1.0.0/spec.md
  defer it        → kicked: yes in 1.0.0, kicked: no on the specs/1.1.0/ side
```

**A listed feature is never one of the remaining ones, and it is never offered these three ways out.** It is running code nobody has specified yet, and the way out is a later version writing its two blocks (`references/spec-format.md`, "`baseline`").

**`/hora` only lays out the choices; it does not decide.**

---

## References

| File | Content |
|---|---|
| `references/structure.md` | **read first.** The layout, where a command runs, the invariants, the division of labor, the language rule, what lives in `.hora/` |
| `references/commits.md` | branches, commit granularity, merging, hotfix catch-up, merge order into main |
| `references/done-criteria.md` | what "done" means for a checkpoint, a feature, a version and a session |
| `references/asking.md` | **how anything is put to a person** — a check, a proposal or a question, and the question tool |
| `references/spec-format.md` | **the authority on the format** of `specs/<version>/spec.md` |
| `references/levers.md` | every lever, and which file owns its rules |
| `specs/skeleton/spec.md` | **the blank spec.** Headings and table headers only. Not a version |
| `../hora-spec/SKILL.md` | **the author** — how a version's spec gets written |
| `../hora-spec/references/stages.md` | stage 0, then the seven stages, and each one's exit condition |
| `../hora-spec/references/investigation.md` | what stage 0 reads, and the line between a fact and an intent |
| `../hora-spec/references/principles.md` | the thinking a spec is written with |
| `../hora-setup/SKILL.md` | code setup |
| `../hora-plan/SKILL.md` | the planner |
| `../hora-build/SKILL.md` | one feature through the checkpoints |
| `../hora-build/references/checkpoints.md` | the eighteen checkpoints themselves |
| `../hora-accept/SKILL.md` | acceptance |

**When a human asks how to write a spec, run `/hora-spec`.** `specs/1.0.0/spec.md` ships empty, and that skill reads whatever already exists at stage 0, copies the skeleton, asks its way through seven stages, and writes each section once it has been approved.

**On a project that already holds working code, stage 0 is the difference between a spec somebody dictates and one they correct.**

Point them at `references/spec-format.md` and `specs/skeleton/spec.md` when what they want is the format itself, or when they would rather write it by hand (`cp specs/skeleton/spec.md specs/1.0.0/spec.md`). Both routes produce the same document.
