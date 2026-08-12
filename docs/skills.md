<!-- 日本語版: [skills.ja.md](./skills.ja.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# The skills Hora Kit runs on

Hora Kit holds the order and the gates. **Every procedure, and every pass/fail criterion, comes from somewhere else** — the [`@openreachtech/ai-agent-skills`](https://github.com/openreachtech/ai-agent-skills) package.

This document is about that boundary: why it exists, how the skills reach the session, how they are referred to, and what happens when one is missing.

---

## Why Hora Kit holds no procedure

Two documents describing the same convention will disagree. **The question is only when, and whether anybody notices.**

```
ai-agent-skills   "a stub resolver lives under server/graphql/resolvers/<audience>/stub/"
                       │
                       │  the package is updated. The path changes.
                       ▼
Hora Kit          "a stub resolver lives under server/graphql/resolvers/<audience>/stub/"
                       ↑
                  still there, still confident, now wrong
```

**The copy does not announce that it went stale.** It reads exactly as authoritative as it did the day it was written, and an agent following it produces work that is confidently in the wrong place.

So Hora Kit's rule is absolute:

> **Never write a procedure, a convention or a pass/fail criterion into a hora skill when a skill in `ai-agent-skills` already holds it. State the work and delegate it.**

This is the same reasoning `/hora-setup` already applies to the boilerplates: **read the real thing; do not bake in what it currently says.** The package is the real thing here.

### What that leaves each side owning

| | Owns | Example |
|---|---|---|
| **Hora Kit** | when something happens, and what must be true before the next thing may | *"Checkpoint 4 passes when a schema-accurate stub exists for every operation this feature adds"* |
| **`ai-agent-skills`** | how to do it, and what counts as done properly | *"a stub lives under `stub/{queries,mutations}/`, mirrors the schema, holds no DB access, and shares its class name with the real resolver"* |

**The two sentences do not overlap.** That is the test: if a line in Hora Kit could be checked against the package and found to disagree, it does not belong in Hora Kit.

---

## How the skills reach the session

Claude Code discovers skills only in the session's own `.claude/skills/`. A package's skills live under `node_modules/`, which is not that path — so without a copying step, **everything the package ships stays invisible.**

`/hora-setup` runs the copy:

```bash
.claude/skills/hora-setup/scripts/equip-skills.sh
```

```
node_modules/@openreachtech/ai-agent-skills/dist/skills/<skill>/
                          │  straight copy, no renaming, no rewriting
                          ▼
                 .claude/skills/<skill>/
```

- **It runs on every `/hora-setup` invocation**, because the package may have been updated since the last one. It synchronizes rather than overlays — package-equipped directories (the gitignored ones; your own skills are never touched) are removed first, then copied fresh — so a skill the package renamed or dropped does not linger, and a re-run is safe
- **It does not wait for any repository to be cloned.** `ai-agent-skills` is this repository's own devDependency, so it is ready as soon as `npm install` has run here
- **The copies are gitignored, and excluded from the root lint.** Both do it by ignoring the whole of `.claude/skills/` and naming this repository's own skills back in, one by one — an allowlist, not a name pattern, for the reason below. They are regenerated, not authored here

---

## No hora file names one of these skills

Not [`checkpoints.md`](../.claude/skills/hora-build/references/checkpoints.md), not [`stages.md`](../.claude/skills/hora-spec/references/stages.md), not an agent definition, not this page. **A skill's name belongs to the package, which is free to change it** — and a written-down name is the one kind of copy that fails silently.

```
the package renames a skill
       │
       ▼
Hora Kit    "delegate to <the name it used to have>"
       ↑
  matches nothing. The gate runs without its convention,
  and reports that it passed
```

**A stale procedure at least disagrees with the real thing the moment somebody reads both. A stale name disagrees with nothing.** It simply stops resolving — and every mechanism Hora Kit has for reporting a missing skill then turns a skipped convention into a one-line footnote under a passing run. That is the worst possible place for a failure to be quiet.

So the match is made at run time, against what is actually equipped:

| | |
|---|---|
| **a hora file** | **states the work** — "the CSS conventions this project uses", "how a background job is written" |
| **an equipped skill** | **states what it covers**, in its own `description:`, which the package updates along with the skill |
| **the main session** | **matches the two, and records what it picked** |

`checkpoints.md` and `stages.md` are still the authorities — on **what work each gate delegates**, never on which skill covers it.

### The match is the main session's, and it gets recorded

The main session is handed the equipped skills' descriptions as part of its own context, so it is the one place where the match can be made *and written down*. It records what it picked:

```markdown
- [x] 15. UI  <!-- skills: <every name matched> -->     ← .hora/tasks/<version>/<feature-id>.md
| review | <the names matched> | 2 findings |           ← .hora/acceptance/<version>/...
```

**An agent never picks its own.** It would pick differently on a rerun, and nothing downstream could say which set the first run actually used. Recording the choice is also what makes a package rename visible: last run matched five skills for a checkpoint, this one matched four.

### The prefix is the one part of a name worth reading

| Prefix | Applies to |
|---|---|
| `hb-` (hora-backend) | the backend repository |
| `hf-` (hora-frontend) | a frontend repository |
| `hc-` (hora-core) | either |

So which surface a skill serves is visible before anything else. **Everything after the prefix is a label, not a classification** — one skill in this package covers operation clients in the frontend app and another covers SDL for the backend server, and their names differ by no more than a word. **The description is the only thing that says which is which**, and matching on what a name sounds like is how the wrong one gets invoked.

This is also why the exclusion lists above are allowlists rather than `hb-*`/`hf-*`/`hc-*` patterns: a denylist that stops matching says nothing when it stops.

---

## What the package covers

**This is an orientation, not an inventory.** The authoritative list is whatever `.claude/skills/` holds after equipping:

```bash
ls .claude/skills/
```

And the authoritative statement of **what work** each checkpoint delegates is [`checkpoints.md`](../.claude/skills/hora-build/references/checkpoints.md); for a spec stage it is [`stages.md`](../.claude/skills/hora-spec/references/stages.md). **Neither is repeated here, deliberately** — a second copy of either would be exactly the drift this whole document is about.

### `hb-` — backend (renchan)

| Area | Covers |
|---|---|
| **Database** | logical schema design, migrations, models, seeders, named subqueries |
| **GraphQL** | SDL and per-audience schemas, the server engine, query / mutation / subscription resolvers, input validators, the shared `Share` container, **stub resolvers** |
| **REST** | the renderer architecture under `server/restfulapi/` |
| **Execution placement** | deciding whether work belongs in the request path, in a post-worker, or in a background job — then implementing it |
| **Types and constants** | `.d.ts` declaration files, and the two-file constant convention |
| **Integration** | external HTTP/REST API clients |
| **Design patterns** | the strategy trio that replaces an `else-if` chain |
| **AI features** | agent structure and loops, multi-LLM providers, light RAG, prompt document stores |
| **Security** | a read-only, repo-wide audit that produces findings and fixes nothing |
| **Testing** | where a test goes, how its run order is guaranteed, and the local E2E container stack |

### `hf-` — frontend (Furo / Nuxt)

| Area | Covers |
|---|---|
| **Framework** | Nuxt/Furo structure, environment variables, context patterns, utility modules as classes |
| **Components** | a family covering buttons, dialogs, tables, selects, tabs, toasts, steppers, editors and more — plus what must **not** be built |
| **Style** | CSS conventions, layers, units, custom properties, property order, `z-index`, margins, animation |
| **API clients** | GraphQL operations and generated types; the RESTful client trio |
| **Error handling** | mapping backend error codes to user-facing messages |
| **UI/UX** | the project context file, generating UI that is correct by construction, and auditing existing output |
| **Acceptance** | **the acceptance review**, and the durable end-to-end scenario specification |

### `hc-` — core (either surface)

| Area | Covers |
|---|---|
| **Coding conventions** | classes, members, declarations, modules, naming, scope, statements, async, errors, comments, JSDoc, contracts |
| **Requirements** | turning a rough request into a verifiable requirement document |
| **Progress** | keeping an in-flight implementation's state visible and truthful |
| **Testing** | writing Jest tests, and driving a suite to green **without weakening it** |
| **Git** | commit conventions |
| **Documentation** | READMEs, docs, licenses, and updating skills themselves |

---

## The ones Hora Kit leans on hardest

Four checkpoints are built around a single piece of the package. **They are listed by the work, not by a name** — the rule above applies to this page too.

| The work | Checkpoint | Why it shapes the design |
|---|---|---|
| **writing a stub API** | **4** | it is why the frontend gate does not wait for the real API. The stub shares a class name and interface with the real resolver, so checkpoint 16 is a change of endpoint, not a rewrite |
| **the security audit** | **8** | read-only by design, which is why that checkpoint runs in a **verifier** agent. Finding and fixing are separate acts |
| **building the local end-to-end environment** | **17** | acceptance is impossible without it, which is why it is a checkpoint of its own rather than a step inside 18 |
| **the acceptance review** | **18** | it holds every criterion acceptance passes or fails on. `/hora-accept` contributes scope, order and a record — nothing else |

Three more are close behind: **requirement definition** backs checkpoint 1, **the shared UI/UX project context** produces the file that both the UI generator and the UI auditor read, and **test execution** is the reason a failing suite is never "fixed" by loosening a test.

---

## When nothing covers the work

Matching against descriptions removes the rename problem, not the *dropped* one. A gate may state work that nothing equipped covers — the package removed that skill, narrowed it, or never had it.

**Say so, and continue without it. Do not substitute a guess.**

| | Why |
|---|---|
| work nothing covers | **report it by the work, not by a name.** A checkpoint that ran without its convention produced work nobody has checked against anything |
| improvising the missing procedure | **no.** That is the copy problem again, written fresh and with less care than the original |
| picking the nearest-sounding skill | **no.** That is what matching on descriptions exists to prevent. A near miss is worse than a gap, because it reports a pass |
| `/hora-accept` | records the gap in the run's own record. **A run with a step missing is not a pass with a footnote** — it is a partial run, and the record has to say so |

**A shrinking match count is the signal to watch.** Because every run records what it matched, a checkpoint that used to match five skills and now matches three says so in a diff — which is the thing a written-down name could never do.

---

## Where to go next

| | |
|---|---|
| the authoritative statement of what work each checkpoint delegates | [`checkpoints.md`](../.claude/skills/hora-build/references/checkpoints.md) |
| the boundary, stated as a rule | [`structure.md`](../.claude/skills/hora/references/structure.md), "The division of labor" and "No hora file ever names one of those skills" |
| why the design is shaped this way | [`architecture.md`](./architecture.md) |
| what each command does | [`commands.md`](./commands.md) |
