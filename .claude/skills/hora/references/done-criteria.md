# Judging what is done

The conditions for a checkpoint, a feature, a version and a session to be done.

**Manual verification is not part of this.** A human does it whenever they want, in `<myproject>-backend`, with the commands `/hora-setup` recorded in `.hora/tree/<repository>.md`. **The local end-to-end environment is a different thing** — checkpoint 17 builds it and `/hora-accept` requires it.

---

## Four kinds of done

Do not conflate them.

| Unit | Condition to be done | Recorded in |
|---|---|---|
| **a checkpoint** | its exit condition holds, as `../../hora-build/references/checkpoints.md` states it | its checkbox in `.hora/tasks/<version>/<feature-id>.md` |
| **a feature** | all eighteen of its checkpoints are `[x]` — including 18, acceptance, judged against **that feature's own** acceptance criteria | its entry in `.hora/tasks/<version>/_plan.md` |
| **a version** | every feature is done, the sweep passed **over the whole version** and against **the version's own acceptance criteria**, and no blocking question is left | every entry in `_plan.md` is `[x]`, and **the newest block of** `.hora/acceptance/<version>/_sweep.md` reads `reach: full` and `version-criteria: <n> of <n>` with a verdict that counts as a pass (below) |
| **a session** | `git status` was checked and reported for every repository | the report |

**A session being done does not mean the version is done.** A single session is not expected to run to completion, so "how far this run got" and "whether the version is done" are reported separately.

---

## When a checkpoint is done

**`- [x]` may be set only once that checkpoint's own exit condition holds.** The exit conditions are in `../../hora-build/references/checkpoints.md`, which is the authority.

What is common to all eighteen:

```
1. the exit condition, as written, actually holds — not "work was done on it"
2. lint passes in the repository this checkpoint wrote in, on the files it touched
3. nothing it reported (a dependency, a conflict-proof change) is still sitting on
   a branch that has not yet merged into release/<version>
4. it does not deviate from the contract in .hora/contracts/<version>/
5. it uses the glossary's identifiers, and any new name was appended to the glossary
6. it honors the design constraint its feature's "out of scope" kind calls for
```

**Point 2 runs from inside that repository, always** (`structure.md`, "Where a per-repository command runs"). From the outer root it reads nothing and passes anyway.

**Point 3 is why a reported dependency pauses the checkpoint.** Until `install/<package>` has merged into `release/<version>`, the change exists only on that branch.

### Not applicable is a state, and it needs a reason

```markdown
- [x] 7. Worker  <!-- n/a: this feature triggers no background job -->
```

**A checkpoint may be marked not-applicable only against its own "when it does not apply" line**, never against convenience. A bare `n/a` is a skipped checkpoint wearing the mark of a cleared one.

**Two reasons do not come from a checkpoint's own line, and there are no others: `built before Hora Kit was adopted` and `accepted in <earlier version>`.** Both are admissible on the same condition — **the work happened, and what happened is still there to be opened**: running code in the first case, a released version's task file in the second.

**The first is `built before Hora Kit was adopted`.** A spec section may declare `<!-- built: spec | backend | frontend -->`, and `/hora-plan` marks that many checkpoints not-applicable mechanically. **Checkpoint 18 is never one of them**, and the mark is cleared wherever acceptance later sends the run back — code that has to change was not inherited after all.

**The second is `accepted in <earlier version>`:** a checkpoint whose work is recorded as passed in a released version's task file, on a feature re-scheduled **only** because a listed feature's debt was paid, where nothing about that checkpoint is being redone. `/hora-plan` writes it on checkpoints 1 to 17 of every transitive dependent it re-schedules (`../../hora-plan/SKILL.md`, "Paying a listed feature's debt").

```markdown
- [x] 1. Draft or confirm the specification  <!-- n/a: accepted in 1.1.0; re-accepted because #billing's debt was paid -->
```

**The mark names what re-scheduled the feature as well as where the pass came from**, so a later reader can check it against the condition above.

| | `built before Hora Kit was adopted` | `accepted in <earlier version>` |
|---|---|---|
| What it points at | code that existed before the kit ever read the spec | an `[x]` a released version's task file already carries, on work this version does not redo |
| Written by | `/hora-plan`, expanding a confirmed `<!-- built: -->` | `/hora-plan`, on a dependent re-scheduled because a listed feature's debt was paid |
| Checkpoint 18 | never | never — the re-acceptance is the entry's whole purpose |
| Cleared when | acceptance sends the run back into that code | the same |

