---
name: hora-spec-horizon
description: Stage 2 of /hora-spec. Narrow the release to the fewest use cases somebody needs, and split the rest into deferred-with-a-seam and never-built. Writes the implementation scope, the build order, and the version's own acceptance criteria. Invoked by /hora-spec, or directly.
---

# hora-spec-horizon

**Stage 2 of `/hora-spec`.** Decide what this release builds, what it deliberately leaves for later, and what it will never build — and keep the three apart.

Read `../hora/references/structure.md` and `../hora-spec/references/principles.md` first. **`../hora/references/asking.md` fixes how anything here is put to a person**, and `../hora-spec/references/stages.md` is the authority on this stage's exit condition.

**This stage reads nothing new, and one thing stage 1 wrote down for it.** What already exists is stage 1's finding; **what to build next is a decision, and no repository holds one.** Every question here is a question or a proposal — there is nothing to put up as a check. The one thing to read is the list stage 1 held back in `.hora/spec/<version>/_stages.md`.

---

## What this stage decides

```
which of stage 1's use cases this release serves
which are deferred, and what unblocks each one
which are never built
which seams the deferred ones need kept replaceable
in what order the release builds what it builds
which behaviors belong to the version rather than to any one feature
```

## What it must not decide

| | Whose it is |
|---|---|
| a new use case | **stage 1.** If one turns up here, go back and state it there first |
| how a seam is built | stage 4, and the conventions package |
| whether a deferred item is technically possible | nobody, yet. It is deferred |
| the version a deferred item lands in, where nobody decided one | leave it as "no version yet", with the trigger |

---

## The narrowing

**A release carrying too much is the default outcome, not a risk.** Everyone wants everything first, and nothing about writing a document resists it. So this stage resists it.

**The question that does the work is not "is this important?"** — everything is important, and asking it produces the list you started with.

```
which use case is impossible without this?
```

| The answer | What it means |
|---|---|
| a use case from stage 1, named | it is in. That use case is the reason |
| "it would be nice to have" | it is deferred. Ask what would make it necessary |
| a use case nobody stated | **go back to stage 1.** Either it is real and belongs there, or the feature has no reason |

**A listed section states no use case by declaration, and is not sent back to stage 1 for it.** Its silence is somebody's decision, not a hole.

**Then say the number out loud.** "This release has eleven features and four of them serve one use case each" is a sentence nobody says to themselves. Propose the split — which go now, which follow, and which use case each group completes.

**If the answer is still "all of it", record it and carry on.** State it once, propose the narrowing, and if the decision stands, write a `scope` question naming what was proposed and who declined it. **The decision belongs to whoever asked for the product; saying nothing does not.**

---

## The three lists are three lists

**Nothing about this is a formality.** The two kinds of out-of-scope produce opposite designs, and `/hora-plan` carries each into every feature file as a constraint:

| The list | What the design does | What a feature file gets |
|---|---|---|
| **built this time** | build it | the feature itself |
| **out of scope for now** | **leave a seam. Keep what is behind it replaceable** | `Constraint: leave room for …` |
| **permanently out of scope** | **do not abstract it. Exclude it** | `Constraint: … is permanently out of scope. Build no bypass layer` |

**Read the first as the second and the structure cannot take it later. Read the second as the first and an abstraction layer gets built that nobody uses.**

**Every "for now" entry names what unblocks it** — a version, or a condition, never nothing.

```markdown
### Out of scope for now (to be built later)

- Payroll export → planned for 1.1.0. Needs the confirmed monthly totals
- Notifications by anything other than email → no version yet. Once a client
  asks. Seam: the channel is chosen in one place, not at each call site
- Full-text search → no version yet. Once records pass ~100k. Seam: the
  attendance list's query is one class, replaceable without touching the surface
```

**A foreseen requirement with no seam named is a wish, not a design constraint.** The seam is the whole content of the entry.

**Ask for the ones nobody mentioned.** A single tenant that becomes several, an email channel that becomes a choice, a report that becomes scheduled, one language that becomes two, one currency, one timezone. Each is a sentence now and a rewrite later. **Propose them; do not write them unasked.**

---

## Delegates

**This table lists work, not names.**

