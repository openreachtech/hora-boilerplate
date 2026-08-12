# Judging what is done

The conditions for a checkpoint, a feature, a version and a session to be done.

**Manual verification is not part of this.** A human does it whenever they want, in `<myproject>-backend`: `./docker.sh start` → `npm run db:refresh` → `npm run dev`. `/hora` neither does it for them nor makes it a condition of being done. **The local end-to-end environment is a different thing** — checkpoint 17 builds it and `/hora-accept` requires it, because an acceptance review has nothing to review without one.

---

## Four kinds of done

Do not conflate them.

| Unit | Condition to be done | Recorded in |
|---|---|---|
| **a checkpoint** | its exit condition holds, as `../../hora-build/references/checkpoints.md` states it | its checkbox in `.hora/tasks/<version>/<feature-id>.md` |
| **a feature** | all eighteen of its checkpoints are `[x]` — including 18, acceptance | its entry in `.hora/tasks/<version>/_plan.md` |
| **a version** | every feature is done, the sweep passed, and no blocking question is left | every entry in `_plan.md` is `[x]`, and `.hora/acceptance/<version>/_sweep.md` says `passed` |
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

**There is exactly one reason that does not come from a checkpoint's own line: `built before Hora Kit was adopted`.** A spec section may declare `<!-- built: spec | backend | frontend -->`, and `/hora-plan` marks that many checkpoints not-applicable mechanically. **Checkpoint 18 is never one of them**, and a feature carrying the annotation is done on exactly the same terms as any other: acceptance passed. **The mark is also cleared wherever acceptance later sends the run back** — code that has to change was not inherited after all.

Two of them deserve particular suspicion, because both look skippable and are usually not:

| | Why it gets wrongly skipped | What has to be true |
|---|---|---|
| **7. Worker** | the processing "looks synchronous" | the execution-placement skill was actually run, and said so |
| **5 / 13. The modules the implementation needs** | "nothing extra is needed" | what the next checkpoint will import was actually listed and checked |

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

---

## When a version is done

```
1. every entry in .hora/tasks/<version>/_plan.md is [x] (## Withdrawn is not counted)
2. .hora/questions/<version>/open.md has no unresolved blocking: yes
3. the whole-version sweep passed (.hora/acceptance/<version>/_sweep.md)
4. lint and test pass in every declared repository and in app
5. every contract in .hora/contracts/<version>/ matches the implementation
6. no repository has uncommitted changes
7. every implementation repository has been merged into main
```

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

The parent (`myproject-app`) also has lint, covering `.claude/`.

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
| a DB connection error | the middleware is not running. Point at the manual-verification steps. `/hora` does not run `docker.sh start` on its own |
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
| how an acceptance review reached its verdict | the skills covering the acceptance review own that. `.hora/acceptance/` records the verdict, the findings and which skills were matched — not the reasoning behind each criterion |
