---
name: hora-build
description: Build one feature by taking it through the eighteen checkpoints — spec, backend, frontend, acceptance — in order, one gate at a time. Runs at the root of the hora repository, one feature per invocation. Invoked by /hora, or directly as /hora-build.
---

# hora-build

**Take one feature through the eighteen checkpoints, in order.**

Read `../hora/references/structure.md` (the layout, the invariants, where a command runs) and `references/checkpoints.md` (the checkpoint list itself) before starting. **This skill is read-only on `specs/`; checkpoint 1 is where a problem found there is routed to the two skills that may write it** (`references/checkpoints.md`, checkpoint 1).

## One feature at a time, never two

**Nothing here ever runs alongside another feature's checkpoints.** One feature goes from checkpoint 1 to checkpoint 18, and only then does the next one start:

| | |
|---|---|
| a feature reaches acceptance while its author still remembers it | rather than at the end of the version, alongside twenty others |
| a break shows up in the run that caused it | checkpoint 18's unit suites cover every feature so far, so a regression fails immediately |
| one branch per repository is open at a time | no shared, uncommitted state between two features to untangle |

## Where to start

**If a backend row is declared, clear its `bank-id` lock unconditionally before touching any checkpoint** (`.claude/skills/bank-id/SKILL.md`, "Clearing a stale lock"). Nothing holds that lock across invocations, so one still standing at the start of a run is leftover.

**Then allocate this feature's id prefix once, before its first implementing checkpoint, and hand that same prefix to every agent that works in the backend row.** `bank-id` returns the same prefix for the same requester however often it is asked, so allocating here costs one call and leaves the lock free — where several units run at once, asking for themselves would queue them behind each other's `mkdir`.

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

**A feature whose only open checkpoint is 18 writes no code, and cuts no branch.** That is what a section declaring `<!-- built: frontend -->` looks like on adoption: everything up to the acceptance gate is marked not-applicable, so this skill goes straight to `/hora-accept`.

**Step 2 skips an entry whose checkpoint 18 is covered by the sweep entry.** Where every specified feature carries `built:`, `/hora-plan` collapses the per-feature gates into a single adoption sweep (`../hora-plan/SKILL.md`, "collapses to one sweep"). Taking one anyway would run the twenty individual gates the collapse exists to replace.

**A listed feature is never entered, and it has nothing to resume from.** A section carrying `<!-- baseline: inventoried -->` sits under `## Not accepted` with no checkbox, so step 2 skips it with no special case (`../hora-plan/SKILL.md`, "`_plan.md` — the order"). Its eighteen empty boxes are not a feature nobody started — the feature file's provenance header says which of the two this is, and opening one rebuilds code that is already serving users.

**If no feature is ready and some are unfinished, that is a dependency cycle or a reference to an `id` that does not exist.** Raise it as a `contradiction` question (`blocking: yes`) and stop.

**A listed feature is not one of the unfinished ones.** It carries no checkbox, so a version with nothing left but listed entries is finished rather than deadlocked (`../hora/SKILL.md`, "Deciding where you are").

**A `depends` naming a listed feature is satisfied by the running code, never by a checkbox.** Read it as satisfied, and read the dependent's own `Rests on: #<id> (not accepted)` line for what its pass rests on.

---

## Running one checkpoint

