---
name: hora-build
description: Build one feature by taking it through the eighteen checkpoints — spec, provider, consumer, acceptance — in order, one gate at a time. One feature per invocation. Invoked by /hora, or directly as /hora-build.
---

# hora-build

**Take one feature through the eighteen checkpoints, in order.**

Read `../hora/references/structure.md` and `references/checkpoints.md` before starting. **This skill is read-only on `specs/`; checkpoint 1 is where a problem found there is routed to the two skills that may write it.**

## One feature at a time, never two

**Nothing here ever runs alongside another feature's checkpoints.**

| | |
|---|---|
| a feature reaches acceptance while its author still remembers it | rather than at the end of the version, alongside twenty others |
| a break shows up in the run that caused it | checkpoint 18's test suites cover every feature so far |
| one branch per repository is open at a time | no shared, uncommitted state between two features to untangle |

## Where to start

**If a provider row is declared, clear its `bank-id` lock unconditionally before touching any checkpoint** (`../bank-id/SKILL.md`). Nothing holds that lock across invocations, so one still standing at the start of a run is leftover.

**Then allocate this feature's id prefix once, before its first implementing checkpoint, and hand that same prefix to every agent working in that row.** `bank-id` returns the same prefix for the same requester however often it is asked, so allocating here costs one call and leaves the lock free.

```
1. Read .hora/tasks/<version>/_plan.md
2. Take the first feature whose entry is [ ] and whose depends are all
   satisfied, looking back through past versions for a revived feature's
   dependencies — finishing in an earlier version counts
3. Open .hora/tasks/<version>/<feature-id>.md
4. Take the first checkpoint that is [ ]
5. Run it. Then the next one. Stop when the file has no [ ] left
```

Report the decision in one line before starting — "building #attendance, from checkpoint 6 of 18".

**A feature whose only open checkpoint is 18 writes no code and cuts no branch.** That is what a section declaring `built: consumer` looks like on adoption.

**Step 2 skips an entry whose checkpoint 18 the sweep entry covers.** Taking one anyway would run the individual gates the collapse exists to replace (`../hora-plan/SKILL.md`, "Collapsing an all-built version to one sweep").

**A listed feature is never entered, and it has nothing to resume from.** It sits under `## Not accepted` with no checkbox, so step 2 skips it with no special case. **Its eighteen empty boxes are not a feature nobody started** — the file's header says which of the two this is, and opening one rebuilds code that is already serving users.

**If no feature is ready and some are unfinished, that is a dependency cycle or a reference to an `id` that does not exist.** Raise `contradiction` (`blocking: yes`) and stop. **A listed feature is not one of the unfinished ones.**

**A `depends` naming a listed feature is satisfied by the running code, never by a checkbox.**

---

## Running one checkpoint

```
 1. Read the checkpoint's entry in references/checkpoints.md — its exit
    condition, the work it delegates, and when it does not apply
 2. Decide whether it applies. If not, write the reason and mark it [x] with
    the n/a comment. Move on
 3. Match that work against the equipped skills, take a digest of each, and
    record both. This is the main session's step, never an agent's
 4. Cut this repository's feature branch, if this is the gate's first
    checkpoint (../hora/references/commits.md)
 5. Run it:
      an interactive checkpoint (1, 2, 9, 11, 17, 18)
        -> the main session runs it. Never an agent
      an implementing checkpoint (3-7, 10, 12-16)
        -> hora-implementer, one agent per unit, started together, each given
           the exit condition, the skill names and digest paths from step 3,
           and this feature's id prefix
      an auditing checkpoint (8)
        -> hora-verifier, read-only, given the skill names to invoke in full
 6. Gather the units: regenerate every aggregation file their registrations
    name, then handle whatever else they reported that is not code
 7. Lint: from inside this checkpoint's repository, run its own fix-what-it-can
    command over exactly the files it touched, then its plain lint command over
    the same files. Fixing the mechanical violations without an agent round
    trip leaves only what is worth one
      still fails -> fix it, retry (up to five attempts; see below)
 8. Test, where the exit condition names tests (6, 16, 18): from that same
    repository, run its test command over exactly the files this checkpoint
    wrote, with the output written to a file and read from there
      fails, from something code could fix -> fix it, retry
      fails, from something no code change could fix (a service is not
        running, a network call reached nothing, the database was altered
        outside this run) -> stop retrying immediately, without spending the
        retry limit. Raise `lacked-environment` and stop the feature there
      dies leaving no result (the process was killed, the machine ran out of
        memory) -> also not a code failure. Raise `lacked-environment` naming
        the configuration the run died under, and stop the feature there
 9. Verify the exit condition actually holds — with hora-verifier for anything
    a reading of the code can settle, in conversation for the gates that check
    against use cases
10. Write [x] into the feature file. Commit at the gate boundary, not here
11. Move to the next checkpoint
```

