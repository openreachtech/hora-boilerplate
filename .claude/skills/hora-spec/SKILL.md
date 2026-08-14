---
name: hora-spec
description: Write one version's spec, in conversation, through stage 0 and seven stages. Reads what already exists first, so nobody dictates a running product from memory; from the second version on it writes a diff. Invoked by /hora when a version has no spec, by /hora-plan when a finding needs design work, or directly.
---

# hora-spec

**The author.** Turn what somebody wants into `specs/<version>/spec.md`, in conversation, and write it in the format the rest of Hora Kit reads.

Read `../hora/references/structure.md` first. **`../hora/references/asking.md` fixes how anything is put to a person** — a check, a proposal or a question. **`references/principles.md` holds the thinking this skill applies**, **`references/investigation.md` what stage 0 reads**, and **`references/stages.md` is the authority on stage 0 and the seven stages.**

`/hora-spec` does no design of its own. **Stage 0 it runs itself; seven skills do the rest, in order:**

| Stage | Skill | Fixes |
|---|---|---|
| **0** | **— (this skill)** | **what already exists** — the repositories, the documents, and what they show |
| 1 | **`/hora-spec-usecases`** | who uses this, and what each of them completes end to end |
| 2 | **`/hora-spec-horizon`** | what this release builds, what is foreseen for later, what is never built |
| 3 | **`/hora-spec-nonfunctional`** | how many users, how heavy, how available, how long kept |
| 4 | **`/hora-spec-backend`** | the repositories and servers, the data model, the operations, what runs as a job |
| 5 | **`/hora-spec-frontend`** | the screens each use case passes through, and what each screen calls |
| 6 | **`/hora-spec-security`** | who may call each operation, and what happens when someone else does |
| 7 | **`/hora-spec-review`** | whether the whole document holds together, and every use case is satisfiable |

---

## Why this skill exists

**A blank spec plus a format document is a writing assignment.** The format is exacting — use cases and acceptance criteria per feature, the kind of every operation, two different kinds of out-of-scope, an `id` that may never change — so a person handed it writes the parts they find easy and leaves `/hora-plan` to ask about the rest, one question at a time.

**And nobody should be asked to dictate a product that already runs.** Twenty existing features described from memory come out as the ones somebody remembers, and silence reads exactly like "there is nothing there". **The system is the better witness for what it does**, so stage 0 reads it and puts the reading back as something to correct. What no system can witness is what anybody *wanted* (`references/investigation.md`).

---

## The line this skill must not cross

| What it is | What happens to it |
|---|---|
| a requirement, a constraint or a decision **stated in the conversation** | **write it into `specs/`.** This is the skill's entire job |
| something **read off a repository or a document** | **put it up as a check** — "I read it as this; is that right?" Written once it is confirmed or corrected |
| something **asked for in `request/`** | **draft it into the section that owns it and put it up as a proposal.** Written once they approve the words |
| an improvement, an alternative or a gap **this skill thought of** | **propose it, marked as a proposal.** It becomes spec text only once the person says yes |
| a requirement **nobody stated and nobody approved** | **never written** (`../hora/references/structure.md`, invariant 2) |

**The check and the two kinds of proposal are different acts and must never sound alike.** A check asks whether the skill read the system correctly; a proposal asks whether to do something the system does not do. Stated in the same voice, a proposal becomes an existing fact. **`../hora/references/asking.md` is the authority.**

**Invariant 2 was never "a human must type it".** It is that **no requirement enters `specs/` without a human having read the exact words.** A skill that drafts a section, shows it in full, and writes it only after the person says yes protects exactly what the invariant protects.

**Proposing is required, not merely allowed.** The gaps in a request are invisible from inside it. What is forbidden is the proposal that goes in silently.

**Say which is which, every time.** Where a stage assumed something in order to keep moving, the assumption is stated in the same breath and recorded (`spec-assumption`).

### Approval is per section, at the end of the stage that wrote it

```
1. the stage reads whatever evidence its section has, and runs its conversation
2. it drafts the section
3. it shows the section, in full, as it will be written
4. it says, line by line, which came from the conversation, which were read and
   confirmed, and which are its own proposals
5. it waits
6. it writes what was approved, and only that
```

