---
name: hora-build
description: Build one feature by taking it through the eighteen checkpoints — spec, backend, frontend, acceptance — in order, one gate at a time. Runs at the root of the hora repository (myproject-app), one feature per invocation. Invoked by /hora, or directly as /hora-build.
---

# hora-build

**Take one feature through the eighteen checkpoints, in order.**

Read `../hora/references/structure.md` (the layout, the invariants, where a command runs) and `references/checkpoints.md` (the checkpoint list itself) before starting. **This skill is read-only on `specs/`; checkpoint 1 is where a problem found there is routed to the two skills that may write it** (`references/checkpoints.md`, checkpoint 1).

## One feature at a time, never two

**Nothing here ever runs alongside another feature's checkpoints.** One feature goes from checkpoint 1 to checkpoint 18, and only then does the next one start. That is what makes the whole scheme work:

| | |
|---|---|
| a feature reaches acceptance while its author still remembers it | rather than at the end of the version, alongside twenty others |
| a break shows up in the run that caused it | checkpoint 18's unit suites cover every feature so far, so a regression fails immediately |
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

**Unless the plan collapsed the version to one adoption sweep, in which case none of them is taken at all.** Where every specified feature carries `built:`, `/hora-plan` writes those entries `[ ]` under `## Features — adopted as built` and puts one sweep entry beneath them that covers checkpoint 18 of all of them (`../hora-plan/SKILL.md`, "collapses to one sweep"). **Step 2 skips an entry whose checkpoint 18 is covered by that sweep entry** — taking it anyway would run the twenty individual gates the collapse exists to replace, each one re-reviewing what the last had just reviewed. The sweep is the run; these entries are what it closes.

**A listed feature is never entered, and it has nothing to resume from.** A section carrying `<!-- baseline: inventoried -->` is listed rather than specified (`../hora/references/spec-format.md`, "`baseline`"), and its entry sits under `## Not accepted` with no checkbox that could be `[ ]` — so step 2 skips it with no special case of its own (`../hora-plan/SKILL.md`, "`_plan.md` — the order"). Its eighteen empty boxes are not a feature nobody ever started: the feature file's provenance header is what says which of the two this is (`../hora-plan/SKILL.md`, "One file per feature"), and opening one rebuilds from checkpoint 1 code that is already serving users.

**If no feature is ready and some are unfinished, that is a dependency cycle or a reference to an `id` that does not exist.** Raise it as a `contradiction` question (`blocking: yes`) and stop; it cannot proceed until the spec is fixed.

**A listed feature is not one of the unfinished ones.** It carries no checkbox, so it is neither ready nor waiting on anything, and a version with nothing left but listed entries is finished rather than deadlocked (`../hora/SKILL.md`, "Deciding where you are"). Count one as unfinished and this stops with a `contradiction` against a spec that holds no contradiction at all.

**A `depends` naming a listed feature is satisfied by the running code, never by a checkbox** (`../hora-plan/SKILL.md`, "`_plan.md` — the order"). Read it as satisfied, and read the dependent's own `Rests on: #<id> (not accepted)` line for what its pass rests on.

---

## Running one checkpoint

```
1. Read the checkpoint's entry in references/checkpoints.md — its exit
   condition, the work it delegates, and when it does not apply
2. Decide whether it applies. If it does not, write the reason and mark it
   [x] with the n/a comment. Move on
3. Match that work against the equipped skills, and record what you picked
   (below). This is the main session's step, never an agent's
4. Cut this repository's feature/<feature-id> branch, if this is the first
   checkpoint in this gate (see ../hora/references/commits.md)
5. Run it:
     an interactive checkpoint (1, 2, 9, 11, 17, 18)
       -> the main session runs it. Never an agent
     an implementing checkpoint (3-7, 10, 12-16)
       -> hora-implementer, one agent per checkpoint, given that checkpoint's
          exit condition and the skill names from step 3
     an auditing checkpoint (8)
       -> hora-verifier, read-only, given the same
6. Handle whatever the agent reported that is not code (below): a dependency,
   a conflict-proof change, a new identifier, a contract it wanted to change
7. Lint: cd into this checkpoint's repository, then npx eslint --fix on
   exactly the files it touched, then npx eslint on the same files for what
   remains. --fix clears the mechanical violations (most of @stylistic/*)
   without an agent round trip; only what it cannot fix is worth one
     still fails -> fix it, retry (up to five attempts; see "A lint rule contradiction")
8. Test, where the checkpoint's exit condition names tests (6, 16, 18): from
   that same repository, npx jest on exactly the files this checkpoint wrote,
   with the output written to a file and read from there (below)
     fails, from something code could fix -> fix it, retry
     fails, from something no code change could fix (the middleware is not
       running, a network call reached nothing, the database was altered
       outside this run) -> stop retrying immediately, without spending the
       retry limit. Retrying does not fix an environment, and "fixing" code
       that was never wrong only makes it worse. Report it as a
       `lacked-environment` question and stop the feature there
     dies, leaving no result at all (the process was killed, the machine ran
       out of memory) -> not a code failure either. Report it as a
       `lacked-environment` question that names the configuration the run
       died under (below), and stop the feature there
9. Verify the exit condition actually holds — with hora-verifier for anything
   a reading of the code can settle, in conversation for the four gates that
   check against use cases. At 6 and 16, where step 8's suite is itself the
   proof, the verifier is usually skipped ("When the suite is the
   verification", below)
10. Write [x] into the feature file. Commit at the gate boundary, not here
11. Move to the next checkpoint
```

