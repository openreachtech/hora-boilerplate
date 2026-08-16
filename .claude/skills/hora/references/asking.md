# How to ask a person something

Every skill that talks to a person stands on this file.

**There are three ways to put something to a person, and each asks them to do a different job.**

---

## The three

| | **A check** | **A proposal** | **A question** |
|---|---|---|---|
| What the skill is doing | stating its own understanding | offering a course of action | naming something undecided |
| What the person judges | **is this right, or wrong** | **do we take this, or not** | **what is it** |
| Where it came from | evidence the skill read | the skill's own thinking, or a request nobody has worked out yet | nowhere yet |
| If they say yes | it goes in **as fact** | it goes in **as an approved decision** | — |
| If they say no | the correction goes in | it is dropped, and recorded | — |

```
a check      "I read it as this. Is that right?"
a proposal   "I suggest this. It is yours to decide."
a question   "Nothing decides this. What is it?"
```

**Open with the form, not with the content.** A person who has to work out whether they are verifying or deciding will sometimes get it wrong, and nothing downstream can tell that they did.

**What somebody asked for is a proposal, never a check.** A request says what they want; the drafted section says what the product would then do, which nobody has decided yet. **Say whose idea it was in the same breath** — "you asked for this, here is what it would mean" and "nobody asked for this, I am suggesting it" are both proposals.

**A proposal dressed as a check is the dangerous direction.** The person answers "yes, that's right" and the skill's own idea enters `specs/` as an existing fact.

```
"This screen shows an error state."   a check    — it is there, in the code
"This screen shows an error state."   a proposal — it is not. You are suggesting it
```

**Those two sentences are identical, and both must never be allowed.** The second is only ever written as "I suggest adding an error state to this screen."

---

## What each is recorded as

| | Recorded where |
|---|---|
| a check the person confirmed | **the section itself. Nothing else** |
| a check the person corrected | the section, corrected. The reasoning goes in `_stages.md` if it changes a design |
| a proposal the person took | the section itself |
| a proposal the person declined | `_stages.md`, and a `spec-proposal` question (`blocking: no`) |
| a question nobody present can answer | the question file, in the category that fits |
| **a check nobody present can confirm** | **`spec-assumption`** (`blocking: no`), naming the reading taken |

**A `spec-assumption` raised without having asked first is a defect.** A skill no longer assumes silently — it asks, and records an assumption only when the asking produced no answer.

---

## Use the question tool

**Default to a selectable question rather than free prose.** A person who has to compose every answer from nothing answers fewer of them.

| Use the tool | Keep it in prose |
|---|---|
| a check — right, or wrong and how | **approving a section.** The whole text has to be read |
| a proposal with distinguishable options | an answer that is really a story — a use case, a domain explanation |
| a value from a known set | an argument that four options would distort |
| `built:` per feature | **the `Baseline` line itself** — a section's own declaration |

**Never fold a section approval into an option.** What approval protects is that the person read the exact words (`structure.md`, invariant 1).

**How to build the options:**

1. **Put the most likely answer first, marked `(recommended)`** — where the skill is allowed to have one
2. **Offer values, not blanks.** Not "how many users?" but `100 / 1,000 / 10,000`. People correct a number more readily than they produce one
3. **Say what each option costs**
4. **Batch up to four.** One question per exchange turns a stage into an interrogation
5. **"Other" is always available**, which is what makes offering a best guess safe

**Where the tool does not fit, ask in prose and say why in one line.**

---

## What is never asked

**Do not ask a person to confirm something the skill is forbidden to have worked out.** Offering `built: consumer` as the recommended option because the code looks finished is inference wearing a check's clothing.

**Offer the evidence instead, with the choice left open, and recommend nothing.**

| | |
|---|---|
| **legitimate** | "The attendance operations, their tests and the two screens are present. Whether that is finished is not something the tree can say. Which is it?" |
| **not legitimate** | "This looks built to the consumer gate — confirm?" |

**One declaration lifts this, for exactly what it covers: `Authority: as-built`.** For the features it reaches, `built:` may be derived from the evidence and put up for correction, and use cases may be drafted from the running system as checks. Everywhere else, this section applies unchanged.

**`Baseline: inventoried` lifts nothing here.** Which features are listed is asked per feature, with the evidence laid out and **no option recommended**.

---

## Do not economize on asking

**Asking is not a cost to minimize.** People who get asked start writing it down in advance, and the asking is what trains whoever writes the spec. The question tool exists to make each question *cheap to answer*, not to ask fewer of them.