**Step 3 stays in prose, never in the question tool.** An option labelled "approve" is precisely what lets somebody not read the words (`../hora/references/asking.md`). The individual checks and proposals inside the conversation default to the tool, with the likely answer offered first.

| Granularity | Why not |
|---|---|
| per line | twenty approvals for one section is a burden nobody carries twice |
| **per section** | **what this skill uses.** A section is the smallest unit that means anything on its own |
| per document | a whole spec approved with one "yes" is a spec nobody read, and the record says otherwise |

**A section the person redirects is redrafted and shown again.** Never write "most of it" and note the disagreement.

**`/hora-plan`'s per-edit rule is unchanged, and the two do not compete.** A one-line hole found while planning is settled there. **A finding that needs design work comes back here**, to the stage that owns it (`references/stages.md`, "What sends a run back into a stage").

---

## The order of the stages is a rule

**Each stage's answers are the next stage's input.** The alternative costs the work twice.

```
use cases ──> horizon ──> non-functional ──> data / API / jobs ──> screens ──> security ──> review
```

- A data model designed before the use cases are fixed is designed twice, and the second time there is already a migration written against the first
- A table designed before the user counts are known is designed for the wrong number, and nothing in it says so
- A screen designed before the operations exist invents operations, which then exist only in the screen

**Going back is normal, and it is not a failure.** A stage that turns up something an earlier one got wrong says so, names the stage, and the run returns there. Stage 7 exists to do exactly this. `references/stages.md` holds which stage each kind of shortfall returns to.

**No stage may write another stage's section.** Stage 4 does not write use cases; stage 1 does not choose a column type. **The two exceptions are both stage 6's**: a refusal is a behavior, so it belongs in the owning section's `<!-- acceptance -->` block; and the security rows of `Non-functional requirements`, which land in stage 3's table because a reader looks for every non-functional line in one place (`references/stages.md`).

---

## Where it writes, and what it must not touch

| | |
|---|---|
| `specs/<version>/spec.md`, and the version's feature files | **written by this skill**, one approved section at a time |
| `specs/skeleton/spec.md` | **copied from, never written to.** This skill does the copying, **and only for the first version** |
| `specs/<version>/request/` | **read, never written to and never tidied up.** It stays as they wrote it |
| `specs/<older version>/` | **never.** Past versions are frozen |
| `.hora/spec/<version>/_stages.md` | this skill's own record of where it got to |
| `.hora/spec/<version>/_assets.md` | what stage 0 read, where from, and at what commit (`references/investigation.md`) |
| `.hora/spec/<version>/_divergence.md` | where the documents and the code disagree. **Stage 0 writes the rows, unrouted; the stage that owns a row's subject writes its `Routed to`** (`references/investigation.md`) |
| `.hora/questions/<version>/open.md` | appended to, like any other skill |
| `.hora/tasks/`, `.hora/contracts/`, `.hora/glossary.md` | **never.** They are `/hora-plan`'s |
| code, tests, any implementation repository | **read, never written.** Nothing read becomes a requirement on its own |
| git, in any repository | **never.** `/hora` owns every git operation |

### Fixing the version, and starting the file

```
1. The version is the one given on the command line, or:
   the lowest directory under specs/ whose name is a semver version and whose
   spec.md is missing or empty. If every one of those has content, the version
   /hora-plan would target (../hora-plan/SKILL.md, "Fix the version")

2. If specs/<version>/ does not exist, create it, with sources/, annex/ and
   request/ inside it — each holding a .gitkeep, so that an empty one survives
   being committed (../hora/references/spec-format.md, "a drop-off convention")

3. If spec.md is missing or empty, and this is the FIRST version:
       cp specs/skeleton/spec.md specs/<version>/spec.md
   Then say that it was copied, and that nothing in it is filled in yet

4. From the second version on, DO NOT copy the skeleton. What gets written is a
   DIFF against the version before it — only the sections this version changes.
   Start spec.md with its H1 and Document information alone, and let each stage
   add the sections it turns out this version touches
   (../hora/references/spec-format.md, "The blank spec is not copied into a
   diff version")

5. Run stage 0 before entering stage 1, always (references/investigation.md).
   On a project with nothing to read it is over in a sentence
```

**Step 3 is a copy, not a draft.** The skeleton lands as it ships: headings and table headers. Every value in it arrives through a stage's conversation.