**It reaches checkpoints whose own "when it does not apply" line reads `never`, which is why it is authorized here.** The mark says "this was accepted in 1.1.0 and is not being redone", not "this did not apply", and naming the version and the file is what makes it checkable.

**Never use it for a checkpoint that did not run anywhere, and never for a feature re-scheduled for any other cause** — a finding from acceptance, a spec change, a contract drift, code that has to be touched at all. **And never on checkpoint 18.**

Two of the eighteen deserve particular suspicion, because both look skippable and are usually not:

| | Why it gets wrongly skipped | What has to be true |
|---|---|---|
| **7. Worker** | the processing "looks synchronous" | the execution-placement skill was actually run, and said so |
| **5 / 13. The modules the implementation needs** | "nothing extra is needed" | what the next checkpoint will import was actually listed and checked |

**A listed feature's checkpoints are not not-applicable, and none of the eighteen is marked at all.** `built:` on such a feature is recorded rather than acted on, so it expands into no marks (`spec-format.md`, "`baseline`"). The entry is left out of the count instead ("When a feature is done", below).

**Nothing marked is the stronger choice, because there is then no `[x]` to misread.** The opposite misreading — eighteen empty boxes taken for a feature nobody started — is answered in the feature file's own header (`../../hora-plan/SKILL.md`, "One file per feature").

### Tests, where a checkpoint's exit condition names them

Three checkpoints name tests: 6 (the backend's units), 16 (the frontend's), 18 (everything).

**A test existing for an acceptance criterion and that test actually backing the behavior are two different things.**

```
Acceptance criterion: createRpaFlow returns an error on a duplicate flow_key

❌ a test that passes a duplicate and only checks "an exception was thrown"
   → passes for any exception. Does not check that it is the constraint violation

✅ a test that checks the kind or content of the error on a duplicate
```

**Never weaken a test to pass a checkpoint.** No test skipped, deleted, loosened or waited out. The skills covering test execution are the authority; it is repeated here because "make the suite green" is exactly the instruction that produces a suite which no longer checks anything.

Where tests live, how they are named, how their order is guaranteed and which helpers to use come from the skills covering backend test placement, and from the real tree `/hora-setup` read.

**A checkpoint whose spec has no acceptance criteria must not be marked done.** `/hora-plan` should already have raised `missing-acceptance` (`blocking: yes`).

**The criteria a checkpoint is judged against are its own feature's, and the version's own are never among them** (`spec-format.md`, "15. Version acceptance criteria"). A test written for one at checkpoint 6 or 16 can only pass by building somebody else's feature or by weakening the test.

---

## When a feature is done

```
1. all eighteen checkpoints are [x], each either passed or marked n/a with a reason
2. checkpoint 18 passed — /hora-accept reported a pass over every feature in scope,
   not only this one
3. the feature/<feature-id> branch in every repository it touched has merged into
   that repository's release/<version>, and been deleted
4. .hora/ was committed at each gate boundary
```

**Point 2 is what makes this different from a task-level "done".** A feature is done when the product, with that feature in it, still does what it claims end to end.

**A withdrawn feature is not "done".** Its entry moves to `_plan.md`'s `## Withdrawn` and carries no checkbox, so it never counts either way. If it was already implemented, a removal task is raised and the move waits for that to finish — **removing a task does not remove the code**.

**A listed feature is not done, and it is not undone either — it is not counted.** A section carrying `<!-- baseline: inventoried -->` was never specified, so **not one of its eighteen boxes is marked in either direction**: there is nothing for point 1 to read and nothing for point 2's pass to be a pass over. Its entry sits under `_plan.md`'s `## Not accepted`, with no checkbox. **What separates it from a withdrawn feature is what happens next**: a withdrawn one raises a removal task; a listed one is working code somebody will specify in the version that next changes it.

---

## When a version is done

```
1. every entry in .hora/tasks/<version>/_plan.md is [x]
   (## Withdrawn is not counted, and neither is ## Not accepted)
2. .hora/questions/<version>/open.md has no unresolved blocking: yes
3. the newest block of the whole-version sweep's record reads `reach: full`,
   its `version-criteria:` line accounts for every criterion the version
   declared, and that block's verdict reads `passed`, or
   `passed over <n> of <m> features; <k> not accepted`
   (.hora/acceptance/<version>/_sweep.md)
4. lint and test pass in every declared repository and in app
5. every contract in .hora/contracts/<version>/ matches the implementation
6. no repository has uncommitted changes
7. every implementation repository has been merged into main
```