| What is needed |
|---|
| the out-of-scope list, and what makes a requirement decided rather than assumed |

If nothing equipped covers it, say so by the work it names, carry on, and record the gap.

---

## What it writes

**Show each section in full and wait for approval** (`../hora-spec/SKILL.md`).

```markdown
## Implementation scope

### Built this time (1.0.0)

- Clocking in and out, and the day's list      (#attendance)
- Approving a month, and locking the totals    (#approval)

### Out of scope for now (to be built later)

- Payroll export → planned for 1.1.0. Needs the confirmed monthly totals

### Permanently out of scope

- Reading attendance out of the old spreadsheets. That migration is a one-off
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
- The export's formatting
```

**`/hora-plan` extracts its order from this and derives none of its own**, so an order left unwritten is one somebody else guesses at. **These are the project's own milestones** — unrelated to the eighteen checkpoints, which are the same for every feature.

**Check that "fine to leave for later" and "out of scope for now" agree.**

### The order has to agree with `depends`

**Every feature comes after every feature it depends on.** The order written here is what `/hora-plan` extracts, so an order contradicting a `depends` edge is settled here or nowhere.

**Nothing downstream reports the contradiction, which is why it is checked at the source.** `/hora-build` takes the first feature whose `depends` are satisfied, so a plan listing `#payroll` before the `#attendance` it depends on does not fail — the run silently builds them in a different order than the document states. Only a cycle stops anything.

**Walk it once, in order, checking each feature's `depends` against what is already above it.** An edge pointing forward is one of two things:

| What it turns out to be | What happens |
|---|---|
| the order is wrong | reorder here, and say which two moved |
| the dependency is wrong | it goes back to whichever stage stated it — usually **stage 4** |

**A `depends` naming a listed feature is satisfied by the running code and orders nothing.** Skip it in this walk rather than treating it as unsatisfiable.

### The version's own acceptance criteria

**A feature's criteria stop at its own gate. This section holds the behavior that fits inside none of them** — and it is this stage's because it is the stage that holds the order. Deciding that a behavior spans three features rather than reordering two of them is a horizon decision, not a use-case one.

```markdown
## 15. Version acceptance criteria

### 1.0.0
<!-- id: version-acceptance-1-0-0 -->

- a newly hired member of staff signs up, clocks in, and appears in the admin's list
  spans: #sign-up, #attendance, #user-admin
```

**What arrives here is stage 1's held-back list**, plus whatever the walk above turned up. **Read it before this section is written.**

**Take each one and try the three destinations in order** — reorder, a section of its own, or this section. **The third is last, and this stage is where the discipline holds**: a criterion here is checked once, at the end of the version, instead of at a gate that runs while the code is one commit old. Say the number out loud, the way the narrowing does — "eleven features, and nine criteria that nobody's feature owns" is a sentence that gets a spec reordered.

**Every criterion carries `spans:`, and `none` is written where the version has none.** Both are the difference between a sweep that can route a finding and one that cannot.

**A criterion reaching a feature the spec only listed carries `rests on: #<id> (not accepted)`.**

---

## Exit condition

Three separate lists; every "for now" entry naming what unblocks it and the seam it needs; the build order written, **with every feature after every feature it depends on**; and the version's own criteria written — **`none` where there are none, and every criterion carrying `spans:`**.

---

## When it sends the run back

| Found here | Goes to |
|---|---|
| a use case nobody stated at stage 1 | **stage 1** |
| an actor who exists only for a deferred feature | stage 1, to have that actor's own release stated |
| a `depends` edge that describes the design wrongly, not just the order | **stage 4** |
| a held-back criterion that turns out to need a use case nobody stated | **stage 1** |

---

## References

| File | Content |
|---|---|
| `../hora/references/asking.md` | **a check, a proposal or a question** |
| `../hora-spec/SKILL.md` | the approval rule, the state file, the closing report |
| `../hora-spec/references/stages.md` | this stage's exit condition |
| `../hora-spec/references/principles.md` | why a release carries too much, and what a seam is for |
| `../hora/references/spec-format.md` | the two kinds of out-of-scope, and the version's own criteria |
| `../hora-plan/SKILL.md` | how both kinds become a feature file's constraint |
