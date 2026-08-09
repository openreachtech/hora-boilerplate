# Why the parallel run stays opt-in

`.claude/workflows/implement.js` already carries a full design for running Stage 2 in parallel — the dispatcher, `bank-id`, the `_orders/` structure, per-repository Lint and Test phases. None of that is being withdrawn. What is unresolved is `/hora`'s own git-branch management once several tasks are actually resolved at once, and that unresolved piece is why Stage 2 defaults to serial for every project, not only for this one.

## The unresolved piece

`hora-implementer` never touches git — every task it implements lands, uncommitted, in one shared working tree, alongside whatever every other concurrently-running task is doing. Splitting that shared, uncommitted state back into one clean commit per task, after the fact, runs into a real problem: an aggregation file gets rewritten **in full** by every task that touches its folder, so the file's state in the working tree already carries every later task's contribution by the time an earlier task's commit is built from its own `touchedFiles` list. A commit built that way silently absorbs a different task's work along with it.

The serial run does not have this problem — `/hora` processes one task at a time, cuts that task its own branch (`task/id/<id>`, see "Per-change branches" under Commits), commits and merges it back before the next task's branch is even cut. Nothing is ever shared, uncommitted, between two tasks at once.

Giving every *parallel* task the same per-branch treatment would resolve the same way — except a single working directory can only have one branch checked out at a time, and this project does not use git worktrees to give each concurrent task its own checkout. Until that constraint is resolved one way or another, parallel Stage 2 cannot safely commit its own tasks per-task the way serial does.

### A concrete illustration: a dependency discovered mid-task

The serial run's own procedure (`SKILL.md`, "Processing one task") shows exactly why the single-checkout constraint bites. When `hora-implementer` reports a dependency it needs partway through a task, the serial flow pauses that one task, installs the dependency on its own branch, merges it into `release/<version>`, then rebases `task/id/<id>` onto the new tip before continuing — a full-chain rebase back to where the branch first left `release/<version>`, if it happens to be a sub-feature branch nested deeper than that. In the serial run this is simple: nothing else is running, so there is no concurrent state the rebase could conflict with.

In the parallel run, the same trigger is far harder. Several tasks' branches could be open at once, each potentially needing the same rebase once the dependency lands — but only one branch can be checked out in this project's single working directory at a time, so rebasing them one by one means repeatedly switching the whole working directory out from under whatever else is mid-edit. This is the single-checkout problem from above, showing up again at a different point (an in-flight rebase, not only the final commit-splitting step) — not a separate gap, but the same one.

## What this means in practice

Stage 2 defaults to serial (`SKILL.md`, "Serial by default") for this reason, in every project built from this template — not as a cautious default to be lifted casually, but because the alternative currently has a real, unresolved correctness gap. Delegating to `.claude/workflows/implement.js` remains available, and stays exactly as capable as it already is, for a version that explicitly asks for it and can accept that gap — but it is not the default, and no future minor update should make it the default on its own, without this gap actually being closed first.
