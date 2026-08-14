# What may be read, and what reading can never settle

**Stage 0's authority, and the line every later stage reads its own evidence against.**

**A spec written for something that already runs must not be dictated.** A person asked to describe a twenty-feature product from memory describes what they remember, and the rest is silence. **The system itself is the better witness for what it does. It is a useless witness for what anybody wanted.**

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

**The fourth row is missed most often.** "Anyone with a session token can call this" is a fact read off an auth filter. "Anyone with a session token should be able to call this" is a decision nobody has made — and in a product that already runs, the second has usually never happened.

**The last row cannot be moved by any amount of evidence.** `built:` is asked, always, with the evidence offered as material rather than as a recommendation (`../../hora/references/asking.md`, "What is never asked").

---

## Facts go out as checks, never as writes

```
read it  ──>  draft the section  ──>  show it as a CHECK  ──>  confirmed?  ──> write
                                                              corrected?  ──> write the correction
                                                              unanswerable? ──> spec-assumption
```

**The draft is not the spec.** Nothing read enters `specs/` until somebody has confirmed the words (`../../hora/references/structure.md`, "This forbids inferring. It does not forbid reading").

**A gap found while reading is a proposal, never a check.** "There is no error state on this screen" states a fact; "add an error state to this screen" is the skill's own thinking (`asking.md`).

---

## Stage 0 — the inventory

**Runs once, before stage 1, and it is over in a sentence when there is nothing to read.**

```
1. Is there anything to read at all?
     specs/<version>/request/ first — what somebody wants this version to do,
     which is the agenda every later stage works through (below)
     then sources/ and annex/ — what is in them, and what their placement says
     then the rest of specs/<version>/, an existing repository inside this
     one, a reference document, a PDF, a diagram, a spreadsheet, an old spec
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

7. Write .hora/spec/<version>/_assets.md — and, where documents and code
   both exist, .hora/spec/<version>/_divergence.md (below)
```

**Step 2 is the step that gets skipped.** A session cannot discover what is not on its disk. **Ask, with options** — a design doc, an API reference, screen mockups, a data dictionary, a ticket backlog, none of these.

**Step 3's "breadth first" is a rule, not a hint.** Stage 0 reads enough to say *what exists*; stage 4 reads the migrations properly, stage 5 the screens, stage 6 the auth filters (`stages.md`, "The order is a rule").

### The inventory is confirmed per section

**One check per area — the operation surface, the data model, the screens, the current authorization, the documents — not one per feature.** Twenty features would otherwise cost twenty exchanges before stage 1 has begun.

**New features are the other way round.** Anything designed fresh is settled feature by feature, in the stage that owns it.

| | Granularity |
|---|---|
| what stage 0 read off something that exists | **per section**, batched |
| `built:`, which is per-feature by nature | **per feature**, in stage 1 |
| a feature being designed fresh | **per feature**, in its own stage |

---

## Where a document has to sit before any of this works

**A session reads only what is inside its own working directory, and `/hora` reaches a file only by following links from `specs/<version>/spec.md`.**

```
specs/<version>/
  spec.md            the entry point. The only fixed name
  sources/           drop-off: "this is part of the specification"
  annex/             drop-off: "this only explains it"
  request/           drop-off: "this is what I want. Turn it into the two above"
  <anything>/        names, nesting and depth are all free
```

### The three drop-off directories, and why they turn a question into a check

**They ship empty and are read first**, so that somebody handing over twenty documents can express by placement what they would otherwise be asked twenty times (`../../hora/references/spec-format.md`, "a drop-off convention").

| Where it was found | How it goes out |
|---|---|
| in `sources/` or `annex/` | **a check** — "you put this in `sources/`, so I am treating it as part of the specification. Is that right?" |
| in `request/` | **a check on the agenda** — "I am reading this as what you want this version to add, and nothing in it goes into the spec until a stage drafts it and you approve the words. Right?" |
| anywhere else under `specs/<version>/` | **a question** — "which of the three is this?" |

**Batch the checks** — one exchange for everything in `sources/`, one for `annex/`, one for `request/`.

**Placement is evidence of intent, never a decision.** A document in `sources/` that nobody confirmed is not a source.

**Recognized, never required.** A project that brought its own layout across keeps it, and stage 0 reads the whole of `specs/<version>/` regardless. **Never tell somebody their existing folders are wrong**, and never move a file to make it fit.

**When somebody names a document that is not there, say where to put it and ask them to place it.** A document paraphrased across a conversation arrives with exactly the parts they remembered.

**Never link into an implementation repository.** Those directories are gitignored, so a link into one resolves on the author's disk and breaks in every other clone. Anything needed goes as a copy under `specs/<version>/`.

**Material is closed inside one version, never shared across them** (`../../hora/references/structure.md`, invariant 3).

**A document that cannot be brought in at all is still worth naming.** Record what it is and who holds it, under "read but not settled here".

### What a request is read for

**A request is the other column of the table at the top of this file** — somebody's intent, arriving as text for once instead of having to be asked for one question at a time.

**That is what makes it dangerous to file under `Sources`.** A source states what the product must do and somebody is held to it. A request states what somebody wants and nobody has worked out yet whether it is coherent, who may do it, or what it does to the monthly close.

```
read the request  ──>  the parts that are clear  ──> draft them, per stage, as PROPOSALS
                  ──>  the parts that are not    ──> questions, in the stage that owns them
                  ──>  what it does not mention  ──> the stage asks, as it always would
```

