# What may be read, and what reading can never settle

**Stage 0's authority, and the line every later stage reads its own evidence against.**

**A spec written for something that already runs must not be dictated.** A person asked to describe a twenty-feature product from memory describes what they remember, and the rest is silence. **The system is the better witness for what it does. It is a useless witness for what anybody wanted.**

---

## The line

| **A fact — read it, draft it, put it as a check** | **An intent — no reading settles it** |
|---|---|
| which operations exist, and what each returns | who each one is *for* |
| which tables exist, and what columns they hold | why the model came out that way, and what was rejected |
| which surfaces exist, and which operations each calls | what somebody was trying to accomplish on them |
| **who may call an operation as it is configured now** | **who *should* be able to call it** |
| what the existing tests assert | whether what they assert is what anybody wanted |
| which services the stack brings up | which of them the product actually needs |
| what a reference document states | whether it is still true |
| | **how much of a feature counts as finished** |

**The fourth row is missed most often.** "Anyone with a session token can call this" is a fact read off an auth filter. "Anyone with a session token *should* be able to call this" is a decision nobody has made — and in a product that already runs, the second has usually never happened.

**The last row cannot be moved by any amount of evidence.**

---

## Facts go out as checks, never as writes

```
read it ─> draft the section ─> show it as a CHECK ─> confirmed?    -> write
                                                      corrected?    -> write the correction
                                                      unanswerable? -> spec-assumption
```

**A gap found while reading is a proposal, never a check.** "There is no error state on this screen" states a fact; "add an error state to this screen" is the skill's own thinking.

---

## Stage 0 — the inventory

**Runs once, before stage 1, and is over in a sentence when there is nothing to read.**

```
1. Is there anything to read at all?
     request/ first — what somebody wants this version to do
     then sources/ and annex/ — what is in them, and what their placement says
     then the rest of specs/<version>/, an existing repository, a reference
     document, a diagram, a spreadsheet, an old spec
     nothing -> record "new project, nothing to read", pass, go to stage 1

2. Ask for what is not visible from here
     documents live where a session cannot reach — a wiki, a drive, a ticket
     tracker. ASK what exists before concluding there is nothing

3. Read the repositories, breadth first
     the layout, the servers, the entry points, the operations, the tables,
     the surfaces, the tests, the scripts that bring it up
     Do NOT go deep. Depth is each stage's own, on its own section

4. Read the declared and offered documents
     what each covers, how current it is, where it disagrees with the code

5. Declare them: Sources and Annex

6. Confirm the inventory, PER SECTION, not per feature

7. Write _assets.md — and, where documents and code both exist, _divergence.md
```

**Step 2 is the step that gets skipped.** A session cannot discover what is not on its disk. **Ask, with options.**

**Step 3's "breadth first" is a rule, not a hint.**

### The inventory is confirmed per section

**One check per area — the operations, the data model, the surfaces, the current authorization, the documents — not one per feature.** Twenty features would otherwise cost twenty exchanges before stage 1 begins.

| | Granularity |
|---|---|
| what stage 0 read off something that exists | **per section**, batched |
| `built:`, and whether a feature is listed | **per feature**, in stage 1 |
| a feature being designed fresh | **per feature**, in its own stage |

---

## Where a document has to sit

**A session reads only what is inside its working directory, and hora reaches a file only by following links from `spec.md`.**

| Where it was found | How it goes out |
|---|---|
| in `sources/` or `annex/` | **a check** — "you put this in `sources/`, so I am treating it as part of the specification. Is that right?" |
| in `request/` | **a check on the agenda** — "I read this as what you want this version to add. Nothing in it goes into the spec until a stage drafts it and you approve the words. Right?" |
| anywhere else under `specs/<version>/` | **a question** — "which of the three is this?" |

**Batch the checks** — one exchange for everything in each directory.

**Placement is evidence of intent, never a decision.**

**Recognized, never required.** A project that brought its own layout across keeps it. **Never tell somebody their existing folders are wrong**, and never move a file to make it fit.

**When somebody names a document that is not there, say where to put it and ask them to place it.** A document paraphrased across a conversation arrives with exactly the parts they remembered.

**Never link into an implementation repository.** Those directories are gitignored, so the link resolves on the author's disk and breaks in every other clone. Bring a copy under `specs/<version>/` instead.

**A document that cannot be brought in at all is still worth naming.** Record what it is and who holds it.

### What a request is read for

**A request is the intent column of the table above, arriving as text for once.**

**That is what makes it dangerous to file under `Sources`.** A source states what the product must do and somebody is held to it. A request states what somebody wants, and nobody has worked out yet whether it is coherent.

