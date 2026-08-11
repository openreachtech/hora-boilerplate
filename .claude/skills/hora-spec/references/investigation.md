# What may be read, and what reading can never settle

**Stage 0's authority, and the line every later stage reads its own evidence against.**

**A spec written for something that already runs must not be dictated.** A person asked to describe, from memory and in the right format, a product with twenty features will describe the parts they remember and leave the rest — and the parts they leave are exactly the parts nobody has looked at in a year. **The system itself is the better witness for what it does. It is a useless witness for what anybody wanted.**

This file is where those two are separated.

---

## The line

| **A fact — read it, draft it, put it as a check** | **An intent — no reading settles it** |
|---|---|
| which operations exist, and what each returns | who each one is *for* |
| which tables exist, and what columns they hold | why the model came out that way, and what was rejected |
| which screens exist, and which operations each calls | what somebody was trying to accomplish on them |
| **who may call an operation as it is configured now** | **who *should* be able to call it** |
| what the existing tests assert | whether what they assert is what anybody wanted |
| which services the stack brings up | which of them the product actually needs |
| what a reference document states | whether it is still true |
| | **how much of a feature counts as finished (`built:`)** |

**The fourth row is the one that matters most and is missed most often.** "Anyone with a session token can call this" is a fact read off an auth filter. "Anyone with a session token should be able to call this" is a decision nobody has made — and stage 6 exists because, in a product that already runs, the second has usually never happened.

**The last row cannot be moved by any amount of evidence.** A half-built screen and a finished one look identical from a file listing; tests exist for features nobody finished and are absent for features that work. `built:` is asked, always, and the evidence is offered as material rather than as a recommendation (`../hora/references/asking.md`, "What is never asked").

---

## Facts go out as checks, never as writes

```
read it  ──>  draft the section  ──>  show it as a CHECK  ──>  confirmed?  ──> write
                                                              corrected?  ──> write the correction
                                                              unanswerable? ──> spec-assumption
```

**The draft is not the spec.** Nothing read enters `specs/` until somebody has confirmed the words, exactly as if they had said them — which is what invariant 2 protects and all it protects (`../hora/references/structure.md`, "This forbids inferring. It does not forbid reading").

**A gap found while reading is a proposal, never a check.** "There is no error state on this screen" states a fact; "add an error state to this screen" is the skill's own thinking, and it goes out labelled as such. Stating the second in the voice of the first is the one mixing this whole design guards against (`asking.md`).

---

## Stage 0 — the inventory

**Runs once, before stage 1, and it is over in a sentence when there is nothing to read.** A new project has no repositories, no sources and no annex; stage 0 records that and stage 1 begins.

```
1. Is there anything to read at all?
     an existing repository inside this one, a reference document, a PDF,
     a diagram, a spreadsheet, an old spec
     nothing  -> record "new project, nothing to read", pass the stage, go to 1

2. Ask for what is not visible from here
     documents live in places a session cannot reach — a wiki, a drive, a
     ticket tracker. ASK what exists before concluding there is nothing

3. Read the repositories, breadth first
     the layout, the servers, the entry points, the operation surface, the
     tables, the screens, the tests, the scripts that bring it up
     Do NOT go deep here. Depth is each stage's own, on its own section

4. Read the declared and offered documents
     what each one covers, how current it is, and where it disagrees with the
     code. A disagreement is a finding, not something to resolve alone

5. Declare them: Sources and Annex (below)

6. Confirm the inventory, per section, not per feature
     "here is what I found and how I read it" — one check per area, batched

7. Write .hora/spec/<version>/_assets.md
```

**Step 2 is the step that gets skipped.** The most useful document is regularly one nobody thought to mention, and a session cannot discover what is not on its disk. **Ask, with options** — a design doc, an API reference, screen mockups, a data dictionary, a ticket backlog, none of these.

**Step 3's "breadth first" is a rule, not a hint.** Stage 0 reads enough to say *what exists*; stage 4 reads the migrations properly, stage 5 the screens, stage 6 the auth filters. Reading everything deeply here would settle, in one undifferentiated pass, questions that seven stages exist to settle in order (`stages.md`, "The order is a rule").

### The inventory is confirmed per section