**A request is drafted from as a proposal, not confirmed as a check.** What the request said goes back as *this is what I understood you to be asking for*; what it implies goes back as *this is what that would mean; is it what you want?* (`../../hora/references/asking.md`).

**Take the whole request through the stages, and never only the parts that fit.** Anything no stage claimed by the end of stage 7 is reported, recorded under "read but not settled here" with the stage it should have belonged to.

**Contradictions inside a request are expected and are not defects in it.** Put each one up as a question with both readings, and never resolve it by picking the one that is easier to build.

**Never edit `request/`.** Not to tidy it, not to strike through what turned out to be out of scope, not to append what was decided.

---

## Sources and Annex

Both already exist in the format (`../../hora/references/spec-format.md`). **Stage 0's job is to fill them.**

| | What it means | Read as |
|---|---|---|
| **`Sources`** | this document is part of the specification | **a source.** `/hora` extracts from it exactly as from a feature file |
| **`Annex`** | this document helps interpret the specification | **interpretation only.** Never extracted from |

**The difference is not how useful the document is — it is whether anybody is willing to be held to it.** A design doc that is two years stale is `Annex` however good it is.

**Which one a document goes into is never stage 0's judgment call.** For anything found in `sources/` or `annex/`, put the placement up as a check; for anything found elsewhere, offer the options — **including "none of them: this is a request"**.

**A document nobody can vouch for goes in `Annex`, and stage 0 says so.**

### Files that are not text

A PDF, a screenshot, a mockup, a spreadsheet: **link it from `Annex` and say in one line what it shows.** What was read out of it goes into the spec through the ordinary route.

**Never paste a picture's contents into the spec as if they were stated requirements.** A mockup shows a screen somebody drew, not a screen anybody committed to.

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

## This version's request

| File | Asked for | Where it went |
|---|---|---|
| `request/csv-export.md` | a CSV export of a month's attendance, for the admin | stages 1, 4, 5 and 6. One line unplaced, below |

## Read but not settled here

| What | Which stage settles it |
|---|---|
| the `status` column holds four values, one of them unused | 4 |
| `deleteAccount` has no auth filter at all | 6 |
| the request says "and the same for payroll", which no feature covers | 2 |
```

**"Read but not settled here" is the part worth the file.** Stage 0 turns up things it must not decide, and the only alternative to recording them is deciding or forgetting them.

**Rewrite it when the commit it was read at no longer matches.** On any disagreement between this file and the tree, **the tree wins**.

**This file is not `.hora/tree/<repository>.md`.** That one is `/hora-setup`'s note of a boilerplate's conventions, for implementation. This one is what an existing product was found to *do*, for specification.

---

## `.hora/spec/<version>/_divergence.md`

**Written only where there is something to diverge** — documents that state one thing and code that does another. Every row here is **work someone has to route**, and stage 7 refuses to pass while one is unrouted.

```markdown
# Divergence — 1.0.0

## The spec says it; the code does not do it

| What | Stated where | Routed to |
|---|---|---|
| CSV export of a month | `sources/requirements.md` §4.2 | proposed for "out of scope for now" — accepted |

## The code does it; nothing states it

| What | Read where | Routed to |
|---|---|---|
| `deleteAccount` is callable with no auth filter | `legacy-api` schema | Q7 `undeclared-behavior`, blocking: no |
```

**The example shows the file after later stages routed each row. Stage 0 writes every `Routed to` cell blank.** Once stage 1 has fixed the `Authority` declaration, **each row is routed by the stage that owns its subject** (`stages.md`, "What sends a run back into a stage").

**Which way a row is routed follows the `Authority` declaration** (`../../hora/references/spec-format.md`, "Existing assets"):

| Divergence | Under `as-built` | Under `to-spec` |
|---|---|---|
| the spec states it; the code does not do it | **propose moving it out of scope** — stage 2 decides | **a task.** The ordinary case of unfinished work |
| the code does it; nothing states it | **draft it into the spec, as a check** — the product is the requirement | **report it and stop there** (`undeclared-behavior`, `blocking: no`) |

**The bottom-right cell is the one this table exists for.** Under `to-spec`, authoritative-and-silent is not the same as "delete it": the person may have forgotten to write it down, or the code may be a leftover. **Put both readings up, recommend neither, and wait.**

**Every row carries its routing, and stage 7 checks that none is blank** (`stages.md`).

---

## What stage 0 never does

- **decide anything.** It reads, drafts and asks
- **write into `specs/` beyond `Sources` and `Annex`**, and those only once confirmed
- **treat a request as settled requirements**, or promote one into `Sources`
- **edit, tidy or annotate `request/`**
- **conclude the `Authority` declaration**, or route a divergence without one
- **resolve a `to-spec` divergence where the code does something no spec states.** Both readings go up, neither recommended
- **go deep.** Each later stage reads its own section's evidence for itself
- **conclude `built:`** from what it read (`../../hora/references/asking.md`)
- **resolve a disagreement between a document and the code.** It reports both readings and asks which holds
- **touch git, or any implementation repository's contents.** Reading is the whole of its access

---

## References

| File | Content |
|---|---|
| `../../hora/references/asking.md` | **a check, a proposal or a question** — and the question tool |
| `../../hora/references/structure.md` | invariant 2, and why reading is not inferring |
| `../../hora/references/spec-format.md` | `Sources`, `Annex`, and the `built:` annotation |
| `stages.md` | stage 0's exit condition, and what each later stage reads |
| `../SKILL.md` | the approval model everything drafted here passes through |
