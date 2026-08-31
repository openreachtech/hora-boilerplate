# The stack handbook

The contract between the hora skills and the boilerplate a project started from. **The kit owns the order and the git handling; everything specific to a technology stack — which repositories a declared row fetches, what gets filled in, what middleware exists, what an API kind produces — is the boilerplate's, written down in its handbook, and read at run time.**

This is the same division of labor `structure.md` states for the equipped skills, applied to the stack: a hora file states the kind of information it needs, and never bakes in the answer. For conventions and pass/fail criteria the answer comes from the equipped skills, matched by description. For the stack's structure it comes from the handbook, found at its fixed place.

---

## Where it lives

```
docs/stack/README.md        the entry point, at the project root
docs/stack/origins/<origin>.md   one document per origin the catalog lists
```

The boilerplate ships it, so it is present from the moment the project exists, and it is versioned with the project's own git.

**If the entry point, or an entry a step needs, is missing — stop and ask, naming exactly what is missing.** Do not substitute an assumption about the stack, and do not scaffold the handbook: writing it is the boilerplate's job, and a generated stand-in would be an invented stack. A project created before its boilerplate carried a handbook gets one by copying `docs/stack/` from a boilerplate version that has it.

**The handbook is read-only for every hora skill.** It sits under the project's `docs/`, which no hora skill writes. A divergence between the handbook and reality is reported, never patched over.

---

## What the entry point holds

**The origin catalog** — every value the spec's repository layout section may write in its `Origin` column, one row each:

| Column | What it settles |
|---|---|
| the origin's name | the value the spec writes |
| where it comes from | which boilerplate repository fills a row of this origin |
| its role | what a repository of this origin is for |
| how many | the origin's cardinality — how many rows of it a layout may declare |

**An `Origin` value the catalog does not list is a stop-and-ask**, and so is a row count outside an origin's stated bounds. The catalog's bounds are the stack's own architectural constraints; overriding one is a decision for a human, not a default.

---

## What each origin document answers

One file per origin, in a fixed order of sections. `/hora-setup` walks them top to bottom for each declared row of that origin:

| Section | What it settles | What `/hora-setup` does with it |
|---|---|---|
| **Where it comes from** | the source repository, and how the version to fetch is chosen | step 1 of creating a row — always a released state, never an unreleased head |
| **What to fill in** | every placeholder the fetched tree ships, and the value each takes | filled after the fetch, each an idempotent check of its own |
| **What to place** | files the boilerplate does not ship but the project needs | placed without overwriting; anything spec-dependent is decided from the spec's declared sections, as the document directs |
| **Skills to copy into the row** | which equipped skills get copied into the created repository's own `.claude/skills/` | copied only where the destination is missing |
| **What to read once it is there** | the checklist the real tree is read against | read in place and recorded into `.hora/tree/` |

---

## The rules of the contract

- **Nothing from the handbook is copied into a hora file.** A copy disagrees with the original the first time the boilerplate moves, and nothing announces that it has
- **The handbook decides content; the kit decides order.** Which steps exist, when they run, what git does, and what gets recorded are this skill's own and do not vary by stack
- **The real tree outranks the handbook.** The handbook says what to fetch and what to fill in; what actually arrived is read in place, and on any disagreement the tree wins and the disagreement is reported
- **Other skills read it the same way.** Wherever a hora skill needs a stack answer — a default middleware table, the default API style, what an operation kind produces — the handbook is where it looks, at run time, by the same stop-and-ask rule
