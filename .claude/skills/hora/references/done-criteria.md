# Judging what is done

The criteria for Stage 3 (verification by machine), and the conditions for a task and a version to be done.

**Manual verification is not part of this.** A human does it whenever they want, in `<myproject>-backend`: `./docker.sh start` → `npm run db:refresh` → `npm run dev`. `/hora` neither does it for them nor makes it a condition of being done.

---

## Three kinds of done

Do not conflate them.

| Unit | Condition to be done | Recorded in |
|---|---|---|
| a task | its tests pass its acceptance criteria, and lint passes | the checkbox in `.hora/tasks/<version>/*.md` |
| a version | every task in it is done, and no `blocking` question is left | every checkbox is `[x]` |
| a session | `git status` was checked and reported for every repository | the report |

**A session being done does not mean the version is done.** A single session is not expected to run to completion, so "how far this run got" and "whether the version is done" are reported separately.

---

## When a task is done

`- [x]` may be set only once every one of these holds.

```
1. it satisfies the acceptance criteria of the spec's matching section
2. the acceptance criteria are backed by a test (a test of the behavior exists)
3. npm test passes in the target repository
4. npm run lint passes in the target repository
5. it does not deviate from the contract (each file in .hora/contracts/<version>/)
6. it uses the glossary's identifiers (a new name was appended to the glossary)
7. it honors the design constraint that its "out of scope" kind calls for
8. nothing it reported (a dependency, a conflict-proof change) is still sitting on a
   branch that has not yet merged into release/<version>
```

**Point 8 only ever matters in the parallel run.** A serial commit lands on `release/<version>` directly, so nothing is ever "still on a branch" to begin with. In parallel, the Install phase applies a reported change on its own branch (`install/<version>`) before merging it into `release/<version>` — until that merge lands, the change exists only there, and a task that depends on it is not really done yet, whatever `hora-recorder`'s own report already says. Wait for the merge before setting `[x]` on any task sharing that pass.

**Point 3 is judged by a continuous test dispatcher in the parallel run, never by the task's own implementer or verifier.** The backend's tests share one SQLite file that gets wiped and reseeded on every run, so nothing may run two of them at once. An implementer classifies each test it wrote into `logic` (no fixture at all), `finding` (a read-only haystack fixture) or `saving` (writes to the database or an output folder) and reports it instead of running it; a shared dispatcher runs `logic` requests together immediately, then `finding` after a database refresh, then `saving`.

**`saving` needs no grouping or ordering computed for it — one discipline makes the whole folder safe to run together.** An assertion may use an `id` to fetch its own row, but never as the thing being asserted, and never asserts over a whole collection (a count, "the latest one", "nothing else exists"). Scoped this way, a test is unaffected by any other task's rows, whatever table they happen to share — so two `saving` files are either both safe in any order, or one of them breaks the discipline, which is a bug to fix in that file, never a reason to compute a relative order between files. An explicit row `id` never collides for the same structural reason: the `bank-id` skill hands out a mutually exclusive prefix per requester, and any task writing an explicit id calls it first.

Every `saving` file still lives under `_orders/` — not for ordering, but because the folder itself is what keeps a write structurally apart from `finding`'s stable fixture, which a stray write would otherwise corrupt. Inside it, `_orders/saving/` is the default, order-independent home for any file with no dependency on another one; `_orders/<scenario-id>/` holds only the files that implement a spec section written the way `references/spec-template.md`'s "A behavior that only exists once two sections cooperate" describes — there, file-name numbering carries the order a human decided, since `/hora` never infers that a dependency exists. Either way, `_.test.js` stays a thin, regenerated aggregator: scan the folder, `import` every sibling in file-name order, rewrite the whole file. The whole of `_orders/` still runs as a single process with workers disabled — the discipline above only rules out a *data*-level conflict; the shared SQLite file cannot tolerate two connections regardless.

