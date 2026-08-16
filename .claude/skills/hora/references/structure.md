# What every hora skill assumes

Every hora skill stands on this file. It is written once here; the others point at it.

---

## The division of labor

**Hora owns the order and the gates. It does not own how anything is built, or what counts as good work.**

| | Owner |
|---|---|
| which phase runs next | hora |
| the order a spec is decided in | hora |
| which repositories exist | hora |
| which version is built, and which features it holds | hora |
| the order of the checkpoints, and each one's exit condition | hora |
| **how to write code, a test, a schema, a screen** | **the conventions package** |
| **what an acceptance review looks at, and what it fails on** | **the conventions package** |

**Never copy a procedure or a pass/fail rule from the conventions package into a hora file.** State the work and delegate it. A copy stops matching the first time the package changes, and nothing says so.

### The conventions package

A project declares one in its spec (`spec-format.md`, "1. Document information"). It ships skills holding the procedures, and `/hora-setup` copies them into `.claude/skills/` so the `Skill` tool can find them.

**A project may declare none.** Every gate then runs without conventions and records that it did. Nothing else changes.

### No hora file ever names one of those skills

**A skill's name belongs to the package, which may rename it.** A name written here would not fail loudly — it would stop matching, the gate would run without its convention, and the run would report a pass.

| | |
|---|---|
| a hora file | **states the kind of work** — "how a background job is written" |
| an equipped skill | states what it covers, in its own `description:` |
| the match between them | **made at run time, never written down in advance** |

**Skills hora itself ships may be named freely.** They live in this repository, so a rename here is a rename everywhere.

### How the match is made

```
1. The checkpoint or stage states the kind of work.
2. The MAIN SESSION reads the equipped skills' descriptions and picks every
   one that covers that work, for the role this repository plays.
3. It records which it picked, in .hora/.
4. It hands those names to the agent doing the work, each with a digest
   (../../hora-build/SKILL.md, "The digest a matched skill is read through").
```

**Step 2 is the main session's.** An agent would pick differently on a rerun, and nothing would say which set the first run used.

**Match on what a description says, never on what a name sounds like.**

**If nothing equipped covers the work, say so and continue without it.** A recorded gap beats a guessed substitute.

**A step whose skill *is* the criteria invokes that skill in full, not through a digest.** An agent writing code opens the skill when a question comes up; an audit or a review has no such moment, because the missing check is the one nobody thinks to ask about.

---

## The structure this assumes

A project is one hora repository with the implementation repositories nested inside it.

```
myproject-app/          ← cwd. Holds specs/, .hora/ and .claude/. No application code
  myproject-core/       ← a declared row. Gitignored by the outer repository
  myproject-web/        ← another
```

**The spec declares the layout. No hora skill may assume one** (`spec-format.md`, "2. Repository layout").

Every row declares one or more **roles**:

| Role | Means | Checkpoints it runs |
|---|---|---|
| `provider` | it owns a data store and serves the operations | 3–9 |
| `consumer` | it uses those operations | 10–17 |

- **A row may hold both roles.** A single-repository project declares one such row and runs all eighteen checkpoints in it
- **One data store has exactly one provider.** Two rows writing the same store is a stop (`blocking: yes`)
- **More rows arrive in later versions**

**Names read `<project>-<suffix>`, and the suffix is what `target` names.** The project name comes from the spec, never from the directory name.

**A repository that existed before hora keeps its own name.** The layout's `Directory` column says where it sits; `target` still comes from the `Repository` column.

The nesting is the agent harness's requirement, not git's: a session cannot write outside its working directory.

---

## Where a per-repository command runs

Every hora skill runs at the outer root. **Every command that acts on a repository runs with that repository as its working directory**, as one command, with paths relative to it:

```
cd myproject-core && <that repository's own lint command>
```

**What decides it is whether the command reads or writes anything belonging to the repository** — its config, its dependencies, its environment files, its migrations, its own source, its own git history. Whatever `/hora-setup` found in the real tree is covered from the moment it is found.

`git -C <repository>` is the same rule in git's own option.

**A wrong working directory does not reliably announce itself.** The outer root ignores every implementation repository in its own lint config, so a lint run from there reads nothing and exits 0 — a check that never ran looks exactly like one that passed.

---

## Invariants

These three must not be broken.

### 1. Ownership is split

| Directory | Who writes it |
|---|---|
| `specs/` | **humans, `/hora-spec` and `/hora-plan`.** Every other skill is read-only |
| `.hora/` | the skill whose work it records. Humans read only |

**The two skills that write `specs/` both do it the same way:**

```
1. state what is missing, or what the conversation decided
2. show the exact text, in full, as it will be written
3. wait for approval of THAT text
4. write it
```

| | Writes | Approval granularity |
|---|---|---|
| `/hora-spec` | a version's spec | **a section** |
| `/hora-plan` | holes found while planning | **an edit** |

**Approval is never blanket.** "Yes, fix them all" is not approval of text nobody read.

**What is protected is not typing — it is that no requirement enters `specs/` without a human reading the exact words.**

**An improvement a skill thought of is a proposal, and it is labelled one** (`asking.md`). Proposing is expected; the silent proposal is forbidden.

