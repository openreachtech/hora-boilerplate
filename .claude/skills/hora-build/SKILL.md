---
name: hora-build
description: Build one feature by taking it through the eighteen checkpoints — spec, backend, frontend, acceptance — in order, one gate at a time. Runs at the root of the hora repository (myproject-app), one feature per invocation. Invoked by /hora, or directly as /hora-build.
---

# hora-build

**Take one feature through the eighteen checkpoints, in order.**

Read `../hora/references/structure.md` (the layout, the invariants, where a command runs) and `references/checkpoints.md` (the checkpoint list itself) before starting. **This skill is read-only on `specs/`, with the single exception checkpoint 1 names.**

## One feature at a time, never two

**Nothing here ever runs alongside another feature's checkpoints.** One feature goes from checkpoint 1 to checkpoint 18, and only then does the next one start. That is what makes the whole scheme work:

| | |
|---|---|
| a feature reaches acceptance while its author still remembers it | rather than at the end of the version, alongside twenty others |
| a break shows up in the run that caused it | checkpoint 18 covers every feature so far, so a regression fails immediately |
| one branch per repository is open at a time | no shared, uncommitted state between two features to untangle |

**The failure mode this avoids is building every backend task, then every frontend task, then testing.** Under that order, the first time anyone finds out whether a feature works is after all of them are written.

## Where to start

**If a backend row is declared, clear its `bank-id` lock unconditionally before touching any checkpoint** (`.claude/skills/bank-id/SKILL.md`, "Clearing a stale lock"). Nothing holds that lock across separate invocations, so one still standing at the very start of a run is always leftover from an earlier one that ended abnormally — never something still in use.

```
1. Read .hora/tasks/<version>/_plan.md
2. Take the first feature whose entry is [ ] and whose depends are all satisfied
   (looking back through past versions in .hora/tasks/ for a revived feature's
   dependencies — finishing in an earlier version counts)
3. Open .hora/tasks/<version>/<feature-id>.md
4. Take the first checkpoint that is [ ]
5. Run it. Then the next one. Stop when the file has no [ ] left
```

Report the decision in one line before starting work — "building #attendance, from checkpoint 6 of 18".

**A feature whose only open checkpoint is 18 writes no code, and cuts no branch.** That is what a section declaring `<!-- built: frontend -->` looks like on adoption: everything up to the acceptance gate is marked not-applicable, so this skill goes straight to `/hora-accept`. Cutting a `feature/` branch for it would open one with nothing to put on it.

**If no feature is ready and some are unfinished, that is a dependency cycle or a reference to an `id` that does not exist.** Raise it as a `contradiction` question (`blocking: yes`) and stop; it cannot proceed until the spec is fixed.

---

## Running one checkpoint

```
1. Read the checkpoint's entry in references/checkpoints.md — its exit
   condition, its delegate, and when it does not apply
2. Decide whether it applies. If it does not, write the reason and mark it
   [x] with the n/a comment. Move on
3. Cut this repository's feature/<feature-id> branch, if this is the first
   checkpoint in this gate (see ../hora/references/commits.md)
4. Run it:
     an interactive checkpoint (1, 2, 9, 11, 17, 18)
       -> the main session runs it. Never an agent
     an implementing checkpoint (3-7, 10, 12-16)
       -> hora-implementer, one agent per checkpoint, given that checkpoint's
          exit condition and its delegate skill
     an auditing checkpoint (8)
       -> hora-verifier, read-only
5. Handle whatever the agent reported that is not code (below): a dependency,
   a conflict-proof change, a new identifier, a contract it wanted to change
6. Lint: cd into this checkpoint's repository, then npx eslint on exactly the
   files it touched
     fails -> fix it, retry (up to a limit; see "A lint rule contradiction")
7. Test, where the checkpoint's exit condition names tests (6, 16, 18): from
   that same repository, npx jest on exactly the files this checkpoint wrote
     fails, from something code could fix -> fix it, retry
     fails, from something no code change could fix (the middleware is not
       running, a network call reached nothing, the database was altered
       outside this run) -> stop retrying immediately, without spending the
       retry limit. Retrying does not fix an environment, and "fixing" code
       that was never wrong only makes it worse. Report it as a
       `lacked-environment` question and stop the feature there
8. Verify the exit condition actually holds — with hora-verifier for anything
   a reading of the code can settle, in conversation for the four gates that
   check against use cases
9. Write [x] into the feature file. Commit at the gate boundary, not here
10. Move to the next checkpoint
```

