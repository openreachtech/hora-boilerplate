---
name: hora
description: Implement an application from its spec. Decides where a project stands and runs the five skills that do the work — spec, setup, plan, build, accept — feature by feature, taking each one to acceptance before starting the next. Runs at the root of the hora repository (myproject-app). Started or restarted only by an explicit `/hora` invocation — each run picks up where the last one stopped.
---

# hora

**The orchestrator.** Decide where this project stands, run the skill that comes next, and own every git operation on the way.

`/hora` does no implementation of its own. Five skills do the work:

| Skill | Does | Runs |
|---|---|---|
| **`/hora-spec`** | writes the version's spec, in conversation, through its own seven stages | once per version, until stage 7 passes |
| **`/hora-setup`** | creates the repositories the spec declares, fills in the project's values, reads the real tree | once per version, idempotent |
| **`/hora-plan`** | fixes the version, verifies the spec in conversation, writes the feature list | once per version, re-entered every run |
| **`/hora-build`** | takes one feature through the eighteen checkpoints | **once per feature** |
| **`/hora-accept`** | runs acceptance over every feature implemented so far | at each feature's checkpoint 18, and once as a whole-version sweep |

Read `references/structure.md` before anything else — the repository layout, where a per-repository command runs, and the three invariants all come from there. `references/commits.md` holds every git rule.

---

## The shape of a run

```
/hora-spec ─> /hora-setup ─> /hora-plan ──┬─> /hora-build #A ─> /hora-accept ─┐
                                          ├─> /hora-build #B ─> /hora-accept ─┤
                                          └─> /hora-build #C ─> /hora-accept ─┴─> sweep ─> merge
```

**One feature goes all the way to acceptance before the next one starts.** Backend, then frontend, then acceptance — per feature, not per layer.

**This is the whole point of the design, so it is worth saying what it replaces.** Building every backend task, then every frontend task, then testing, means the first time anyone finds out whether a feature *works* is after all of them are written — at which point a shortfall in the data model is twenty features deep, every one of them built on it. Taking one feature to acceptance costs a container stack coming up more often, and buys the failure arriving while its cause is one commit old.

**Re-entrancy is the center.** Specs are assumed to be plentiful, so a single session does not run to the end. Each run decides where it is and continues from there. **Nothing is ever redone because a session ended** — every checkpoint's checkbox is written the moment it passes.

**Serial throughout.** No feature ever runs alongside another, and no checkpoint alongside another checkpoint. Processing one checkpoint still moves through several agents in sequence (an implementer, an agent for a reported dependency, a verifier) — one after another, never side by side.

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

5. Does .hora/tasks/<version>/_plan.md still hold an unfinished feature?
                                              if so → /hora-build, on the
                                                      first one that is ready

6. Every feature is done, and the sweep has not run
                                              → /hora-accept, whole-version

7. The sweep passed                           → merge (references/commits.md,
                                                "Merge order into main")
