# Judging what is done

The conditions for a checkpoint, a feature, a version and a session to be done.

**Manual verification is not part of this.** A human does it whenever they want, in `<myproject>-backend`, with the commands `/hora-setup` read in that row's real tree — `.hora/tree/<repository>.md` holds them. `/hora` neither does it for them nor makes it a condition of being done. **The local end-to-end environment is a different thing** — checkpoint 17 builds it and `/hora-accept` requires it, because an acceptance review has nothing to review without one.

---

## Four kinds of done

Do not conflate them.

| Unit | Condition to be done | Recorded in |
|---|---|---|
| **a checkpoint** | its exit condition holds, as `../../hora-build/references/checkpoints.md` states it | its checkbox in `.hora/tasks/<version>/<feature-id>.md` |
| **a feature** | all eighteen of its checkpoints are `[x]` — including 18, acceptance | its entry in `.hora/tasks/<version>/_plan.md` |
| **a version** | every feature is done, the sweep passed **over the whole version**, and no blocking question is left | every entry in `_plan.md` is `[x]`, and **the newest block of** `.hora/acceptance/<version>/_sweep.md` reads `reach: full` with a verdict that counts as a pass (below) |
| **a session** | `git status` was checked and reported for every repository | the report |

**A session being done does not mean the version is done.** A single session is not expected to run to completion, so "how far this run got" and "whether the version is done" are reported separately.

---

## When a checkpoint is done

**`- [x]` may be set only once that checkpoint's own exit condition holds.** The exit conditions are in `../../hora-build/references/checkpoints.md`, one per checkpoint, and that file is the authority — this one does not restate them.

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

**Point 2 runs from inside that repository, always** (`structure.md`, "Where a per-repository command runs"). From the outer root it reads nothing and passes anyway, which is indistinguishable from having passed for real.

**Point 3 is why a reported dependency pauses the checkpoint rather than being noted for later.** Until `install/<package>` has merged into `release/<version>`, the change exists only on that branch, and a checkpoint recorded as passed while what it needed is still sitting there is a checkpoint that will not reproduce.

### Not applicable is a state, and it needs a reason

```markdown
- [x] 7. Worker  <!-- n/a: this feature triggers no background job -->
```

**A checkpoint may be marked not-applicable only against its own "when it does not apply" line**, never against convenience and never against "this seems small". A bare `n/a` is not a state; it is a skipped checkpoint wearing the mark of a cleared one.

**Two reasons do not come from a checkpoint's own line, and there are no others: `built before Hora Kit was adopted` and `accepted in <earlier version>`.** Both are admissible on one condition and the same one — **the work happened, and what happened is still there to be opened**: running code in the first case, a released version's task file in the second, and neither is ever rewritten. That is what makes the mark point at evidence instead of standing in for it. A reason that cannot point anywhere is the bare `n/a` above, however it is worded.

**The first is `built before Hora Kit was adopted`.** A spec section may declare `<!-- built: spec | backend | frontend -->`, and `/hora-plan` marks that many checkpoints not-applicable mechanically — on a feature the document goes on to specify, which is every feature except a listed one (below). **Checkpoint 18 is never one of them**, and a feature carrying the annotation is done on exactly the same terms as any other: acceptance passed. **The mark is also cleared wherever acceptance later sends the run back** — code that has to change was not inherited after all.

**The second is `accepted in <earlier version>`, and its condition is narrow enough to state in one sentence:** a checkpoint whose work is recorded as passed in a released version's task file, on a feature re-scheduled **only** because a listed feature's debt was paid, where nothing about that checkpoint is being redone. `/hora-plan` writes it on checkpoints 1 to 17 of every transitive dependent it re-schedules, so that the entry asks for the one thing it exists to ask for — a second acceptance against behavior that is now stated (`../../hora-plan/SKILL.md`, "Paying a listed feature's debt"). The evidence is `.hora/tasks/<earlier version>/<feature-id>.md`, which recorded the pass at the time and which no later version may rewrite, and the reason names that version so the second acceptance can be read against the first.