On a failure, the fix targets only the file that actually failed (a predecessor that already passed in the same run is not the cause), exactly as point 4 below does for lint, up to the same retry limit. **Unlike point 4, this does gate the checkbox** — `[x]` still needs every one of the task's own test results to be `passed: true`, since a test backing the acceptance criteria is what point 3 already means.

**Point 4 is also judged differently in the parallel run — per repository, per resolved batch, never by the task's own implementer or verifier.** A dedicated step runs `npx eslint` on every file touched in that repository so far this run (not `npm run lint`'s whole-repository scan — only what the tasks have actually changed), once per repository, right after the whole batch's tasks have finished, fixing and retrying it (up to a limit) if it fails. **This does not gate the checkbox itself** — `[x]` is still decided from every other point exactly as before, just never from point 4. What a failing lint blocks is *progress*: the batch's tasks are not treated as resolved, so nothing depending on them becomes ready until it passes.

**A task whose spec has no acceptance criteria must not be marked done.** It should already have been raised as `missing-acceptance` (`blocking: yes`) in Stage 1.5, so this point is never reached.

### How acceptance criteria relate to tests

**A condition common to every task is not written in the spec.** That `npm run lint && npm test` passes is common to all of them, so it is never repeated. What the spec writes is a section's specific **behavior**.

```markdown
- `createRpaFlow` returns an error on a duplicate `flow_key`
```

Without a test that covers this, the task is not done. **Acceptance criteria are the means of telling "implemented" apart from "working".**

Follow the real tree read in Stage 0.5 for where tests live, how they are named, and the helper conventions (use an in-house helper such as `renchan-test-tools` where one exists).

---

## Stage 3 — Verification by machine

Run per target repository. Follow the command names in the `package.json` `scripts` read in Stage 0.5 (below is a guide).

```bash
# for each declared repository
cd <myproject>-<row>
npm run lint
npm test
```

The parent (`myproject-app`) also has lint, covering `.claude/workflows/`.

```bash
npm run lint
```

**Do not put a cross-repository script in the parent.** Something like `npm --prefix <myproject>-backend run dev` that reaches into another repository does not work for someone working from a standalone clone. Run things in each repository instead.

### Handling a failure

| Failure | Response |
|---|---|
| a bug in the implementation | fix it. The task stays undone |
| a lint naming violation | **do not invent a workaround name on the spot.** Check the glossary; if it is not there, append to it first, then fix the code |
| acceptance criteria cannot be met | the spec may describe something unachievable. Raise it as a question (`contradiction`) |
| a DB connection error | the middleware is not running. Point at the manual-verification steps. `/hora` does not run `docker.sh start` on its own |
| an existing test fails | the implementation broke existing behavior. Fix it. If the spec calls for breaking it on purpose, confirm through a question |

**Never set `- [x]` while a test does not pass.** Report the fact that it did not.

### Lint's naming rules

`@openreachtech/eslint-config` strictly forbids certain identifier names. **A naive name fails.**

```
Forbidden suffixes    ~Data ~Info ~Helper ~Item ~List ~Manager ~Utils ~Wrapper
Forbidden words       data item list info acc arr attr btn cate cfg cnt col cond ctx
                      err el ev evt ex ext fmt idx img len msg no num obj opt
                      pos prod ret str usr temp tmp tx txt val callback
Enforced spelling     cancelled → canceled
Forbidden syntax      while / do-while / for / for-of / for-in / let / switch
```

Stage 1 already checks the glossary against the lint rules, so following it avoids failing here. A failure here means something is missing from the glossary. **Once a workaround name is chosen, append it to the glossary's "names avoided, and why".** Without that record, somebody later restores the naive name and it fails again.

---

## When a version is done

```
1. every checkbox in .hora/tasks/<version>/ is [x] (the ## Withdrawn section is not counted)
2. .hora/questions/<version>/open.md has no unresolved blocking: yes
3. lint and test pass in every declared repository and in app
4. every contract in .hora/contracts/<version>/ matches the implementation
5. no repository has uncommitted changes
6. every implementation repository has been merged into main (below)
```