```
1. Read the checkpoint's entry in references/checkpoints.md — its exit
   condition, the work it delegates, and when it does not apply
2. Decide whether it applies. If it does not, write the reason and mark it
   [x] with the n/a comment. Move on
3. Match that work against the equipped skills, take a digest of each, and
   record both (below). This is the main session's step, never an agent's
4. Cut this repository's feature/<feature-id> branch, if this is the first
   checkpoint in this gate (see ../hora/references/commits.md)
5. Run it:
     an interactive checkpoint (1, 2, 9, 11, 17, 18)
       -> the main session runs it. Never an agent
     an implementing checkpoint (3-7, 10, 12-16)
       -> hora-implementer, one agent per unit of this checkpoint's work,
          started together (below), each given that checkpoint's exit
          condition, the skill names and digest paths from step 3, and this
          feature's bank-id prefix
     an auditing checkpoint (8)
       -> hora-verifier, read-only, given the skill names to invoke in full
          (below)
6. Gather the units: regenerate every aggregation file their registrations
   name, then handle whatever else they reported that is not code (below) —
   a dependency, a conflict-proof change, a new identifier, a contract one
   wanted to change
7. Lint: cd into this checkpoint's repository, then npx eslint --fix on
   exactly the files it touched, every unit's together, then npx eslint on
   the same files for what remains. --fix clears the mechanical violations
   without an agent round trip; only what it cannot fix is worth one
     still fails -> fix it, retry (up to five attempts; see "A lint rule contradiction")
8. Test, where the checkpoint's exit condition names tests (6, 16, 18): from
   that same repository, npx jest on exactly the files this checkpoint wrote,
   with the output written to a file and read from there (below)
     fails, from something code could fix -> fix it, retry
     fails, from something no code change could fix (the middleware is not
       running, a network call reached nothing, the database was altered
       outside this run) -> stop retrying immediately, without spending the
       retry limit. Report it as a `lacked-environment` question and stop the
       feature there
     dies, leaving no result at all (the process was killed, the machine ran
       out of memory) -> not a code failure either. Report it as a
       `lacked-environment` question that names the configuration the run
       died under (below), and stop the feature there
9. Verify the exit condition actually holds — with hora-verifier for anything
   a reading of the code can settle, in conversation for the four gates that
   check against use cases. At 6 and 16, where step 8's suite is itself the
   proof, the verifier is usually skipped (below)
10. Write [x] into the feature file. Commit at the gate boundary, not here
11. Move to the next checkpoint
```

**Step 10's split matters.** The checkbox is written the moment the checkpoint passes, so an interrupted run resumes at the right place; the commit happens once per gate, so `git log .hora/` stays readable (`../hora/references/commits.md`, "Committing `.hora/`").

### Step 3 — matching a checkpoint to the skills that cover it

**`references/checkpoints.md` names no package skill, and it never may** (`../hora/references/structure.md`, "No hora file ever names one of those skills"). So the match is made here, once per checkpoint, against what is actually equipped:

```
1. Take the work the checkpoint's "Delegate to" row states
2. Read the descriptions of the skills equipped under .claude/skills/
3. Pick every one whose description covers that work, on the surface this
   checkpoint's repository requires (hb- backend, hf- frontend, hc- either)
4. Take a digest of each one (below)
5. Write the names, and the version those digests were derived from, into
   the feature file against this checkpoint
6. Hand the names and the digest paths to the agent, in its assignment
```

```markdown
- [x] 15. UI  <!-- skills: <every name you matched, comma-separated>; digests: <package version> -->
```

**The example above carries no real name on purpose.** This is a hora file, so the rule it states applies to it too.

**Match on what a description says, never on what a name sounds like.**

**Where a checkpoint's row says "every skill covering X" (12 and 15), read the descriptions exhaustively.** The package ships a family there — one skill per existing component, one per CSS convention — and a partial match builds a screen against four of eleven conventions with nothing saying so.

**Record it even when nothing matched.** An empty list is the evidence that the gate ran without its conventions; no list at all is indistinguishable from a checkpoint nobody thought about. Report the gap by name in the closing report too.

**Never let an agent do this matching.** An agent would pick differently on a rerun, and nothing downstream could say which set the first run used.

### Step 3 — the digest each matched skill is read through

**A matched skill can run to thousands of lines, and it stays resident in the agent's context for every turn.** A checkpoint's cost is close to that resident size multiplied by its turn count. `.hora/digests/<skill-name>.md` is the short form.

```
1. Read the installed version from
   node_modules/@openreachtech/ai-agent-skills/package.json
2. For each skill matched above, use .hora/digests/<skill-name>.md while its
   header names that version
3. For the rest, start hora-digester — one agent per skill, all in one
   message — and use the files they write
4. Hand those paths to the agent, alongside the skill names
```

**The version in the header is what keeps a digest honest.** It holds only while it names the version it came from, so a package update leaves every digest to be rewritten before it is read again.

**A digest names the skill it came from, and the agent reads that skill whenever a question stays open** (`../../agents/hora-digester.md`), so a convention a digest states too thinly costs one read.

**Record the version alongside the names**, so the checkpoint stays re-derivable after the next package update.

**A verifier at step 9 is handed the same digests its implementer had.** Judging a checkpoint against a fuller text than the implementer was given fails work for a convention nobody handed it.