```
the parts that are clear    -> draft them, per stage, as PROPOSALS
the parts that are not      -> questions, in the stage that owns them
what it does not mention    -> the stage asks, as it always would
```

**Take the whole request through the stages, never only the parts that fit.** Anything no stage claimed by the end of stage 7 is recorded under "read but not settled here", with the stage it should have belonged to.

**Contradictions inside a request are expected and are not defects in it.** Put each up as a question with both readings, and never resolve one by picking what is easier to build.

**Never edit `request/`.** Not to tidy it, not to strike through what turned out to be out of scope, not to append what was decided.

---

## Sources and Annex

| | Means | Read as |
|---|---|---|
| **`Sources`** | this document is part of the specification | **a source.** Extracted from exactly like a feature file |
| **`Annex`** | this document helps interpret it | **interpretation only.** Never extracted from |

**The difference is not how useful the document is — it is whether anybody is willing to be held to it.**

**Which one is never stage 0's judgment call.** Put the placement up as a check, or offer the options — **including "neither: this is a request"**.

**A document nobody can vouch for goes in `Annex`, and stage 0 says so.**

**A file that is not text is linked from `Annex` with one line saying what it shows.** **Never paste a picture's contents into the spec as though they were stated requirements** — a mockup shows a screen somebody drew, not one anybody committed to.

---

## `_assets.md`

What was read, where from, and when. **A cache and an audit trail — never a requirement.**

```markdown
# Assets — 1.0.0

## Repositories read

| Row | Directory | Read at | What it holds |
|---|---|---|---|
| core | `legacy-api` | `a1b2c3d` | 14 operations, 9 tables, 2 jobs, 118 tests |

## Documents

| File | Declared as | Vouched for by | Note |
|---|---|---|---|
| `docs/api-reference.md` | `Sources` | the API owner | current as of the last release |
| `docs/screens.pdf` | `Annex` | nobody | 2 years old; three screens no longer exist |

## This version's request

| File | Asked for | Where it went |
|---|---|---|
| `request/csv-export.md` | a CSV export of a month | stages 1, 4, 5 and 6. One line unplaced, below |

## Read but not settled here

| What | Which stage settles it |
|---|---|
| the `status` column holds four values, one unused | 4 |
| `deleteAccount` has no auth filter at all | 6 |
| the request says "and the same for payroll", which no feature covers | 2 |
```

**"Read but not settled here" is the part worth the file.** Stage 0 turns up things it must not decide, and the only alternative to recording them is deciding or forgetting them.

**On any disagreement between this file and the tree, the tree wins**, and the record gets rewritten from it.

**This is not `.hora/tree/<repository>.md`.** That one records a repository's conventions, for implementation. This one records what an existing product was found to *do*, for specification.

---

## `_divergence.md`

**Written only where documents state one thing and code does another.** Every row is work somebody has to route, and stage 7 refuses to pass while one is unrouted.

```markdown
## The spec says it; the code does not do it

| What | Stated where | Routed to |
|---|---|---|
| CSV export of a month | `sources/requirements.md` §4.2 | proposed for "out of scope for now" — accepted |

## The code does it; nothing states it

| What | Read where | Routed to |
|---|---|---|
| `deleteAccount` is callable with no auth filter | `legacy-api` | Q7 `undeclared-behavior`, blocking: no |
```

**Stage 0 writes every routing cell blank.** Once stage 1 has fixed the `Authority` declaration, each row is routed by the stage that owns its subject.

| Divergence | Under `as-built` | Under `to-spec` |
|---|---|---|
| the spec states it; the code does not do it | **propose moving it out of scope** | **a task.** The ordinary case of unfinished work |
| the code does it; nothing states it | **draft it into the spec, as a check** | **report it and stop there** (`undeclared-behavior`) |

**The bottom-right cell is what this table exists for.** Under `to-spec`, authoritative-and-silent is not the same as "delete it": the person may have forgotten to write it down, or the code may be a leftover. **Put both readings up, recommend neither, and wait.**

---

## What stage 0 never does

- **decide anything.** It reads, drafts and asks
- **write into `specs/` beyond `Sources` and `Annex`**, and those only once confirmed
- **treat a request as settled requirements**, or promote one into `Sources`
- **edit, tidy or annotate `request/`**
- **conclude the `Authority` declaration**, or route a divergence without one
- **conclude how far a feature was built**
- **go deep.** Each later stage reads its own section's evidence
- **touch git, or write anything in an implementation repository**