**Step 10's split matters.** The checkbox is written the moment the checkpoint passes, so an interrupted run resumes in the right place; the commit happens once per gate, so `git log .hora/` stays readable.

**Steps 7 and 8 use the commands `/hora-setup` recorded in `.hora/tree/<repository>.md`**, from inside that repository. From the outer root, lint reads nothing and passes anyway.

**Step 8 captures test output in a file and reads the file.** Output collected behind a pipe lives in memory until the run ends, and a suite can end by taking the whole machine down. Written to a file as it is produced, it survives to the line where the run stopped.

**A run that dies without a result is an environment failure, and what makes its record worth writing is the configuration it names** — how many workers ran, what memory ceiling they had, what else was resident. A record without those says "it died", and the next run dies the same way.

### Matching a checkpoint to the skills that cover it

**`references/checkpoints.md` names no skill from the conventions package, and it never may.** So the match is made here, once per checkpoint:

```
1. Take the work the checkpoint's "Delegate to" row states
2. Read the descriptions of the skills equipped under .claude/skills/
3. Pick every one whose description covers that work, for the role this
   repository plays
4. Take a digest of each
5. Write the names, and the version the digests came from, into the feature
   file against this checkpoint
6. Hand the names and the digest paths to the agent
```

```markdown
- [x] 15. Presentation  <!-- skills: <every name you matched>; digests: <package version> -->
```

**Match on what a description says, never on what a name sounds like.**

**Where a checkpoint's row says "every skill covering X", read the descriptions exhaustively.** A package often ships a family there — one skill per existing component, one per style convention — and a partial match builds against four of eleven conventions with nothing saying so.

**Record it even when nothing matched.** An empty list is evidence the gate ran without its conventions; no list at all is indistinguishable from a checkpoint nobody thought about. **Report the gap by name in the closing report too.**

**Never let an agent do this matching.** An agent would pick differently on a rerun, and nothing downstream could say which set the first run used.

### The digest a matched skill is read through

**A matched skill can run to thousands of lines, and it stays resident in the agent's context for every turn.** A checkpoint's cost is close to that resident size multiplied by its turn count.

```
1. Read the conventions package's installed version
2. For each matched skill, use .hora/digests/<skill-name>.md while its header
   names that version
3. For the rest, start hora-digester — one agent per skill, all in one message
   — and use the files they write
4. Hand those paths to the agent, alongside the skill names
```

**The version in the header is what keeps a digest honest.** It holds only while it names the version it came from, so a package update leaves every digest to be rewritten before it is read again.

**A digest names the skill it came from, and the agent reads that skill whenever a question stays open**, so a convention a digest states too thinly costs one read.

**A verifier at step 9 is handed the same digests its implementer had.** Judging a checkpoint against a fuller text than the implementer was given fails work for a convention nobody handed it.

**Checkpoint 8's audit skills are invoked in full, and a digest has no part in it.**

### Splitting a checkpoint into units

**Five checkpoints divide into units whose files are exclusive, and each unit gets its own implementer, all started together in one message.** One agent writing six handlers carries a context that grows across all six; six agents each carry one.

| Checkpoint | One unit is |
|---|---|
| 3 | one table, and one operation's interface |
| 5 | one module |
| 6 | one operation |
| 12 | one component |
| 15 | one surface |

**Exclusive files are what make this safe, so a file two units would both write belongs to one of them.** Give it to the unit that owns it, or run the checkpoint whole.

**Everything shared stays with the main session:** the aggregation file, regenerated once at step 6; this feature's id prefix; and lint and tests, run once over every file the units touched together.

**Each unit is handed the slice of the match its own work needs.** At 12 the matched set is often a family, so handing all of it to every unit puts twenty-odd digests in each context. **Record the full set against the checkpoint as always, and name which unit received which subset.**

**The exit condition stays whole.** A unit is a slice of the work, never a slice of the gate: step 9 verifies the checkpoint's own condition once, across everything the units produced, and one checkbox covers all of them.

**A checkpoint holding one table, one module, one operation or one component runs as a single agent.**

**Why this parallelism holds where feature-level parallelism does not.** Two tasks at once in one working tree each need their own commit, and an aggregation file rewritten by the later one lands in the earlier one's commit. **Units of a checkpoint share one commit — the gate's — and the aggregation file belongs to the main session.**

### When the suite is the verification (checkpoints 6 and 16)

