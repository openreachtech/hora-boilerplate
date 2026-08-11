---
name: hora-spec
description: Write one version's spec from a conversation with whoever wants the product — reading whatever already exists first, then use cases, the horizon, the non-functional requirements, the data / API / execution design, the screens, security, and a whole-document review. On a project that already runs, it reads the repositories and documents and puts them back as something to confirm, so nobody dictates a product from memory. Writes `specs/<version>/spec.md` itself, one approved section at a time, and runs the seven stage skills that do the work. Runs at the root of the hora repository (myproject-app). Invoked by /hora when a version has no spec, by /hora-plan when a finding needs design work, or directly as /hora-spec.
---

# hora-spec

**The author.** Turn what somebody wants into `specs/<version>/spec.md`, in conversation, and write it in the format the rest of Hora Kit reads.

Read `../hora/references/structure.md` first — the layout, the invariants and the language rule all come from there. **`../hora/references/asking.md` fixes how anything is put to a person** — a check, a proposal or a question, and the question tool each defaults to. **`references/principles.md` holds the thinking this skill applies**, **`references/investigation.md` what stage 0 reads and what reading can never settle**, and **`references/stages.md` is the authority on stage 0 and the seven stages**, each one's exit condition, and which sub-skill runs it.

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

**Leaving `specs/` as human-only territory would make the first step of every project the one step nobody would do twice.** A blank spec plus a format document is a writing assignment, and the format is exacting: use cases and acceptance criteria per feature, the kind of every operation, two different kinds of out-of-scope, an `id` that may never change. Handed that, a person writes the parts they find easy and leaves `/hora-plan` to ask about the rest, one question at a time, for as long as it takes.

**Nobody should be asked to hand-edit twenty holes.** That is the whole reason this skill writes.

**And nobody should be asked to dictate a product that already runs.** A person describing twenty existing features from memory, in an exacting format, describes the ones they remember — the rest is silence, and silence reads exactly like "there is nothing there". **The system is the better witness for what it does**, so stage 0 reads it and puts the reading back as something to correct. What no system can witness is what anybody *wanted*, and that is what the seven stages are still for (`references/investigation.md`).

---

## The line this skill must not cross

| What it is | What happens to it |
|---|---|
| a requirement, a constraint or a decision **stated in the conversation** | **write it into `specs/`.** This is the skill's entire job |
| something **read off a repository or a document** | **put it up as a check** — "I read it as this; is that right?" Written once it is confirmed or corrected |
| an improvement, an alternative or a gap **this skill thought of** | **propose it, marked as a proposal.** It becomes spec text only once the person says yes |
| a requirement **nobody stated and nobody approved** | **never written.** That is inventing what the spec does not say (`../hora/references/structure.md`, invariant 2) |

**Rows two and three are different acts and must never sound alike.** A check asks whether the skill read the system correctly; a proposal asks whether to do something the system does not do. Stated in the same voice, a proposal becomes an existing fact in the record, and nothing afterwards can tell it apart from something that was actually there. **`../hora/references/asking.md` is the authority on this, and it is read by `/hora-plan` too.**

**Invariant 2 was never "a human must type it".** It is that **no requirement enters `specs/` without a human having read the exact words.** Typing was never the protection; reading is. A skill that drafts a section, shows it in full, and writes it only after the person says yes protects exactly what the invariant protects — and a person who was made to type it themselves read it no more carefully.

**Proposing is required, not merely allowed.** Whoever asks for a product describes the product they already have in mind, and the gaps in it are invisible from the inside. Breaking a request down, offering a better shape for a flow, and naming the case nobody thought of is the value of this stage. What is forbidden is the proposal that goes in silently.

**Say which is which, every time.** A proposal is labelled a proposal. Where a stage assumed something in order to keep moving, the assumption is stated in the same breath, and recorded (`spec-assumption`).

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

**Step 3 stays in prose, never in the question tool.** What approval protects is that somebody read the exact words, and an option labelled "approve" is precisely what lets them not read them (`../hora/references/asking.md`). The individual checks and proposals inside the conversation are a different matter — those default to the tool, with the likely answer offered first.

| Granularity | Why not |
|---|---|
| per line | twenty approvals for one section is a burden nobody carries twice, and a spec that never gets written is the result |
| **per section** | **what this skill uses.** A section is the smallest unit that means anything on its own |
| per document | a whole spec approved with one "yes" is a spec nobody read. That is worse than no approval, because the record says otherwise |