**Step 9's split matters.** The checkbox is written the moment the checkpoint passes, so an interrupted run resumes at the exact right place; the commit happens once per gate, so `git log .hora/` stays readable (`../hora/references/commits.md`, "Committing `.hora/`").

### Which checkpoints the main session must run itself

**1, 2, 9, 11 — the ones that talk to a person.** An agent cannot ask anyone anything, so a gate that exists to resolve a problem in conversation cannot be delegated to one. Handing checkpoint 2 to an agent turns "settle this with the author" into "the agent decided", which is invariant 2.

**17 and 18 — the ones that drive the whole system.** Bringing up a container stack and running an acceptance review across every feature so far is not one feature's implementation work, and neither fits an agent scoped to one checkpoint's files.

### What an implementer agent may not do

`hora-implementer` writes code and tests, for **one checkpoint**, and nothing else. It never touches git, never writes `.hora/`, never writes `specs/`, never installs a dependency, and never edits a file outside its own checkpoint's scope. Everything else it finds, it reports — and this skill acts on the report.

| It reports | This skill does |
|---|---|
| `dependencies` | installs it on an `install/` branch, merges, rebases the feature branch, continues |
| `conflictProof` | applies it on an `update/` branch, merges, rebases, continues |
| `newIdentifiers` | appends them to `.hora/glossary.md`, with any workaround name and why |
| `contractDrift` | raises a `contradiction` question (`blocking: yes`). **Never edits the contract** |
| `registrations` | records that an aggregation file could only be inserted into (below) |
| `reinvention` | raises a `reinvention` question (`blocking: no`) |
| `specIssues` | takes it to checkpoint 1's procedure, or raises a question |

**A reported dependency or conflict-proof change pauses the checkpoint where it is.** A separate agent applies it on its own branch, it merges into `release/<version>`, and `feature/<feature-id>` rebases onto the new tip before work continues. Nothing else is running, so that rebase has no concurrent state to reconcile.

---

## What every checkpoint follows

The rules below apply to whatever is written, at whichever checkpoint. **How to write a resolver, a migration, a component or a test is not here** — that lives in the skills `references/checkpoints.md` names.

### Follow the contract

For each server, the contract in `.hora/contracts/<version>/` is authoritative for the providing side and the consuming side both. **Wanting to change a contract mid-checkpoint means raising a question, not changing it.** A contract is derived once, before implementation, and pinned; once it drifts, the agreement between backend and frontend breaks down.

### Use the glossary's identifiers

`.hora/glossary.md` holds the names. When a new concept gets one, check it against `@openreachtech/eslint-config`'s naming rules first, then append it — **including the workaround chosen for a forbidden name, and why.** Without that record, somebody later restores the naive name and lint fails.

### File and folder names

**Only class definitions are PascalCase. Everything else is kebab-case.**

```
lib/models/RpaFlow.js               a class definition. PascalCase
lib/scalars/AuditLog.js             a class definition
docker-compose.development.yml      not a class. kebab-case
.hora/tasks/1.0.0/attendance.md
specs/1.0.0/attendance/spec.md
```

**The intent is for the name itself to say "this is not a class definition."** Keep the tree in a state where starting with a capital reads as "there is exactly one class in here".

### How to order imports

**Farthest first.** What is farthest from the current file goes on top. One blank line between groups.

```
1. Native Node modules (node:*)
2. External modules from outside the company. Largest first
3. The company's shared modules (@openreachtech/*)
4. Modules inside the application
5. Constant files (gathered at the end when there are any, since they are not classes)
```

```js
import fs from 'node:fs'

import { z } from 'zod'
import dayjs from 'dayjs'

import RandomTextGenerator from '@openreachtech/mentsu-random-text-generator'

import Base from './lib/Base.js'

import RpaFlow from './lib/models/RpaFlow.js'
import User from './lib/models/User.js'

import { RPA_STATUS } from './constants/rpa.js'
```

**"Largest first" in group 2 cannot be decided mechanically.** Follow the order in existing files. Judgment that wobbles from run to run costs reproducibility, so decide it yourself only where no precedent exists.

**Inside group 4, order by folder as well**: by the folder part of the path first, then by file name, with one blank line where the folder changes. **Never order the path as a single string** — files in the same folder end up separated by a group of subfolders (measured).

