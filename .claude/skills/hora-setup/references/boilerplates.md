# Fetching and initializing the boilerplates

The detailed procedure behind `/hora-setup`'s step 1.

**This stage is passed over entirely** if every declared repository already exists. Only what is missing gets created. **Re-evaluate it for every version** — repositories arrive in later versions.

---

## The target boilerplates

| Repository | Role | What it becomes |
|---|---|---|
| `openreachtech/renchan-boilerplate` | backend | every row in the declaration whose origin is `renchan` |
| `openreachtech/furo-boilerplate-nuxt` | Nuxt frontend | every row in the declaration whose origin is `furo` |

`chiho-boilerplate` is out of scope (it has no tag practice). `npm-boilerplate` is for npm packages.

**Only the rows the spec's repository layout section declares get created.** There is no default of making a backend and a frontend as a pair. **Do not create anything the declaration does not ask for.**

**Rows with origin `furo` are often more than one.** Clone one per row. There is only ever one row with origin `renchan`; if a second is declared, stop with a question.

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

**If it is not written, stop here and ask a human.** It must not be derived from a directory name, which may have been renamed after `git clone`.

### 2. Rewrite the root's own `package.json`

**`myproject-app` also ships with the placeholder.** Fill it in as soon as the project name is settled — this does not wait for any repository to be cloned.

```json
{
  "name": "@openreachtech/<myproject>",
  "description": "<myproject> by hora"
}
```

**Leave `"version"` and `"private"` as they are.** The tag carries the version, and `private: true` guards against an accidental publish.

### 3. Find the newest tag

```bash
git ls-remote --tags --sort=-v:refname \
  https://github.com/openreachtech/renchan-boilerplate.git | head -5
```

**Do not take the HEAD of `main`.** A version is the unit of management, so take a released state.

The boilerplates leave `package.json`'s `version` at `0.0.0` and manage the real version through git tags; `release.yml` checks a derived version against the tags already pushed, never against `package.json`. **The tag is what carries the version.**

### 4. Clone it and throw away its history

**Repeat this for each declared row.** Below is an example with two rows, both using the default directory name.

**A row whose layout entry carries a `Directory` column is never cloned at all** — that column declares the repository already exists.

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

**The `checkout -b` right after `init` matters.** `HEAD` is unborn at that point, and `checkout -b` on an unborn `HEAD` points the next commit at the named branch instead of `git init`'s configured default — often literally `main`, which is the one branch the commit rules say never to commit straight to (`../../hora/references/commits.md`, "Where work lands").

**The `commit --allow-empty` right after that is the branch's opening marker.** `<version>` here is the hora project's own version (`1.0.0`, matching the branch name), not the boilerplate's tag fetched two lines above. Step 13's initial commit is the second commit.

**Skip this step entirely for a row whose directory already exists.** Do not clone into it, and do not touch its `.git`. A human commonly places it there themselves when the boilerplate is private and a non-interactive `git clone` has no credentials. The remaining steps still run for that row — each is checked on its own.

**Why `.git` is thrown away.** Keeping it would let `git pull` bring in upstream updates, but it would also mix hundreds of somebody else's commits into a product repository's `main`.

The parent's `.gitignore` already ignores the implementation repositories. **These two lines must not be removed** — without them the outer repository absorbs the inner one as a mode-160000 gitlink, and cloning it leaves the contents missing.

```gitignore
/*-backend*/
/*-frontend*/
```

**The trailing `*` is required**: `/*-frontend/` alone does not match `<myproject>-frontend-admin`. **The leading `/` is also required** — without it, a same-named directory anywhere under the tree would be swept in too.

#### A declared `Directory` matches neither pattern

**Both patterns match on the name, so a row that declares its own directory (`legacy-api/`) is excluded by neither.** Two things then go wrong at once, and **neither of them says so:**

| | What happens | How it surfaces |
|---|---|---|
| `.gitignore` | the whole implementation repository is tracked by the hora repository and committed into it | only when somebody reads `git status` — by which point it is committed |
| `eslint.config.js` | the root's own lint walks into a repository whose config is not its own | a flood of violations against rules that repository never agreed to |

**Step 0 of `/hora-setup` adds one entry per unmatched directory, to both files, and reports that it did.**

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

**Write the entry exactly as declared, with no wildcard around it.** The two built-in patterns cover a family of generated names; a declared directory is one literal name.

### 5. Equip the skills `@openreachtech/ai-agent-skills` ships

**This does not wait on any row being cloned.** Run the script from the repository root — `ai-agent-skills` is this repository's own devDependency.

Skill discovery only looks at the session's own `.claude/skills/`, and a package's skills live under `node_modules/`. Without this step, everything the package ships stays invisible for the rest of the session.

The package ships its skills flattened under `dist/skills/`, so the script clones them into `.claude/skills/` as-is. **Safe to re-run** — it synchronizes rather than overlays: every package-equipped directory is removed first, then copied fresh, so a skill the package renamed or dropped does not linger as a match candidate. This repository's own skills are named back in `.gitignore` and are never touched.

```bash
.claude/skills/hora-setup/scripts/equip-skills.sh
```

