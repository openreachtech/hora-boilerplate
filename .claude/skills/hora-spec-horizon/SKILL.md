---
name: hora-spec-horizon
description: Stage 2 of /hora-spec. Narrow the release to the fewest use cases somebody actually needs, and split everything else into what is deferred with a seam kept open and what is never built. Writes the implementation scope in three parts, and the implementation plan. Runs at the root of the hora repository (myproject-app), in conversation. Invoked by /hora-spec, or directly.
---

# hora-spec-horizon

**Stage 2 of `/hora-spec`.** Decide what this release builds, what it deliberately leaves for later, and what it will never build — and keep the three apart.

Read `../hora/references/structure.md` and `../hora-spec/references/principles.md` first. **`../hora-spec/references/stages.md` is the authority on this stage's exit condition.**

---

## What this stage decides

```
which of stage 1's use cases this release serves
which are deferred, and what unblocks each one
which are never built
which seams the deferred ones need kept replaceable
in what order the release builds what it builds
```

## What it must not decide

| | Whose it is |
|---|---|
| a new use case | **stage 1.** If one turns up here, go back and state it there first |
| how a seam is built | stage 4, and the package's own skills |
| whether a deferred item is technically possible | nobody, yet. It is deferred |
| the version number a deferred item lands in, where nobody has decided one | leave it as "no version yet", with the trigger |

---

## The narrowing

**A release carrying too much is the default outcome, not a risk** (`../hora-spec/references/principles.md`). Everyone wants everything first, and nothing about writing a document resists it. So this stage resists it.

**The question that does the work is not "is this important?"** — everything is important, and asking it produces a list identical to the one you started with.

```
which use case is impossible without this?
```

| The answer | What it means |
|---|---|
| a use case from stage 1, named | it is in. That use case is the reason |
| "it would be nice to have" | it is deferred. Ask what would make it necessary |
| a use case nobody stated | **go back to stage 1.** Either the use case is real and belongs there, or the feature has no reason |

**Then say the number out loud.** "This release has eleven features and four of them serve one use case each" is a sentence nobody says to themselves. Propose the split — which four go now, which seven follow, and which use case each group completes.

**If the answer is still "all of it", record it and carry on.** State it once, propose the narrowing, and if the decision stands, write a `scope` question naming what was proposed and who declined it. **The decision belongs to whoever asked for the product; saying nothing does not.**

---

## The three lists are three lists

**Nothing about this is a formality.** The two kinds of out-of-scope produce opposite designs, and `/hora-plan` carries each into every feature file as a constraint:

| The list | What the design does | What a feature file gets |
|---|---|---|
| **built this time** | build it | the feature itself |
| **out of scope for now** (to be built later) | **leave a seam. Keep what is behind it replaceable** | `Constraint: leave room for …` |
| **permanently out of scope** | **do not abstract it. Exclude it** | `Constraint: … is permanently out of scope. Build no bypass layer` |

**Read the first as the second and the structure cannot take it later. Read the second as the first and an abstraction layer gets built that nobody uses.** Both are expensive, and both are cheap to avoid here.

**Every "for now" entry names what unblocks it.** A version, or a condition — never nothing.

```markdown
### Out of scope for now (to be built later)

- Payroll export → planned for 1.1.0. Needs the confirmed monthly totals
- Notifications by anything other than email → no version yet. Once a client
  asks for one. Seam: the notification channel is chosen at one place, not at
  each call site
- Full-text search → no version yet. Once staff records pass ~100k. Seam: the
  attendance list's query is one class, replaceable without touching the screen
```

**A foreseen requirement with no seam named is a wish, not a design constraint.** The seam is the whole content of the entry — it is what stage 4 has to honor and what `/hora-plan` copies into the feature file.

**Ask for the ones nobody has mentioned.** A single tenant that becomes several, an email channel that becomes a choice, a report that becomes scheduled, one language that becomes two, one currency, one timezone. Each is a sentence now and a rewrite later. **Propose them; do not write them unasked.**

---

## Delegates

| What is needed | The skill that holds it |
|---|---|
| the out-of-scope list, and what makes a requirement decided rather than assumed | `hc-requirement-definition` |

If it is not under `.claude/skills/`, say so, carry on, and record the gap.

---

## What it writes

**Show each section in full and wait for approval** (`../hora-spec/SKILL.md`).

```markdown
## Implementation scope

### Built this time (1.0.0)

- Clocking in and out, and the day's list          (#attendance)
- Filing a forgotten day                          (#attendance)
- Approving a month, and locking the totals       (#approval)

### Out of scope for now (to be built later)

- Payroll export → planned for 1.1.0. Needs the confirmed monthly totals

### Permanently out of scope

- Reading attendance out of the old spreadsheets. The migration is a one-off
  somebody runs by hand
```

**And the implementation plan, which is the order the release is built in:**

```markdown
## Implementation plan

### Milestone 1 (MVP)

1. Clocking in, and the day's list
2. Filing a forgotten day

### Milestone 2

3. Approving a month

### Fine to leave for later

- The export screen's formatting
```

**`/hora-plan` extracts `_plan.md`'s order from this and derives no order of its own**, so an order left unwritten is an order somebody else guesses at. **These are the project's own milestones** — they have nothing to do with `/hora-build`'s eighteen checkpoints, which are the same for every feature.

**Check that "fine to leave for later" and "out of scope for now" agree.** Where they do not clearly correspond, `/hora-plan` stops and asks, so settle it here.

---

## Exit condition

Three separate lists; every "for now" entry naming what unblocks it and the seam it needs kept open; the build order written. `../hora-spec/references/stages.md` is the authority.

---

## When it sends the run back

| Found here | Goes to |
|---|---|
| a use case nobody stated at stage 1 | **stage 1** |
| an actor who only exists for a deferred feature | stage 1, to have the actor's own release stated |

---

## References

| File | Content |
|---|---|
| `../hora-spec/SKILL.md` | the approval rule, the state file, the closing report |
| `../hora-spec/references/stages.md` | this stage's exit condition |
| `../hora-spec/references/principles.md` | "A release carrying too much is the normal failure", and "Build for now. Design for what was named" |
| `../hora/references/spec-format.md` | "Implementation scope", and the two kinds of out-of-scope |
| `../hora-plan/SKILL.md` | how both kinds become a feature file's `Constraint:` |
