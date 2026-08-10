# Branches and commits

Every hora skill that touches git follows this file. **`/hora` itself owns every git operation** — the agents it starts never touch git at all.

`git log .hora/` becomes the history of what ran, and the checkboxes hold what is done. There is no separate state file. **That is what the commits are for.**

---

## Where work lands

- **Never commit straight to `main`.** Work on `release/<version>` — the version whose `spec.md` is currently being worked on (`main-guard.yml` restricts PRs into main to `release/*`, `hotfix/*`, `dev` and `env`). This applies to the hora repository itself and to every declared row, all under the same branch name
- **A feature's own implementation commits do not land on `release/<version>` directly either — they go on a `feature/<feature-id>` branch first** (below), cut from `release/<version>`'s own tip in each repository that feature touches. "Work on `release/<version>`" still describes where that branch comes from, and where `install`/`update`/`retake` commit directly
- **Create the branch when it does not exist yet.** `git fetch origin --prune`, then branch from `origin/main` if `release/<version>` is still missing after that. For a row `/hora-setup` just set up with a fresh `git init`, there is no `origin` to fetch from yet — branch from the current `HEAD` instead
- **The first commit on a newly created `release/<version>` is an empty marker**, before anything else lands on it: `git commit --allow-empty -m "Release <version>"`. This departs from `core-git-commit`'s general branch-opening marker, which always begins with `Start` — a deliberate exception for `release/<version>` specifically, not a mistake to reconcile
- **`hotfix/xxxx` skips the opening marker entirely — no empty commit, not even a differently-worded one.** It exists to move fast on one emergency fix; the marker exists to give a human something to point at when a branch's own start matters, and a hotfix branch is disposable and urgent enough that this is not worth the extra commit
- **This exemption holds only as long as `hotfix/xxxx` never itself becomes a trunk branch** — never cut a sub-hotfix or a sub-feature branch from it. A fix that would need one is not a **hot**fix anymore; do it properly instead, as a patch-bumped `release/x.x.+x` with its own real versioning. The marker is waived because nothing complex is supposed to happen on this branch, not as a general discount on ceremony

---

## Per-change branches

Six kinds of change each get their own branch — cut from `release/<version>`'s current tip, merged back into it with `--no-ff`, deleted once merged, on the same lifecycle as any other branch merging into a trunk (below). Unlike the rule that the merge message never names the branch, **these branch names are deliberately descriptive** — the name is what a reader scans `git branch` for while the work is still in flight; it is gone once merged, which is exactly why the `Local-merge:` message still carries the real content separately, for after that.

| Kind | Name | Example |
|---|---|---|
| **one feature's implementation** | **`feature/<feature-id>`** | `feature/attendance`, `feature/attendance--monthly` |
| a new dependency | `install/<package-name>-<version>` | `install/date-fns-4.1.0` |
| an existing dependency's version bump | `update/<package-name>-to-<version>` | `update/date-fns-to-4.2.0` |
| a conflict-proof file's expected, planned change | `update/<filename>-with-<what>` | `update/Base-with-SampleClassName` |
| the local end-to-end environment, extended by checkpoint 17 | `update/e2e-<what>-for-<feature-id>` | `update/e2e-seed-for-attendance` |
| reworking something already implemented, found lacking later (a checkpoint reopened by acceptance, a lint rule strengthened after the fact) | `retake/<member-name>-of-<class-name>-for-<why>`, or `retake/<filename>-for-<why>` when no single member is at fault | `retake/save-of-UserRepository-for-no-restricted-syntax` |

**`update` and `retake` read differently even when both touch the same file.** `update` is planned, expected growth — a dependency's version, a `Base` class gaining a method a new derived class needs. `retake` is a redo — existing work that turns out to have been done poorly, surfaced later. Naming the branch by which of the two it is keeps that distinction visible while the work is still in flight, not only in the commit that follows.

**`feature/` always holds the feature's `id` verbatim, never a summary in its place — not even where the `id` itself reads as opaque** (`fr-010`, and the like). Judging whether an `id` "is descriptive enough" to skip a summary would make the format depend on that judgment call, and a reader of an existing branch name has no way to tell which case produced it. One fixed shape avoids that: look the `id` up in `.hora/tasks/` or `specs/` for what it means; do not expect the branch name to say it.