```markdown
- [x] 1. Draft or confirm the specification  <!-- n/a: accepted in 1.1.0; re-accepted because #billing's debt was paid -->
```

**The mark names what re-scheduled the feature as well as where the pass came from**, because the version alone says the checkpoint passed once and not why anything is owed a second time — and the clause is what a later reader checks the condition above against.

| | `built before Hora Kit was adopted` | `accepted in <earlier version>` |
|---|---|---|
| What it points at | code that existed before the kit ever read the spec | an `[x]` a released version's task file already carries, on work this version does not redo |
| Written by | `/hora-plan`, expanding a confirmed `<!-- built: -->` | `/hora-plan`, on a dependent re-scheduled because a listed feature's debt was paid |
| Checkpoint 18 | never | never — the re-acceptance is the entry's whole purpose |
| Cleared when | acceptance sends the run back into that code | the same: a finding that reopens the feature reopens it for real |

**It reaches checkpoints whose own "when it does not apply" line reads `never`, which is exactly why it is authorized here.** Checkpoints 1 and 2 never fail to apply, and 8 and 9 never do for a feature that wrote backend code (`../../hora-build/references/checkpoints.md`) — a re-scheduled dependent carries the mark on every one of them it has, because the mark says "this was accepted in 1.1.0 and is not being redone", not "this did not apply". **Read the other way, seventeen of those marks turn a feature that was built and accepted in 1.1.0 into one nobody ever ran a checkpoint on** — and naming the version and the file is what prevents it: whoever doubts the mark opens `.hora/tasks/1.1.0/<feature-id>.md` and finds the run.

**Never use it for a checkpoint that did not run anywhere, and never for a feature re-scheduled for any other cause.** A finding from acceptance, a spec change, a contract drift, code that has to be touched at all — each of those reopens the checkpoint for real, and marking it against a pass earned in an earlier version would claim that the earlier run covered work that did not exist when it ran. **And never on checkpoint 18 in any circumstance**: the entry exists because that feature's acceptance has to be earned again.

Two of the eighteen deserve particular suspicion, because both look skippable and are usually not:

| | Why it gets wrongly skipped | What has to be true |
|---|---|---|
| **7. Worker** | the processing "looks synchronous" | the execution-placement skill was actually run, and said so |
| **5 / 13. The modules the implementation needs** | "nothing extra is needed" | what the next checkpoint will import was actually listed and checked |

**A listed feature's checkpoints are not not-applicable, and none of the eighteen is marked at all.** `built:` on such a feature is required but recorded rather than acted on, so it expands into no marks (`spec-format.md`, "`baseline`") — and 18 could not be marked in any case: its own "when it does not apply" line reads `never` (`../../hora-build/references/checkpoints.md`). No reason is invented for this and none is needed; the entry is left out of the count instead ("When a feature is done", below).

**Nothing marked is the stronger choice, because there is then no `[x]` to misread.** A not-applicable mark reads as a cleared checkpoint to anybody who does not open the comment beside it, and a run of them on a feature nobody ever specified would say the feature had been taken through the kit and come out the other side. **The opposite misreading — eighteen empty boxes taken for a feature nobody ever started, by somebody who then rebuilds running code — is answered where it arises**, in the feature file's own header recording that the feature was listed (`../../hora-plan/SKILL.md`, "One file per feature").

### Tests, where a checkpoint's exit condition names them

Three checkpoints name tests: 6 (the backend's units), 16 (the frontend's), 18 (everything).

**A test existing for an acceptance criterion and that test actually backing the behavior are two different things.**

```
Acceptance criterion: createRpaFlow returns an error on a duplicate flow_key

❌ a test that passes a duplicate and only checks "an exception was thrown"
   → passes for any exception. Does not check that it is the constraint violation

✅ a test that checks the kind or content of the error on a duplicate
```

**Never weaken a test to pass a checkpoint.** No test skipped, deleted, loosened or waited out. The skills covering test execution are the authority; the reason it is repeated here is that "make the suite green" is exactly the instruction that produces a suite which no longer checks anything.

Where tests live, how they are named, how their order is guaranteed and which helpers to use all come from the skills covering backend test placement, and from the real tree `/hora-setup` read — not from here.