**A section the person redirects is redrafted and shown again.** Never write "most of it" and note the disagreement.

**`/hora-plan`'s per-edit rule is unchanged, and the two do not compete.** A one-line hole found while planning — a missing annotation, a `target` that names no repository, a typo — is settled there, one edit at a time. **A finding that needs design work comes back here**, to the stage that owns it (`../hora-plan/SKILL.md`, and `references/stages.md`, "What sends a run back into a stage").

---

## The order of the stages is a rule

**Each stage's answers are the next stage's input.** Not a suggestion, not a default ordering — the reason is that the alternative costs the work twice.

```
use cases ──> horizon ──> non-functional ──> data / API / jobs ──> screens ──> security ──> review
```

- A data model designed before the use cases are fixed is designed twice, and the second time there is already a migration written against the first
- A table designed before the user counts are known is designed for the wrong number, and nothing in it says so
- A screen designed before the operations exist invents operations, which then exist only in the screen

**Going back is normal, and it is not a failure.** A stage that turns up something an earlier one got wrong says so, names the stage, and the run returns there. Stage 7 exists to do exactly this. `references/stages.md` holds which stage each kind of shortfall returns to.

**No stage may write another stage's section.** Stage 4 does not write use cases; stage 1 does not choose a column type. A stage that reaches into the next one's section has decided something before the conversation that was supposed to decide it.

---

## Where it writes, and what it must not touch

| | |
|---|---|
| `specs/<version>/spec.md`, and the version's feature files | **written by this skill**, one approved section at a time |
| `specs/skeleton/spec.md` | **copied from, never written to.** This skill does the copying |
| `specs/<older version>/` | **never.** Past versions are frozen (`../hora/references/spec-format.md`) |
| `.hora/spec/<version>/_stages.md` | this skill's own record of where it got to |
| `.hora/spec/<version>/_assets.md` | what stage 0 read, where from, and at what commit (`references/investigation.md`) |
| `.hora/questions/<version>/open.md` | appended to, like any other skill |
| `.hora/tasks/`, `.hora/contracts/`, `.hora/glossary.md` | **never.** They are `/hora-plan`'s |
| code, tests, any implementation repository | **read, never written.** Reading is how stage 0 and stages 4 to 6 get something to put up for confirmation; nothing read is ever written back, and nothing read becomes a requirement on its own |
| git, in any repository | **never.** `/hora` owns every git operation |

### Fixing the version, and starting the file

```
1. The version is the one given on the command line, or:
   the lowest directory under specs/ whose name is a semver version and whose
   spec.md is missing or empty. If every one of those has content, the version
   /hora-plan would target (../hora-plan/SKILL.md, "Fix the version")

2. If specs/<version>/ does not exist, create it

3. If spec.md is missing or empty:
       cp specs/skeleton/spec.md specs/<version>/spec.md
   Then say that it was copied, and that nothing in it is filled in yet

4. From the second version on, what gets written is a DIFF against the version
   before it — only the sections this version changes
   (../hora/references/spec-format.md, "From the second version on, write a diff")

5. Run stage 0 before entering stage 1, always
   (references/investigation.md). On a project with nothing to read it is over
   in a sentence; on one that already runs it is what stops the seven stages
   from being a dictation exercise
```

**Step 3 is a copy, not a draft.** The skeleton lands as it ships: headings and table headers, nothing filled in. Every value in it arrives through a stage's conversation.

**A version whose `spec.md` already has content is edited, never restarted.** Read what is there, work out which stages it already satisfies, record that in `_stages.md`, and enter the first stage that is not satisfied. A spec somebody wrote by hand is a spec at stage 7, not stage 1.

**Stage 0 still runs, even then.** A hand-written spec says nothing about which documents exist or what the repositories hold, and `Sources` / `Annex` are exactly what a person writing by hand leaves empty.

**Never write into a past version's directory.** A fix that belongs to a released version goes into the version being written now, as a full replacement of that section.

---

## The record of where it got to

`.hora/spec/<version>/_stages.md`. **There is no separate state file** — the checkboxes are the state, and `git log .hora/` is the history (`../hora/references/structure.md`).

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

**"Decided in conversation, and not visible in `spec.md`" is the part worth the file.** A spec states what the product is; it does not state what it was nearly instead, and the reason a design came out this way is exactly what somebody later needs in order not to undo it. This is the same reasoning `/hora-plan`'s glossary applies to names it avoided.