**Checkpoint 8's audit skills are invoked in full, and a digest has no part in it.** A step whose skill *is* the criteria runs that skill whole (`../hora/references/structure.md`, "How the match is made").

### Step 5 — splitting a checkpoint into units

**Five checkpoints divide into units whose files are exclusive, and each unit gets its own implementer, all started together in one message.** One agent writing six resolvers carries a context that grows across all six; six agents each carry one.

| Checkpoint | One unit is |
|---|---|
| 3 | one table, and one operation's API surface |
| 5 | one module |
| 6 | one operation |
| 12 | one component |
| 15 | one screen |

**Exclusive files are what make this safe, so a file two units would both write belongs to one of them.** Give it to the unit that owns it, or run the checkpoint whole.

**Everything shared stays with the main session:**

| | |
|---|---|
| an aggregation file | regenerated once at step 6, from the folder scan and the units' `registrations` |
| this feature's `bank-id` prefix | allocated once, with the feature's `id` as the requester, and handed to every unit working in the backend row |
| lint, and the tests | steps 7 and 8, run once over every file the units touched together |

**Each unit is handed the slice of step 3's match its own work needs.** At 12 the matched set is a family — one skill per existing component — so handing all of it to every unit puts twenty-odd digests in each context. **Record the full set against the checkpoint as always, and name which unit received which subset.**

**The exit condition stays whole.** A unit is a slice of the work, never a slice of the gate: step 9 verifies the checkpoint's own condition once, across everything the units produced, and one checkbox covers all of them. **Where the condition asks for something no single unit can see** — checkpoint 5's confirmation that every module checkpoint 6 imports resolves — the main session gathers it at step 6.

**A checkpoint holding one table, one module, one operation or one component runs as a single agent.**

**Why this parallelism holds where feature-level and checkpoint-level parallelism do not.** Two tasks running at once in one working tree each need their own commit, and an aggregation file rewritten by the later one lands in the earlier one's commit. Units of a checkpoint share one commit — the gate's — and the aggregation file belongs to the main session. **Two features, and two checkpoints, still never run alongside each other.**

### Step 8 — output that survives the run, and the run that dies

**Capture test output in a file, and read the file.** Output collected behind a pipe lives in memory until the run ends, and a suite can end by taking the whole machine down. Written to a file as it is produced, the output survives to the line where the run stopped.

**A run that dies without a result is the third kind of failure, and it is an environment one.** It is recorded as a `lacked-environment` question, and what makes the record worth writing is the configuration it names: how many workers ran, what per-worker memory ceiling they were given, and what else was resident on the machine. A record without those is "it died", and the next run dies the same way. What the right values *are* is the package's knowledge; naming what this run died under is this skill's job.

### Step 9 — when the suite is the verification (checkpoints 6 and 16)

**At 6 and 16 the exit condition names tests, and step 8 just ran them.** What a verifier adds at these two gates is catching a test that is missing or was weakened, and both are cheaper to check directly:

```
1. Map every unit's testsWritten, together, against the acceptance criteria
   this checkpoint covers. Every criterion carries a test file that exists and
   ran in step 8's suite. A criterion with none -> back to an implementer,
   with the shortfall named. This is the main session's own read, never an
   agent's — and where the checkpoint was split, the union of the units is
   what the criteria are read against
2. Did step 8's fix loop touch any test file?
     no  -> the checkpoint is verified; write [x]. The implementer never runs
            the tests (its own file forbids it), so a suite that passed
            without a test being edited afterwards was never exposed to the
            loosen-until-green failure mode
     yes -> spawn hora-verifier after all, scoped to exactly the test files
            the fix loop touched, judging missingTests / weakenedTests only
```

**What this skips is the re-derivation, never the standard.** A test loosened, skipped or deleted to make the suite pass still fails the checkpoint. The rest of these exit conditions — the stub's class name and interface at 6, the stub left intact at 16 — is a two-file read the main session does itself.

### Which checkpoints the main session must run itself

**1, 2, 9, 11 — the ones that talk to a person.** An agent cannot ask anyone anything. Handing checkpoint 2 to an agent turns "settle this with the author" into "the agent decided", which is invariant 2.

**17 and 18 — the ones that drive the whole system.** Neither fits an agent scoped to one checkpoint's files.

### What an implementer agent may not do

