<!-- 日本語版: [architecture.ja.md](./architecture.ja.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# How work gets executed

How Hora Kit turns a spec into an application: what runs where, what holds the state, and why the whole thing is serial.

This document explains the design. It is not the authority on any rule — each rule lives in the skill that owns it, and this file links to it.

---

## Four layers

```
        you  ──  /hora
                   │  decides where the project stands, owns every git operation
                   ▼
   /hora-spec   /hora-setup   /hora-plan   /hora-build   /hora-accept
        │                                       │
        │  seven stage skills,                  │  runs one feature through
        │  one per stage of the spec            │  18 checkpoints
        ▼                                       ▼
  hora-spec-usecases … hora-spec-review   hora-implementer   hora-verifier
        │  asks, proposes, writes one section   │  writes / checks one checkpoint
        ▼                                       ▼
                    @openreachtech/ai-agent-skills
                       how to actually write a resolver, a migration,
                       a component, a test — how to shape a table, an SDL,
                       a job or a screen — and what acceptance fails on
```

| Layer | What it decides | What it never decides |
|---|---|---|
| `/hora` | which phase comes next; every branch, commit and merge | anything about the work itself |
| the five skills | the order of the work, and each gate's exit condition | how any of it is written |
| the stage skills and the two agents | one section of the spec, or one checkpoint's code or verdict | where they run in the order; anything about git |
| `ai-agent-skills` | **every procedure and every pass/fail criterion** | when it is invoked |

**The bottom layer is the one that surprises people.** Hora Kit contains no instructions for writing a GraphQL resolver, a Sequelize migration or a Vue component, and it must not — those live in a package that is versioned and updated on its own. A copy inside Hora Kit would disagree with the original the first time that package moved, and nothing would announce that it had. See [`structure.md`](../.claude/skills/hora/references/structure.md), "The division of labor", and [`skills.md`](./skills.md).

---

## Feature by feature, not layer by layer

```
/hora-spec ─> /hora-setup ─> /hora-plan ──┬─> /hora-build #A ─> /hora-accept ─┐
                                          ├─> /hora-build #B ─> /hora-accept ─┤
                                          └─> /hora-build #C ─> /hora-accept ─┴─> sweep ─> merge
```

One feature goes through its spec, its backend, its frontend and then acceptance. **Only once it has passed acceptance does the next feature start.**

**The alternative is worth stating, because it is the ordinary way to do it.** Build every backend task, then every frontend task, then test: under that order, the first time anyone finds out whether a feature *works* is after all of them are written — and a shortfall in the data model is by then twenty features deep, every one of them built on it.

| | Layer by layer | Feature by feature |
|---|---|---|
| when a design flaw surfaces | at the end, in the test phase | at that feature's own acceptance gate |
| how much is built on top of it by then | everything | nothing |
| what a regression looks like | one of twenty changes did it | **the change you just made did it** |
| cost | one environment bring-up | one per feature |

The cost is real and it is accepted deliberately: bringing a container stack up per feature is cheap next to unwinding twenty features built on a wrong table.

**Acceptance is cumulative, which is what makes the middle row work.** [`/hora-accept`](../.claude/skills/hora-accept/SKILL.md) runs over **every feature implemented so far**, not the newest one. A feature that breaks an earlier one therefore fails in the run that broke it.

---

## Where each thing runs, and why

Not everything can be delegated to a subagent, and the line is not about difficulty.

| Checkpoints | Runs in | Why there |
|---|---|---|
| **1, 2, 9, 11** | **the main session, in conversation** | they exist to settle something *with a person*. **A subagent cannot ask anyone anything**, so delegating one turns "settle this with the author" into "the agent decided" — which is inventing a requirement |
| **3–7, 10, 12–16** | `hora-implementer` | ordinary implementation, scoped to one checkpoint's files |
| **8** | `hora-verifier` | a security audit is read-only by design; the agent has no write tools at all |
| **17, 18** | the main session | bringing up a container stack, and reviewing every feature so far, is not one checkpoint's file-scoped work |
| **all seven spec stages** | **the main session, in conversation** | for the same reason as 1, 2, 9 and 11: a stage exists to settle something with a person, and a subagent cannot ask anybody anything. Only stage 7's mechanical checks — a missing section, a duplicate `id` — could run anywhere else, and their findings still come back to be settled |

**`hora-verifier` has no write tools, and that is the point.** Letting the same agent implement and verify opens a path to loosening a failing test until it passes. It returns the fact that something is failing; it never fixes it.

**`hora-implementer` never touches git, `.hora/`, or `specs/`.** It writes code and tests for one checkpoint and reports everything else — a dependency it needs, a shared file it must not edit, a contract it wanted to change, a problem it found in the spec. [`/hora-build`](../.claude/skills/hora-build/SKILL.md) acts on the report.

**Why the agents are so tightly bounded:** every one of those prohibitions removes a way for two writers to collide, or for a decision to be made where nobody can see it.

---

## The state model

There is no state file. **The state is `.hora/`, and its checkboxes are the state.**

```
.hora/
  tree/<repository>.md          what /hora-setup read in the real tree, and the tag it read it at
  tasks/<version>/
    _plan.md                    the feature order, and the acceptance tasks
    <feature-id>.md             one feature, and its eighteen checkpoints
  contracts/<version>/          one file per server whose consumer is elsewhere
  questions/<version>/open.md   append-only. Answered by editing specs/
  acceptance/<version>/
    <feature-id>.md             one acceptance run, at one feature's gate
    _sweep.md                   the whole-version sweep
  glossary.md                   append-only, not split per version
```

`git log .hora/` is the history of what ran. Nothing else records it, and nothing needs to.

### Who may write what

| Directory | Written by | Everyone else |
|---|---|---|
| `specs/` | **humans** | read-only — with one narrow exception: `/hora-plan` may write an edit **a person has just read and approved**, one at a time |
| `.hora/` | the skill whose work it records | humans read only |
| the implementation repositories | `hora-implementer`, plus `/hora` for every git operation | — |

**The `specs/` exception exists because planning is a conversation.** Asking someone to hand-edit twenty separate holes one at a time defeats the point of having it. What is protected is not the act of writing — it is that **no requirement ever enters `specs/` without a human having read the exact words first.** Approval is per edit; "yes, fix them all" is not approval of edits nobody has read.

### A feature file

```markdown
# #attendance  Recording and listing attendance
<!-- spec: attendance @ sha256:abc123... -->
<!-- repositories: backend, frontend-employee -->

## Spec gate
- [x] 1. Draft or confirm the specification
- [x] 2. Verify the use cases can be met

## Backend gate
- [x] 3. DB and API schemas
- [x] 4. Stub API
- [ ] 5. The modules the implementation needs
...
- [x] 7. Worker  <!-- n/a: this feature triggers no background job -->
```

**Three states, and only three:** not passed, passed, and not-applicable-with-a-reason. A bare `n/a` is not a state — it is a skipped checkpoint wearing the mark of a cleared one. The full list, with each checkpoint's exit condition, is in [`checkpoints.md`](../.claude/skills/hora-build/references/checkpoints.md).

---

## Re-entrancy

**A single session is not expected to finish a project.** Specs are assumed to be plentiful; `/hora` is started and restarted as many times as it takes, and each run decides where it is.

```
0. fetch, and check whether a hotfix landed on main
1. are all declared repositories present?          missing → /hora-setup
2. always run /hora-plan                           (it reconciles specs/ every time)
3. any unresolved blocking question?               yes → stop, and say what to fix
4. any unfinished feature in _plan.md?             yes → /hora-build
5. every feature done, sweep not run?              → /hora-accept, whole-version
6. sweep passed                                    → merge
```

**Step 2 runs even when the feature list already exists.** A spec keeps moving while implementation is under way; sections get added, changed and withdrawn. Reconciling every time is the only way those reach the plan.

### Two different acts, on purpose

| | When | Why |
|---|---|---|
| **writing** a checkpoint's `[x]` | the moment it passes | an interrupted run must resume at the exact checkpoint it stopped at |
| **committing** `.hora/` | once per gate (after 2, 9, 17, 18) | eighteen commits per feature is not a history anyone reads |

Conflating the two costs one of those properties. Keeping them apart costs nothing.

---

## The git model

Every git operation belongs to `/hora`. No skill and no agent it starts ever touches git. The rules are in [`commits.md`](../.claude/skills/hora/references/commits.md); the shape is this:

```
main
 └── release/<version>            the version currently being built
      ├── feature/<feature-id>    one per repository the feature touches
      ├── install/<pkg>-<ver>     a dependency, on its own branch
      ├── update/<file>-with-<x>  a planned change to a shared file
      ├── retake/<what>-for-<why> a redo of something already merged
      └── adhoc/<rule>-in-<file>  a lint-rule contradiction, scoped to one file
```

**A feature branch is cut per repository, under the same name, and merges at its own gate's boundary.**

| | Cut when | Merges when |
|---|---|---|
| in the backend row | entering checkpoint 3 | **checkpoint 9 passes** |
| in a frontend row | entering checkpoint 10 | **checkpoint 17 passes** |

**Not after acceptance** — acceptance (18) covers every feature so far, so waiting for it would hold this feature's branches open across other features' work. What acceptance turns up comes back as a `retake/` branch instead, which is already the name for "merged, then found lacking".

**Why a dependency gets its own branch:** `package-lock.json` is the file two changes cannot both edit cleanly. One change at a time, merged before the next starts, is how a human team avoids that conflict, and it is how this does too.

---

## Why it is serial

**Nothing runs alongside anything.** Not two features, not two checkpoints, not two agents.

**Running features or checkpoints in parallel is not an optimization waiting to be switched on. It is blocked on an unsolved problem**, and the reason is written down here because otherwise somebody will build it.

**The problem is git, not throughput.** An implementer agent never touches git, so its work lands uncommitted in one shared working tree alongside whatever else is running. Splitting that back into one clean commit per task afterwards runs into this:

> **An aggregation file is rewritten in full by every task that touches its folder.** By the time an earlier task's commit is built from its own file list, that file already carries every later task's contribution. The commit silently absorbs work that is not its own.

Giving each parallel task its own branch would fix it — except **a single working directory can only have one branch checked out at a time**, and this design does not use git worktrees. The same constraint reappears mid-run: when a dependency is discovered partway through, the serial flow pauses that one task, installs it, and rebases; in parallel, several open branches would each need that rebase, which means switching the whole working directory out from under whatever else is mid-edit.

**Until that is genuinely resolved, serial is not a cautious default — it is the only one that commits correctly.**

**The order also makes parallelism worth much less than it sounds.** The unit is not a small task; it is a feature that ends at an acceptance run over the whole product. There is not much left to overlap.

---

## The two boundaries that hold it together

Everything above rests on two lines. Both are stated in [`structure.md`](../.claude/skills/hora/references/structure.md).

### 1. Ownership is split

`specs/` is written by humans; `.hora/` is written by the kit. When something is wrong in `specs/`, the response is to ask — a typo and a broken layout are treated the same. Allow "it is minor, I will just fix it" once and the rule is gone.

### 2. Classifying may be inferred; content may not

| | Example | Treatment |
|---|---|---|
| classifying | `target`, `depends` | **may be inferred** — it attaches a label, it adds no information |
| content | requirements, use cases, acceptance criteria, **which kind an API operation is**, **how far a feature was already built** | **must not be inferred** — it would mean inventing what the spec does not say |
| a permanent identifier | `id` | **must not be invented** — it is the reference key from `.hora/tasks/`, and it never changes |

**"Do not try to keep the number of questions down."** People who get asked start writing it down in advance, which is the mechanism that improves the spec.

---

## Where to go next

| | |
|---|---|
| what each command does, step by step | [`commands.md`](./commands.md) |
| the skills the checkpoints delegate to | [`skills.md`](./skills.md) |
| putting this on a project that already exists | [`adopting.md`](./adopting.md) |
| the eighteen checkpoints themselves | [`checkpoints.md`](../.claude/skills/hora-build/references/checkpoints.md) |
| the seven stages a spec is written through | [`stages.md`](../.claude/skills/hora-spec/references/stages.md) |
| the thinking a spec is written with | [`principles.md`](../.claude/skills/hora-spec/references/principles.md) |
| the format of a spec | [`spec-format.md`](../.claude/skills/hora/references/spec-format.md) |