**`specs/skeleton/spec.md` is written to by nobody and is not a version.** It is the blank spec copied into the first version only.

### 2. The boundary of inference

| | Example | Treatment |
|---|---|---|
| Classifying | `target`, `depends` | **may be inferred.** It attaches a label and adds no information |
| Content | requirements, use cases, acceptance criteria, **an operation's kind**, **how far a feature is already built** | **must not be inferred.** That would invent what the spec does not say |
| A permanent identifier | `id` | **must not be invented.** Derive it only where it can be derived |

**This forbids inferring. It does not forbid reading.**

```
read the code, draft what it shows, show it, let somebody confirm it   allowed
read the code and write the requirement it implies                     forbidden
```

**No amount of reading settles intent.** Which operations exist is a fact. Who they are *for*, who *should* be allowed to call them, and how much of a feature counts as finished are not in the tree.

**One written declaration moves this line, once: `Authority: as-built`** (`spec-format.md`, "5. Existing assets"). Where it is absent, this section applies in full.

**Do not try to keep the number of questions down** (`asking.md`).

### 3. Pin things, to stay reproducible

- Templates are fetched at a released tag, not at a branch head
- Material a version's spec references is closed inside that version
- Do not upgrade dependencies on your own — that is a human's deliberate act

---

## Where a lever lives

**A lever is anything that reduces how much work happens** — a declaration, an annotation, a section left out, a step a run gives up. `levers.md` indexes them; this is the rule that places one.

**Ask these in order. The first match is the home.**

```
1. Is it about THE PRODUCT — what must exist, who may use it, which side wins
   when the spec and the code disagree, how much counts as finished?
     -> intent. Only a person states it, only in specs/, through
        show-the-text-and-wait. Its reach picks the home:
          the whole project      -> spec.md's own text
          this version           -> a required section
          one feature            -> an annotation under its heading

2. Is it about ONE RUN — how much this invocation does, asserting nothing
   that outlives it?
     -> the invocation, and that run's own record. A skill may only narrow
        against a written condition; a person may only widen

3. Does it merely FOLLOW from something already written under 1 or 2?
     -> a derivation. A skill writes it into .hora/, mechanically. NOTHING IS
        EVER DECLARED THERE, because humans read .hora/ and do not write it
```

**Two clauses bind every home.**

**(a) A lever may reduce work. It may never reduce verification, and it may never reduce what is recorded.** A run that gave up a step pays for it in the record, never in the verdict's wording.

**(b) A lever states its own reach where it is declared** — whether it carries forward under the diff rule. Omission is how `specs/` propagates, so an unstated reach is a silent permanent grant.

---

## What language to write for humans

| What is written | Language |
|---|---|
| anything in a file — questions, notes, acceptance records | **the spec's declared question language.** Absent that, the language of whoever ran it |
| **anything said in conversation** | **always the language of whoever ran it** |
| task and feature names, glossary terms | copied from the spec |
| glossary identifiers | English |

The declaration lives in the spec's document information section. It has to be declarable because a question stays in a file, read by whoever edits `specs/` next.

**Never write two languages side by side.** One copy gets updated and the two disagree.

**Existing questions are not retranslated.** The file is append-only, so it may hold more than one language.

**A proposed edit to `specs/` is discussed in the person's language and written in the file's language.**

---

## Citing a question in a report

**A count is not a report.** A question nobody can find is a question nobody answers.

**Every question a run raised, or left open, is named and linked** — in every report, from every skill, at every blocking value.

```
Q4  missing-authorization  blocking: yes
    `closeMonth` does not say who may call it
    → .hora/questions/1.0.0/open.md
```

| | |
|---|---|
| a relative markdown link | so it opens from wherever the report is read |
| the `Q<n>` id and a one-line title | the file is append-only and grows |
| **never a bare count** | at any blocking value, including questions this run resolved |

**Where a run raised none, say that.**

**`blocking: no` gets the same treatment.** Nothing is stopping yet, and those are the cheapest decisions to overturn.

---

## What lives in `.hora/`

```
.hora/
  spec/<version>/_stages.md      the spec stages, what the conversation decided that
                                 spec.md does not show, and the proposals declined
  spec/<version>/_assets.md      what stage 0 found, and the commit it read it at
  spec/<version>/_divergence.md  where the documents and the code disagree, one row
                                 each, carrying where it was routed
  tree/<repository>.md           what /hora-setup read in the real tree: its commands,
                                 its layout, its conventions, and the tag it read at
  digests/<skill-name>.md        one equipped skill's conventions in short form
  tasks/<version>/
    _plan.md                     the feature order, and the acceptance tasks
    <feature-id>.md              one feature, and its eighteen checkpoints
  contracts/<version>/           one file per server whose consumer is elsewhere
  questions/<version>/open.md    append-only. Answered by editing specs/
  acceptance/<version>/
    <feature-id>.md              every acceptance run for one feature, appended
    _sweep.md                    the whole-version sweep
  glossary.md                    append-only, not split per version
```

**There is no separate state file.** The checkboxes are the state, and `git log .hora/` is the history.