**Step 10's split matters.** The checkbox is written the moment the checkpoint passes, so an interrupted run resumes at the exact right place; the commit happens once per gate, so `git log .hora/` stays readable (`../hora/references/commits.md`, "Committing `.hora/`").

### Step 3 — matching a checkpoint to the skills that cover it

**`references/checkpoints.md` names no package skill, and it never may.** A name written there is a copy of something the package owns and is free to change, and it is the one kind of copy that fails silently: the name stops matching, the gate runs without its convention, and the run reports a pass. `../hora/references/structure.md`, "No hora file ever names one of those skills", is the full statement of this.

So the match is made here, once per checkpoint, against what is actually equipped:

```
1. Take the work the checkpoint's "Delegate to" row states
2. Read the descriptions of the skills equipped under .claude/skills/
3. Pick every one whose description covers that work, on the surface this
   checkpoint's repository requires (hb- backend, hf- frontend, hc- either)
4. Write them into the feature file, against this checkpoint
5. Hand the names to the agent, in its assignment
```

```markdown
- [x] 15. UI  <!-- skills: <every name you matched, comma-separated> -->
```

**The example above carries no real name on purpose.** This file is a hora file, so the rule it is stating applies to it too.

**Match on what a description says, never on what a name sounds like.** Two skills whose names differ by one word can serve different surfaces entirely; the description is the only thing that says which is which.

**Where a checkpoint's row says "every skill covering X" (12 and 15), read the descriptions exhaustively rather than stopping at the obvious few.** Those two rows are worded that way because the package ships a family there — one skill per existing component, one per CSS convention — and a partial match is how a screen gets built against four of eleven conventions with nothing saying so.

**Record it even when nothing matched.** An empty list is the evidence that the gate ran without its conventions; no list at all is indistinguishable from a checkpoint nobody thought about. Report the gap by name in the closing report too.

**Never let an agent do this matching.** An agent that picks its own would pick differently on a rerun, and nothing downstream could say which set the first run actually used.

### Step 8 — output that survives the run, and the run that dies

**Capture test output in a file, and read the file.** Output collected behind a pipe lives in memory until the run ends — and a suite can end by taking the whole machine down, at which point nothing has been written and zero bytes remain. The next invocation then cannot tell a run that died from a run that never started. Written to a file as it is produced, the output survives to exactly the line where the run stopped, which is also where the diagnosis starts.

**A run that dies without a result is the third kind of failure, and it is an environment one.** The first two cases in step 8 both leave results to read; this one leaves nothing — the process was killed, or the machine ran out of memory under it. No code change fixes that, so it is recorded as a `lacked-environment` question, and what makes the record worth writing is the configuration it names: how many workers ran, what per-worker memory ceiling they were given, and what else was resident on the machine competing for it. A record without those is "it died"; the next run keeps the same settings and dies the same way. What the right values *are* is the package's knowledge — the skill matched at step 3 for running tests owns that — but naming what this run died under is this skill's job, because this skill is the one holding the evidence when it happens.

### Step 9 — when the suite is the verification (checkpoints 6 and 16)

**At 6 and 16 the exit condition names tests, and step 8 just ran them — a passing suite already proves most of what a verifier would re-derive.** What a verifier really adds at these two gates is catching a test that is missing or was weakened, and both are cheaper to check directly:

```
1. Map the implementer's testsWritten against the acceptance criteria this
   checkpoint covers. Every criterion carries a test file that exists and ran
   in step 8's suite. A criterion with none -> back to an implementer, with
   the shortfall named. This is the main session's own read, never an agent's
2. Did step 8's fix loop touch any test file?
     no  -> the checkpoint is verified; write [x]. The implementer never runs
            the tests (its own file forbids it), so a suite that passed
            without a test being edited afterwards was never exposed to the
            loosen-until-green failure mode
     yes -> spawn hora-verifier after all, scoped to exactly the test files
            the fix loop touched, judging missingTests / weakenedTests only
```