**One check per area — the operation surface, the data model, the screens, the current authorization, the documents — not one per feature.** A product with twenty features would otherwise cost twenty exchanges before stage 1 has begun, and a person answering the twentieth is not reading it.

**New features are the other way round.** Anything being designed fresh is settled feature by feature, in the stage that owns it, because there is no existing thing to read and every answer is a decision (`stages.md`).

| | Granularity |
|---|---|
| what stage 0 read off something that exists | **per section**, batched |
| `built:`, which is per-feature by nature | **per feature**, in stage 1 |
| a feature being designed fresh | **per feature**, in its own stage |

---

## Sources and Annex

Both already exist in the format (`../hora/references/spec-format.md`). **Stage 0's job is to fill them, which nothing did before.**

| | What it means | Read as |
|---|---|---|
| **`Sources`** | this document is part of the specification | **a source.** `/hora` extracts from it exactly as from a feature file — `id`, `target`, tasks and all |
| **`Annex`** | this document helps interpret the specification | **interpretation only.** Never extracted from |

**The difference is not how useful the document is — it is whether anybody is willing to be held to it.** A design doc that is two years stale is `Annex` however good it is; a current requirements list is `Sources`.

**Which one a document goes into is a question, not a judgment call.** Offer each document with the two options and what each entails.

**A document nobody can vouch for goes in `Annex`, and stage 0 says so.** Promoting it to `Sources` would make a stale statement a requirement that `/hora-plan` extracts tasks from.

### Files that are not text

A PDF, a screenshot, a mockup, a spreadsheet: **link it from `Annex` and say in one line what it shows.** What was read out of it goes into the spec through the ordinary route — a check, confirmed, written into the section that owns it. The file itself stays where it is, referenced.

**Never paste a picture's contents into the spec as if they were stated requirements.** A mockup shows a screen somebody drew, which is not the same as a screen anybody committed to.

---

## `.hora/spec/<version>/_assets.md`

What was read, where it was read from, and when. **A cache and an audit trail — never a requirement.**

```markdown
# Assets — 1.0.0

## Repositories read

| Row | Directory | Read at | What it holds |
|---|---|---|---|
| backend | `legacy-api` | `a1b2c3d` | 14 GraphQL operations, 9 tables, 2 jobs, 118 tests |
| frontend-admin | `admin-console` | `e4f5g6h` | 11 pages, 6 of them behind a role check |

## Documents

| File | Declared as | Vouched for by | Note |
|---|---|---|---|
| `docs/api-reference.md` | `Sources` | the API owner | current as of the last release |
| `docs/screens.pdf` | `Annex` | nobody | 2 years old; three screens no longer exist |

## Read but not settled here

| What | Which stage settles it |
|---|---|
| the `status` column holds four values, one of them unused | 4 |
| `deleteAccount` has no auth filter at all | 6 |
```

**"Read but not settled here" is the part worth the file.** Stage 0 turns up things it must not decide, and the only alternative to recording them is that it either decides them or forgets them. Each one names the stage that owns it.

**Rewrite it when the commit it was read at no longer matches.** On any disagreement between this file and the tree, **the tree wins** — the same rule `/hora-setup` applies to `.hora/tree/`.

**This file is not `.hora/tree/<repository>.md`.** That one is `/hora-setup`'s note of a boilerplate's conventions, for implementation. This one is what an existing product was found to *do*, for specification. They are written by different skills, at different times, for different readers.

---

## What stage 0 never does

- **decide anything.** It reads, drafts and asks. Every answer is somebody else's
- **write into `specs/` beyond `Sources` and `Annex`**, and those only once confirmed
- **go deep.** Each later stage reads its own section's evidence for itself
- **conclude `built:`** from what it read. It offers the evidence and the choice (`../hora/references/asking.md`)
- **resolve a disagreement between a document and the code.** It reports both readings and asks which holds
- **touch git, or any implementation repository's contents.** Reading is the whole of its access

---

## References

| File | Content |
|---|---|
| `../hora/references/asking.md` | **a check, a proposal or a question** — and the question tool |
| `../hora/references/structure.md` | invariant 2, and why reading is not inferring |
| `../hora/references/spec-format.md` | `Sources`, `Annex`, and the `built:` annotation |
| `stages.md` | stage 0's exit condition, and what each later stage reads |
| `../SKILL.md` | the approval model everything drafted here passes through |
