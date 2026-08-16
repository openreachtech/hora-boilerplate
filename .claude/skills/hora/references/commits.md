# Branches and commits

**Every git operation runs in the main session** — `/hora`'s own, or a skill it invoked. The agents they start never touch git.

`git log .hora/` is the history of what ran, and the checkboxes hold what is done. That is what the commits are for.

---

## Where work lands

- **Never commit straight to `main`.** Work on `release/<version>` — in the hora repository and in every declared row, under the same branch name
- **A feature's implementation commits go on a `feature/<feature-id>` branch**, cut from `release/<version>`'s tip in each repository the feature touches
- **Create the branch when it does not exist.** `git fetch origin --prune`, then branch from `origin/main`. For a row `/hora-setup` just created with a fresh `git init`, branch from the current `HEAD`
- **The first commit on a new `release/<version>` is an empty marker**: `git commit --allow-empty -m "Release <version>"`
- **`hotfix/xxxx` skips the marker.** It exists to move fast on one emergency fix, and nothing is ever branched from it. A fix needing its own sub-branch is not a hotfix — do it as a patch-bumped `release/x.x.+x`

---

## Per-change branches

Each is cut from `release/<version>`'s tip, merged back with `--no-ff`, and deleted. **The names are descriptive because that is what a reader scans `git branch` for while work is in flight.**

| Kind | Name |
|---|---|
| **one feature's implementation** | **`feature/<feature-id>`** |
| a new dependency | `install/<package>-<version>` |
| a dependency's version bump | `update/<package>-to-<version>` |
| a conflict-proof file's planned change | `update/<filename>-with-<what>` |
| the local end-to-end environment, extended by checkpoint 17 | `update/e2e-<what>-for-<feature-id>` |
| reworking something already implemented | `retake/<what>-for-<why>` |

**`update` is planned growth; `retake` is a redo.**

**`feature/` holds the feature's `id` verbatim, never a summary** — even where the `id` reads as opaque.

**When several wait to merge, `install`/`update`/`retake` go first.** A feature's branch may depend on what one of them provides.

### One feature, several repositories, one branch name

**Each repository gets its own `feature/<feature-id>` branch, cut and merged independently.**

| | Cut when | Merges when |
|---|---|---|
| a provider row | entering checkpoint 3 | **checkpoint 9 passes** |
| a consumer row | entering checkpoint 10 | **checkpoint 17 passes** |

**A feature's branches merge at their own gate's boundary, not after acceptance.** Checkpoint 18 runs suites spanning every feature so far and can fail on any of them, so waiting for it would hold these branches open across other features' work. What acceptance turns up comes back as a `retake/` branch.

**A repository the feature does not touch gets no branch.**

**Checkpoint 17 falls outside this.** It extends the local end-to-end environment, which lives in a provider row whose feature branch already merged, so its changes go on their own `update/e2e-…` branch.

---

## Commit messages

- **Stamp the spec id into the message.** It is the only way to follow one change across every repository

```
Add the RpaFlow model and its migration

spec: 1.0.0#data-model
```

- **One kind per commit.** Messages are short and imperative
- **The manifest and the lockfile always go in separate commits, manifest first.** The first is intent written by a human; the second is generated output
- **The lockfile commit's message is fixed** — `Update the lockfile after installing <package>`. The diff is not meant to be read
- **A dependency update can break lint or tests.** A fix commit right after the lockfile commit is fine, but only when the fix is specific to that dependency. If the same fix would have applied before the update, commit it separately, first
- **A conflict-proof file's change gets its own commit**, one per file, never mixed into a feature's commit

---

## Committing `.hora/`

An update to `.hora/` never goes in the same commit as the implementation it records — they are separate repositories.

**Write a checkpoint's checkbox the moment it passes; commit at the gate boundary.**

| | Written | Committed |
|---|---|---|
| when | immediately, as each checkpoint passes | at the end of each gate (after 2, 9, 17 and 18) |
| why | an interrupted run must resume at the exact checkpoint it stopped at | `git log .hora/` has to stay readable |