**Step 4 is why it is not copied twice.** The skeleton's empty headings mean "the body carries over" under the diff rule, so copying it into a later version writes twenty sections that say nothing while looking like they were written.

**A version whose `spec.md` already has content is edited, never restarted.** Read what is there, work out which stages it already satisfies, record that in `_stages.md`, and enter the first stage that is not satisfied. A spec somebody wrote by hand is a spec at stage 7, not stage 1.

**Stage 0 still runs, even then.** A hand-written spec says nothing about which documents exist or what the repositories hold.

**Never write into a past version's directory.** A fix that belongs to a released version goes into the version being written now, as a full replacement of that section.

---

## The second version onward

**A released product's next version is one or two features on top of twenty that already work, and the seven stages must not make somebody re-agree to the twenty.** Run head-on, stage 3 asks for user counts settled a release ago and stage 6 asks who may call operations nobody has touched — and a person answering those for the third time answers without reading.

**Nothing about the format changes. What changes is how much of it this version writes** (`../hora/references/spec-format.md`, "From the second version on, write a diff").

### A stage passes by carry-over, and says so

**A stage whose section nothing in this version touches is passed, with the reason written** — it is not skipped, and it is not `n/a`.

```markdown
3. [x] Non-functional requirements  <!-- carried: 1.0.0's numbers, confirmed unchanged -->
```

**Carrying over is a check, never an assumption.** The stage states what the previous version fixed, in the words it fixed it in, and asks whether what this version adds changes it.

```
hora  Stage 3. 1.0.0 fixed these, and nothing in the CSV export request
      touches them on the face of it:

        200 staff now, 5,000 within two years
        the heaviest single operation: the monthly close
        records kept for 7 years

      An export that reads a whole year for every member of staff would be
      heavier than the monthly close. Is it in scope to be, or is it a month
      at a time like the close?
```

**That is the shape of every stage on a diff version:** what already holds, what this version adds, and the one question the addition actually raises.

**Which stages may carry over is stated per stage in `references/stages.md`**, as a `Carried over when` line. It is not restated here.

**Stages 6 and 7 never carry over for anything this version adds, and they are what make a diff version safe to run quickly.** Everything above them is allowed to be brief because those two are not: every new operation states its caller at the version that introduced it, and the whole-document review reads the **resolved** document, where a new operation contradicting a rule 1.0.0 wrote is obvious.

---

## A page of notes is enough to start from

**Drop what is wanted into `specs/<version>/request/` and run `/hora-spec`.** Any file, any name, in anybody's own words. Stage 0 reads it first and treats it as **this version's agenda** (`references/investigation.md`).

**A request is not a source, and the difference is the point.** Nothing in it is spec text. What it says clearly is drafted into the section that owns it and goes back as a **proposal**; what it implies goes back as a question. `/hora-plan` never reads `request/` at all, so a wish list cannot become a task by sitting in a folder.

**Requests are the one thing this skill reads that nobody has to be held to.** Somebody writing one may contradict themselves or describe a screen without saying who opens it. **That is expected, and each one is a question this skill asks rather than a defect in the file.**

**Saying it in conversation works identically.** The directory exists because a request is regularly longer than a message, written by somebody who is not in the session, and worth keeping next to the version that answered it.

---

## The record of where it got to

`.hora/spec/<version>/_stages.md`. **There is no separate state file** — the checkboxes are the state, and `git log .hora/` is the history.

```markdown
# Spec — 1.0.0

## Stages

0. [x] Assets and sources
1. [x] Use cases and actors
2. [x] The horizon
3. [x] Non-functional requirements
4. [ ] Data, API and execution        ← in progress: the data model is drafted,
                                       the operation list is not
5. [ ] Screens and interaction
6. [ ] Security
7. [ ] Whole-document review

## Decided in conversation, and not visible in spec.md

| What | Decided | Why the alternative was rejected |
|---|---|---|
| roles or separate endpoints | one employee endpoint, role-switched | roles will be added per client; a second endpoint per role would double the auth filter each time |
| attendance totals | recalculated on read for 1.0.0 | a stored total needs an invalidation path nobody has asked for yet. Revisit at 500 staff (#nfr) |

## Proposals not taken

| Proposed | Answer | Recorded as |
|---|---|---|
| splitting approval into its own release | keep it in 1.0.0 | Q4, `scope`, blocking: no |
```

