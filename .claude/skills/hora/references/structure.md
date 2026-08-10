# What every hora skill assumes

`/hora`, `/hora-setup`, `/hora-plan`, `/hora-build` and `/hora-accept` all stand on what is written here. **It is written once, in this file, and read by all of them** — copy any of it into a skill and the copy is what goes stale.

---

## The division of labor

**Hora Kit owns the order and the gates. It does not own how anything is built, or what counts as a pass.**

| | Who owns it | Where it lives |
|---|---|---|
| which phase runs next, and when a project is ready for it | Hora Kit | `/hora` |
| which repositories exist, and what fills them | Hora Kit | `/hora-setup` |
| which version is being built, and which features it holds | Hora Kit | `/hora-plan` |
| **the order of the checkpoints, and each one's exit condition** | Hora Kit | `/hora-build` |
| **how to write a resolver, a migration, a component, a test** | **`@openreachtech/ai-agent-skills`** | that package's own skills |
| **what an acceptance review looks at, and what it fails on** | **`@openreachtech/ai-agent-skills`** | `hf-acceptance-review` and its neighbours |

**Never write a procedure, a convention or a pass/fail criterion into a hora skill when a skill in `ai-agent-skills` already holds it.** Delegate to it by name instead. A copy disagrees with the original the first time the package is updated, and nothing announces that it has — the copy still reads as authoritative.

This is the same reasoning `/hora-setup` already applies to the boilerplates: **read the real thing; do not bake in what it currently says.** The package is the real thing here.

### Invoking one of those skills

`/hora-setup` runs `.claude/skills/hora-setup/scripts/equip-skills.sh`, which copies every skill the package ships into this repository's own `.claude/skills/`. From then on they are invocable through the ordinary `Skill` tool, like any other.

**Use the name exactly as it is written here.** Each skill declares a `name:` in its own frontmatter, and the package's flatten build makes that the directory name under `dist/skills/`, which `equip-skills.sh` copies unchanged. There is nothing to resolve and no wildcard to expand: `hb-stub-api`, `hf-acceptance-review`, `hc-requirement-definition`.

If nothing under `.claude/skills/` matches a name a checkpoint gave you, **say so and continue without it.** The package may have renamed or dropped that skill; guessing at a replacement is worse than proceeding and reporting the gap.

**The prefix says which surface a skill serves.**

| Prefix | Applies to |
|---|---|
| `hb-` (hora-backend) | the backend repository |
| `hf-` (hora-frontend) | a frontend repository |
| `hc-` (hora-core) | either |

**The prefix is the only part worth reading.** What follows it is a label, not a classification — `hf-graphql` is a Furo client and `hb-graphql-schema` is renchan SDL, and nothing but the prefix separates them. **What decides which skill applies is the checkpoint that names it**; `checkpoints.md` is the only authority on that, and choosing one because its name sounds relevant is how the wrong one gets invoked.

---

## The structure this assumes

One project is made of several git repositories. The outer one is the hora repository, and the implementation repositories are nested inside it. **Every hora skill runs at the outer root.**

```
myproject-app/                     ← cwd. Holds specs/, .hora/ and .claude/. Holds no application code
  myproject-backend/               ← from renchan. Contains several servers. Is gitignored
  myproject-frontend-employee/     ← from furo
  myproject-frontend-admin/        ← from furo
```

**The spec declares the layout. No hora skill may assume one.**

