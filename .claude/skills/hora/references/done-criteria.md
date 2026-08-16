# Judging what is done

Four different things can be "done". Do not conflate them.

| Unit | Condition | Recorded in |
|---|---|---|
| **a checkpoint** | its exit condition holds, as `../../hora-build/references/checkpoints.md` states it | its checkbox in `.hora/tasks/<version>/<feature-id>.md` |
| **a feature** | all eighteen checkpoints are `[x]`, 18 judged against **that feature's own** acceptance criteria | its entry in `_plan.md` |
| **a version** | every feature is done, the sweep passed over the whole version and against **the version's own** criteria, and no blocking question is left | every `_plan.md` entry `[x]`, and `_sweep.md`'s newest block reading `reach: full` with a passing verdict |
| **a session** | `git status` was checked and reported for every repository | the report |

**A session being done does not mean the version is done.** One session is not expected to run to completion, so "how far this run got" and "whether the version is done" are reported separately.

**Manual verification is not part of this.** A human does it whenever they want, with the commands `/hora-setup` recorded in `.hora/tree/<repository>.md`. The local end-to-end environment is a different thing — checkpoint 17 builds it and `/hora-accept` requires it.

---

## When a checkpoint is done

**`- [x]` may be set only once that checkpoint's own exit condition holds.** What is common to all eighteen:

```
1. the exit condition, as written, actually holds — not "work was done on it"
2. lint passes in the repository this checkpoint wrote in, on the files it touched
3. nothing it reported — a dependency, a conflict-proof change — is still sitting
   on a branch that has not merged into release/<version>
4. it does not deviate from the contract in .hora/contracts/<version>/
5. it uses the glossary's identifiers, and any new name was appended there
6. it honors the design constraint its feature's "out of scope" kind calls for
```

**Point 2 runs from inside that repository, always** (`structure.md`, "Where a per-repository command runs"). From the outer root it reads nothing and passes anyway.

### Not applicable is a state, and it needs a reason

```markdown
- [x] 7. Work outside the request path  <!-- n/a: this feature triggers none -->
```

**A checkpoint may be marked not-applicable only against its own "when it does not apply" line.** A bare `n/a` is a skipped checkpoint wearing the mark of a cleared one.

**Three reasons do not come from a checkpoint's own line, and there are no others.** All three are admissible on one condition — **the work happened, and what happened is still there to be opened.**

| Reason | Written by | Points at |
|---|---|---|
| `built before hora was adopted` | `/hora-plan`, expanding a confirmed `<!-- built: -->` | code that existed before the kit read the spec |
| `accepted in <earlier version>` | `/hora-plan`, on a feature re-scheduled because a listed feature's debt was paid | an `[x]` a released version's task file already carries |
| `target names no <provider \| consumer> row` | `/hora-plan`, over a whole skipped gate | a role this feature does not touch |

**Checkpoint 18 never carries any of the three.**

**A not-applicable mark is cleared the moment its reason stops holding.** When acceptance sends a run back into code marked `built before hora was adopted`, that code is changing, so it was not simply inherited.

```markdown
- [x] 1. Draft or confirm the specification  <!-- n/a: accepted in 1.1.0; re-accepted because #billing's debt was paid -->
```

**A listed feature's checkpoints are marked as nothing at all** — not `[x]`, not `n/a` (`spec-format.md`, "`baseline`"). Its entry is left out of the count instead.

Two of the eighteen deserve suspicion, because both look skippable and usually are not:

| | Why it gets wrongly skipped | What has to be true |
|---|---|---|
| **7. Work outside the request path** | the processing "looks synchronous" | the placement skill actually ran, and said so |
| **5 / 13. The modules the implementation needs** | "nothing extra is needed" | what the next checkpoint will import was actually listed and checked |

### Tests, where a checkpoint's exit condition names them

Three checkpoints name tests: 6, 16 and 18.

**A test existing for an acceptance criterion and that test actually backing the behavior are two different things.**

```
Criterion: createRpaFlow returns an error on a duplicate flow_key

❌ a test that passes a duplicate and checks only "something was thrown"
   → passes for any error. Does not check that it is the constraint violation
✅ a test that checks the kind or content of the error
```