**When more than one of these is waiting to merge into `release/<version>`, `install`/`update`/`retake` go first, ahead of any `feature/`.** A feature's branch may depend on what one of these provides (a package it just added, a `Base` method it needs) — clearing them first avoids a feature branch rebasing needlessly more than once.

### One feature, several repositories, one branch name

A feature is built through the checkpoints of `/hora-build`, and those checkpoints cross repositories: the backend gate writes in the backend row, the frontend gate writes in a frontend row. **Each repository gets its own `feature/<feature-id>` branch, under the same name, cut and merged independently.**

| | When it is cut | When it merges back |
|---|---|---|
| the backend row | entering checkpoint 3 (the first one that writes backend code) | **once checkpoint 9 passes** (the backend gate's last one) |
| a frontend row | entering checkpoint 10 | **once checkpoint 17 passes** (the frontend gate's last one) |

**A feature's branches merge at their own gate's boundary, not after acceptance.** Acceptance (checkpoint 18) covers **every feature implemented so far**, not just this one, so waiting for it would hold this feature's branches open across other features' work. What acceptance turns up instead comes back as a `retake/` branch — the existing name for "already implemented, found lacking later", which is exactly what an acceptance failure is.

**A repository the feature does not touch gets no branch.** A backend-only feature never cuts one in a frontend row.

**Checkpoint 17 is the one that falls outside this.** It builds or extends the local end-to-end environment, which lives in the backend repository — whose `feature/<feature-id>` branch merged back at checkpoint 9, eight checkpoints earlier. Its changes therefore go on their own **`update/e2e-<what>-for-<feature-id>`** branch (`update/e2e-seed-for-attendance`), cut and merged like any other `update/`. This is the right shape for it regardless of the timing: an environment is shared by every feature, so a change to it is planned growth of something common, not one feature's own implementation.

---

## Commit messages

- **Stamp the spec ID into the commit message.** It is the only way to follow one change across every declared repository

```
Add RpaFlow model and rpa_flows migration

spec: 1.0.0#data-model
```

- **Split per kind. One kind per commit.** Messages are short and imperative
- **`package.json` and `package-lock.json` always go in separate commits**, `package.json` first. The first is intent written by a human, the second is output generated by npm; mixed together, a few lines of intent are buried in thousands
- **This is a different axis from keeping a dependency change off a feature branch entirely.** The latter is how a human team stops a `package-lock.json` conflict from happening at all — one change at a time, merged to the trunk branch before the next one starts. `install/` gets that same guarantee the same way: its own branch, cut from `release/<version>`, merged back before the next one starts
- **The `package-lock.json` commit message is always `Update package-lock.json after npm install`** (or `... after npm uninstall`) — it carries no other information, since the diff itself is not meant to be read
- A dependency left in `package.json` after the feature that needed it was later dropped from the spec is not worth a cleanup commit on its own. It costs nothing to leave unused, and chasing it would only reopen the same `package-lock.json` conflict risk this rule exists to avoid
- **A dependency update can break `npm test` / `npm run lint`.** When it does, a fix commit right after the `package-lock.json` commit is fine — **but only when the fix is dependency-specific**, something the update itself is what makes it necessary. When the identical fix would already have applied before the update too, it is not caused by the update: commit it on its own, before the `package.json` commit, not folded into what comes after it
- **A conflict-proof change (`.env.development`, `docker-compose.development.yml`, the `Base` class, and the like) gets its own commit**, one per file, never mixed into a feature's own commit — unlike `package.json`, there is no generated pair to split it from

---

## Committing `.hora/`

An update to `.hora/` never goes in the same commit as the implementation it belongs to. `myproject-app` and the implementation repositories are separate repositories, so they are separated structurally.

**Write a checkpoint's checkbox the moment it passes; commit at the gate boundary.** The two are not the same act, and conflating them costs one of the two things this design needs:

| | Written | Committed |
|---|---|---|
| when | immediately, as each checkpoint passes | at the end of each gate (after checkpoints 2, 9, 17 and 18) |
| why | an interrupted run must resume from the exact checkpoint it stopped at — an unwritten checkbox loses that | `git log .hora/` has to stay readable. Eighteen commits per feature is not a history anyone reads |

The gate-boundary commit message names the gate and the feature:

```
Pass the backend gate of #attendance

spec: 1.0.0#attendance
```

`/hora-plan`'s own output (`_plan.md`, the feature files it creates, questions, contracts, the glossary) is committed when planning finishes, before any feature starts.

---

## Merging into a trunk branch

A trunk branch is one other branches are cut from and merged back into — `main` itself, and, for a run's own purposes, `release/<version>`.

Three more grow from `main` and count as a trunk branch in the narrow sense — each is itself where other branches merge back into, on the way to `main`: **`env`**, bundling the initial environment setup; **`dev`**, used by people on the older development style that predates `/hora`; **`hotfix/xxxx`**, cut for one emergency fix.

**This role is relative, not a fixed list.** Any branch becomes a trunk the moment something is cut from it, for as long as that something has not yet merged back. The same rules below (`--no-ff`, `Local-merge:`, rebase-before-merging-second) apply there too, not only at `main`/`release/<version>`.

- **Always `--no-ff`, never fast-forward.** A fast-forward merge leaves no commit a human can point at; if that tracking did not matter, no git-operation rule here would either — everything could just be merged straight into `main`
- **The merge commit's message is `Local-merge: <what merged> [<id>]`** (`[<id1>, <id2>, ...]` when the merge covers more than one feature) — the equivalent of GitHub's own `Merge pull request #NNN from <branch>`, for a merge with no real PR behind it. **Never the branch name** — what is worth citing is the content and the spec `id` it traces to, the same as any other commit. **`Local-merge:` is a second exception to `core-git-commit`'s "no type prefix" rule**, alongside `Start …` — a merge commit records an integration event, not a hand-authored description of a change, the same way GitHub's own auto-generated merge message is not held to the imperative-content convention either
  ```
  Local-merge: Build the attendance API through the backend gate [attendance]
  ```
- **Delete the branch once it is merged.** This holds for every branch merged into a trunk, `release/<version>`, `hotfix/*`, `dev` and `env` merged into `main` included
- **When two branches were cut from the same commit on a trunk and both aim to merge into it, whichever merges second rebases onto the trunk's new tip first, then merges.** This keeps the trunk's history from recording a divergence that never had to exist
- **Every rebase in this scheme uses `-r` (`--rebase-merges`), explicit about what moves where:**
  ```bash
  git rebase -r --onto <trunk's new tip> <the commit this branch was cut from> <branch>
  ```
  Without `-r`, `git rebase` flattens history — every merge commit it replays is dropped, and a trunk built entirely of `--no-ff` merges (above) would lose the very thing `--no-ff` exists to keep
- **Immediately after merging anything into `release/<version>`, run the check in "Keeping `release/<version>` current" again.** This is what stands in for periodic monitoring — `/hora` has no scheduler, so a merge it was already doing is the next-best occasion to notice `origin/main` moved

---

## Keeping `release/<version>` current

**`release/<version>` is not rebased, with one exception.** Once created, its own history stays as it was built — nothing already merged into it is ever reverted or rewritten away.

**The exception is a `hotfix/*` landing on `main` while `release/<version>` is still open.** Check for it at the start of every `/hora` invocation, and again right after every merge into `release/<version>` (above) — `/hora` never asks a human before running the check itself; asking only starts once the check turns up something it cannot resolve on its own (below).

```bash
git merge-base --is-ancestor origin/main release/<version>   # 0 = nothing new landed / 1 = it did
```

A `1` means `origin/main` now holds a commit `release/<version>` does not — ordinarily only possible through a `hotfix/*` merge, since `main` otherwise only moves once every declared repository's own `release/<version>` merges into it.

**If this check runs while `feature/<feature-id>` still holds uncommitted work, commit that work first, as a single commit, before doing anything else.** Use `saving-YYYYMMDD-HHii` as the message (today's date and the current time, `HH` hours and `ii` minutes) — a plain save point, not a real description, and not split per kind the way a finished checkpoint's commits are. Only once that commit exists does `feature/<feature-id>` have a clean state safe to rebase.

**Once the rebase lands, `git reset --soft` that `saving-YYYYMMDD-HHii` commit away and continue from where it left off.** It only ever existed to give the rebase a clean tree to work with — `--soft` keeps every change it held staged, exactly as if the commit had never happened, so the feature's own eventual commits are still the real, per-kind history, never this placeholder.

### The catch-up procedure

Never rewrite `release/<version>` directly. Build the caught-up result on a disposable `temp` branch instead, and only ever move `release/<version>` itself once, at the very end, to `temp`'s finished tip.

```
1. Branch temp from release/<version>'s current tip.
2. Attempt the whole thing in one shot:
     git rebase -r --onto origin/main origin/main temp
   Success → temp is release/<version>, fully caught up. Skip to step 6.
   Conflict → git rebase --abort.
3. Walk temp back one commit at a time and retry step 2 at each point,
   until one succeeds:
     git rebase --onto @^ @      # moves temp back one commit; replays nothing
   (Only an install/update branch and any hotfix-restacked branch ever touch a
   shared file, so this typically stops right after backing past the most recent
   merge — but it is a plain one-commit-at-a-time walk, not a jump to the nearest
   merge, and does not assume that in general.)
4. Call the point reached C. temp now holds release/<version>'s history up to C,
   rebased cleanly onto origin/main. The next commit after C, in release/<version>'s
   ORIGINAL history, is where catching up stopped working.
5. Handle exactly that next stretch, and no more:
   - An ordinary commit → cherry-pick it onto temp directly.
     Conflict → git cherry-pick --abort, redo it (below), commit the redone
     version onto temp, then continue.
   - A --no-ff merge commit M (some branch B) → reconstruct B on its own
     disposable line branched from temp, cherry-picking B's own commits
     (git log M^1..M^2) onto it one at a time, aborting and redoing (below)
     wherever one conflicts. Once every one of B's commits has landed, merge
     that line into temp the same way any branch merges into a trunk (above:
     --no-ff, message Local-merge: <what B was for> [<id>]) and discard it.
6. Retry the bulk form for whatever remains after the stretch just handled:
     git rebase -r --onto temp temp <original release/<version> tip>
   Success → done. Conflict → go back to step 3, walking back from here instead
   of from origin/main.
7. Once release/<version>'s entire original history has landed on temp with
   nothing lost, fast-forward release/<version> to temp's tip and delete temp
   (and any leftover disposable line from step 5).
```

### Redoing a conflicting commit

Never hand-resolve a conflict textually. Redo means reproducing the same intent against the tree as it now stands.

| The commit's own kind | How to redo it |
|---|---|
| a feature's implementation commit (carries a `spec: <id>` trailer) | trace `<id>`, clear the checkpoints in `.hora/tasks/<version>/<id>.md` that produced it, and run them again through `/hora-build` against the tree as it stands at this point |
| a `package.json`/`package-lock.json` commit | **stop instead of redoing it, if the commits `release/<version>` is catching up on (the `hotfix/*` side) also touch this file.** Re-running `npm install` there would silently pick some resolution — neither the hotfix's nor the original one, and with no conflict to surface the disagreement. Report it in the closing report and wait for a human. Otherwise, safe to redo: re-run the same `npm install`/`npm uninstall` against the tree as it stands here |
| a conflict-proof file commit | the same distinction as above: stop and ask if the hotfix side also touches this file; otherwise re-apply the same change fresh |
| the branch's own empty opening marker | never conflicts — it carries no diff |

---

## Merge order into `main`

**app (the hora repository) may be merged into main only after every declared repository has been merged into main.**

app's merge causes `release.yml` to create a tag, and that tag means the version has been released. Reverse the order and you get "the spec is released but the code never landed". Because of this order, judging a release comes down to **checking a single tag on app.**

Check per declared row, against the row's own `release/<version>` branch — **not `HEAD`.** A run works from a version-scoped branch, so by the time this check runs `HEAD` may already sit on a later version's branch in the same row directory.

```bash
git -C <myproject>-<row> fetch origin main
git -C <myproject>-<row> merge-base --is-ancestor release/<version> origin/main   # 0 = merged / 1 = not yet
```

If even one returns `1`, **app must not be merged.** State that explicitly in the closing report. If a repository has no remote configured, that just means it has not been pushed yet — report it as such. If `release/<version>` no longer exists locally, a human deleted it after the PR merged — treat that as merged, not as missing.
