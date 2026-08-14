---
name: hora-setup
description: Fetch the boilerplates a spec declares, fill in the project's values, and read what was cloned in place. Idempotent — creates only what is missing, and re-evaluates on every version. Invoked by /hora, or directly as /hora-setup.
---

# hora-setup

**Code setup.** Create the repositories the spec declares, fill in this project's values, and read the real tree that arrived.

Read `../hora/references/structure.md` first — the repository layout, where a per-repository command runs, and the invariants. **This skill is strictly read-only on `specs/`.**

## What this skill is for

```
1. Create only the repositories that are missing, from the declaration
2. Fill in the values that carry this project's name
3. Equip the skills @openreachtech/ai-agent-skills ships
4. Read what was cloned, in place, and record what was read
```

**It is idempotent, and it re-evaluates on every version.** Repositories arrive in later versions, so passing this once is not the end of it. Anything already there is passed over.

---

## 1. Create what is missing

**Which repositories to create is declared by the spec's repository layout section.** Never carry "a backend and a frontend" as an assumption.

If there is no declaration, **stop here and ask.** Adding a repository is an architectural decision.

| Detection | Action |
|---|---|
| No repository layout section | **stop and ask** |
| **Zero or two or more** backends (origin `renchan`) | **stop and ask.** For now it is always exactly one |
| Zero frontends (origin `furo`) | **normal.** Some projects are only an API for a phone app |
| No table of servers | **stop and ask.** Contracts cannot be derived |

**The repository layout must be written in the entry point (`specs/<version>/spec.md`).** Written in a feature file, it does not count as the declaration.

Settle the project name first, from `specs/<version>/spec.md`. **If it is not written, stop here and ask.** It must not be derived from the directory name, and — unlike most required roles — **it must not be taken from a declared Source either.** The project name and the repository layout are decisions, not facts to locate.

**Once it is settled, also fill in this repository's own `package.json`** (`name` / `description`) — it ships with the same placeholder a cloned boilerplate does.