**A checkpoint whose spec has no acceptance criteria must not be marked done.** It should already have been raised as `missing-acceptance` (`blocking: yes`) by `/hora-plan`, so this is never reached.

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

**Point 2 is what makes this different from the task-level "done" it replaces.** A feature is not done when its code is written and its own tests pass — it is done when the product, with that feature in it, still does what it claims end to end.

**A withdrawn feature is not "done".** Its entry moves to `_plan.md`'s `## Withdrawn` and carries no checkbox, so it never counts either way. If it was already implemented, a removal task is raised and the move waits for that to finish — **removing a task does not remove the code**, and the model, the resolver, the tests and the migration all stay behind otherwise.

**A listed feature is not done, and it is not undone either — it is not counted, exactly as a withdrawn one is not.** A section carrying `<!-- baseline: inventoried -->` was never specified, so **not one of its eighteen boxes is marked in either direction — no `[x]`, and no not-applicable mark either** ("Not applicable is a state", above): there is nothing for point 1 to read and nothing for point 2's pass to be a pass over. Its entry sits under `_plan.md`'s `## Not accepted`, with no checkbox (`../../hora-plan/SKILL.md`, "`_plan.md` — the order"; `spec-format.md`, "`baseline`"). **What separates it from a withdrawn feature is what happens next**: a withdrawn one raises a removal task, because the code has to go; a listed one is working code somebody will specify in the version that next changes it, and that version writes the two blocks and earns the acceptance the entry never claimed.

---

## When a version is done

```
1. every entry in .hora/tasks/<version>/_plan.md is [x]
   (## Withdrawn is not counted, and neither is ## Not accepted)
2. .hora/questions/<version>/open.md has no unresolved blocking: yes
3. the newest block of the whole-version sweep's record reads `reach: full`,
   and that block's verdict reads `passed`, or
   `passed over <n> of <m> features; <k> not accepted`
   (.hora/acceptance/<version>/_sweep.md)
4. lint and test pass in every declared repository and in app
5. every contract in .hora/contracts/<version>/ matches the implementation
6. no repository has uncommitted changes
7. every implementation repository has been merged into main
```

**Point 1 excludes both sections for the same structural reason: an entry in either one carries no checkbox.** `## Withdrawn` holds a feature that should not exist; `## Not accepted` holds one the spec listed without ever specifying it (`../../hora-plan/SKILL.md`, "`_plan.md` — the order"; `spec-format.md`, "`baseline`"). **Count `## Not accepted` and a version holding a single listed feature can never be done** — the entry has no box, so it can never become `[x]`, and the only way out would be to give it one and mark it: exactly the pass nothing earned.

**A version that finishes with entries under `## Not accepted` is released with a named debt, not with a pass.** Those are two different releases and the record is the only thing that tells them apart: the sweep reads `passed over 17 of 20 features; 3 not accepted`, and **the tag on `app` means exactly what that record means — no more.** Nothing extra attaches to the act of tagging, and nobody may read anything extra into it. Whoever opens 1.0.0 two years later and finds three features nobody verified is reading what 1.0.0 said about itself, in the run that released it.

**Point 3 names the verdict strings rather than the word `passed`, because a check that reads for one word cannot tell the two apart.** Grep a sweep record for `passed` and `passed over 17 of 20 features; 3 not accepted` matches — as does an older block's verdict, which is the second reason the check reads the newest block and then distinguishes the two strings — the declared reduction laundered into a clean bill of health by whoever wrote the check, not by whoever wrote the record. The grammar itself is `../../hora-accept/SKILL.md`'s ("Recording the result"), which is also where a bare `passed` is forbidden unless `not-accepted: none` and `reach: full` both hold; what this condition adds is that both strings clear the version, and that a downstream file has to distinguish them to say why.