**Never weaken a test to pass a checkpoint.** No test skipped, deleted, loosened or waited out. The conventions package owns test execution; this is repeated here because "make the suite green" is exactly the instruction that produces a suite which no longer checks anything.

**The criteria a checkpoint is judged against are its own feature's.** The version's own criteria are never among them — a test written for one at checkpoint 6 or 16 can only pass by building somebody else's feature or by weakening the test.

---

## When a feature is done

```
1. all eighteen checkpoints are [x], each passed or n/a with a reason
2. checkpoint 18 passed — /hora-accept reported a pass over every feature in
   scope, not only this one
3. the feature branch in every repository it touched merged and was deleted
4. .hora/ was committed at each gate boundary
```

**Point 2 is what makes this different from a task-level "done".** A feature is done when the product, with that feature in it, still does what it claims end to end.

**A withdrawn feature is not done.** Its entry moves to `_plan.md`'s `## Withdrawn` with no checkbox, so it never counts either way. If it was implemented, a removal task is raised — **removing a task does not remove the code.**

**A listed feature is not done and not undone — it is not counted.** Not one of its boxes is marked in either direction. What separates it from a withdrawn one is what happens next: a withdrawn feature raises a removal task; a listed one is working code somebody will specify later.

---

## When a version is done

```
1. every entry in _plan.md is [x]
   (## Withdrawn and ## Not accepted carry no checkbox and are not counted)
2. no unresolved blocking: yes question remains
3. _sweep.md's newest block reads `reach: full`, its `version-criteria:` line
   accounts for every criterion declared, and its verdict reads `passed` or
   `passed over <n> of <m> features; <k> not accepted`
4. lint and tests pass in every repository, and in the hora repository
5. every contract in .hora/contracts/<version>/ matches the implementation
6. no repository has uncommitted changes
7. every implementation repository has merged into main
```

**A version finishing with entries under `## Not accepted` is released with a named debt, not with a pass.** The tag means exactly what the record means — no more.

**Point 3 reads `reach:` beside the verdict.** A sweep may be invoked before every feature is done, and such a run writes a truthful `passed over 8 of 20 features` over `reach: scoped`. **`reach: full` is the only line claiming the run reached everything acceptance could reach.**

**It reads `version-criteria:` for the same reason, one level up.** Those criteria reach no gate at all, so the sweep is the only run that checks them. A version whose spec declared `none` is done on `none declared`.

**A listed feature does not cost a sweep its `reach: full`.** Nothing can reach a feature with no checkbox and no criteria, so a reach that counted it would leave the version impossible to finish.

Point 5: **on finding a drift, do not rewrite the contract after the fact.** Report why the drift happened.

Once a version is done, check whether the next version's `specs/<version>/` exists, and report that. If not, offer `/hora-spec`.

### Running lint and tests

Use the command names `/hora-setup` recorded in `.hora/tree/<repository>.md`, from inside each repository. The hora repository has its own lint too — a self-check of its own config, not a review of `.claude/`.

**Do not put a cross-repository script in the hora repository.** It would not work for somebody working from a standalone clone of one row.

### Handling a failure

| Failure | Response |
|---|---|
| a bug in the implementation | fix it. The checkpoint stays undone |
| a lint naming violation | **do not invent a workaround name on the spot.** Check the glossary; append to it first, then fix the code |
| two lint rules that cannot both be satisfied | `../../hora-build/SKILL.md`, "A lint rule contradiction". Never handed to the user |
| an acceptance criterion cannot be met | the spec may describe something unachievable. Raise `contradiction` |
| a service is not running | point at the manual-verification steps. `/hora` does not bring it up |
| an existing test fails | the implementation broke existing behavior. Fix it. If the spec calls for breaking it deliberately, confirm through a question |

**Never set `- [x]` while a test does not pass.** Report that it did not.

---

## What is not reported

| | Why |
|---|---|
| the run history | `git log .hora/` already holds it |
| the history of identifier changes | git holds it. The glossary records only "why this name" |
| the result of manual verification | `/hora` never does it. It only points at the steps |
| how an acceptance review reached its verdict | the review skills own that. `.hora/acceptance/` records each run's verdict, findings and matched skills |