- **One backend repository.** Keep `one DB system = one repository`. **If a second one is declared, that is outside the policy, so stop and ask** (`blocking: yes`)
- **One backend holds several servers.** An employee GraphQL server, an admin GraphQL server, a REST-API, a JSON-RPC and a Worker can live side by side in separate folders (this is renchan-core's design). **An API server and a Worker server that share a DB also belong in one repository**
- **Frontends do not come in pairs, and there may be several.** Some projects only need an API for a phone app. **furo cannot hold more than one Nuxt app per repository**, so repositories split along groups of screens. One backend against several frontends comes from this asymmetry
- **Names read `<myproject>-<role>-<purpose>`.** It is `myproject-frontend-admin`, not `myproject-admin-frontend`. Putting the role first keeps repositories of the same role adjacent and makes `app` → `backend` → `frontend-*` the order of implementation (verified to be locale-independent)
- **A repository that already existed before Hora Kit rarely follows that name, and is not renamed to.** The layout declaration's optional `Directory` column says where such a row actually sits, and `/hora-setup` looks there instead. **The name in the `Repository` column is still what `target` is derived from**, so a directory is only ever a place on disk — nothing in `.hora/` depends on it
- **More arrive in later versions.** A project starts with an API for a phone app and gains an admin screen later

The `myproject` part is the project name. **Use the name written in the spec. Do not derive it mechanically from the directory name.** Glued onto `<role>-<purpose>` like this, call it the **project prefix** — the two terms name the same value, but "project prefix" is the word for this specific, repository-naming role.

The nesting is not git's requirement but Claude Code's: a session cannot write outside its cwd.

---

## Where a per-repository command runs

Every hora skill runs at the outer root, but **every command that acts on a repository runs with that repository as its working directory**, as one command, with paths relative to it:

```
cd myproject-backend && npx eslint app/... server/...
```

**This is a rule about commands in general, not a list of three.** `npx eslint`, `npx jest` and `npm` are only the ones met most often. What decides it is whether the command reads or writes anything that belongs to a repository — its config (`eslint.config.js`, `jest.config.js`, `pm2.config.cjs`, `jsconfig.json`), its `package.json` and `node_modules/`, its `.env.development` and `docker-compose.development.yml`, its migrations, seeders and generated output, its own git history, its own source. If it does, it runs from inside that repository, whether or not it is named here. **`/hora-setup` reads the real tree**, and whatever it turns up there — `./docker.sh`, a `test.sh`, a `db:*` npm script, an `e2e/docker/` stack, anything else that boilerplate ships at its own current tag — is covered from the moment it is found, with nothing to add to a list first.

**`git -C <repository>` is this same rule spelled with git's own option**, and is the form these skills use throughout. An option counts only where it genuinely relocates the working directory the way `cd` does; one that merely points at a single file does not (`--config`, below).

**The reverse direction holds too.** A command that belongs to the hora repository itself — `npm run lint` at the root — runs at the root, never from inside a declared row. What must not happen is a command reaching across the boundary in either direction (`done-criteria.md` gives the reason a cross-repository script must not be written into the parent either).

**A wrong working directory does not reliably announce itself. That is what makes this worth a rule of its own.**

| Run from the outer root | What actually happens |
|---|---|
| `npx eslint …` | **passes, having read nothing** (below) |
| `npm install <package>` | **succeeds against the wrong repository.** The dependency lands in `myproject-app`'s own `package.json`, where nothing imports it |
| `npx jest …` | fails loudly — a repository's `jest.config.js` is not the root's |

Only the last one says so. **Run lint from the outer root and it passes every time, having read nothing.** The outer root holds no application code, so its own `eslint.config.js` ignores `*-backend*/` and `*-frontend*/` — each repository lints itself, under its own config. Every implementation file therefore matches an ignore pattern: eslint prints `File ignored because of a matching ignore pattern`, exits `0`, and a check that never ran is indistinguishable from one that passed. Nothing fails, so nothing says so. One rule avoids all three.

**`--config <repository>/eslint.config.js` from the root is not a substitute.** It does load the right rules, but that config's own relative `ignores` then resolve against the root instead of the repository, so files the repository excludes get linted anyway.

---

## Invariants

These three must not be broken.

### 1. Ownership is split

| Directory | Who writes | What a hora skill may do |
|---|---|---|
| `specs/` | humans | **read only, with one exception: `/hora-plan`, and only with the author's approval, one edit at a time** (below) |
| `.hora/` | hora skills | write (humans read only) |

**`/hora-plan` is the single exception, and it is narrow.** Planning is a conversation with whoever wrote the spec, and asking that person to hand-edit twenty separate holes one at a time defeats the point of having the conversation. So the planner may write into `specs/` — but only ever like this:

```
1. state the hole or contradiction found
2. propose the exact edit, in full
3. wait for that person to approve THAT edit
4. write it
```

**Approval is per edit, never blanket.** "Yes, fix them all" is not approval of edits nobody has read yet; go back to step 2 for each one. And what is being protected here is not the act of writing — it is that **no requirement ever enters `specs/` without a human having read the exact words first.** A planner that writes an unapproved edit has invented a requirement, which is invariant 2.

**`specs/skeleton/spec.md` is human territory too, and is not a version.** It is the blank spec a human copies to `specs/<version>/spec.md`. `/hora` reads only the directories under `specs/` whose name is a semver version, so the skeleton is never planned, implemented, or counted as unfinished — and no hora skill ever does the copying.

**Every other skill — `/hora-setup`, `/hora-build`, `/hora-accept`, and every agent any of them starts — is strictly read-only on `specs/`.** On finding a problem there, they report it; they never fix it. A typo and a broken layout are treated the same. Allow "it is minor, I will just fix it" once and the rule is gone.

### 2. The boundary of inference

| | Example | Treatment |
|---|---|---|
| Classifying | `target` / `depends` | **May be inferred.** It only attaches a label, it adds no information |
| Filling in content | requirements / use cases / acceptance criteria / implementation scope / **which kind an API operation is** / **how far a feature was already built (`built`)** / how existing assets are used | **Must not be inferred.** It would mean inventing what the spec does not say |
| **A permanent identifier** | **`id`** | **Must not be invented.** Derive it only where it can be derived (`/hora-plan`) |

**`id` is not `target`.** Getting `target` wrong only changes which checkpoints apply, but `id` is the reference key from `.hora/tasks/` and is permanent — once given, it never changes. Inferred from heading text, the next run after someone edits the heading produces a different `id`, and recorded references come loose in silence.

**Do not try to keep the number of questions down.** People who are asked start writing it down in advance. Asking is also the mechanism that trains whoever writes the spec.

### 3. Pin things to stay reproducible

Follow upstream only on purpose. Never drift to the newest thing by itself.

- Boilerplates come from `--branch <newest tag>` (not the HEAD of `main`)
- Supporting material referenced from a version's `spec.md` is closed inside that version. It is not shared across versions
- Do not bump versions in `package-lock.json` by yourself (`npm update` is a human's action)

---

## What language to write for humans

**What stays in a file follows the declaration; what is said in the moment follows the person in front of you.**

| What is written | Language |
|---|---|
| Question text (`.hora/questions/`) | **The spec's declaration. Absent that, the language of whoever ran it** |
| Notes attached to a task or a checkpoint (constraints, conflict warnings) | same as above |
| An acceptance record (`.hora/acceptance/`) | same as above |
| **Anything said in conversation** — a planner's proposed edit, a checkpoint's question, the closing report | **always the language of whoever ran it** |
| Task names, feature names | copied from the spec |
| Glossary terms | copied from the spec |
| Glossary identifiers | English (the lint rules assume English naming) |

The declaration lives in the spec's document information section.

```markdown
| Question language | Japanese |
```

**Why it has to be declarable.** Whoever runs this is usually Japanese, so the operator's language is a fine default — but **on a project whose client side includes foreign members, the operator's language leaves someone unable to read it.** A question stays in the file and is read by whoever edits `specs/` next, so it cannot be settled by the operator's convenience alone.

**Conversation does not follow the declaration.** It is aimed at the person who is right there and it does not stay in a file, so it always uses that person's language. **A proposed edit to `specs/` is the exception inside the exception:** it is discussed in that person's language, but written into the file in the language the file itself is written in.

**Never write two languages side by side.** A single question written twice leaves no original: one copy gets updated and the two disagree.

**Existing questions are not retranslated.** The file is append-only, so once the declaration changes or somebody else runs it, one file holds more than one language. **That is fine.** Retranslating a question somebody else wrote does more harm (it changes what they meant — and resolution is judged by reading `specs/`, which does not depend on the language).

---

## What lives in `.hora/`

```
.hora/
  tree/<repository>.md          what /hora-setup read in the real tree, and the tag it read it at
  tasks/<version>/
    _plan.md                    the feature order, and the acceptance tasks. /hora-plan writes it
    <feature-id>.md             one feature. Holds its checkpoint checklist. /hora-build writes it
  contracts/<version>/          one file per server whose consumer is elsewhere
  questions/<version>/open.md   append-only. Answered by editing specs/
  acceptance/<version>/
    <feature-id>.md             one acceptance run, for one feature's gate
    _sweep.md                   the whole-version sweep
  glossary.md                   append-only, not split per version
```

**There is no separate state file.** `git log .hora/` is the history of what ran, and the checkboxes hold what is done.