Read `references/boilerplates.md` for the detailed procedure. The essentials for each declared row (**numbered for this summary alone — these numbers do not line up with `boilerplates.md`'s own**):

```
0. Settle this row's directory (below), and register it in the exclusion lists
1. git ls-remote --tags to find the newest tag
2. git clone --depth 1 --branch <newest tag> ... <that directory>
3. rm -rf <dir>/.git && git -C <dir> init && git -C <dir> checkout -b release/<version>
4. git -C <dir> commit --allow-empty -m "Release <version>" (the branch's opening marker)
5. Rewrite name / description in package.json with the project's name
6. Fill in the values in .env.development (renchan-boilerplate ships keys with empty values)
7. Place docker.sh / docker-compose.development.yml and decide profiles from the spec
8. Write COMPOSE_PROFILES into .env.development (when there is a profile to enable — never into .env)
9. npm install
10. Backend row only: copy `.claude/skills/bank-id/` into `<dir>/.claude/skills/bank-id/`, if it is not already there
```

### Step 0 — which directory a row lives in, and excluding it

**A row's directory is `<project name>-<declared row>`, unless the layout's optional `Directory` column says otherwise.**

| The `Directory` column is | Treatment |
|---|---|
| **omitted** | `<project name>-<declared row>`. Clone the boilerplate into it if it is missing. **The default, and the only case a new project meets** |
| **written** | look for exactly that directory, **and never clone.** A stated directory declares that the repository already exists — if it is not there, **stop and ask** |

**Then register the directory in both of this repository's own exclusion lists, unless it already matches them.**

```
.gitignore          /*-backend*/ and /*-frontend*/ already cover a default name
eslint.config.js    `ignores` already covers '*-backend*/' and '*-frontend*/'
```

**A directory named anything else matches neither, and both failures are silent.** An unexcluded implementation repository gets committed wholesale into the hora repository, and the root's eslint walks into a repository whose config is not its own. Add one entry per unmatched directory, to both files, and **report that you added it.**

**If `<that directory>` already exists, skip steps 1–4 for that row** — treat it as already fetched, however it got there. **A row with a `Directory` column always takes this path.** `../hora/references/commits.md`'s branch rule still applies to it (fetch and branch from `origin/main` if `release/<version>` is missing, with the same empty marker once created) — it is just not the fresh-`git init` case. This is not only for the idempotent re-run: the boilerplates are currently private, so a non-interactive session's own `git clone` fails for lack of credentials until a human clones the row beforehand. **Still run steps 5 onward for that row** — each is its own idempotent check, not an all-or-nothing skip.

**Step 10 never overwrites an existing copy.** A human may have customized `bank-id` inside their own backend repository. This step is also why `bank-id` can be invoked without `/hora`: it lands in the backend row's own `.claude/skills/`.

`.git` is thrown away and re-initialized so that hundreds of commits from somebody else's repo never land on a product repository's `main`.

**This never happens to a repository that already existed.** A row skipped past step 3 keeps its own history untouched — Hora Kit is adopted onto a repository, never over it.

When this step finishes, make an initial commit in each repository it created, on the `release/<version>` branch checked out in step 3, after the empty marker from step 4.

---

## 2. Equip the skills `@openreachtech/ai-agent-skills` ships

```bash
.claude/skills/hora-setup/scripts/equip-skills.sh
```

It copies every skill that package ships into this repository's own `.claude/skills/` — **skill discovery only looks at the session's own `.claude/skills/`, and a package's skills live under `node_modules/`.**

**This does not wait on any declared row being cloned.** Run it on every invocation: the package may have been updated, and the script synchronizes rather than overlays, so a re-run leaves nothing stale behind.

**Everything `/hora-build` and `/hora-accept` delegate to comes from here** (`../hora/references/structure.md`, "The division of labor"). Without this step, every one of those delegations has nothing to reach.

Report what was equipped, by count, and **name anything a later checkpoint will look for and not find.**

---

## 3. Read what was cloned, in place

**This skill does not bake in knowledge of the boilerplates' conventions.** The newest tag is always cloned, so anything written down here would eventually disagree with the real thing.

The order to read in:

1. If there is a `CLAUDE.md`, read it (the authority, updated by the maintainer along with the code)
2. Otherwise read the tree in place. At minimum, get hold of:

```
Directory layout          where things go
How servers are split     how several servers are separated. Entry points and the pm2 config
Naming conventions        how classes, files and tables are named
How tests are written     placement, naming, helpers, the mocking style
The existing GraphQL schema   how the SDL is written
How things get registered     automatic via directory scanning, or an aggregation file to append to
Existing model definitions    how sequelize is used, and how it maps to migrations
npm scripts               the names of the test / lint / db commands
A local E2E environment   whether one ships (an `e2e/docker/` stack and its up/seed/clean scripts)
```

**"How things get registered" deserves particular care.** If registration is automatic through directory scanning, implementation only has to drop its own file in, and the aggregation-file problem disappears entirely. If appending is required, several checkpoints end up touching the same single place. **It is the highest-value thing to check.**

The real tree beats any assumption. This step stays even after a `CLAUDE.md` exists.

### Record what was read, and what tag it was read at

Write it to `.hora/tree/<repository>.md`, with the tag at the top:

```markdown
# myproject-backend
<!-- boilerplate: renchan-boilerplate 1.8.1 -->

## Directory layout
...
```

**Re-read and rewrite it whenever the recorded tag no longer matches the row's own.** Otherwise, trust what is recorded.

**This is a cache, not a source.** It exists because `/hora-build` crosses many sessions. **On any disagreement, the tree wins**, and the record gets rewritten from it.

---

## What this skill does not do

| Not done | Why |
|---|---|
| Baking the boilerplate into the template (vendoring) | upstream is updated piecemeal over time. It would also contradict the parent's `.gitignore` |
| Keeping `.git` and holding an upstream remote | mixes somebody else's commits into the product repo's history |
| Turning it into a submodule | the consistency gained is not worth the added complexity |
| Baking the boilerplate's conventions into this file | they will disagree with the real thing eventually. Step 3 reads it in place instead |
| `npm update` / bumping a dependency's version | following upstream is a human's deliberate action |
| Starting the middleware (`./docker.sh start`) | a human does that when they want it. `/hora-accept` is where an environment becomes a prerequisite, and it says so rather than acting |

---

## References

| File | Content |
|---|---|
| `references/boilerplates.md` | the detailed procedure. Which boilerplate to choose, and what to fill in where |
| `scripts/equip-skills.sh` | copies `@openreachtech/ai-agent-skills`' skills into `.claude/skills/` |
| `../hora/references/structure.md` | the layout, the per-repository command rule, the invariants |
| `../hora/references/commits.md` | the branch each created repository starts on |