`hora-implementer` writes code and tests, for **the one checkpoint — or the one unit of it — that it was handed**, and nothing else. It never touches git, never writes `.hora/`, never writes `specs/`, never installs a dependency, and never edits a file outside its own scope.

| It reports | This skill does |
|---|---|
| `dependencies` | installs it on an `install/` branch, merges, rebases the feature branch, continues |
| `conflictProof` | applies it on an `update/` branch, merges, rebases, continues |
| `newIdentifiers` | appends them to `.hora/glossary.md`, with any workaround name and why |
| `contractDrift` | raises a `contradiction` question (`blocking: yes`). **Never edits the contract** |
| `registrations` | regenerates that aggregation file from its folder, and records where insertion was the only option |
| `reinvention` | raises a `reinvention` question (`blocking: no`) |
| `specIssues` | takes it to checkpoint 1's procedure, or raises a question |
| `missingSkill` | records the gap against the checkpoint in the feature file, continues without it, and names it in the closing report. **Never substitutes a different skill** |

**A reported dependency or conflict-proof change pauses the checkpoint where it is.** A separate agent applies it on its own branch, it merges into `release/<version>`, and `feature/<feature-id>` rebases onto the new tip before work continues.

### What the verifier's report drives

`hora-verifier` returns a judgment, never a fix (`../../agents/hora-verifier.md`, "What to return").

| It reports | This skill does |
|---|---|
| `met` | writes `[x]` and moves on |
| `unmet`, with `sendBackTo` | clears the checkpoints from `sendBackTo` on and re-enters there. **`sendBackTo` is required whenever anything is unmet**; a report missing it goes back to the verifier, never into a guess |
| `missingTests` / `weakenedTests` | the checkpoint is not passed — back to an implementer agent, with the shortfall named |
| `findings` (checkpoint 8) | an implementer fixes them, then the audit runs again. An accepted finding is recorded as a question, never left as a silent pass |
| `contractDrift` | raises a `contradiction` question (`blocking: yes`). **Never edits the contract** |
| `specIssues` | takes it to checkpoint 1's procedure, or raises a question |
| `specAssumptions` | records each as a `spec-assumption` question (`blocking: no`) |

---

## What every checkpoint follows

**How to write a resolver, a migration, a component or a test is not here** — that lives in the skills `references/checkpoints.md` names.

### Follow the contract

For each server, the contract in `.hora/contracts/<version>/` is authoritative for the providing side and the consuming side both. **Wanting to change a contract mid-checkpoint means raising a question, not changing it.** A contract is derived once, before implementation, and pinned.

### Use the glossary's identifiers

`.hora/glossary.md` holds the names. When a new concept gets one, check it against `@openreachtech/eslint-config`'s naming rules first, then append it — **including the workaround chosen for a forbidden name, and why.** Without that record, somebody later restores the naive name and lint fails.

### File and folder names, and import order

**How a file is named and how imports are ordered are the package's conventions, and neither is restated here** (`../hora/references/structure.md`, "The division of labor"). At step 3, match the equipped skills whose descriptions cover naming and import order, and hand them to the agent.

**Lint does not enforce all of it**, so the conventions hold because the matched skills are followed, not because a check would catch a miss.

### Aggregation files are regenerated

An aggregation file that bundles classes for export (`index.js` and the like) is **derived.** When a class is finished, **scan its folder and rewrite the whole file. Do not insert one line.**

**This skill is what rewrites it, at step 6, once the checkpoint's units have finished** — the folder is the one thing several units share. An implementer drops its own class into the folder and names it under `registrations`.

**Every regeneration starts with this banner, unchanged.** It is the only thing that never comes from the folder scan — write it first, every time.

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

**Nothing handwritten may be mixed in** — an aliased export, a re-export of an external package, excluding a particular class. Any one of these makes the file underivable. To use an external package, import it in the file that uses it.

On finding an aggregation file with something underivable mixed in, **do not regenerate: insert only the one line, at the position the import order gives.**

| Is the mixture documented? | Treatment |
|---|---|
| **Yes** — `specs/` or an already-resolved question says this file may carry it | Insert and move on. **`blocking: no`** |
| **No** — nothing says so | **`blocking: yes`.** An approved exception cannot be told from an accidental edit |

**Once a human has documented the mixture as expected, also remove the banner if the file still carries it.** The banner claims the file is purely derived.