**Point 1 excludes both sections because an entry in either one carries no checkbox.** Count `## Not accepted` and a version holding a single listed feature could never be done.

**A version that finishes with entries under `## Not accepted` is released with a named debt, not with a pass.** The sweep reads `passed over 17 of 20 features; 3 not accepted`, and **the tag on `app` means exactly what that record means — no more.**

**Point 3 names the verdict strings rather than the word `passed`**, because grepping for one word matches the counted form too, and matches an older block's verdict. The grammar itself is `../../hora-accept/SKILL.md`'s ("Recording the result"); what this condition adds is that both strings clear the version.

**It reads `reach:` alongside the verdict.** The version's own sweep may be invoked before every feature is done, and such a run writes a truthful `passed over 8 of 20 features; 0 not accepted` over `reach: scoped`. **`reach: full` is the only line that claims the run reached everything acceptance could reach.**

**It reads `version-criteria:` for the same reason, one level up.** Those criteria reach no gate at all (`spec-format.md`, "15. Version acceptance criteria"), so the sweep is the only run that checks them. **A version whose spec declared `none` is done on `none declared`.**

**A listed feature does not cost the sweep its `reach: full`.** Nothing can reach a feature with no checkbox and no acceptance criteria, so a reach that counted it would leave a version impossible to finish. `reach:` answers how much of what was reachable this run reached; `<k>` and the record's `not-accepted:` line answer what nothing reached.

Point 5 checks that nothing drifted from a contract. **On finding a drift, do not rewrite the contract after the fact — report why the drift happened instead.**

Point 7's ordering — app last, after every declared row — is in `commits.md`, "Merge order into main". It is what makes a single tag on app sufficient evidence that a version was released.

Once a version is done, check whether the next version's `specs/<version>/` exists and report that. If not, offer `/hora-spec`.

### Running lint and test for the whole repository

Follow the command names in the `package.json` `scripts` that `/hora-setup` recorded in `.hora/tree/<repository>.md` (below is a guide).

```bash
# for each declared repository
cd <myproject>-<row>
npm run lint
npm test
```

The parent (`myproject-app`) also has lint. Its tree holds almost no JavaScript, so this is a self-check of the root's own config, not a review of `.claude/`'s markdown.

```bash
npm run lint
```

**Do not put a cross-repository script in the parent.** Something like `npm --prefix <myproject>-backend run dev` does not work for someone working from a standalone clone.

### Handling a failure

| Failure | Response |
|---|---|
| a bug in the implementation | fix it. The checkpoint stays undone |
| a lint naming violation | **do not invent a workaround name on the spot.** Check the glossary; if it is not there, append to it first, then fix the code |
| two lint rules that cannot both be satisfied | `/hora-build`, "A lint rule contradiction". Never handed to the user |
| an acceptance criterion cannot be met | the spec may describe something unachievable. Raise it as `contradiction` |
| a DB connection error | the middleware is not running. Point at the manual-verification steps (`.hora/tree/<repository>.md`). `/hora` does not bring it up |
| an existing test fails | the implementation broke existing behavior. Fix it. If the spec calls for breaking it on purpose, confirm through a question |

**Never set `- [x]` while a test does not pass.** Report that it did not.

### Lint's naming rules

`@openreachtech/eslint-config` strictly forbids certain identifier names — suffixes, words and syntax. **Read them from the package itself**, under the linted repository's own `node_modules/@openreachtech/eslint-config/` (`structure.md`, "The division of labor").

`/hora-plan` already checks the glossary against these rules, so a failure here means something is missing from it. **Once a workaround name is chosen, append it to the glossary's "names avoided, and why".**

---

## What is not reported

| | Why |
|---|---|
| the run history (what happened when) | `git log .hora/` already holds it |
| the history of identifier changes | git holds it. The glossary only records "why this name" |
| the result of manual verification | `/hora` never does it. It only points at the steps |
| how an acceptance review reached its verdict | the skills covering the acceptance review own that. `.hora/acceptance/` records each run's verdict, its findings and which skills it matched |
