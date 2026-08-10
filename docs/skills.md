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

> **Never write a procedure, a convention or a pass/fail criterion into a hora skill when a skill in `ai-agent-skills` already holds it. Delegate to it by name instead.**

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

- **It runs on every `/hora-setup` invocation**, because the package may have been updated since the last one. It is a plain copy, safe to re-run
- **It does not wait for any repository to be cloned.** `ai-agent-skills` is this repository's own devDependency, so it is ready as soon as `npm install` has run here
- **The copies are gitignored** (`.claude/skills/backend-*/`, `frontend-*/`, `core-*/`). They are regenerated, not authored here — nothing about them belongs in this repository's history

---

## Names carry a hash. Match by prefix

The package ships each skill in a directory whose name ends in a content hash:

```
backend-renchan-stub-api-1c0186b5eae9
frontend-acceptance-review-1340e28a90b1
core-requirement-definition-92eb3e22b2cd
```

`equip-skills.sh` copies that name unchanged, so the invocable skill name carries the hash too.

**The hash changes when the package is updated. The prefix does not.** Every reference in Hora Kit is therefore written as a prefix, and resolved by listing `.claude/skills/` and taking the one entry that starts with it.

```
written in Hora Kit    backend-renchan-stub-api
resolved to            backend-renchan-stub-api-1c0186b5eae9
```

**Never write a full name with its hash into anything.** It is correct until the next release of the package, and wrong silently afterwards.

### The prefix already tells you the surface

| Prefix | Applies to | Roughly |
|---|---|---|
| `backend-renchan-*` | the backend repository | renchan conventions — models, resolvers, workers, migrations |
| `frontend-*` | a frontend repository | furo/Nuxt conventions — components, CSS, clients, UI/UX, acceptance |
| `core-*` | either | language-level conventions, git, tests, documentation, requirements |

So which one applies to the row you are working in is visible from the name alone, before reading anything.

---

## What the package covers

**This is an orientation, not an inventory.** The authoritative list is whatever `.claude/skills/` holds after equipping:

```bash
ls .claude/skills/ | grep -E '^(backend|frontend|core)-'
```

And the authoritative mapping from a checkpoint to the skills it delegates to is [`checkpoints.md`](../.claude/skills/hora-build/references/checkpoints.md). **It is deliberately not repeated here** — a second copy of that table would be exactly the drift this whole document is about.

### `backend-renchan-*`

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

### `frontend-*`

| Area | Covers |
|---|---|
| **Framework** | Nuxt/Furo structure, environment variables, context patterns, utility modules as classes |
| **Components** | a family covering buttons, dialogs, tables, selects, tabs, toasts, steppers, editors and more — plus what must **not** be built |
| **Style** | CSS conventions, layers, units, custom properties, property order, `z-index`, margins, animation |
| **API clients** | GraphQL operations and generated types; the RESTful client trio |
| **Error handling** | mapping backend error codes to user-facing messages |
| **UI/UX** | the project context file, generating UI that is correct by construction, and auditing existing output |
| **Acceptance** | **the acceptance review**, and the durable end-to-end scenario specification |

### `core-*`

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

Four are worth knowing by name, because a checkpoint is built around each.

| Skill | Checkpoint | Why it shapes the design |
|---|---|---|
| `backend-renchan-stub-api` | **4** | it is why the frontend gate does not wait for the real API. The stub shares a class name and interface with the real resolver, so checkpoint 16 is a change of endpoint, not a rewrite |
| `backend-renchan-security-audit` | **8** | read-only by design, which is why that checkpoint runs in a **verifier** agent with no write tools. Finding and fixing are separate acts |
| `backend-renchan-build-e2e-test-environment` | **17** | acceptance is impossible without it, which is why it is a checkpoint of its own rather than a step inside 18 |
| `frontend-acceptance-review` | **18** | it holds every criterion acceptance passes or fails on. `/hora-accept` contributes scope, order and a record — nothing else |

`core-requirement-definition`, `frontend-uiux-context` and `core-test-execution` are close behind: the first backs checkpoint 1, the second produces the context file that both the UI generator and the UI auditor read, and the third is the reason a failing suite is never "fixed" by loosening a test.

---

## When a skill is missing

A prefix may resolve to nothing — the package renamed it, dropped it, or has not been equipped yet.

**Say so, and continue without it. Do not substitute a guess.**

| | Why |
|---|---|
| a named skill that cannot be found | **report it by name.** A checkpoint that ran without its convention produced work nobody has checked against anything |
| improvising the missing procedure | **no.** That is the copy problem again, written fresh and with less care than the original |
| `/hora-setup` | reports at equip time what a later checkpoint will look for and not find — better known then than at the moment it is needed |
| `/hora-accept` | records the gap in the run's own record. **A run with a step missing is not a pass with a footnote** — it is a partial run, and the record has to say so |

---

## Where to go next

| | |
|---|---|
| the authoritative checkpoint → skill map | [`checkpoints.md`](../.claude/skills/hora-build/references/checkpoints.md) |
| the boundary, stated as a rule | [`structure.md`](../.claude/skills/hora/references/structure.md), "The division of labor" |
| why the design is shaped this way | [`architecture.md`](./architecture.md) |
| what each command does | [`commands.md`](./commands.md) |
