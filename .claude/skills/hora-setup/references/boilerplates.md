# Fetching and initializing the boilerplates

The detailed procedure behind `/hora-setup`'s step 1.

**This stage is passed over entirely** if every declared repository already exists (idempotent). Only what is missing gets created. **Re-evaluate it for every version** (repositories arrive in later versions).

---

## The target boilerplates

| Repository | Role | What it becomes |
|---|---|---|
| `openreachtech/renchan-boilerplate` | backend | every row in the declaration whose origin is `renchan` |
| `openreachtech/furo-boilerplate-nuxt` | Nuxt frontend | every row in the declaration whose origin is `furo` |

`chiho-boilerplate` is out of scope (it has no tag practice). `npm-boilerplate` is for npm packages and is not a source for project repositories.

**Only the rows the spec's repository layout section declares get created.** There is no default of making a backend and a frontend as a pair. Some projects are only an API for a phone app; some add an admin screen in a later version. **Do not create anything out of helpfulness that the declaration does not ask for.**

**Rows with origin `furo` are often more than one** (`frontend-employee` and `frontend-admin`). Clone one per row. There is only ever one row with origin `renchan`; if a second is declared, stop with a question.

### Stack (a rough guide before step 3 reads the real thing — do not write conventions here)

| | Main dependencies |
|---|---|
| backend | express / graphql-http / graphql-ws / @graphql-tools/* / sequelize / mariadb / ioredis / pm2 |
| frontend | nuxt / vue / @openreachtech/furo-nuxt / core-js |

A frontend holds neither a DB client nor a Redis client. **Only the backend uses middleware.**

---

## The procedure

### 1. Settle the project name

Use the name written in `specs/<version>/spec.md`'s document information section.

**If it is not written, stop here and ask a human.** It must not be derived mechanically from a directory name (the directory may have been renamed after `git clone`).

### 2. Rewrite the root's own `package.json`

**`myproject-app` (this repository, the one at cwd) also ships with the placeholder.** Fill it in as soon as the project name is settled — this does not wait for any repository to be cloned.

```json
{
  "name": "@openreachtech/<myproject>",
  "description": "<myproject> by hora"
}
```

`<myproject>` is the project name settled in step 1. **Leave `"version"` and `"private"` as they are**, for the same reason as every other repository: the tag carries the version, and `private: true` guards against an accidental publish.

### 3. Find the newest tag

```bash
git ls-remote --tags --sort=-v:refname \
  https://github.com/openreachtech/renchan-boilerplate.git | head -5
```

**Do not take the HEAD of `main`.** Since a version is the unit of management, take a released state. `main` risks grabbing a work-in-progress commit that carries no tag.

The existing boilerplates leave `package.json`'s `version` at `0.0.0` and manage the real version through git tags. `release.yml` also reads the version from `git tag -l`, never from `package.json`. **The tag is what carries the version.**

### 4. Clone it and throw away its history

**Repeat this for each declared row.** Below is an example with two rows, both using the default directory name.

**A row whose layout entry carries a `Directory` column is never cloned at all** — that column declares the repository already exists, so this whole step is skipped for it and the directory is used as written. Everything below is about a row that does not carry one.

```bash
git clone --depth 1 --branch <newest tag> \
  https://github.com/openreachtech/renchan-boilerplate.git  <myproject>-backend
rm -rf <myproject>-backend/.git
git -C <myproject>-backend init
git -C <myproject>-backend checkout -b release/<version>
git -C <myproject>-backend commit --allow-empty -m "Release <version>"

git clone --depth 1 --branch <newest tag> \
  https://github.com/openreachtech/furo-boilerplate-nuxt.git  <myproject>-frontend-admin
rm -rf <myproject>-frontend-admin/.git
git -C <myproject>-frontend-admin init
git -C <myproject>-frontend-admin checkout -b release/<version>
git -C <myproject>-frontend-admin commit --allow-empty -m "Release <version>"
```

**The `checkout -b` right after `init` matters.** `HEAD` is unborn at that point (there is no commit yet), and `checkout -b` on an unborn `HEAD` is valid — it just points the next commit at the named branch instead of whatever `git init`'s configured default happens to be. Skip this and step 12's initial commit lands wherever that default is (often literally `main`), which is exactly the branch this skill's git-operation rule (Commits, in the main skill) says never to commit straight to.

**The empty `commit --allow-empty` right after that is the branch's opening marker**, not a placeholder for real content. `<version>` here is the hora project's own version (`1.0.0`, matching the branch name) — not the boilerplate's tag fetched two lines above (`1.8.1`, or whatever the boilerplate's own version happens to be). It is the first commit on `release/<version>`; step 12's initial commit is the second.

**Skip this step entirely for a row whose directory already exists.** Do not clone into it, and do not touch its `.git` — treat it as already fetched, however it got there. A human commonly places it there themselves when the boilerplate is private and a non-interactive `git clone` has no credentials to authenticate with (a session has no terminal to type a username/password into, so the clone fails immediately rather than prompting). The remaining steps (filling in `package.json`/`.env.development`, and the like) still run for that row — each is checked on its own, not skipped as a group.

**Why `.git` is thrown away.** Keeping it would let `git pull` bring in upstream updates later, but it would also mix hundreds of commits from somebody else's repo into a product repository's `main`, and the drift from upstream would only grow from there. A clean history wins here.

The parent's (`myproject-app`'s) `.gitignore` already ignores the implementation repositories, so a gitlink accident does not happen. **These two lines must not be removed.** Removing them lets the outer repository absorb the inner one as a mode-160000 gitlink — cloning it then leaves the contents missing, in a broken state.

```gitignore
/*-backend*/
/*-frontend*/
```

**The trailing `*` is required.** `/*-frontend/` alone does not match `<myproject>-frontend-admin`, so a repository that carries a purpose suffix would end up tracked (confirmed by measurement). The leading `/` is also required — without it, a same-named directory anywhere under the tree, like `docs/<myproject>-frontend-admin/`, would be swept in too.

#### A declared `Directory` matches neither pattern

**Both patterns match on the name, so a row that declares its own directory (`legacy-api/`, and the like) is excluded by neither.** Two things then go wrong at once, and **neither of them says so:**

| | What happens | How it surfaces |
|---|---|---|
| `.gitignore` | the whole implementation repository is tracked by the hora repository and committed into it | only when somebody reads `git status` — by which point it is committed |
| `eslint.config.js` | the root's own lint walks into a repository whose config is not its own | a flood of violations against rules that repository never agreed to |

**Step 0 of `/hora-setup` adds one entry per unmatched directory, to both files, and reports that it did.** Both belong to the hora repository itself, so this is its own file to write — not an instruction for whoever adopted the kit to remember.

```gitignore
#### an implementation repository declared under its own directory name
/legacy-api/
```

```js
ignores: [
  '**/node_modules/**',

  '*-backend*/',
  '*-frontend*/',
  'legacy-api/',            // declared under its own directory name
  ...
]
```

**Write the entry exactly as declared, with no wildcard around it.** The two built-in patterns are wildcards because they cover a family of generated names; a declared directory is one literal name, and widening it into a pattern would start excluding files nobody meant to exclude.

### 5. Equip the skills `@openreachtech/ai-agent-skills` ships

**This does not wait on any row being cloned.** Run `.claude/skills/hora-setup/scripts/equip-skills.sh` from the repository root — like `@openreachtech/hora-ecosystem`, `ai-agent-skills` is this repository's own devDependency, so it is ready as soon as this repository's own `npm install` has run, regardless of which rows the declaration lists.

Skill discovery only looks at the session's own `.claude/skills/`, and a package's skills live under `node_modules/`, never under that path. Without this step, everything `ai-agent-skills` ships stays invisible for the rest of the session.

The package already ships its skills flattened under `dist/skills/` (one directory per skill, name unique, no frontmatter left to strip), so the script clones them into this repository's `.claude/skills/` as-is — no renaming, no rewriting. **Safe to re-run** — each destination is a straight copy of its source, so a re-run just overwrites each destination with whatever the package currently holds.

```bash
.claude/skills/hora-setup/scripts/equip-skills.sh
```

### 6. Rewrite `package.json`'s `name` / `description`

A boilerplate arrives with `"name": "TODO: fulfill here ❌️"`. Fill it in with the project's name.

```json
{
  "name": "<myproject>-backend",
  "description": "<a one-line description written from the spec>"
}
```

**`"version": "0.0.0"` and `"private": true` are left as they are.** The tag carries the version, and `private: true` guards against an accidental publish.

### 7. Fill in `.env.development`

`renchan-boilerplate`'s `.env.development` ships with **keys only, values empty**, so fill them in. Make the values match `docker-compose.development.yml` and CI (`test-with-mariadb.yml`).

```
DATABASE_NAME=development
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
DATABASE_DIALECT=mysql
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
```

**`/hora` writes both the compose file and `.env.development`, so the DB name and the rest are structurally guaranteed to agree.** No human is left to keep the two in sync by hand.

Follow the keys the real boilerplate ships (the above is a guide — read the actual key names and fill those in).

### 8. Place `docker.sh` and `docker-compose.development.yml`

**`/hora` writes these while upstream does not ship them.** None of the three boilerplates — renchan, furo, chiho — ships a docker or compose file. What they ship is startup scripts (`db:setup` / `db:seed:dev` / `db:refresh` / `dev`) — **what is missing is the middleware.**

Place them in **`<myproject>-backend/`**. Not in the parent.

**Never overwrite one that is already there.** A repository adopted into Hora Kit very often brings its own docker setup, tuned to that project; replacing it with a generated one is how a working local environment stops working. If a file of either name exists, leave it, read it for what profiles it already offers, and report the difference against what the spec's manual-verification table asks for.

- a frontend uses no middleware
- `<myproject>-backend` is an independent repository, so someone will clone it alone and work without the parent's compose file present
- it sits in the same directory as the backend's `.env.development`, which makes the values easy to keep aligned

```bash
#!/bin/bash