**It reads `reach:` alongside the verdict, because a counted verdict is honest about its own scope and still not a statement about the version.** The version's own sweep may be invoked before every feature is done, and one run that way covers the features finished by then: it writes `reach: scoped` over eight of twenty and a truthful `passed over 8 of 20 features; 0 not accepted`, which is one of the strings above. Read the verdict alone and the version is done on a run that never drove twelve of its features — and the line that said so was sitting in the same file. **`reach: full` is the only line that claims the run reached everything acceptance could reach**, and it is what makes the two accepted strings mean "this version" rather than "as much of it as somebody asked for".

**A listed feature does not cost the sweep its `reach: full`, and it must not.** Nothing can reach a feature with no checkbox and no acceptance criteria (`../../hora-accept/SKILL.md`, "What is in scope"), so a reach that counted it would leave a version holding one impossible to finish — the same dead end point 1 avoids by not counting the entry. `reach:` answers how much of what was reachable this run reached; `<k>` and the record's `not-accepted:` line answer what nothing reached. **A version is done with a named debt on a full sweep and a counted verdict**, and that pair is what the tag means.

Point 5 checks that nothing drifted from a contract during implementation. **On finding a drift, do not rewrite the contract after the fact — report why the drift happened instead.** A contract is derived once, before implementation, and pinned; once it drifts, the agreement between backend and frontend breaks down.

Point 7's ordering — app last, after every declared row — is in `commits.md`, "Merge order into main". It is what makes a single tag on app sufficient evidence that a version was released.

Once a version is done, check whether the next version's `specs/<version>/` exists and report that. If not, say so and offer `/hora-spec` — the next version's spec is a diff against this one, and it is written the same way the first one was.

### Running lint and test for the whole repository

Follow the command names in the `package.json` `scripts` that `/hora-setup` recorded in `.hora/tree/<repository>.md` (below is a guide).

```bash
# for each declared repository
cd <myproject>-<row>
npm run lint
npm test
```

The parent (`myproject-app`) also has lint. Its own tree holds almost no JavaScript — the implementation rows and the equipped skills are ignored by design — so this is a self-check of the root's own config and of any script that ever lands there, not a review of `.claude/`'s markdown.

```bash
npm run lint
```

**Do not put a cross-repository script in the parent.** Something like `npm --prefix <myproject>-backend run dev` that reaches into another repository does not work for someone working from a standalone clone. Run things in each repository instead.

### Handling a failure

| Failure | Response |
|---|---|
| a bug in the implementation | fix it. The checkpoint stays undone |
| a lint naming violation | **do not invent a workaround name on the spot.** Check the glossary; if it is not there, append to it first, then fix the code |
| two lint rules that cannot both be satisfied | `/hora-build`, "A lint rule contradiction". Never handed to the user |
| an acceptance criterion cannot be met | the spec may describe something unachievable. Raise it as `contradiction` |
| a DB connection error | the middleware is not running. Point at the manual-verification steps (`.hora/tree/<repository>.md` holds the commands). `/hora` does not bring the middleware up on its own |
| an existing test fails | the implementation broke existing behavior. Fix it. If the spec calls for breaking it on purpose, confirm through a question |

**Never set `- [x]` while a test does not pass.** Report the fact that it did not.

### Lint's naming rules

`@openreachtech/eslint-config` strictly forbids certain identifier names — suffixes, words and syntax. **A naive name fails.** The rules are read from the package itself, under the linted repository's own `node_modules/@openreachtech/eslint-config/`, never from a list restated here — the denylist is the package's to grow, and a copy would still read as authoritative after it had (`structure.md`, "The division of labor").

`/hora-plan` already checks the glossary against these rules, so following it avoids failing here. A failure here means something is missing from the glossary. **Once a workaround name is chosen, append it to the glossary's "names avoided, and why".** Without that record, somebody later restores the naive name and it fails again.

---

## What is not reported

| | Why |
|---|---|
| the run history (what happened when) | `git log .hora/` already holds it. No separate state file is kept |
| the history of identifier changes | git holds it. The glossary only records "why this name" |
| the result of manual verification | `/hora` never does it. It only points at the steps |
| how an acceptance review reached its verdict | the skills covering the acceptance review own that. `.hora/acceptance/` records each run's verdict, its findings and which skills it matched — not the reasoning behind each criterion |