```
Ordered by the whole path         folder → file name (correct)
./lib/Base.js                     ./lib/Base.js
./lib/models/RpaFlow.js           ./lib/zoo.js          ← same folder, so adjacent
./lib/models/User.js
./lib/scalars/AuditLog.js         ./lib/models/RpaFlow.js
./lib/scalars/Email.js            ./lib/models/User.js
./lib/zoo.js  ← ends up far away
                                  ./lib/scalars/AuditLog.js
                                  ./lib/scalars/Email.js
```

**Compare by locale-independent code units** (the order where `LC_ALL=C sort` and JavaScript's `Array#sort()` agree). **This applies inside group 4 only.**

**Never let a code-unit comparison decide the order of the groups themselves.** The list above decides it. Left to the comparison, it comes out backwards.

```
Code-unit comparison   @openreachtech/... (0x40) → dayjs → zod → ./lib/... (0x2E comes first)
Farthest first (right) zod / dayjs → @openreachtech/... → ./lib/...
```

**Lint does not enforce this order.** `sort-imports` is set to `off`. A broken order still passes CI, so it is maintained as a convention.

### Aggregation files are regenerated

An aggregation file that bundles classes for export (`index.js` and the like) is **derived.** When a class is finished, **scan its folder and rewrite the whole file. Do not insert one line.**

**Every regeneration starts with this banner, unchanged.** It is the only thing that never comes from the folder scan — write it first, every time, then the export lines below it.

```js
/*
 *  ___   ___    _  _  ___ _____   ___ ___ ___ _____
 * |   \ / _ \  | \| |/ _ \_   _| | __|   \_ _|_   _|
 * | |) | (_) | | .` | (_) || |   | _|| |) | |  | |
 * |___/ \___/  |_|\_|\___/ |_|   |___|___/___| |_|
 *
 *  _____ _  _ ___ ___   ___ ___ _    ___
 * |_   _| || |_ _/ __| | __|_ _| |  | __|
 *   | | | __ || |\__ \ | _| | || |__| _|
 *   |_| |_||_|___|___/ |_| |___|____|___|
 *
 * Code generated by /hora. DO NOT EDIT.
 */

export { default as Base } from './lib/Base.js'
export { default as Zoo } from './lib/zoo.js'