# Bring the local middleware up or down for manual verification.
#
#   ./docker.sh start
#   ./docker.sh stop

COMPOSE_FILE='docker-compose.development.yml'
ENV_FILE='.env.development'

case "$1" in
  start)
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --wait
    ;;
  stop)
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    ;;
  *)
    echo 'Usage: ./docker.sh start|stop' >&2
    exit 1
    ;;
esac
```

The verbs are `start` / `stop`. Docker's `up` / `down` are not passed through as-is — they become the script's own vocabulary. `--wait` waits for the healthcheck to pass, so the `db:refresh` right after it does not fail waiting on startup.

**`--env-file` points at `.env.development` explicitly.** `.env` is never touched outside production; local work always goes through `.env.development`. Compose defaults to reading `.env` on its own, so without this flag it would silently miss whatever is written there.

Do not name it `compose.yaml`. **A name must not claim to be the tool.** Every existing file names its own tool (`eslint.config.js` / `jest.config.js` / `pm2.config.cjs` / `jsconfig.json`). Including `.development` in the name makes clear it is not for production. It is not an npm script either (npm has nothing to do with docker; a `.sh` runs even before `npm install`).

### 9. Write the compose file "everything included, off by default via `profiles`"

Get it into a state where what is needed **is already written** (so image names, versions and environment variables never have to be looked up again). But use **`profiles`, not commenting things out.**

| | Commented out | `profiles` |
|---|---|---|
| validated as YAML | ❌ | ✅ `docker compose config` passes |
| turning it on | edit the file | an environment variable or a flag |
| what `/hora` has to do | find the line, uncomment it | one line in `.env.development` |

Nobody validates commented-out YAML.

```
default (no profile)   mariadb / redis
profiles                elasticsearch / kafka / qdrant / minio
```

**Redis is a required dependency of the queue the Job convention runs on**, so a project with any Job cannot drop it. Even a check against SQLite still brings Redis up.

**Write values in directly. Do not reference `.env`.** `.env` is gitignored and is guaranteed not to exist right after a clone, so a value referenced from compose would come out empty. Fix the host to localhost and fix the port.

```yaml
services:
  mariadb:
    image: mariadb:10.5.12          # the same version as CI
    ports:
      - '3306:3306'
    environment:
      MYSQL_USER: user
      MYSQL_PASSWORD: password
      MYSQL_DATABASE: development   # matches the file name and NODE_ENV. Does not mix with CI's live one
      MYSQL_ROOT_PASSWORD: password