**On a diff version, a stage that carried over is `[x]` with the carry-over written next to it** — `<!-- carried: ... -->`, saying what it was confirmed against.

**"Decided in conversation, and not visible in `spec.md`" is the part worth the file.** A spec states what the product is; it does not state what it was nearly instead, and the reason a design came out this way is exactly what somebody later needs in order not to undo it.

**"Proposals not taken" stops a run from proposing the same thing every time.** Re-raising a declined proposal every session is how a person learns to say yes without reading.

---

## Questions

Appended to `.hora/questions/<version>/open.md`, in the format and the language `../hora/references/structure.md` fixes. Three categories exist for this stage, and `../hora-plan/SKILL.md` holds the full table:

| category | Raised when | blocking |
|---|---|---|
| `missing-authorization` | an operation, a screen or a whole spec does not say who may reach it | **yes** |
| `unmet-usecase` | a stated use case cannot be completed under the design as drafted, and the fix needs somebody who is not here | **yes** |
| `spec-proposal` | an improvement was proposed and declined or deferred | no |

**Everything else uses the categories that already exist** — `scope`, `contradiction`, `undefined-detail`, `spec-assumption`.

**A `blocking: yes` question does not stop this skill from finishing the other stages.** It stops `/hora-build`. Carry on to the end of stage 7 with the hole recorded.

---

## When this skill finishes

```
the version written, and whether it was created or continued
  — and, from the second version on, that it is a diff, and against which version
what stage 0 found — repositories read, documents declared as Sources or Annex,
  what was in request/ and what became of it, and anything it recorded as read
  but not settled
which stages passed, and which are still open
which stages carried over, and what each carry-over was confirmed against
what the release ended up containing, in one line per feature
how many checks were confirmed, and how many came back corrected
how many proposals were made, taken, and declined
every question raised — its Q<n> id, its category, its blocking value, one
  line of what it is, and a link to the file it is in
  (../hora/references/structure.md, "Citing a question in a report")
what /hora will start on next (normally /hora-setup, then /hora-plan)
```

**Report checks and proposals separately, never as one number.** "Eighteen items agreed" hides the corrections, which are the most interesting part — each one is a place the system and somebody's understanding of it had drifted apart.

**Name every stage that carried over, never a count of them.** A carry-over is the one kind of pass that looks identical to not having run.

**Write it in the language of whoever ran it.**

When a `blocking: yes` is outstanding, **put what the human has to do first**: which decision is missing, who can make it, and a link to the question file.

**Never report questions as a count** (`../hora/references/structure.md`, "Citing a question in a report").

**Never report a spec as finished while stage 7 has not passed.** A document that every earlier stage wrote and nothing reviewed is a document whose sections agree with their own conversations and with nothing else.

---

## What this skill never does

- **decide scope.** It says when a release is carrying too much, proposes the narrowing, and records the answer. The decision is the requester's (`references/principles.md`)
- **plan.** No task list, no feature order, no contract, no glossary
- **clone or configure a repository.** Declaring the layout is stage 4's; creating it is `/hora-setup`'s
- **let anything it read become a requirement without somebody confirming the words** (`references/investigation.md`)
- **conclude how far a feature was already built.** A half-built screen and a finished one look identical from a file listing. `built:` is asked, with the evidence offered as material and no option recommended
- **touch git.** Not a branch, not a commit

---

## References

| File | Content |
|---|---|
| `references/stages.md` | **the authority on stage 0 and the seven stages** — each one's exit condition, what it reads, its delegates, and what sends a run back into it |
| `references/investigation.md` | **the authority on stage 0** — what may be read, what reading never settles, `Sources` and `Annex`, `_assets.md` |
| `../hora/references/asking.md` | **the authority on how anything is put to a person** |
| `references/principles.md` | **the thinking this skill applies**, and the boundary against the package's own design skills |
| `../hora/references/structure.md` | the layout, the invariants, the language rule |
| `../hora/references/spec-format.md` | **the authority on the format** of what this skill writes |
| `specs/skeleton/spec.md` | the blank spec this skill copies |
| `../hora-plan/SKILL.md` | what happens to the spec next, and the question categories |
| `../hora-spec-usecases/SKILL.md` … `../hora-spec-review/SKILL.md` | the seven stages themselves |