**"Proposals not taken" stops a run from proposing the same thing every time.** A proposal that was declined is closed until something changes; re-raising it every session is how a person learns to say yes without reading.

---

## Questions

Appended to `.hora/questions/<version>/open.md`, in the format and the language `../hora/references/structure.md` fixes. Three categories exist for this stage, and `../hora-plan/SKILL.md` holds the full table:

| category | Raised when | blocking |
|---|---|---|
| `missing-authorization` | an operation, a screen or a whole spec does not say who may reach it | **yes** |
| `unmet-usecase` | a stated use case cannot be completed under the design as drafted, and the fix needs somebody who is not here | **yes** |
| `spec-proposal` | an improvement was proposed and declined or deferred | no |

**Everything else uses the categories that already exist** — `scope` for a release nobody will narrow, `contradiction` for two requirements that cannot both hold, `undefined-detail` for a shape nobody has decided, `spec-assumption` for a reading this skill assumed and wrote against.

**A `blocking: yes` question does not stop this skill from finishing the other stages.** It stops `/hora-build`. Carry on to the end of stage 7 with the hole recorded, so that one unanswerable question does not cost the whole document.

---

## When this skill finishes

```
the version written, and whether it was created or continued
what stage 0 found — repositories read, documents declared as Sources or Annex,
  and anything it recorded as read but not settled
which stages passed, and which are still open
what the release ended up containing, in one line per feature
how many checks were confirmed, and how many came back corrected
how many proposals were made, taken, and declined
every question raised — its Q<n> id, its category, its blocking value, one
  line of what it is, and a link to the file it is in
  (../hora/references/structure.md, "Citing a question in a report")
what /hora will start on next (normally /hora-setup, then /hora-plan)
```

**Report checks and proposals separately, never as one number.** "Twelve things confirmed, three corrected, two proposals taken, one declined" says what actually happened; "eighteen items agreed" says nothing, and hides the corrections — which are the most interesting part, because each one is a place the system and somebody's understanding of it had drifted apart.

**Write it in the language of whoever ran it** — it is conversation, and it does not stay in a file.

When a `blocking: yes` is outstanding, **put what the human has to do first**: which decision is missing, who can make it, and a link to `.hora/questions/<version>/open.md`.

**Never report questions as a count.** A stage can raise several in one pass, and "four questions raised" leaves whoever reads it to find out which four, in a file that only grows. Name each one and link it (`../hora/references/structure.md`, "Citing a question in a report").

**Never report a spec as finished while stage 7 has not passed.** A document that every earlier stage wrote and nothing reviewed is a document whose sections agree with their own conversations and with nothing else.

---

## What this skill never does

- **decide scope.** It says when a release is carrying too much, proposes the narrowing, and records the answer. The decision is the requester's (`references/principles.md`)
- **plan.** No task list, no feature order, no contract, no glossary. `/hora-plan` reads the spec this produces
- **clone or configure a repository.** Declaring the layout is stage 4's; creating it is `/hora-setup`'s
- **let anything it read become a requirement without somebody confirming the words.** Reading a repository, a document or a diagram is what stage 0 and half the later stages are for — what is forbidden is the step after it, where evidence turns into spec text nobody agreed to. A reading goes out as a check, and only what comes back confirmed is written (`references/investigation.md`)
- **conclude how far a feature was already built.** A half-built screen and a finished one look identical from a file listing. `built:` is asked, with the evidence offered as material and no option recommended
- **touch git.** Not a branch, not a commit

---

## References

| File | Content |
|---|---|
| `references/stages.md` | **the authority on stage 0 and the seven stages** — each one's exit condition, what it reads, its delegates, and what sends a run back into it |
| `references/investigation.md` | **the authority on stage 0** — what may be read, what reading never settles, `Sources` and `Annex`, `_assets.md` |
| `../hora/references/asking.md` | **the authority on how anything is put to a person** — a check, a proposal or a question, and the question tool |
| `references/principles.md` | **the thinking this skill applies**, and the boundary against the package's own design skills |
| `../hora/references/structure.md` | the layout, the invariants, the language rule, what lives in `.hora/` |
| `../hora/references/spec-format.md` | **the authority on the format** of what this skill writes |
| `specs/skeleton/spec.md` | the blank spec this skill copies |
| `../hora-plan/SKILL.md` | what happens to the spec next, and the question categories |
| `../hora-spec-usecases/SKILL.md` … `../hora-spec-review/SKILL.md` | the seven stages themselves |
