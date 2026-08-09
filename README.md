# hora-boilerplate

A template repository for building an application from a spec, driven by the `/hora` Claude Code skill.

## Concept

A project built from this template is made of several git repositories, nested inside one another. The outer repository (this one, cloned as `<myproject>-app`) holds the spec and the `/hora` skill; it holds no application code of its own. `/hora` clones the backend and frontend repositories inside it from `renchan-boilerplate` and `furo-boilerplate-nuxt`, reads the spec, and implements the application.

`/hora` is re-entrant: it decides where a run left off and continues from there, stopping to ask when the spec leaves something undecided. A single run is not expected to finish a whole project — it is started, and restarted, as many times as it takes.

The full procedure — every stage, every rule — lives in [`.claude/skills/hora/SKILL.md`](./.claude/skills/hora/SKILL.md). This README only covers getting started.

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

Write `specs/1.0.0/spec.md`, using [`references/spec-template.md`](./.claude/skills/hora/references/spec-template.md) as the template.

### 3. Run `/hora`

`/hora` fetches the boilerplates, extracts tasks from the spec, asks about anything left undecided, implements, and verifies by machine. It stops on its own whenever it needs an answer — edit `specs/` and run `/hora` again to continue.

## Continuous integration

The workflows under `.github/workflows/` run on a self-hosted runner labeled `light`, not GitHub's own `ubuntu-latest` — `<myproject>-app` is usually a private repository, and a GitHub-hosted runner would bill you for every run. **Register your own self-hosted runner with the `light` label** before opening pull requests, or these workflows stay queued and never run.

If that is not possible, do not change `runs-on` yourself — note it in `specs/<version>/spec.md` instead.

## Usage

```
Stage 0    Fetch the boilerplate and fill in the project's values
Stage 0.5  Read what was cloned, in place
Stage 1    Extract and structure tasks from the spec
Stage 1.5  Questions — stop for anything the spec leaves undecided
Stage 2    Implement the unfinished tasks
Stage 3    Verify by machine (test / lint)
```

See [`.claude/skills/hora/SKILL.md`](./.claude/skills/hora/SKILL.md) for what each stage actually does.

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
