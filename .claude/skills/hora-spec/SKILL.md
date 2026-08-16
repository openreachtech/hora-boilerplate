---
name: hora-spec
description: Write one version's spec, in conversation, through stage 0 and seven stages. Reads what already exists first, so nobody dictates a running product from memory; from the second version on it writes a diff. Invoked by /hora when a version has no spec, by /hora-plan when a finding needs design work, or directly.
---

# hora-spec

**The author.** Turn what somebody wants into `specs/<version>/spec.md`, in conversation, in the format the rest of hora reads.

Read `../hora/references/structure.md` first. **`../hora/references/asking.md` fixes how anything is put to a person.** `references/stages.md` is the authority on the stages, `references/investigation.md` on stage 0, and `references/principles.md` on the thinking they apply.

**Stage 0 this skill runs itself. Seven skills do the rest, in order:**

| Stage | Skill | Fixes |
|---|---|---|
| **0** | **— (this skill)** | **what already exists** — the repositories, the documents, and what they show |
| 1 | `/hora-spec-usecases` | who uses this, and what each of them completes end to end |
| 2 | `/hora-spec-horizon` | what this release builds, what is deferred, what is never built |
| 3 | `/hora-spec-nonfunctional` | how many users, how heavy, how available, how long kept |
| 4 | `/hora-spec-provider` | the repositories and servers, the data model, the operations, the jobs |
| 5 | `/hora-spec-consumer` | the surface each use case passes through, and what it calls |
| 6 | `/hora-spec-security` | who may call each operation, and what happens when someone else does |
| 7 | `/hora-spec-review` | whether the whole document holds together |

---

## Why this skill exists

**A blank spec plus a format document is a writing assignment.** The format is exacting, so a person handed it writes the parts they find easy and leaves `/hora-plan` to ask about the rest, one question at a time.

**And nobody should be asked to dictate a product that already runs.** Twenty existing features described from memory come out as the ones somebody remembers, and silence reads exactly like "there is nothing there". **The system is the better witness for what it does**, so stage 0 reads it and puts the reading back as something to correct. **What no system can witness is what anybody wanted.**

---

## The line this skill must not cross

| What it is | What happens to it |
|---|---|
| a requirement or decision **stated in the conversation** | **write it into `specs/`.** This is the skill's job |
| something **read off a repository or a document** | **put it up as a check.** Written once confirmed or corrected |
| something **asked for in `request/`** | **draft it and put it up as a proposal.** Written once they approve the words |
| an improvement **this skill thought of** | **propose it, marked as a proposal** |
| a requirement **nobody stated and nobody approved** | **never written** |

**A check and a proposal must never sound alike.** A check asks whether the skill read the system correctly; a proposal asks whether to do something the system does not do. Stated in one voice, a proposal becomes an existing fact.

**Invariant 2 was never "a human must type it".** It is that **no requirement enters `specs/` without a human having read the exact words.**

**Proposing is required, not merely allowed.** The gaps in a request are invisible from inside it. What is forbidden is the proposal that goes in silently.

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

**Step 3 stays in prose, never in the question tool.** An option labelled "approve" is exactly what lets somebody not read the words. The individual checks and proposals inside the conversation default to the tool.

| Granularity | Why not |
|---|---|
| per line | twenty approvals for one section is a burden nobody carries twice |
| **per section** | **what this skill uses.** The smallest unit that means anything on its own |
| per document | a whole spec approved with one "yes" is a spec nobody read, and the record says otherwise |

**A section the person redirects is redrafted and shown again.** Never write "most of it" and note the disagreement.

**A one-line hole found while planning is settled at `/hora-plan`. A finding that needs design work comes back here**, to the stage that owns it (`references/stages.md`).

---

## Where it writes, and what it must not touch

| | |
|---|---|
| `specs/<version>/spec.md` and its feature files | **written here**, one approved section at a time |
| `specs/skeleton/spec.md` | **copied from, never written to** — and only for the first version |
| `specs/<version>/request/` | **read, never written to and never tidied up** |
| `specs/<older version>/` | **never.** Past versions are frozen |
| `.hora/spec/<version>/` | this skill's own records |
| `.hora/questions/<version>/open.md` | appended to |
| `.hora/tasks/`, `.hora/contracts/`, `.hora/glossary.md` | **never.** They are `/hora-plan`'s |
| code, tests, any implementation repository | **read, never written** |
| git | **never.** `/hora` owns every git operation |

### Fixing the version, and starting the file

```
1. The version is the one given on the command line, or the lowest directory
   under specs/ whose name is a semver version and whose spec.md is missing or
   empty. If every one has content, the version /hora-plan would target

2. If specs/<version>/ does not exist, create it, with sources/, annex/ and
   request/ inside it, each holding a .gitkeep

3. If spec.md is missing or empty and this is the FIRST version:
       cp specs/skeleton/spec.md specs/<version>/spec.md
   Then say it was copied, and that nothing in it is filled in yet

4. From the second version on, DO NOT copy the skeleton. Start spec.md with
   its H1 and document information alone, and let each stage add the sections
   this version turns out to touch

5. Run stage 0 before entering stage 1, always
```

**Step 3 is a copy, not a draft.** Every value in it arrives through a stage's conversation.