### Conflict-proof files are reported, not written directly

Some files are neither derivable by a folder scan nor safe for a checkpoint to edit on its own.

**The line that decides an aggregation file from this one: does the change add a new file for a scan to pick up, or edit an existing shared file's own content?** A derived class piling into its own folder is the first. A change to what a shared ancestor itself provides — a getter added to the `Base` class — is always the second.

**Known instances**, beyond `package.json`/`package-lock.json`:

```
.env.development                a new environment-variable key
docker-compose.development.yml  a new profile to enable
the Base class (or equivalent)  a getter/method meant for every derived class
```

More may turn up in the real tree — the question above decides it, not this list.

**Report the change needed; do not make it yourself.** State what the file needs, under `conflictProof`. This skill applies it on an `update/` branch and **commits it on its own**, one commit per file.

---

## A lint rule contradiction

Rarely, two lint rules conflict outright — fixing one violation only trips the other, with no version of the code that satisfies both. This is a defect in that repository's own `eslint.config.js` (**never the outer root's, which does not lint that repository at all**), and it has happened for real.

**Never stop and hand this to whoever is running this for their own project.** That config is not something an ordinary user of this template can be expected to untangle.

**Detecting a genuine loop needs every lint error this fix loop has ever seen, not only the latest.** Keep every reported violation (rule, file, line) from every attempt. The moment a newly-reported violation exactly matches one already kept, that is proof of a loop — act on it immediately, without waiting for the retry limit.

**The retry limit is five attempts per checkpoint. Reaching it without an exact repeat is handled the same way.** There is no way to tell the two apart from here, and stopping to ask a human over a trivial style rule is not worth it either way.

**Either trigger resolves identically:** from every distinct violation kept so far, pick whichever rule sits lowest on the protection order below, cut an `adhoc/<rule-name>-in-<filename>` branch, add a `files`-scoped override disabling that one rule for that one file **in that repository's own `eslint.config.js`**, and merge it in like any other branch. Report it as an `eslint-exception` question — `blocking: no`, but **fail-loud**: name it on its own in the closing report. **Reset the retry count and run lint again.**

**Which rule gets disabled follows a fixed protection order, most-protected first:**

```
1. no-restricted-syntax                         (never disable this over the others)
2. any other no-restricted-*                    (no-restricted-imports, and the like)
3. any rule that is neither no-restricted-* nor @stylistic/*
4. @stylistic/* (formatting only)               (disable this first, given the choice)
```

**When more than one distinct rule lands on the same, lowest tier, break the tie mechanically, in this order:** prefer the rule with no configurable options; then the one with fewer; then whichever name sorts first alphabetically. **Never leave this to judgment** — a reader of an existing `adhoc/` override can only tell whether the right rule was disabled if the same fixed order always produces the same answer.

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

Keeping every `adhoc/` override in its own block is what makes it possible to find and remove later.

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

**Name and link every question, never count them** (`../hora/references/structure.md`, "Citing a question in a report"). A feature's run can raise a `reinvention`, a `spec-assumption` and an `eslint-exception` without ever stopping.

**Never set `[x]` while any checkpoint in that feature is still `[ ]`.** A missed checkbox is picked up on the next run; one set by mistake is never revisited.

**That same rule is why a listed feature's entry carries no checkbox at all rather than a set one.** All eighteen of its checkpoints are `[ ]`, so `[x]` would claim a pass nothing earned, and `[ ]` would put it in the queue step 2 takes its next feature from (`../hora-plan/SKILL.md`, "`_plan.md` — the order").

---

## References

| File | Content |
|---|---|
| `references/checkpoints.md` | **the eighteen checkpoints** — order, exit conditions, delegates, when each does not apply |
| `../hora/references/structure.md` | the layout, the invariants, where a command runs, the division of labor |
| `../hora/references/commits.md` | branches, commit granularity, merging, hotfix catch-up |
| `../hora/references/done-criteria.md` | what "done" means for a checkpoint, a feature and a version |
| `../../agents/hora-implementer.md` | writes code and tests for one checkpoint, or for one unit of one |
| `../../agents/hora-verifier.md` | adversarially checks one checkpoint's exit condition. Read-only |
| `../../agents/hora-digester.md` | writes one equipped skill's digest into `.hora/digests/` |