Point 4 checks that nothing drifted from a contract during implementation. **On finding a drift, do not rewrite the contract after the fact — report why the drift happened instead.** A contract is derived once, before implementation, and pinned; once it drifts, the agreement between backend and frontend breaks down.

Once a version is done, check whether the next version's `specs/<version>/` exists and report that. If not, it is a human's turn to create it.

### Merge order

**app (the hora repository) may be merged into main only after every declared repository has been merged into main.**

app's merge causes `release.yml` to create a tag, and that tag means the version has been released. Reverse the order and you get "the spec is released but the code never landed". Because of this order, judging a release comes down to **checking a single tag on app.**

Check per declared row, against the row's own `release/<version>` branch — **not `HEAD`.** `/hora` now works from a version-scoped branch (see Commits, in the main skill), so by the time this check runs `HEAD` may already sit on a later version's branch in the same row directory.

```bash
git -C <myproject>-<row> fetch origin main
git -C <myproject>-<row> merge-base --is-ancestor release/<version> origin/main   # 0 = merged / 1 = not yet
```

If even one returns `1`, **app must not be merged.** State that explicitly in the closing report. If a repository has no remote configured, that just means it has not been pushed yet — report it as such. If `release/<version>` no longer exists locally, a human deleted it after the PR merged — treat that as merged, not as missing.

---

## The closing report

**The one real harm of the nested structure is that the outer `git status` shows nothing from inside.** Running `/hora` changes several repositories at once, yet `git status` at the root shows only the update to `.hora/`. Commits get forgotten.

**Check every declared repository and the hora repository. This cannot be skipped.**

```bash
git status --short --branch
git -C <myproject>-<row> status --short --branch      # for every declared row
```

**`--branch` matters now, not just `--short`.** Every repository is expected to be on `release/<version>` (see Commits); a repository sitting on anything else is worth surfacing, not silently reported as if it were normal.

### What the report includes

```
the target version and the stage that was reached
how many tasks are done / how many are left, per repository
the state of the questions (how many blocking remain, how many were newly added)
git status for every repository, including the branch (state it explicitly if anything is uncommitted, or if a branch is not release/<version>)
what the next run of /hora will start from
```

**Every `eslint-exception` question (SKILL.md, Stage 1.5's "Categories") gets its own, separate line, by name — never just counted among the ordinary questions.** It records that a real lint rule contradiction forced an `adhoc/` branch through (SKILL.md, Stage 2, "A lint rule contradiction") — `blocking: no`, but fail-loud: it never stopped the run, yet it is still worth a human's attention on its own.

### When a version cannot proceed, lay out the choices

A version with unfinished tasks blocks the next one from starting (versions run serially). **State the ways out in the report.** Without that, a human is left to guess on their own why the next version is not starting.

```
1.0.0 has 3 unfinished tasks. 1.1.0 exists under specs/, but versions run
serially, so it cannot start yet.

Remaining: #payroll #bonus #year-end

  build it        → just run /hora again
  drop it         → mark the section kicked: yes in specs/1.0.0/spec.md
  defer it        → kicked: yes in 1.0.0, kicked: no on the specs/1.1.0/ side
```

**`/hora` only lays out the choices; it does not decide.** Deciding the scope is on the side that must not be inferred.

When it stopped with a `blocking: yes` outstanding, **state what the human has to do first.** Be specific about which section needs what added, and give the path to `.hora/questions/<version>/open.md`.

```
Stopped in Stage 1.5 for 1.0.0. 3 blocking.

Please edit specs/1.0.0/spec.md:
  #scope           no section for "out of scope for now (to be built later)"
  #graphql         the fields of RpaFlowsInput are unknown
  #existing-assets does not say whether the current implementation may be referenced

Details: .hora/questions/1.0.0/open.md
Running /hora again after editing will judge what is resolved and move to Stage 2.
```

### What is not reported

| | Why |
|---|---|
| the run history (what happened when) | `git log .hora/` already holds it. No separate state file is kept |
| the history of identifier changes | git holds it. The glossary only records "why this name" |
| the result of manual verification | `/hora` never does it. It only points at the steps |