export { default as RpaFlow } from './lib/models/RpaFlow.js'
export { default as User } from './lib/models/User.js'
```

The order is the one in the previous section. **An export name matches its file name.**

The reason to regenerate is **idempotency.**

| | Inserting | Regenerating |
|---|---|---|
| depends on the previous content | **yes.** It assumes what its own line is added to | no. Decided by the folder's contents alone |
| a missing export line | goes unnoticed | **is always picked up by the next regeneration** |
| the rule for where to insert | every implementer has to know it | only the generator has to know it |

**Nothing handwritten may be mixed in** — an aliased export, a re-export of an external package, excluding a particular class. Any one of these makes the file underivable, and **the safest move, regenerating, is no longer available.** To use an external package, import it in the file that uses it.

On finding an aggregation file with something underivable mixed in, **do not regenerate: insert only the one line, at the position the import order gives.**

| Is the mixture documented? | Treatment |
|---|---|
| **Yes** — `specs/` or an already-resolved question says this file may carry it | Insert and move on. **`blocking: no`** — it is settled |
| **No** — nothing says so | **`blocking: yes`.** An approved exception cannot be told from an accidental edit, and only a human decision, recorded in `specs/` or a question, can settle which this is |

**Once a human has documented the mixture as expected, also remove the banner if the file still carries it.** The banner claims the file is purely derived; a file with an approved handwritten element no longer is.

### Conflict-proof files are reported, not written directly

Some files are neither derivable by a folder scan nor safe for a checkpoint to edit on its own — **`package.json`/`package-lock.json` is one instance of this**; the pattern is more general.

**The line that decides an aggregation file from this one: does the change add a new file for a scan to pick up, or edit an existing shared file's own content?** A derived class piling into its own folder is the first, no matter how many classes accumulate there. A change to what a shared ancestor itself provides — a getter every derived class should have, added to the `Base` class — edits one already-existing file, so it is always the second, regardless of how narrow or wide that ancestor's reach is.

**Known instances**, beyond `package.json`/`package-lock.json`:

```
.env.development                a new environment-variable key
docker-compose.development.yml  a new profile to enable
the Base class (or equivalent)  a getter/method meant for every derived class
```

More may turn up in the real tree — the question above decides it, not this list.

**Report the change needed; do not make it yourself.** State what the file needs, in the implementer's return value under `conflictProof`. This skill applies it on an `update/` branch and **commits it on its own**, one commit per file, never mixed into the feature's own commits.

---

## A lint rule contradiction

Rarely, two lint rules conflict outright — fixing one violation only trips the other, in either direction, with no version of the code that satisfies both at once. This is a defect in that repository's own `eslint.config.js` (**never the outer root's, which does not lint that repository at all**), never a sign the implementation is wrong, and it has happened for real.

**Never stop and hand this to whoever is running this for their own project.** That config (and the shared `@openreachtech/eslint-config` it very likely traces to) is not something an ordinary user of this template can be expected to untangle — the fix belongs with whoever maintains that config.

**Detecting a genuine loop needs every lint error this fix loop has ever seen, not only the latest one.** Keep every reported violation (rule, file, line) from every attempt. The moment a newly-reported violation exactly matches one already kept — same rule, same file, same line — that is definitive proof of a loop. Act on it immediately, without waiting for the retry limit; comparing the errors directly catches a longer cycle (A trips B trips C trips A) faster than comparing the code.

**Reaching the retry limit without ever detecting an exact repeat is handled exactly the same way.** A loop that keeps producing different violations is not *proven* to be a rule contradiction, but there is no way to tell the two apart from here, and stopping to ask a human over what is likely a trivial style rule is not worth it either way.

**Either trigger resolves identically:** from every distinct violation kept so far, pick whichever rule sits lowest on the protection order below, cut an `adhoc/<rule-name>-in-<filename>` branch, add a `files`-scoped override disabling that one rule for that one file **in that repository's own `eslint.config.js`**, and merge it in like any other branch. Report it as an `eslint-exception` question — `blocking: no`, but **fail-loud**: name it on its own in the closing report. **Reset the retry count and run lint again.**

**Which rule gets disabled follows a fixed protection order, most-protected first — disable whichever rule sits lower on this list:**

```
1. no-restricted-syntax                         (never disable this over the others)
2. any other no-restricted-*                    (no-restricted-imports, and the like)
3. any rule that is neither no-restricted-* nor @stylistic/*
4. @stylistic/* (formatting only)               (disable this first, given the choice)
```

**When more than one distinct rule lands on the same, lowest tier, break the tie mechanically, in this order:** prefer the rule with no configurable options; if more than one has options, prefer the one with fewer; if the count is equal too, prefer whichever rule name sorts first alphabetically. Never leave this to judgment — a reader of an existing `adhoc/` override has no way to tell whether "the right one" was disabled unless the same fixed order always produces the same answer.

**One override is one self-contained block, a `// TODO:` comment directly above it, never merged into another block:**

```js
// TODO: Kick out this block after resolved the issue.
{
  files: [
    '<filename>',
  ],
  rules: {
    '@stylistic/xxxx': 'off',
  },
},
```

Keeping every `adhoc/` override in its own block, marked this way, is what makes it possible to find and remove later.

---

## When a feature finishes

Checkpoint 18 passing is what finishes a feature. Then:

```
1. Set the feature's entry to [x] in _plan.md
2. Commit .hora/ for the acceptance gate
3. Report: the feature, how many checkpoints applied, how many were n/a and why,
   what questions it raised, git status for every repository it touched
```

**Never set `[x]` while any checkpoint in that feature is still `[ ]`.** A missed checkbox is picked up on the next run; one set by mistake is never revisited by anyone.

---

## References

| File | Content |
|---|---|
| `references/checkpoints.md` | **the eighteen checkpoints** — order, exit conditions, delegates, when each does not apply |
| `../hora/references/structure.md` | the layout, the invariants, where a command runs, the division of labor |
| `../hora/references/commits.md` | branches, commit granularity, merging, hotfix catch-up |
| `../hora/references/done-criteria.md` | what "done" means for a checkpoint, a feature and a version |
| `../../agents/hora-implementer.md` | writes code and tests for one checkpoint |
| `../../agents/hora-verifier.md` | adversarially checks one checkpoint's exit condition. Read-only |