**At 6 and 16 the exit condition names tests, and step 8 just ran them.** What a verifier adds is catching a test that is missing or was weakened, and both are cheaper to check directly:

```
1. Map every unit's reported tests, together, against the acceptance criteria
   this checkpoint covers. Every criterion carries a test file that exists and
   ran in step 8's suite. A criterion with none -> back to an implementer,
   with the shortfall named. This is the main session's own read
2. Did step 8's fix loop touch any test file?
     no  -> the checkpoint is verified; write [x]. The implementer never runs
            the tests, so a suite that passed without a test being edited
            afterwards was never exposed to the loosen-until-green failure
     yes -> spawn hora-verifier after all, scoped to exactly the test files the
            fix loop touched, judging missing and weakened tests only
```

**What this skips is the re-derivation, never the standard.** A test loosened, skipped or deleted to make the suite pass still fails the checkpoint.

### Which checkpoints the main session must run itself

**1, 2, 9, 11 — the ones that talk to a person.** An agent cannot ask anyone anything. Handing checkpoint 2 to an agent turns "settle this with the author" into "the agent decided", which is invariant 2.

**17 and 18 — the ones that drive the whole system.** Neither fits an agent scoped to one checkpoint's files.

### What an implementer may not do

`hora-implementer` writes code and tests for **the one checkpoint — or the one unit — it was handed**, and nothing else. It never touches git, never writes `.hora/` or `specs/`, never installs a dependency, and never edits a file outside its scope.

| It reports | This skill does |
|---|---|
| `dependencies` | installs it on an `install/` branch, merges, rebases the feature branch, continues |
| `conflictProof` | applies it on an `update/` branch, merges, rebases, continues |
| `newIdentifiers` | appends them to the glossary, with any workaround name and why |
| `contractDrift` | raises `contradiction` (`blocking: yes`). **Never edits the contract** |
| `registrations` | regenerates that aggregation file from its folder |
| `reinvention` | raises `reinvention` (`blocking: no`) |
| `specIssues` | takes it to checkpoint 1's procedure, or raises a question |
| `missingSkill` | records the gap against the checkpoint, continues without it, and names it in the closing report. **Never substitutes a different skill** |

**A reported dependency or conflict-proof change pauses the checkpoint where it is.**

### What the verifier's report drives

`hora-verifier` returns a judgment, never a fix.

| It reports | This skill does |
|---|---|
| `met` | writes `[x]` and moves on |
| `unmet`, with `sendBackTo` | clears the checkpoints from there on and re-enters. **`sendBackTo` is required whenever anything is unmet**; a report missing it goes back to the verifier, never into a guess |
| `missingTests` / `weakenedTests` | the checkpoint is not passed — back to an implementer, with the shortfall named |
| `findings` (checkpoint 8) | an implementer fixes them, then the audit runs again. An accepted finding is recorded as a question, never left as a silent pass |
| `contractDrift` | raises `contradiction` (`blocking: yes`) |
| `specIssues` | takes it to checkpoint 1's procedure, or raises a question |
| `specAssumptions` | records each as `spec-assumption` (`blocking: no`) |

---

## What every checkpoint follows

**How to write any piece of the implementation is not here** — that lives in the skills `references/checkpoints.md` names.

### Follow the contract

For each server, the contract in `.hora/contracts/<version>/` is authoritative for the providing side and the consuming side both. **Wanting to change one mid-checkpoint means raising a question, not changing it.**

### Use the glossary's identifiers

When a new concept gets a name, check it against the project's lint rules first, then append it — **including the workaround chosen for a forbidden name, and why.** Without that record, somebody later restores the naive name and lint fails.

### File names and import order are the package's conventions

**Neither is restated here.** At step 3, match the equipped skills whose descriptions cover them and hand them to the agent. **Lint does not enforce all of it**, so these conventions hold because the matched skills are followed, not because a check would catch a miss.

### Aggregation files are regenerated

An aggregation file that bundles things for export is **derived.** When something is finished, **scan its folder and rewrite the whole file. Do not insert one line.**

**This skill rewrites it, at step 6, once the units have finished** — the folder is the one thing several units share. An implementer drops its own file into the folder and names it under `registrations`.

**Every regeneration starts with a banner saying the file is generated and must not be edited.** It is the only thing that never comes from the folder scan — write it first, every time.

| | Inserting | Regenerating |
|---|---|---|
| depends on the previous content | **yes** | no. Decided by the folder alone |
| a missing entry | goes unnoticed | **is picked up by the next regeneration** |
| the rule for where to insert | every implementer has to know it | only the generator has to |