**What this skips is the re-derivation, never the standard.** A test loosened, skipped or deleted to make the suite pass still fails the checkpoint — step 2's `yes` branch is where that is caught, and it runs precisely when the risk exists: a test edited *after* its result was visible. The rest of these exit conditions — the stub's class name and interface at 6, the stub left intact at 16 — is a two-file read the main session does itself.

### Which checkpoints the main session must run itself

**1, 2, 9, 11 — the ones that talk to a person.** An agent cannot ask anyone anything, so a gate that exists to resolve a problem in conversation cannot be delegated to one. Handing checkpoint 2 to an agent turns "settle this with the author" into "the agent decided", which is invariant 2.

**17 and 18 — the ones that drive the whole system.** Bringing up a container stack, and running an acceptance gate whose unit suites span every repository, is not one feature's implementation work, and neither fits an agent scoped to one checkpoint's files.

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
| `missingSkill` | records the gap against the checkpoint in the feature file, continues without it, and names it in the closing report. **Never substitutes a different skill** (`../hora/references/structure.md`, "How the match is made") |

**A reported dependency or conflict-proof change pauses the checkpoint where it is.** A separate agent applies it on its own branch, it merges into `release/<version>`, and `feature/<feature-id>` rebases onto the new tip before work continues. Nothing else is running, so that rebase has no concurrent state to reconcile.

### What the verifier's report drives

`hora-verifier` returns a judgment, never a fix (`../../agents/hora-verifier.md`, "What to return"). This skill acts on what it returns:

| It reports | This skill does |
|---|---|
| `met` | writes `[x]` and moves on |
| `unmet`, with `sendBackTo` | clears the checkpoints from `sendBackTo` on and re-enters there — the same movement the four verification gates use. **`sendBackTo` is required whenever anything is unmet**; a report missing it goes back to the verifier, never into a guess |
| `missingTests` / `weakenedTests` | the checkpoint is not passed — back to an implementer agent, with the shortfall named |
| `findings` (checkpoint 8) | an implementer fixes them, then the audit runs again. An accepted finding is recorded as a question, never left as a silent pass |
| `contractDrift` | raises a `contradiction` question (`blocking: yes`). **Never edits the contract** |
| `specIssues` | takes it to checkpoint 1's procedure, or raises a question — the same as the implementer's |
| `specAssumptions` | records each as a `spec-assumption` question (`blocking: no`), so the reading it assumed is visible to whoever edits `specs/` next |

---

## What every checkpoint follows

The rules below apply to whatever is written, at whichever checkpoint. **How to write a resolver, a migration, a component or a test is not here** — that lives in the skills `references/checkpoints.md` names.

### Follow the contract

For each server, the contract in `.hora/contracts/<version>/` is authoritative for the providing side and the consuming side both. **Wanting to change a contract mid-checkpoint means raising a question, not changing it.** A contract is derived once, before implementation, and pinned; once it drifts, the agreement between backend and frontend breaks down.

### Use the glossary's identifiers

`.hora/glossary.md` holds the names. When a new concept gets one, check it against `@openreachtech/eslint-config`'s naming rules first, then append it — **including the workaround chosen for a forbidden name, and why.** Without that record, somebody later restores the naive name and lint fails.

### File and folder names, and import order

**How a file is named and how imports are ordered are the package's conventions, and neither is restated here.** A copy would go stale the first time the package updates, and nothing would announce that it had (`../hora/references/structure.md`, "The division of labor"). At step 3, match the equipped skills whose descriptions cover naming and import order along with the rest, and hand them to the agent.

**Lint does not enforce all of it**, so a broken convention can still pass CI — the conventions hold because the matched skills are followed, not because a check would catch a miss.

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

**The retry limit is five attempts per checkpoint. Reaching it without ever detecting an exact repeat is handled exactly the same way.** A loop that keeps producing different violations is not *proven* to be a rule contradiction, but there is no way to tell the two apart from here, and stopping to ask a human over what is likely a trivial style rule is not worth it either way.

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
   every question it raised — id, category, blocking value, one line, and a
   link to the file — and git status for every repository it touched
```

**Name and link every question, never count them** (`../hora/references/structure.md`, "Citing a question in a report"). A feature's run can raise a `reinvention`, a `spec-assumption` and an `eslint-exception` without ever stopping, and all three are decisions taken by default that somebody would want to look at while the work is one commit old.

**Never set `[x]` while any checkpoint in that feature is still `[ ]`.** A missed checkbox is picked up on the next run; one set by mistake is never revisited by anyone.

**That same rule is why a listed feature's entry carries no checkbox at all rather than a set one** — all eighteen of its checkpoints are `[ ]`, so `[x]` would claim a pass nothing earned, and `[ ]` would put it in the queue "Where to start"'s step 2 takes its next feature from. An entry with no box claims neither (`../hora-plan/SKILL.md`, "`_plan.md` — the order").

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
