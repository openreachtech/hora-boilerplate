# How to ask a person something

**Every skill that talks to a person stands on this file** — `/hora-spec` and its stage skills, and `/hora-plan`.

**There are three ways to put something to a person, and they are not interchangeable.** Each one asks the person to do a different job.

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

**Open with the form**, not with the content. A person who has to work out whether they are being asked to verify or to decide will sometimes get it wrong, and nothing downstream can tell that they did.

**What somebody asked for is a proposal, never a check.** A request states what they want; the section drafted from it states what the product would then do, which is a step nobody has taken yet. **Say whose idea it was in the same breath**: *"you asked for this; here is what it would mean"* and *"nobody asked for this; I am suggesting it"* are both proposals, and the record distinguishes them.

**A proposal dressed as a check is the dangerous direction.** The person answers "yes, that's right" to something the skill invented, and it enters `specs/` as an existing fact.

```
"This screen shows an error state."        a check    — it is there, in the code
"This screen shows an error state."        a proposal — it is not there. You are
                                                        suggesting it should be
```

**Those two sentences are identical, and they must never both be allowed.** The second is only ever written as *"I suggest adding an error state to this screen."*

---

## What each one is recorded as

| | Recorded where |
|---|---|
| a check the person confirmed | **the section itself. Nothing else** |
| a check the person corrected | the section, corrected. The reasoning goes in `_stages.md`, "Decided in conversation" if it changes a design |
| a proposal the person took | the section itself |
| a proposal the person declined | `_stages.md`, "Proposals not taken", and a `spec-proposal` question (`blocking: no`) |
| a question nobody present can answer | the question file, in the category that fits |
| **a check nobody present can confirm** | **`spec-assumption`** (`blocking: no`), naming the reading taken |

**`spec-assumption` narrows to that last row.** A skill no longer assumes silently — it asks, and records an assumption only when the asking produced no answer. **A `spec-assumption` raised without having asked first is a defect.**

---

## Use the question tool, and make the answer selectable

**Default to `AskUserQuestion` rather than free prose.** A person who has to compose every answer from nothing answers fewer of them.

### What goes in it, and what does not

| Use the tool | Keep it in prose |
|---|---|
| a check — right, or wrong and how | **approving a section.** The whole text has to be read, and it belongs in the transcript |
| a proposal with distinguishable options | a question whose real answer is a story — a use case, a domain explanation |
| a value from a known set — availability, security level, question language | a design argument that four options would distort |
| `built:` per feature — `spec` / `backend` / `frontend` / none | |
| `baseline:` per feature — verified, or listed unaccepted | **the `Baseline` line itself.** It is a section's own declaration, approved in prose |

**Never fold a section approval into an option.** What the approval protects is that the person read the exact words (`structure.md`, invariant 1).

### How to build the options

1. **Put the most likely answer first, and mark it `(recommended)`.** After stage 0 has read the existing assets, the skill usually does know which is most likely
2. **Offer values, not blanks.** Not "how many users?" but `100 / 1,000 / 10,000`. A person corrects a number more readily than they produce one
3. **Say what each option costs** in its description
4. **Batch up to four.** One question per exchange turns a stage into an interrogation
5. **"Other" is always available**, added by the tool itself, which is what makes offering a best guess safe

### Where it does not fit, say why in one line

Ask it in prose, and say what it needs: *"this one needs a few sentences — a list of choices would flatten it."*

---

## What is never asked

**Do not ask a person to confirm something the skill is forbidden to have worked out.** Offering `built: frontend` as the recommended option because the code looks finished is inference wearing a check's clothing.

**What may be offered instead is the evidence, and the choice left open**: what was found, what it does not settle, and four options with none recommended.

| | |
|---|---|
| **legitimate** | "The attendance resolvers, their tests and the two screens are present. Whether that is finished is not something the tree can say. Which is it?" |
| **not legitimate** | "This looks built to the frontend gate — confirm?" |

**One declaration lifts this rule, for exactly what it covers: `Authority: as-built`** (`spec-format.md`, "Existing assets"). For the features it reaches, `built:` may be derived from the evidence and put up for correction, and use cases may be drafted from the screens and operations as checks. **For a `to-spec` feature, and everywhere no declaration exists, this section applies unchanged.**

**`Baseline: inventoried` lifts nothing here.** Which features are listed is asked per feature, with the evidence laid out and **no option recommended**. It is **never offered inside `built:`'s own option list** — ask it first, separately, batched up to four features like anything else.

`structure.md`, invariant 2, is the full statement of what may not be inferred.

---

## Do not economize on asking

**Asking is not a cost to be minimized.** People who get asked start writing it down in advance, and the asking trains whoever writes the spec. The question tool is for making each question *cheap to answer*, not for asking fewer of them.

---

## References

| File | Content |
|---|---|
| `structure.md` | the invariants — what may not be inferred, and what approval protects |
| `spec-format.md` | the format every answer ends up written into |
| `../../hora-spec/references/investigation.md` | what evidence a check may be built on |
| `../../hora-spec/SKILL.md` | the approval model a proposal passes through |
| `../../hora-plan/SKILL.md` | the question categories, in full |
