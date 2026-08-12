# How to ask a person something

**Every skill that talks to a person stands on this file** — `/hora-spec` and its stage skills, and `/hora-plan`. It is written once here and read by all of them; a copy in a skill is what goes stale.

**There are three ways to put something to a person, and they are not interchangeable.** Mixing them is not a matter of tone: each one asks the person to do a different job, and answering the wrong job is how a spec ends up recording something nobody decided.

---

## The three, and what each asks of the person

| | **A check** | **A proposal** | **A question** |
|---|---|---|---|
| What the skill is doing | stating its own understanding | offering a course of action | naming something undecided |
| What the person judges | **is this right, or wrong** | **do we take this, or not** | **what is it** |
| Where the content came from | evidence the skill read | the skill's own thinking, **or something somebody asked for that nobody has worked out yet** | nowhere yet |
| If the person says yes | it goes in **as fact** | it goes in **as an approved decision** | — |
| If the person says no | the correction goes in | it is dropped, and recorded | — |

```
a check      "I read it as this. Is that right?"
a proposal   "I suggest this. It is yours to decide."
a question   "This is not decided anywhere. What is it?"
```

**Open with the form.** Not with the content — with which of the three this is. A person who has to work out from the wording whether they are being asked to verify or to decide will sometimes get it wrong, and nothing downstream can tell that they did.

**What somebody asked for is a proposal, never a check.** A request — said in the conversation, or dropped into `specs/<version>/request/` — states what they want; the section drafted from it states what the product would then do, which is a step nobody has taken yet. Put back as a check ("you want a CSV export, so the admin may call this operation"), it turns one sentence of wishing into a permission nobody decided. **Say whose idea it was in the same breath**: *"you asked for this; here is what it would mean"* and *"nobody asked for this; I am suggesting it"* are both proposals, and the record distinguishes them.

---

## Why the mixing is dangerous in one direction more than the other

**A check dressed as a proposal** costs a false approval. The person answers "sounds good" to something that was a matter of fact, and the record says they chose it when they were only agreeing that it was accurate. Recoverable — the fact is still a fact.

**A proposal dressed as a check** is the serious one. The person answers "yes, that's right" to something the skill invented, and it enters `specs/` **as an existing fact rather than as an approved decision.** Nothing later distinguishes it from something that was read off the real system.

```
"This screen shows an error state."        a check    — it is there, in the code
"This screen shows an error state."        a proposal — it is not there. You are
                                                        suggesting it should be
```

**Those two sentences are identical, and they must never both be allowed.** The second one is only ever written as *"I suggest adding an error state to this screen."*

**This is the failure mode that dominates when a spec is written against something that already exists.** Reading a repository produces both kinds in the same breath — what is there, and what is obviously missing — and stating them in the same voice is exactly how the second becomes indistinguishable from the first.

---

## What each one is recorded as

| | Recorded where |
|---|---|
| a check the person confirmed | **the section itself. Nothing else** — the document is the record |
| a check the person corrected | the section, corrected. The reasoning goes in `_stages.md`, "Decided in conversation" if it changes a design |
| a proposal the person took | the section itself |
| a proposal the person declined | `_stages.md`, "Proposals not taken", and a `spec-proposal` question (`blocking: no`) |
| a question nobody present can answer | the question file, in the category that fits |
| **a check nobody present can confirm** | **`spec-assumption`** (`blocking: no`), naming the reading taken |

**`spec-assumption` narrows to that last row.** It used to cover any reading a skill assumed in order to keep moving. With checks available, a skill no longer assumes silently — it asks, and only records an assumption when the asking produced no answer. **A `spec-assumption` raised without having asked first is a defect.**

---

## Use the question tool, and make the answer selectable

**Default to `AskUserQuestion` rather than free prose.** A person who has to compose every answer from nothing answers fewer of them, and a spec conversation that runs out of patience is a spec with holes in it.

### What goes in it, and what does not

| Use the tool | Keep it in prose |
|---|---|
| a check — right, or wrong and how | **approving a section.** The whole text has to be read, and it belongs in the transcript |
| a proposal with distinguishable options | a question whose real answer is a story — a use case, a domain explanation |
| a value from a known set — availability, security level, question language | a design argument that four options would distort |
| `built:` per feature — `spec` / `backend` / `frontend` / none | |

**Never fold a section approval into an option.** What the approval protects is that the person read the exact words (`structure.md`, invariant 1), and an option labelled "approve" is exactly the thing that lets them not read them.

### How to build the options

1. **Put the most likely answer first, and mark it `(recommended)`.** After stage 0 has read the existing assets, the skill usually *does* know which is most likely — say so rather than presenting four equals
2. **Offer values, not blanks.** Not "how many users?" but `100 / 1,000 / 10,000`. A person corrects a number far more readily than they produce one
3. **Say what each option costs** in its description. An option the person cannot tell apart from its neighbour is not a choice
4. **Batch up to four.** One question per exchange turns a stage into an interrogation
5. **"Other" is always available**, added by the tool itself — so a set of options that misses the real answer never traps anybody. That is what makes offering a best guess safe

### Where it does not fit, say why in one line

A question that will not go into options is asked in prose, and it says what it needs: *"this one needs a few sentences — a list of choices would flatten it."* Without that, a person who has been answering by selection reads a prose question as the skill having forgotten its own convention.

---

## What is never asked

**Do not ask a person to confirm something the skill is forbidden to have worked out.** Offering `built: frontend` as the recommended option because the code looks finished is inference wearing a check's clothing — a half-built screen and a finished one look identical from a file listing.

**What may be offered instead is the evidence, and the choice left open**: what was found, what it does not settle, and four options with none of them recommended. That is the difference between *deciding and asking for a rubber stamp* and *doing the legwork so somebody else can decide quickly*.

| | |
|---|---|
| **legitimate** | "The attendance resolvers, their tests and the two screens are present. Whether that is finished is not something the tree can say. Which is it?" |
| **not legitimate** | "This looks built to the frontend gate — confirm?" |

`structure.md`, invariant 2, is the full statement of what may not be inferred.

---

## Do not economize on asking

**Asking is not a cost to be minimized.** People who get asked start writing it down in advance, and the asking is also what trains whoever writes the spec. What the question tool is for is making each question *cheap to answer* — not for asking fewer of them.

---

## References

| File | Content |
|---|---|
| `structure.md` | the invariants — what may not be inferred, and what approval protects |
| `spec-format.md` | the format every answer ends up written into |
| `../../hora-spec/references/investigation.md` | what evidence a check may be built on, and what no evidence can settle |
| `../../hora-spec/SKILL.md` | the approval model a proposal passes through |
| `../../hora-plan/SKILL.md` | the question categories, in full |
