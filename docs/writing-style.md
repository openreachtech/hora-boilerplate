<!-- 日本語版: [writing-style.ja.md](./writing-style.ja.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# How the hora skills are written

Every file the two hora packages distribute — every skill and every agent — is read at run time, by an agent, before it does anything. **A rule that takes eight sentences to state costs those eight sentences on every run.**

This document is the style those files are held to. It is about wording, never about what the rules say.

**They are not authored here.** The hora skills and agents are written in [`hora-core`](https://github.com/openreachtech/hora-core), the procedures they delegate to in the skills package of their domain — [`hora-skills-ort-core`](https://github.com/openreachtech/hora-skills-ort-core), [`hora-skills-ort-renchan`](https://github.com/openreachtech/hora-skills-ort-renchan) or [`hora-skills-ort-furo`](https://github.com/openreachtech/hora-skills-ort-furo); this repository only receives them, under `.claude/`. The style lives with the method, which is documented here.

---

## The three rules

**1. State the rule. Do not narrate the failure.**

A rule followed by two paragraphs on what goes wrong if it is broken is one rule and two paragraphs. Keep a reason only where applying the rule correctly depends on it, and keep it to one clause.

```
✅ Match on what a description says, never on what a name sounds like.
❌ Match on what a description says, never on what a name sounds like. Two
   skills whose names differ by one word can serve different surfaces
   entirely, and a name that stops matching does not announce itself — the
   gate simply runs without its convention and reports a pass, which is the
   one kind of failure a gate must not have.
```

**2. Write it once. Point at it everywhere else.**

Each rule has one owning file. Everywhere else is a single-line reference — `(`structure.md`, "The division of labor")`. This is the rule these files already state about procedures; it applies to their own prose too.

**3. One sentence, one claim.**

Split at every em dash that joins a second claim. Around 40 words is the ceiling.

---

## What that means line by line

| | |
|---|---|
| **bold** | the imperative or the prohibition itself, and nothing else. One or two per section |
| em dash | one per sentence at most. A second one is a sentence break |
| headings | a noun phrase, six words or fewer. **A heading other files quote is not renamed without updating them** |
| cross-references | one per rule, at the end of the sentence |
| negation | say what holds, not what does not. Never two negatives in one sentence |
| aphorisms | one per document, at most |
| `description:` | two sentences, 40 words: what the skill does, and when it runs |

---

## What is never compressed

These are read by matching on the exact string, so a clearer wording breaks them.

- the eighteen checkpoint headings in `checkpoints.md` — `/hora-plan` copies them verbatim
- `_plan.md`'s section names: `## Features`, `## Features — adopted as built`, `## Not accepted`, `## Withdrawn`, `## Acceptance`
- the verdict grammar: `reach: full`, `reach: scoped`, `passed over <n> of <m> features; <k> not accepted`, `version-criteria:`, `not-accepted:`
- annotation syntax (`<!-- id: -->`, `<!-- built: -->`, `<!-- baseline: inventoried -->`, …) and the question category names
- numbered procedure blocks — the order is the content
- the generated-file banner in `hora-build/SKILL.md`
- `name:` and `tools:` in a frontmatter

---

## Where the reasoning goes instead

`docs/` is where a design is explained to a person: [architecture](./architecture.md), [skills](./skills.md), [adopting](./adopting.md). It is read by nobody at run time, so an argument costs nothing there and costs every run in a skill file.
