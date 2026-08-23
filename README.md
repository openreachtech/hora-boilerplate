# hora-boilerplate

A template repository for building an application from a spec, driven by the `/hora` Claude Code skill.

## Concept

A project built from this template is made of several git repositories, nested inside one another. The outer repository (this one, cloned as `<myproject>-app`) holds the spec and the `/hora` skill; it holds no application code of its own. `/hora` clones the backend and frontend repositories inside it from `renchan-boilerplate` and `furo-boilerplate-nuxt`, reads the spec, and implements the application.

`/hora` is re-entrant: it decides where a run left off and continues from there, stopping to ask when the spec leaves something undecided. A single run is not expected to finish a whole project — it is started, and restarted, as many times as it takes.

**Work goes feature by feature, not layer by layer.** Each feature is taken through eighteen checkpoints — its spec, its backend, its frontend, then acceptance — and only once it has passed acceptance does the next feature start. The failure this avoids is building every backend task, then every frontend task, then testing, where the first time anyone finds out whether a feature *works* is after all of them are written.

This README only covers getting started. **The documentation is in [`docs/`](./docs/)** — how work gets executed, what each command does, the skills it runs on, and how to adopt the kit onto a project that already exists.

## Getting started

**Adopting this onto an existing renchan / furo project instead of starting fresh?** Go to [`docs/adopting.md`](./docs/adopting.md) — the steps differ from step 1 onward, and the first decision there is whether the implementation or the spec is the authority: **`as-built`** fixes what runs today as the version, with a handful of questions and one acceptance sweep; **`to-spec`** takes half-finished code the rest of the way toward the spec.

### 0. What you need

