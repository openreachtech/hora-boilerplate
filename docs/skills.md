<!-- 日本語版: [skills.ja.md](./skills.ja.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# The skills Hora Kit runs on

*[日本語](./skills.ja.md)*

Hora Kit holds the order and the gates. **Every procedure, and every pass/fail criterion, comes from somewhere else** — the four skill packages: [`hora-skills-ort-core`](https://github.com/openreachtech/hora-skills-ort-core), [`hora-skills-ort-renchan`](https://github.com/openreachtech/hora-skills-ort-renchan), [`hora-skills-ort-furo`](https://github.com/openreachtech/hora-skills-ort-furo) and [`hora-skills-ort-support`](https://github.com/openreachtech/hora-skills-ort-support), one per domain.

This document is about that boundary: why it exists, how the skills reach the session, how they are referred to, and what happens when one is missing.

---

## Contents

- [Why Hora Kit holds no procedure](#why-hora-kit-holds-no-procedure)
- [How the skills reach the session](#how-the-skills-reach-the-session)
- [No hora file names one of these skills](#no-hora-file-names-one-of-these-skills)
- [What the packages cover](#what-the-packages-cover)
- [The ones Hora Kit leans on hardest](#the-ones-hora-kit-leans-on-hardest)
- [When nothing covers the work](#when-nothing-covers-the-work)
- [Where to go next](#where-to-go-next)

---

## Why Hora Kit holds no procedure

Two documents describing the same convention will disagree. **The question is only when, and whether anybody notices.**

```
hora-skills-ort-* "a stub resolver lives under server/graphql/resolvers/<audience>/stub/"
                       │
                       │  the package is updated. The path changes.
                       ▼
Hora Kit          "a stub resolver lives under server/graphql/resolvers/<audience>/stub/"
                       ↑
                  still there, still confident, now wrong
```

**The copy does not announce that it went stale.** It reads exactly as authoritative as it did the day it was written, and an agent following it produces work that is confidently in the wrong place.

So Hora Kit's rule is absolute:

> **Never write a procedure, a convention or a pass/fail criterion into a hora skill when a skill in the `hora-skills-ort-*` packages already holds it. State the work and delegate it.**

This is the same reasoning `/hora-setup` already applies to the boilerplates: **read the real thing; do not bake in what it currently says.** The package is the real thing here.

### What that leaves each side owning

| | Owns | Example |
|---|---|---|
| **Hora Kit** | when something happens, and what must be true before the next thing may | *"Checkpoint 4 passes when a schema-accurate stub exists for every operation this feature adds"* |
| **the `hora-skills-ort-*` packages** | how to do it, and what counts as done properly | *"a stub lives under `stub/{queries,mutations}/`, mirrors the schema, holds no DB access, and shares its class name with the real resolver"* |

**The two sentences do not overlap.** That is the test: if a line in Hora Kit could be checked against the package and found to disagree, it does not belong in Hora Kit.

---

## How the skills reach the session

Claude Code discovers skills only in the session's own `.claude/skills/`. A package's skills live under `node_modules/`, which is not that path — so without a copying step, **everything the packages ship stays invisible.**

`npm install` runs the copy, through this repository's own `postinstall`:

```json
"hora:init": "hora-core install && hora-skills-ort-core install && hora-skills-ort-renchan install && hora-skills-ort-furo install && hora-skills-ort-support install && node kit/scripts/equip-own-skills.mjs",
"postinstall": "npm run hora:init"
```

```
node_modules/@openreachtech/hora/dist/agents/<agent>.md   ─>  .claude/agents/<agent>.md
node_modules/@openreachtech/hora/dist/skills/<skill>/     ─>  .claude/skills/<skill>/
node_modules/@openreachtech/hora-skills-ort-core/dist/skills/<skill>/     ─>  .claude/skills/<skill>/
node_modules/@openreachtech/hora-skills-ort-renchan/dist/skills/<skill>/  ─>  .claude/skills/<skill>/
node_modules/@openreachtech/hora-skills-ort-furo/dist/skills/<skill>/     ─>  .claude/skills/<skill>/
node_modules/@openreachtech/hora-skills-ort-support/dist/skills/<skill>/  ─>  .claude/skills/<skill>/
                          straight copy, no renaming, no rewriting
```

- Four packages, two payloads, one destination. `@openreachtech/hora` carries the hora skills and the agents — `/hora` itself is one of them — and the four `hora-skills-ort-*` packages carry the procedures they delegate to, one package per domain. They land side by side in one flat `.claude/skills/`, which is what the `hoc-`/`hor-`/`hof-`/`hos-` prefix is for
- **`npm install` alone is enough**, and a plain `npm install` with no arguments re-runs the hook, so an updated package follows along. Naming a package on the command line does not, so `npm run hora:init` re-equips on demand
- **Each command is repeatable.** It removes what its own previous run installed — recorded in `.hora/equip-core.json` for `hora-core`, and in `.hora/<package name>.json` for each of the four skill packages — along with anything named after an entry it distributes, before copying fresh. A skill a package renamed or dropped does not linger as a match candidate, and a skill your own repository authored is left alone
- **It does not wait for any repository to be cloned.** All four packages are this repository's own devDependencies, so they are ready as soon as `npm install` has run here
- **The copies are gitignored, and excluded from the root lint.** Both do it by ignoring the whole of `.claude/agents/` and `.claude/skills/` rather than by a name pattern, for the reason below, and neither names anything back in: the one skill this repository authors is kept at `kit/skills/`, and the hook places a copy of it here like any other. They are regenerated, not authored here

Those four are equipped. One more package is read where it lies: **`@openreachtech/hora-ecosystem`** — also a devDependency here — the catalog of in-house packages that checkpoint 5 checks before anything is written new. It is never equipped anywhere: it is read in place under `node_modules/`, and its layout is its own to change ([`checkpoints.md`](https://github.com/openreachtech/hora-core/blob/main/kit/skills/hora-build/references/checkpoints.md), checkpoint 5).

---

## No hora file names one of these skills

Not [`checkpoints.md`](https://github.com/openreachtech/hora-core/blob/main/kit/skills/hora-build/references/checkpoints.md), not [`stages.md`](https://github.com/openreachtech/hora-core/blob/main/kit/skills/hora-spec/references/stages.md), not an agent definition, not this page. **A skill's name belongs to the package, which is free to change it** — and a written-down name is the one kind of copy that fails silently.

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
- [x] 15. UI  <!-- skills: <every name matched>; digests: <package version> -->
                                                       ← .hora/tasks/<version>/<feature-id>.md
| review | <the names matched> | 2 findings |           ← .hora/acceptance/<version>/...
```

**An agent never picks its own.** It would pick differently on a rerun, and nothing downstream could say which set the first run actually used. Recording the choice is also what makes a package rename visible: last run matched five skills for a checkpoint, this one matched four.

### What reaches the agent is a digest, not the skill

**A matched skill runs to thousands of lines, and it stays resident for every turn the agent reading it takes.** A checkpoint's cost is close to that resident size multiplied by its turn count, so what `/hora-build` hands an implementer is `.hora/digests/<skill-name>.md` — the same conventions in short form, written by [`hora-digester`](https://github.com/openreachtech/hora-core/blob/main/kit/agents/hora-digester.md) the first time a matched skill has no digest at the installed package version. That is also why the record above names the version the digests came from, beside the names themselves.

**A digest is a copy, and it is the one copy the rule this page opens with admits.** What makes a copy dangerous is that it goes stale in silence. A digest carries the package version it was derived from in its own header, so it is read only while that version is installed — and a package update leaves every digest to be rewritten before any of them is read again. It reduces what an agent holds resident, and it decides nothing.

**When the two disagree, the skill's own text is what settles it.** A digest names the file it came from, and the agent opens that file the moment a question stays open — where the digest is thin, where it points there, or where the work is not obviously the thing it describes. So a convention a digest states too briefly costs one read; it is not a convention lost.

**Nothing whose skill *is* the criteria is read this way.** The security audit at checkpoint 8 and the acceptance review invoke their skills whole, because an agent writing code has a moment where the short form announces its own gap and an audit does not: the missing check is the one nobody thinks to ask about. **A summarized check list is a shorter check list, and it reports a pass.** ([`structure.md`](https://github.com/openreachtech/hora-core/blob/main/kit/skills/hora/references/structure.md), "How the match is made")

### The prefix is the one part of a name worth reading

| Prefix | Domain | Applies to |
|---|---|---|
| `hor-` | `backend` | the backend repository |
| `hof-` | `frontend` | a frontend repository |
| `hoc-` | `core` | either |
| `hos-` | `support` | neither surface — the work that surrounds the code |

Each domain is a package of its own — `hora-skills-ort-core`, `hora-skills-ort-renchan`, `hora-skills-ort-furo`, `hora-skills-ort-support` — so **a repository selects domains by selecting packages.** A project with no frontend leaves `-ort-furo` out of its devDependencies and out of `hora:init`; there is no option to pass and nothing to declare in package.json. Each package installs only its own payload and removes only what its own record names, so leaving one out later takes its skills with it and touches none of the others.

**`hoc-` is the `core` domain, not the `hora-core` command.** Both names are in play here and they name different things: `hora-core` installs `@openreachtech/hora`, which distributes no `hoc-` skill at all — every `hoc-` skill comes from `hora-skills-ort-core`.

So which surface a skill serves is visible before anything else. **Everything after the prefix is a label, not a classification** — one skill covers operation clients in the frontend app and another covers SDL for the backend server, and their names differ by no more than a word. **The description is the only thing that says which is which**, and matching on what a name sounds like is how the wrong one gets invoked.

This is also why the exclusion lists above are allowlists rather than `hor-*`/`hof-*`/`hoc-*` patterns: a denylist that stops matching says nothing when it stops.

---

## What the packages cover

**This is an orientation, not an inventory.** The authoritative list is whatever `.claude/skills/` holds after equipping:

```bash
ls .claude/skills/
```

And the authoritative statement of **what work** each checkpoint delegates is [`checkpoints.md`](https://github.com/openreachtech/hora-core/blob/main/kit/skills/hora-build/references/checkpoints.md); for a spec stage it is [`stages.md`](https://github.com/openreachtech/hora-core/blob/main/kit/skills/hora-spec/references/stages.md). **Neither is repeated here, deliberately** — a second copy of either would be exactly the drift this whole document is about.

### `hor-` — backend (renchan)

| Area | Covers |
|---|---|
| **Database** | logical schema design, migrations, models, seeders, named subqueries |
| **GraphQL** | SDL and per-audience schemas, the server engine, query / mutation / subscription resolvers, input validators, the shared resolver container, **stub resolvers** |
| **REST** | the RESTful renderer architecture |
| **Execution placement** | deciding whether work belongs in the request path, in a post-worker, or in a background job — then implementing it |
| **Types and constants** | `.d.ts` declaration files, and the constant convention |
| **Integration** | external HTTP/REST API clients |
| **Design patterns** | the strategy trio that replaces an `else-if` chain |
| **AI features** | agent structure and loops, multi-LLM providers, light RAG, prompt document stores |
| **Security** | a read-only, repo-wide audit that produces findings and fixes nothing |
| **Testing** | where a test goes, how its run order is guaranteed, and the local E2E container stack |

### `hof-` — frontend (Furo / Nuxt)

| Area | Covers |
|---|---|
| **Framework** | Nuxt/Furo structure, environment variables, context patterns, utility modules as classes |
| **Components** | a family covering buttons, dialogs, tables, selects, tabs, toasts, steppers, editors and more — plus what must **not** be built |
| **Style** | CSS conventions, layers, units, custom properties, property order, `z-index`, margins, animation |
| **API clients** | GraphQL operations and generated types; the RESTful client trio |
| **Error handling** | mapping backend error codes to user-facing messages |
| **UI/UX** | the project context file, generating UI that is correct by construction, and auditing existing output |
| **Acceptance** | **the acceptance review**, and the durable end-to-end scenario specification |

### `hoc-` — core (either surface)

| Area | Covers |
|---|---|
| **Coding conventions** | classes, members, declarations, modules, naming, scope, statements, async, errors, comments, JSDoc, contracts |
| **Requirements** | turning a rough request into a verifiable requirement document |
| **Progress** | keeping an in-flight implementation's state visible and truthful |
| **Testing** | writing Jest tests, and driving a suite to green **without weakening it** |
| **Git** | commit conventions |
| **Documentation** | READMEs, docs, licenses, and updating skills themselves |

### `hos-` — support (around the code)

| Area | Covers |
|---|---|
| **Explanation** | rewriting an answer an AI already gave into plain language with diagrams, for a reader who did not follow the thread |
| **User manuals** | walking a running environment feature by feature, and writing the HTML manual its users read, bound to the product version |
| **Skills** | turning a settled conversation into a skill, and handing its naming and layout to the skill-writing convention |

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
| the authoritative statement of what work each checkpoint delegates | [`checkpoints.md`](https://github.com/openreachtech/hora-core/blob/main/kit/skills/hora-build/references/checkpoints.md) |
| the boundary, stated as a rule | [`structure.md`](https://github.com/openreachtech/hora-core/blob/main/kit/skills/hora/references/structure.md), "The division of labor" and "No hora file ever names one of those skills" |
| why the design is shaped this way | [`architecture.md`](./architecture.md) |
| what each command does | [`commands.md`](https://github.com/openreachtech/hora-core/blob/main/docs/commands.md) in `hora-core` |