### 6. Rewrite `package.json`'s `name` / `description`

A boilerplate arrives with `"name": "TODO: fulfill here ❌️"`.

```json
{
  "name": "<myproject>-backend",
  "description": "<a one-line description written from the spec>"
}
```

**`"version": "0.0.0"` and `"private": true` are left as they are.**

### 7. Fill in `.env.development`

`renchan-boilerplate`'s `.env.development` ships with **keys only, values empty**. Make the values match `docker-compose.development.yml` and CI (`test-with-mariadb.yml`).

```
DATABASE_NAME=development
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
DATABASE_DIALECT=mysql
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
```

**`/hora` writes both the compose file and `.env.development`, so the two are structurally guaranteed to agree.**

Follow the keys the real boilerplate ships — the above is a guide.

### 8. Place `docker.sh` and `docker-compose.development.yml`

**`/hora` writes these while upstream does not ship them.** None of the three boilerplates ships a docker or compose file. What they ship is startup scripts (`db:setup` / `db:seed:dev` / `db:refresh` / `dev`) — **what is missing is the middleware.**

Place them in **`<myproject>-backend/`**. Not in the parent.

**Never overwrite one that is already there.** A repository adopted into Hora Kit very often brings its own docker setup, tuned to that project. Leave it, read it for what profiles it offers, and report the difference against the spec's manual-verification table.

- a frontend uses no middleware
- `<myproject>-backend` is an independent repository, so someone will clone it alone and work without the parent's compose file
- it sits in the same directory as the backend's `.env.development`

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

The verbs are `start` / `stop`, not Docker's `up` / `down`. `--wait` waits for the healthcheck, so a `db:refresh` right after it does not fail on startup.

**`--env-file` points at `.env.development` explicitly.** Compose defaults to reading `.env`, which is never touched outside production.

Do not name it `compose.yaml`. **A name must not claim to be the tool** — every existing file names its own (`eslint.config.js` / `jest.config.js` / `pm2.config.cjs`). It is not an npm script either: a `.sh` runs even before `npm install`.

### 9. Write the compose file "everything included, off by default via `profiles`"

Get it into a state where what is needed **is already written**, so image names, versions and environment variables never have to be looked up again. Use **`profiles`, not commenting things out.**

| | Commented out | `profiles` |
|---|---|---|
| validated as YAML | ❌ | ✅ `docker compose config` passes |
| turning it on | edit the file | an environment variable or a flag |
| what `/hora` has to do | find the line, uncomment it | one line in `.env.development` |

```
default (no profile)   mariadb / redis
profiles                elasticsearch / kafka / qdrant / minio
```

**Redis is a required dependency of the queue the Job convention runs on**, so a project with any Job cannot drop it.

**Write values in directly. Do not reference `.env`.** It is gitignored and is guaranteed not to exist right after a clone, so a referenced value would come out empty. Fix the host to localhost and fix the port.

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

Using object storage → turn on `minio`. A search platform marked "not introduced this time" → leave `elasticsearch` off.

**Never write this into `.env`.** Run `docker compose config` here to confirm `COMPOSE_PROFILES` takes effect, and report the result. If it does not, change `docker.sh` to take a profile as an argument instead.

### 11. `npm install`

Run it in each repository that was created.

**`@openreachtech/hora-ecosystem` does not go into an implementation repository's `package.json`.** One entry in the parent's devDependencies is enough — `/hora`'s cwd is `myproject-app/`, so the catalog is readable whichever side is being implemented.

An implementation repository is its own independent git repo, and a standalone checkout has no parent `node_modules`. **The catalog is reference material for development, not a product dependency.**

### 12. Copy the `bank-id` skill into the backend row

**Backend only.**

```bash
cp -r .claude/skills/bank-id <myproject>-backend/.claude/skills/bank-id
```

**Unlike step 5, never overwrite an existing copy** — skip this step entirely if the destination exists. A human may have customized `bank-id` inside their own backend repository. This is also why it lands directly in the backend row's own `.claude/skills/` rather than coming from `ai-agent-skills`: it has to be reachable, and safely editable, from a session working there directly.

### 13. Make an initial commit

In each repository that was created, on the `release/<version>` branch checked out in step 4 — never on whatever branch `git init` defaulted to. Keep the boilerplate's own files separate from the values `/hora` filled in.

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
| Baking the boilerplate's conventions into SKILL.md | they will disagree with the real thing eventually. Step 3 reads it in place instead |
| `npm update` / bumping a dependency's version | following upstream is a human's deliberate action |

---

## What upstream is still missing

`/hora` reports what it notices, and never rewrites upstream.

| Repository | What is missing | `/hora`'s stopgap |
|---|---|---|
| `renchan-boilerplate` | `CLAUDE.md` | read it in place in step 3 |
| `renchan-boilerplate` | `docker.sh` / `docker-compose.development.yml` | `/hora` writes them |
| `furo-boilerplate-nuxt` | `CLAUDE.md` | read it in place in step 3 |

The right place for `CLAUDE.md` is each boilerplate's own repository. **The step that reads the real thing stays even after `CLAUDE.md` is** — the real thing outranks any assumption.