```

**Step 0 is also what catches `release/<version>` up with a `hotfix/*`.** `/hora` has no scheduler and no background process — this fetch, run at the start of every invocation, is one of only two occasions it ever gets to notice one landed on `main`. The other is right after every merge into `release/<version>` during the run itself. Between the two, nothing that changes `origin/main` goes unnoticed for long, without `/hora` ever needing a schedule of its own.

**`/hora` does not ask before running this check, or before acting on an ordinary result.** It only stops and asks once the check turns up something it genuinely cannot resolve on its own.

**Step 1 is not "write the spec for them".** `/hora-spec` writes nothing without somebody reading it first, and a run that reaches step 1 with nobody there to answer stops at step 1 (`../hora-spec/SKILL.md`).

**Step 3 runs even when the feature list already exists.** A spec keeps moving while implementation is under way, so sections may have been added, changed or withdrawn after the list was settled. Only once `/hora-plan`'s reconciliation shows no difference does a version move on.

Report the decision in one line before starting work — for example, "continuing 1.0.0. 4 of 11 features done, building #payroll from checkpoint 6".

---

## What `/hora` owns, and what it never does

**`/hora` owns every git operation.** Cutting a branch, committing, merging, rebasing, catching up with a hotfix — all of it, in every repository. No skill and no agent it starts ever touches git.

| | Who does it |
|---|---|
| git, in every repository | **`/hora` itself** |
| writing `.hora/` | the skill whose work it records (`/hora-plan` the plan, `/hora-build` the checkpoints, `/hora-accept` the acceptance records) |
| writing `specs/` | **`/hora-spec`, one approved section at a time, and `/hora-plan`, one approved edit at a time. Nobody else** (`references/structure.md`, invariant 1) |
| writing code and tests | the agents `/hora-build` starts |

**Manual verification is not one of the phases.** A human does it whenever they want (in the backend: `./docker.sh start` → `npm run db:refresh` → `npm run dev`). `/hora` does not do it for them. What *is* required is the local end-to-end environment checkpoint 17 builds — that one is a prerequisite of acceptance, not a convenience, and `/hora-accept` stops without it rather than reviewing something that is not really running.

---

## Where the procedures live

**`/hora` holds the order. It holds no procedure and no pass/fail criterion.** How to write a resolver, a migration, a component or a test — and what an acceptance review looks at — all live in `@openreachtech/ai-agent-skills`, which `/hora-setup` equips into this repository's own `.claude/skills/`.

**Never write one of those procedures into a hora skill.** A copy disagrees with the original the first time the package is updated, and nothing announces that it has. `references/structure.md`, "The division of labor", is the full statement of this, including how to match one of those skills by prefix.

---

## The closing report

**The one real harm of the nested structure is that the outer `git status` shows nothing from inside.** Run `git status` at the root and only updates to `.hora/` are visible. Commits get forgotten.

**Check and report `git status` for the hora repository and for every declared repository.** This cannot be skipped. The number of repositories differs per project, so walk the declaration.

```bash
git status --short --branch
git -C <project name>-<declared row> status --short --branch    # for every row
```

**`--branch` matters now, not just `--short`.** Every repository is expected to be on `release/<version>`; one sitting on anything else is worth surfacing, not silently reported as if it were normal.

What the report includes:

```
the target version, and which skill the run reached
how many features are done, how many are left, and which checkpoint the
  current one stopped at
the state of the questions (how many blocking remain)
the last acceptance verdict, and what it sent back
git status for every repository, including the branch (state it explicitly if
  anything is uncommitted, or if a branch is not release/<version>)
what the next run of /hora will start from
```

**Write it in the language of whoever ran it**, always — it is conversation, and it does not stay in a file (`references/structure.md`).

When it stopped with a `blocking: yes` outstanding, **put what the human has to do first** (which section to add what to, and the path to `.hora/questions/<version>/open.md`).

**Every `eslint-exception` question gets its own, separate line, by name — never just counted among the ordinary questions.** It records that a real lint rule contradiction forced an `adhoc/` branch through, and that is worth a human's attention on its own even though it never stopped the run.

### When a version cannot proceed, lay out the choices

A version with unfinished features blocks the next one from starting (versions run serially). **State the ways out.** Without that, a human is left to guess why the next version is not starting.

```
1.0.0 has 3 unfinished features. 1.1.0 exists under specs/, but versions run
serially, so it cannot start yet.

Remaining: #payroll #bonus #year-end

  build it        → just run /hora again
  drop it         → mark the section kicked: yes in specs/1.0.0/spec.md
  defer it        → kicked: yes in 1.0.0, kicked: no on the specs/1.1.0/ side
```

**`/hora` only lays out the choices; it does not decide.** Deciding the scope is on the side that must not be inferred.

---

## References

| File | Content |
|---|---|
| `references/structure.md` | **read first.** The layout, where a command runs, the invariants, the division of labor, the language rule, what lives in `.hora/` |
| `references/commits.md` | branches, commit granularity, merging, hotfix catch-up, merge order into main |
| `references/done-criteria.md` | what "done" means for a checkpoint, a feature, a version and a session |
| `references/spec-format.md` | **the authority on the format** of `specs/<version>/spec.md`. Explains it; is not the thing filled in |
| `specs/skeleton/spec.md` | **the blank spec.** Headings and table headers only. Copied to `specs/<version>/spec.md`. Not a version, and never read as one |
| `../hora-spec/SKILL.md` | **the author** — how a version's spec gets written |
| `../hora-spec/references/stages.md` | the seven stages a spec is written through, and each one's exit condition |
| `../hora-spec/references/principles.md` | the thinking a spec is written with |
| `../hora-setup/SKILL.md` | code setup |
| `../hora-plan/SKILL.md` | the planner |
| `../hora-build/SKILL.md` | one feature through the checkpoints |
| `../hora-build/references/checkpoints.md` | the eighteen checkpoints themselves |
| `../hora-accept/SKILL.md` | acceptance |

**When a human asks how to write a spec, run `/hora-spec`.** `specs/1.0.0/spec.md` ships empty, and that skill copies the skeleton, asks its way through seven stages, and writes each section once it has been read and approved.

Point them at `references/spec-format.md` and `specs/skeleton/spec.md` when what they want is the format itself, or when they would rather write it by hand (`cp specs/skeleton/spec.md specs/1.0.0/spec.md`). Both routes produce the same document, and `/hora-plan` reads it the same way.