**Step 4 is why it is not copied twice.** The skeleton's empty headings each mean "the body carries over", so copying it into a later version writes twenty sections that say nothing while looking written.

**A version whose `spec.md` already has content is edited, never restarted.** Work out which stages it already satisfies, record that, and enter the first one that is not. **A spec somebody wrote by hand is a spec at stage 7, not stage 1** — and stage 0 still runs, because a hand-written spec says nothing about which documents exist.

---

## The second version onward

**A released product's next version is one or two features on top of twenty that work, and the seven stages must not make somebody re-agree to the twenty.** Run head-on, stage 3 asks for user counts settled a release ago — and a person answering those for the third time answers without reading.

**Nothing about the format changes. What changes is how much of it this version writes.**

**A stage whose section nothing in this version touches passes by carrying over, with the reason written.** It is not skipped, and it is not `n/a`.

```markdown
3. [x] Non-functional requirements  <!-- carried: 1.0.0's numbers, confirmed unchanged -->
```

**Carrying over is a check, never an assumption.** The stage states what the previous version fixed, in the words it fixed it in, and asks whether what this version adds changes it.

**Stages 6 and 7 never carry over for anything this version adds, and they are what make a diff version safe to run quickly.** Everything above them may be brief because those two are not.

---

## A page of notes is enough to start from

**Drop what is wanted into `specs/<version>/request/` and run `/hora-spec`.** Any file, any name, in anybody's own words. Stage 0 reads it first and treats it as this version's agenda.

**A request is not a source, and the difference is the point.** Nothing in it is spec text. What it says clearly is drafted into the section that owns it and goes back as a **proposal**; what it implies goes back as a question.

**Requests are the one thing this skill reads that nobody has to be held to.** Somebody writing one may contradict themselves. **That is expected, and each contradiction is a question rather than a defect in the file.**

---

## The record of where it got to

`.hora/spec/<version>/_stages.md`. **There is no separate state file** — the checkboxes are the state.

```markdown
# Spec — 1.0.0

## Stages

0. [x] Assets and sources
1. [x] Use cases and actors
...
4. [ ] Data, operations and execution   ← in progress: the data model is drafted,
                                          the operation list is not

## Decided in conversation, and not visible in spec.md

| What | Decided | Why the alternative was rejected |
|---|---|---|
| roles or separate endpoints | one endpoint, switched on role | roles will be added per client; a second endpoint per role would double the auth filter each time |

## Proposals not taken

| Proposed | Answer | Recorded as |
|---|---|---|
| splitting approval into its own release | keep it in 1.0.0 | Q4, `scope`, blocking: no |
```

**"Decided in conversation" is the part worth the file.** A spec states what the product is; it does not state what it was nearly instead, and that is exactly what somebody later needs in order not to undo it.

**"Proposals not taken" stops a run proposing the same thing every time.** Re-raising a declined proposal every session is how a person learns to say yes without reading.

---

## Questions

Appended to `.hora/questions/<version>/open.md`. Three categories belong to this skill; `../hora-plan/SKILL.md` holds the full table.

| category | Raised when | blocking |
|---|---|---|
| `missing-authorization` | an operation, a surface or a whole spec does not say who may reach it | **yes** |
| `unmet-usecase` | a stated use case cannot be completed under the design as drafted | **yes** |
| `spec-proposal` | an improvement was proposed and declined or deferred | no |

**A `blocking: yes` question does not stop this skill from finishing the other stages.** It stops `/hora-build`. Carry on to the end of stage 7 with the hole recorded.

---

## When this skill finishes

```
the version written, and whether it was created or continued — and, from the
  second version on, that it is a diff, and against which version
what stage 0 found, and anything it recorded as read but not settled
which stages passed, which are open, and which carried over, with what each
  carry-over was confirmed against
what the release ended up containing, one line per feature
how many checks were confirmed, and how many came back corrected
how many proposals were made, taken, and declined
every question raised — id, category, blocking value, one line, and a link
what /hora will start on next
```

**Report checks and proposals separately, never as one number.** "Eighteen items agreed" hides the corrections, which are the most interesting part — each is a place the system and somebody's understanding of it had drifted apart.

**Name every stage that carried over, never a count.** A carry-over is the one kind of pass that looks identical to not having run.

**Never report a spec as finished while stage 7 has not passed.** A document every earlier stage wrote and nothing reviewed agrees with its own conversations and with nothing else.

---

## What this skill never does

- **decide scope.** It says when a release carries too much, proposes the narrowing, and records the answer. The decision is the requester's
- **plan.** No task list, no feature order, no contract, no glossary
- **create or configure a repository.** Declaring the layout is stage 4's; creating it is `/hora-setup`'s
- **let anything it read become a requirement without somebody confirming the words**
- **conclude how far a feature was already built**
- **touch git**

---

## References

| File | Content |
|---|---|
| `references/stages.md` | **the authority on the stages** — each one's exit condition, delegates, and what sends a run back into it |
| `references/investigation.md` | **the authority on stage 0** — what may be read, and what reading never settles |
| `references/principles.md` | the thinking every stage applies |
| `../hora/references/asking.md` | **a check, a proposal or a question** |
| `../hora/references/structure.md` | the layout, the invariants, the language rule |
| `../hora/references/spec-format.md` | **the authority on the format** |
| `../hora-plan/SKILL.md` | what happens next, and the question categories |