```

Use the version written in the spec's manual-verification section, matching CI's `test-with-mariadb.yml`. **This avoids passing locally and failing in CI.**

### 10. Write `COMPOSE_PROFILES` into `.env.development`

Decide which profiles to turn on from the spec's manual-verification section.

```
COMPOSE_PROFILES=minio
```

Examples of the judgment: using object storage → turn on `minio`. A search platform marked "not introduced this time" → leave `elasticsearch` off.

**Never write this into `.env`.** `.env` is never touched outside production; local work always goes through `.env.development`, and `docker.sh` (step 8) passes `--env-file .env.development` explicitly so Compose reads it from there. Run `docker compose config` here to confirm `COMPOSE_PROFILES` actually takes effect as expected, and report the result. If it does not, change `docker.sh` to take a profile as an argument instead.

### 11. `npm install`

Run it in each repository that was created.

**`@openreachtech/hora-ecosystem` does not go into an implementation repository's `package.json`.** One entry in the parent's (`myproject-app`'s) devDependencies is enough. `/hora`'s cwd is `myproject-app/`, so `node_modules/@openreachtech/hora-ecosystem/` is readable no matter which side's task is being implemented. This is the benefit of the nested structure.

An implementation repository is its own independent git repo, and a standalone checkout of it has no parent `node_modules`. **The catalog is reference material for development, not a product dependency.**

### 12. Copy the `bank-id` skill into the backend row

**Backend only.** Copy this repository's own `.claude/skills/bank-id/` into `<myproject>-backend/.claude/skills/bank-id/`.

```bash
cp -r .claude/skills/bank-id <myproject>-backend/.claude/skills/bank-id
```

**Unlike step 5, never overwrite an existing copy** — skip this step entirely if the destination already exists. A human may have customized `bank-id` inside their own backend repository (different retry timing, a house convention), and this step only ever bootstraps it once. This is also why `bank-id` lands directly in the backend row's own `.claude/skills/` rather than coming from `ai-agent-skills`: it needs to be reachable, and safely editable, from a session working there directly — a human, or the implementer agent `/hora-build` starts, alike — not only through this repository's own equip step.

### 13. Make an initial commit

In each repository that was created, on the `release/<version>` branch checked out in step 4 — never on whatever branch `git init` defaulted to. This is the branch's second commit, right after its empty opening marker. Keep the boilerplate's own files separate from the values `/hora` filled in.

```
Initial commit from renchan-boilerplate 1.8.1
Fulfill project values for <myproject>
```

---

## What this procedure does not do

| Not done | Why |
|---|---|
| Baking the boilerplate into the template (vendoring) | upstream is updated piecemeal over time. It would also contradict the parent's `.gitignore` |
| Keeping `.git` and holding an upstream remote | mixes somebody else's commits into the product repo's history |
| Turning it into a submodule | the consistency gained is not worth the added complexity |
| Baking the boilerplate's conventions into SKILL.md | there will always come a moment where they disagree with the real thing. `/hora-setup`'s step 3 reads it in place instead |
| `npm update` / bumping a dependency's version | following upstream is a human's deliberate action |

---

## What upstream is still missing

`/hora` cannot fix this on its own. It reports what it notices, but `/hora` never rewrites upstream.

| Repository | What is missing | `/hora`'s stopgap |
|---|---|---|
| `renchan-boilerplate` | `CLAUDE.md` | read it in place in step 3 |
| `renchan-boilerplate` | `docker.sh` / `docker-compose.development.yml` | `/hora` writes them |
| `furo-boilerplate-nuxt` | `CLAUDE.md` | read it in place in step 3 |

The right place for `CLAUDE.md` is each boilerplate's own repository (kept current by its maintainer alongside the code itself). Step 3 is the bridge until that is in place, but **the step that reads the real thing stays even after `CLAUDE.md` is** (the real thing outranks any assumption, in that order).