```
Pass the provider gate of #attendance

spec: 1.0.0#attendance
```

`/hora-plan`'s own output is committed when planning finishes, before any feature starts.

---

## Merging into a trunk branch

A trunk is a branch others are cut from and merged back into — `main` and `release/<version>`. **The role is relative:** any branch becomes a trunk the moment something is cut from it.

- **Always `--no-ff`.** A fast-forward merge leaves no commit a human can point at
- **The merge message is `Local-merge: <what merged> [<id>]`** — never the branch name
- **Delete the branch once merged**
- **When two branches were cut from the same commit, whichever merges second rebases onto the trunk's new tip first**
- **Every rebase here uses `-r` (`--rebase-merges`)**. Without it, `git rebase` drops the merge commits `--no-ff` exists to keep

```bash
git rebase -r --onto <trunk's new tip> <the commit this branch was cut from> <branch>
```

- **Right after merging into `release/<version>`, run the check below again.** `/hora` has no scheduler, so a merge is the next-best occasion to notice `origin/main` moved

---

## Keeping `release/<version>` current

**`release/<version>` is not rebased, with one exception: a `hotfix/*` landing on `main` while it is still open.** Check at the start of every `/hora` invocation, and again after every merge into `release/<version>`.

```bash
git merge-base --is-ancestor origin/main release/<version>   # 0 = nothing new / 1 = it moved
```

**If a feature branch holds uncommitted work when this runs, commit it first** as a single `saving-YYYYMMDD-HHii` commit. Once the rebase lands, `git reset --soft` it away and continue.

### The catch-up procedure

Never rewrite `release/<version>` directly. Build the result on a disposable `temp` branch and move `release/<version>` once, at the end.

```
1. Branch temp from release/<version>'s tip.
2. Try it in one shot:  git rebase -r --onto origin/main origin/main temp
     success  -> skip to 6
     conflict -> git rebase --abort
3. Walk temp back one commit at a time, retrying step 2 at each point:
     git rebase --onto @^ @
4. Call the point that succeeded C. The next commit after C in the ORIGINAL
   history is where catching up stopped working.
5. Handle exactly that next stretch:
     an ordinary commit -> cherry-pick it. On conflict, abort and REDO it
       (below), then commit the redone version.
     a --no-ff merge of branch B -> rebuild B on its own disposable line off
       temp, cherry-picking B's own commits (git log M^1..M^2) one at a time,
       redoing any that conflict. Then merge that line into temp the ordinary
       way and discard it.
6. Retry the bulk form for the rest:
     git rebase -r --onto temp temp <original release tip>
     conflict -> back to step 3, walking back from here.
7. Fast-forward release/<version> to temp, and delete temp.
```

### Redoing a conflicting commit

**Never hand-resolve a conflict textually.** Redo means reproducing the same intent against the tree as it now stands.

| The commit's kind | How to redo it |
|---|---|
| a feature's implementation commit | trace its `spec:` id, clear the checkpoints that produced it, and run them again through `/hora-build` |
| a manifest or lockfile commit | **stop and ask, if the incoming side also touches this file.** Re-running the install would silently pick some resolution with no conflict to surface it. Otherwise re-run the same install |
| a conflict-proof file's commit | the same distinction |
| the branch's empty opening marker | never conflicts — it carries no diff |

---

## Merge order into `main`

**The hora repository merges into `main` only after every declared row has.** Its merge is what tags the version, so judging a release comes down to checking one tag.

Check each row against its own `release/<version>` branch, not `HEAD`:

```bash
git -C <row> fetch origin main
git -C <row> merge-base --is-ancestor release/<version> origin/main   # 0 = merged
```

**If even one returns `1`, the hora repository must not be merged.** Say so explicitly in the closing report. A row with no remote has not been pushed — report it as such. A `release/<version>` that no longer exists locally was deleted after its PR merged; treat it as merged.
