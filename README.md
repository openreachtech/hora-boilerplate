# hora-boilerplate

A template repository for building an application from a spec, driven by the `/hora` Claude Code skill.

## Concept

A project built from this template is made of several git repositories, nested inside one another. The outer repository (this one, cloned as `<myproject>-app`) holds the spec and the `/hora` skill; it holds no application code of its own. `/hora` clones the backend and frontend repositories inside it from `renchan-boilerplate` and `furo-boilerplate-nuxt`, reads the spec, and implements the application.

`/hora` is re-entrant: it decides where a run left off and continues from there, stopping to ask when the spec leaves something undecided. A single run is not expected to finish a whole project — it is started, and restarted, as many times as it takes.

**Work goes feature by feature, not layer by layer.** Each feature is taken through eighteen checkpoints — its spec, its backend, its frontend, then acceptance — and only once it has passed acceptance does the next feature start. The failure this avoids is building every backend task, then every frontend task, then testing, where the first time anyone finds out whether a feature *works* is after all of them are written.

The full procedure — every phase, every rule — lives in [`.claude/skills/hora/SKILL.md`](./.claude/skills/hora/SKILL.md). This README only covers getting started.

## Getting started

### 1. Create `<myproject>-app`

**Recommended: use this repository as a GitHub template.** Open this repository's GitHub page, click **Use this template → Create a new repository**, and name the new repository `<myproject>-app`. GitHub starts it with a single, fresh commit — none of this template's own commit history carries over.

**If you cannot use GitHub's template feature**, clone the repository and discard the cloned history yourself, before writing anything else in it:

```sh
git clone https://github.com/openreachtech/hora-boilerplate.git <myproject>-app
cd <myproject>-app
rm -rf .git
git init
```

Do this before writing `specs/` — once the repository holds commits of its own, discarding `.git` would take those with it too.

### 2. Write the spec

Copy [`spec-skeleton.md`](./.claude/skills/hora/references/spec-skeleton.md) to `specs/1.0.0/spec.md` and fill it in — it is the blank spec, headings and table headers only.

[`spec-template.md`](./.claude/skills/hora/references/spec-template.md) sits next to it and explains the format: what each section is for, which ones are required, and what makes `/hora` stop and ask. Read that one; fill in the other.

### 3. Run `/hora`

`/hora` fetches the boilerplates, plans the version with you, then builds and accepts one feature at a time. It stops on its own whenever it needs an answer — the planner asks in conversation, and anything nobody can answer on the spot is written to `.hora/questions/` for you to settle by editing `specs/`.

## Continuous integration

The workflows under `.github/workflows/` run on a self-hosted runner labeled `light`, not GitHub's own `ubuntu-latest` — `<myproject>-app` is usually a private repository, and a GitHub-hosted runner would bill you for every run. **Register your own self-hosted runner with the `light` label** before opening pull requests, or these workflows stay queued and never run.

If that is not possible, do not change `runs-on` yourself — note it in `specs/<version>/spec.md` instead.

## Usage

`/hora` is an orchestrator. Four skills do the work:

| Skill | Does | Runs |
|---|---|---|
| [`/hora-setup`](./.claude/skills/hora-setup/SKILL.md) | fetches the boilerplates the spec declares, fills in the project's values, reads the real tree | once per version |
| [`/hora-plan`](./.claude/skills/hora-plan/SKILL.md) | fixes the version, verifies the spec with you in conversation, writes the feature list | once per version |
| [`/hora-build`](./.claude/skills/hora-build/SKILL.md) | takes one feature through the eighteen checkpoints | once per feature |
| [`/hora-accept`](./.claude/skills/hora-accept/SKILL.md) | runs acceptance over every feature implemented so far | at each feature's last checkpoint, and once as a whole-version sweep |

```
/hora-setup ──> /hora-plan ──┬─> /hora-build #A ─> /hora-accept ─┐
                             ├─> /hora-build #B ─> /hora-accept ─┤
                             └─> /hora-build #C ─> /hora-accept ─┴─> sweep ─> merge
```

The eighteen checkpoints are in [`checkpoints.md`](./.claude/skills/hora-build/references/checkpoints.md) — spec, use cases, DB and API schemas, stub API, supporting modules, real API, worker, security audit, then the frontend, then acceptance.

**Hora Kit holds the order and the gates; it holds no procedure.** How to write a resolver, a migration, a component or a test — and what an acceptance review looks at — all come from [`@openreachtech/ai-agent-skills`](https://github.com/openreachtech/ai-agent-skills), which `/hora-setup` equips into this repository's own `.claude/skills/`.

## Contribution

Bug reports, feature requests, and code contributions are welcome.

Feel free to contact us through GitHub Issues.

```sh
git clone https://github.com/openreachtech/hora-boilerplate.git
cd hora-boilerplate
npm install
npm run lint
```

## License

This project is released under the Apache License 2.0.

For more details, please see [in the LICENSE file](./LICENSE).

## Developer

[Open Reach Tech Inc.](https://openreach.tech)

## Copyright

© 2026 Open Reach Tech Inc.