| | |
|---|---|
| **Claude Code** | the skills run there |
| **Node and npm** | for this repository's own `npm install`, which is what puts the skills in place. See [Requirements](#requirements) |
| **A POSIX shell** | the skills run shell commands and nest git repositories. Windows `cmd` and PowerShell are not equivalent. See [Recommended](#recommended) |
| **Access to the boilerplate repositories** | `renchan-boilerplate` and `furo-boilerplate-nuxt` are currently private, and a non-interactive session has no terminal to authenticate through. **Either configure credentials, or clone the repositories yourself before running `/hora`** — it handles a directory that already exists and moves on |
| **A runner for CI** | only before opening pull requests, and only while the repository is private — that is when the workflows ask for a self-hosted runner labeled `light`. A public one runs on GitHub-hosted runners with nothing to arrange. See [Continuous integration](#continuous-integration) |

#### Requirements

| Tool | Version |
| :-- | :-- |
| Node.js | >=20.19.0 |
| npm | >=10.0.0 |

**The floor comes from `nuxt`, not from the hora packages.** `nuxt` declares
`^20.19.0 || >=22.12.0`, which rules out 20.0 through 20.18 and 22.0 through 22.11; the three ORT
packages that declare a floor at all ask for 20 or newer.

#### Recommended

| Tool | Version |
| :-- | :-- |
| Node.js | the active LTS — 24.19.0 today |
| npm | whatever that Node bundles — 11.17.0 today |

**Follow CI.** The workflows resolve `node-version: lts/*`, so the active LTS is what this
repository is built against. Install Node through nvm rather than a system package manager, so the
version stays per-project.

**npm 11.6 is where `.npmrc` starts working.** Below it, `min-release-age = 7` is ignored without a
warning, and a package published minutes ago installs. Node 20 and 22 bundle npm 10; the active LTS
bundles 11.x.

**On Windows, work inside WSL 2 (Ubuntu).** macOS and Linux run the skills natively. `sqlite3` and
`mariadb` build from source, which on Windows needs a separate toolchain. Keep the project in the
Linux filesystem — `~/<myproject>-app`, not `/mnt/c/…` — because a Windows-mounted path is slower,
and a Node installed on the Windows side reaches the WSL `PATH`.

### 1. Create `<myproject>-app`

**Recommended: use this repository as a GitHub template.** Open this repository's GitHub page, click **Use this template → Create a new repository**, and name the new repository `<myproject>-app`. GitHub starts it with a single, fresh commit — none of this template's own commit history carries over.

**If you cannot use GitHub's template feature**, clone the repository and discard the cloned history yourself, before writing anything else in it:

```sh
git clone https://github.com/openreachtech/hora-boilerplate.git <myproject>-app
cd <myproject>-app
rm -rf .git
git init
npm install
```

Do this before writing `specs/` — once the repository holds commits of its own, discarding `.git` would take those with it too.

**Either way, run `npm install` in the new repository before `/hora`. Without it there is no `/hora` to run.** This repository carries no skill and no agent of its own: `/hora` and the five skills it orders come from [`@openreachtech/hora`](https://github.com/openreachtech/hora-core), the procedures they delegate to from [`@openreachtech/hora-skills`](https://github.com/openreachtech/hora-skills), and a `postinstall` hook places both into `.claude/`. A fresh clone has an empty `.claude/` until that has run.

The third package, `@openreachtech/hora-ecosystem`, is the catalog checkpoint 5 checks before anything is written new. It is never placed anywhere — it is read where npm put it.

### 2. Write the spec

```
/hora-spec
```

**`/hora-spec` writes it with you.** It reads whatever already exists at stage 0, copies the blank spec, and works through seven stages in conversation — the use cases first, then what the release will and will not carry, the numbers, the data model and the API, the screens, security, and a review of the whole thing. **Each section is shown to you in full and written only once you approve it**, and anything it thought of itself is marked as a proposal.

**On a project that already holds working code, you are not asked to dictate it.** Stage 0 reads the repositories and any document you point it at, drafts what they show, and puts it back for you to correct — **as a check, "I read it as this; is that right?", never as a requirement it decided.** What no reading can settle — who a feature is *for*, who *should* be allowed to call an operation, how much of it counts as finished — is asked outright, with the evidence laid out and nothing recommended. Answers come as choices wherever they can, so you correct far more than you compose.

**If you already have documents, drop them in before running this.** `specs/1.0.0/sources/` for anything that **is** the specification — requirements, an API reference — and `specs/1.0.0/annex/` for anything that only **explains** it — mockups, diagrams, an old design doc. Both ship empty, neither is required, and stage 0 confirms the split rather than asking you about each file. [`docs/adopting.md`](./docs/adopting.md), step 2, has the details.

**If all you have is what you want, put that in `specs/1.0.0/request/`** — a mail, a ticket, a page of bullets, in your own words. Stage 0 reads it as this version's agenda and the seven stages turn it into sections you approve one at a time. It ships empty too, nothing in it becomes spec text on its own, and `/hora-plan` never reads it.

Writing it by hand is still supported, and produces the same document:

```sh
cp specs/skeleton/spec.md specs/1.0.0/spec.md
```

[`specs/skeleton/spec.md`](./specs/skeleton/spec.md) is the blank spec — headings and table headers only. `specs/skeleton/` is not a version, so `/hora` never reads it as one.

[`spec-format.md`](./.claude/skills/hora/references/spec-format.md) explains the format: what each section is for, which ones are required, and what makes `/hora` stop and ask. **Read that one; fill in the other.**

### 3. Run `/hora`

`/hora` runs `/hora-spec` first if the version has no spec yet, then fetches the boilerplates, plans the version with you, and builds and accepts one feature at a time. It stops on its own whenever it needs an answer — the planner asks in conversation, and anything nobody can answer on the spot is written to `.hora/questions/` for you to settle by editing `specs/`.

**In normal use, `/hora` is the only command you type.** For what it is doing at each point, and for running one of the other skills directly, see [`docs/commands.md`](./docs/commands.md).

### Recommended: converse through the spec, let the implementation run

**`/hora-spec` is worth sitting through.** All seven of its stages are conversations, every section is shown in full and written only once you approve it, and what it proposes is where a spec stops being a list of feature names. Attention spent here is what the eighteen checkpoints later have something to build against.

**From `/hora` onwards, letting it run unattended is fine.** Fetching the boilerplates, planning, taking a feature through its checkpoints and running acceptance need nobody watching, and the design is what makes that safe: **a run that needs an answer stops instead of deciding.** The interactive checkpoints exist to settle things with a person, and a subagent is never handed one.

| | |
|---|---|
| `/hora-spec` | **be there.** Seven stages of conversation, approval per section |
| `/hora-plan` | **be there for the questions.** It asks about whatever the spec left undecided, and writes one approved edit at a time |
| `/hora-setup`, `/hora-build`, `/hora-accept` | **let them run.** They report what they did, and stop when they need you |

**Unattended does not mean unattended to the end.** A question nobody can answer on the spot is written to `.hora/questions/`, and answering it means editing `specs/` and running `/hora` again. That is the normal rhythm, not a failure.

## Continuous integration

**The workflows under `.github/workflows/` follow the repository's visibility** — a private repository runs them on a self-hosted runner labeled `light`, a public one on GitHub's `ubuntu-latest`. What the switch is for is the bill: a GitHub-hosted runner charges for every run on a private repository. `<myproject>-app` is usually private, so register a self-hosted runner with the `light` label before opening pull requests, or these workflows stay queued and never run.

**Nothing is hand-edited to choose between them, and overriding the choice is still yours to make.** All four workflows — `lint.yml`, `main-guard.yml`, `release.yml` and `fill-publish-version.yml` — carry the same expression, so pinning one to a GitHub-hosted runner whatever the visibility means replacing it:

```yaml
    # what all four carry
    runs-on: ${{ fromJSON(github.event.repository.private && '["self-hosted", "light"]' || '["ubuntu-latest"]') }}

    # pinned, whatever the repository's visibility
    runs-on: ubuntu-latest
```

Then note the decision in `specs/<version>/spec.md`, so that everyone — and every later `/hora` run — reads the same thing rather than inferring it from the workflow files.

## Usage

`/hora` is an orchestrator. Five skills do the work:

| Skill | Does | Runs |
|---|---|---|
| [`/hora-spec`](./.claude/skills/hora-spec/SKILL.md) | reads what already exists, then writes the version's spec with you through seven stages, one approved section at a time | once per version |
| [`/hora-setup`](./.claude/skills/hora-setup/SKILL.md) | fetches the boilerplates the spec declares, fills in the project's values, reads the real tree | once per version |
| [`/hora-plan`](./.claude/skills/hora-plan/SKILL.md) | fixes the version, verifies the spec with you in conversation, writes the feature list | once per version |
| [`/hora-build`](./.claude/skills/hora-build/SKILL.md) | takes one feature through the eighteen checkpoints | once per feature |
| [`/hora-accept`](./.claude/skills/hora-accept/SKILL.md) | runs acceptance over every feature implemented so far | at each feature's last checkpoint, and once as a whole-version sweep |

```
/hora-spec ─> /hora-setup ─> /hora-plan ──┬─> /hora-build #A ─> /hora-accept ─┐
                                          ├─> /hora-build #B ─> /hora-accept ─┤
                                          └─> /hora-build #C ─> /hora-accept ─┴─> sweep ─> merge
```

Stage 0 and the seven spec stages are in [`stages.md`](./.claude/skills/hora-spec/references/stages.md), what stage 0 may read in [`investigation.md`](./.claude/skills/hora-spec/references/investigation.md), how anything is put to you in [`asking.md`](./.claude/skills/hora/references/asking.md), and the thinking they apply — use cases first, a release that is not overloaded, roles or separate endpoints, synchronous work or a job, authorization stated per operation — in [`principles.md`](./.claude/skills/hora-spec/references/principles.md).

### Adding a feature after a version has shipped

**Everything above describes one version. A second version is the same five skills over a spec that is a diff.**

```sh
mkdir -p specs/1.1.0/request
$EDITOR specs/1.1.0/request/csv-export.md   # what you want, in your own words
```

```
/hora-spec       drafts specs/1.1.0/spec.md from it — a DIFF: document
                 information, and the new feature. Nothing else
/hora            the usual run, from there
```

**`specs/1.1.0/spec.md` is a diff against 1.0.0**, so only the sections this version changes are written; everything else carries over by being absent, and **1.0.0 is never rewritten**. **The blank spec is not copied into it** — that would land twenty empty headings in a document that needed one new feature.

**The stages do not make you re-agree to what shipped.** A stage whose section this version does not touch passes as a **carry-over**: the previous version's answer, quoted back and confirmed. **Stages 6 and 7 never carry over for anything you add** — every new operation states who may call it, and the whole-document review reads the resolved document rather than the diff.

**First decide whether you need a new version at all.** The line is not the size of the change but whether the version has been released — `git tag -l '1.0.0'` empty means you edit `specs/1.0.0/` and the number does not change. Once released, leave it alone and start the next one. [`docs/commands.md`](./docs/commands.md) has the whole procedure, including how the new number is chosen.

The eighteen checkpoints are in [`checkpoints.md`](./.claude/skills/hora-build/references/checkpoints.md) — spec, use cases, DB and API schemas, stub API, supporting modules, real API, worker, security audit, then the frontend, then acceptance.

**Hora Kit holds the order and the gates; it holds no procedure.** How to write a resolver, a migration, a component or a test — and what an acceptance review looks at — all come from [`@openreachtech/hora-skills`](https://github.com/openreachtech/hora-skills), equipped into this repository's own `.claude/skills/` by `npm install`. See [`docs/skills.md`](./docs/skills.md).

## Documentation

| | |
|---|---|
| [`docs/architecture.md`](./docs/architecture.md) | **how work gets executed,** in two parts and drawn out in figures. `/hora`: the four layers, what runs where and why, the state model, re-entrancy, the git model, and why it is serial. `/hora-spec`: reading what already exists, the seven stages, why every one of them is a conversation, and how approval works |
| [`docs/commands.md`](./docs/commands.md) | **what each command does.** Reads, writes, stops-when, and run-it-directly — plus what a session actually looks like |
| [`docs/skills.md`](./docs/skills.md) | **the skills it runs on.** Why Hora Kit holds no procedure, how the skills are equipped, and what the package covers |
| [`docs/adopting.md`](./docs/adopting.md) | **adopting the kit onto a project that already exists.** A renchan backend and a furo frontend that already hold working code |
| [`docs/stack/`](./docs/stack/README.md) | **the stack handbook.** Everything specific to this boilerplate's technology stack — the origin catalog, the middleware, what each API kind produces — read by the hora skills at run time |
| [`about-boilerplate.md`](./about-boilerplate.md) | **the template's own version marker** — which hora-boilerplate this project started from. Not the product's version; that lives in git tags |

The rules themselves live with the skill that owns each one: [`hora/SKILL.md`](./.claude/skills/hora/SKILL.md), [`structure.md`](./.claude/skills/hora/references/structure.md), [`commits.md`](./.claude/skills/hora/references/commits.md), [`done-criteria.md`](./.claude/skills/hora/references/done-criteria.md), [`spec-format.md`](./.claude/skills/hora/references/spec-format.md), [`stages.md`](./.claude/skills/hora-spec/references/stages.md), [`principles.md`](./.claude/skills/hora-spec/references/principles.md) and [`checkpoints.md`](./.claude/skills/hora-build/references/checkpoints.md).

## Contribution

**Bug reports and feature requests are welcome**, through GitHub Issues.

**Code contributions are not being taken for now.** A fix to the kit belongs
in the repository that holds it either way, and the last paragraph of this
section says which one that is.

What follows is for work done inside this repository.

```sh
git clone https://github.com/openreachtech/hora-boilerplate.git
cd hora-boilerplate
npm install
npm run lint
```

**Every file under `docs/` is a pair — `x.md` and `x.ja.md`.** Change one and change the other in the same commit. Two documents saying the same thing will disagree the moment only one of them is updated, and the stale one still reads as authoritative.

**Nothing under `.claude/` is edited here.** It is installed by `npm install`, and the next one overwrites whatever you changed. A fix to a hora skill or an agent belongs in [`hora-core`](https://github.com/openreachtech/hora-core), and one to a procedure they delegate to in [`hora-skills`](https://github.com/openreachtech/hora-skills) — both English only, since Claude Code reads them rather than a person choosing a language. [`docs/writing-style.md`](./docs/writing-style.md) is the style they are held to.

## License

This project is released under the Apache License 2.0.

For more details, please see [in the LICENSE file](./LICENSE).

## Developer

[Open Reach Tech Inc.](https://openreach.tech)

## Copyright

© 2026 Open Reach Tech Inc.