**Nothing handwritten may be mixed in** — an aliased export, a re-export of an external package, an exclusion. Any one makes the file underivable.

**On finding an aggregation file with something underivable in it, do not regenerate: insert only the one line**, at the position the import order gives.

| Is the mixture documented? | Treatment |
|---|---|
| **Yes** — `specs/` or a resolved question says this file may carry it | insert and move on. **`blocking: no`** |
| **No** | **`blocking: yes`.** An approved exception cannot be told from an accidental edit |

**Once a human has documented the mixture as expected, remove the banner if the file still carries it.** The banner claims the file is purely derived.

### Conflict-proof files are reported, not written directly

Some files are neither derivable by a folder scan nor safe for a checkpoint to edit on its own.

**The line that decides an aggregation file from this one: does the change add a new file for a scan to pick up, or edit an existing shared file's own content?** A derived class piling into its own folder is the first. A change to what a shared ancestor provides — a method added to a base class — is always the second.

**Known instances**, beyond the manifest and lockfile: an environment configuration file gaining a key; a service configuration gaining an entry; a base class gaining a member meant for everything derived from it. **More may turn up in the real tree — the question above decides it, not this list.**

**Report the change needed; do not make it yourself.** This skill applies it on an `update/` branch and **commits it on its own**, one commit per file.

---

## A lint rule contradiction

Rarely, two lint rules conflict outright — fixing one violation only trips the other, with no version of the code that satisfies both. **This is a defect in that repository's own lint configuration**, never the outer root's, which does not lint that repository at all.

**Never stop and hand this to whoever is running this for their own project.** That configuration is not something an ordinary user can be expected to untangle.

**Detecting a genuine loop needs every lint error this fix loop has seen, not only the latest.** Keep every reported violation — rule, file, line — from every attempt. **The moment a newly reported violation exactly matches one already kept, that is proof of a loop.** Act on it immediately, without waiting for the retry limit.

**The retry limit is five attempts per checkpoint, and reaching it without an exact repeat is handled the same way.** There is no way to tell the two apart from here, and stopping to ask a human over a style rule is not worth it either way.

**Either trigger resolves identically:** from every distinct violation kept, pick whichever rule sits lowest on the protection order below, cut an `adhoc/<rule>-in-<file>` branch, add a scoped override disabling that one rule for that one file **in that repository's own lint configuration**, and merge it like any other branch. **Raise `lint-exception` — `blocking: no`, but fail-loud: name it on its own in the closing report.** Then reset the retry count and run lint again.

**Which rule gets disabled follows a fixed protection order, most-protected first:**

```
1. rules restricting which constructs may appear in the code at all
   (never disable one of these over the others)
2. rules restricting what may be imported or referenced
3. any other rule that is not purely about formatting
4. formatting-only rules              (disable one of these first, given the choice)
```

**Which of a project's rules fall in which tier is read from `.hora/tree/<repository>.md`**, where `/hora-setup` recorded the lint configuration.

**When more than one distinct rule lands on the same lowest tier, break the tie mechanically, in this order:** prefer the rule with no configurable options; then the one with fewer; then whichever name sorts first alphabetically. **Never leave this to judgment** — a reader of an existing override can only tell whether the right rule was disabled if the same fixed order always produces the same answer.

**One override is one self-contained block, with a `TODO` comment directly above it, never merged into another block.** Keeping each in its own block is what makes it possible to find and remove later.

---

## When a feature finishes

Checkpoint 18 passing is what finishes a feature. Then:

```
1. Set the feature's entry to [x] in _plan.md
2. Commit .hora/ for the acceptance gate
3. Report: the feature, how many checkpoints applied, how many were n/a and
   why, every question it raised — id, category, blocking value, one line and
   a link — and git status for every repository it touched
```

**Name and link every question, never count them.**

**Never set `[x]` while any checkpoint in that feature is still `[ ]`.** A missed checkbox is picked up on the next run; one set by mistake is never revisited.

**That same rule is why a listed feature's entry carries no checkbox at all rather than a set one.**

---

## References

| File | Content |
|---|---|
| `references/checkpoints.md` | **the eighteen checkpoints** — order, exit conditions, delegates, when each does not apply |
| `../hora/references/structure.md` | the layout, the invariants, where a command runs |
| `../hora/references/commits.md` | branches, commits, merging |
| `../hora/references/done-criteria.md` | what done means for a checkpoint, a feature and a version |
| `../../agents/hora-implementer.md` | writes code and tests for one checkpoint, or one unit |
| `../../agents/hora-verifier.md` | adversarially checks one exit condition. Read-only |
| `../../agents/hora-digester.md` | writes one equipped skill's digest |
