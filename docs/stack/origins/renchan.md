<!-- 日本語版: [renchan.ja.md](./renchan.ja.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# Origin `renchan` — the backend repository

*[日本語](./renchan.ja.md)*

What `/hora-setup` needs to know to create and initialize a repository whose declared origin is `renchan`. The git handling itself — fetching the newest tag, discarding history, which branch the repository starts on — is the kit's own and is not restated here.

## Where it comes from

```
https://github.com/openreachtech/renchan-boilerplate.git
```

**Fetch the newest tag, never the HEAD of `main`.** A version is the unit of management, so take a released state:

```bash
git ls-remote --tags --sort=-v:refname \
  https://github.com/openreachtech/renchan-boilerplate.git | head -5
```

The boilerplate leaves `package.json`'s `version` at `0.0.0` and manages the real version through git tags; its `release.yml` checks a derived version against the tags already pushed, never against `package.json`. **The tag is what carries the version.**

**The repository is currently private**, so a non-interactive session's own `git clone` fails for lack of credentials until a human clones the directory beforehand. A directory that already exists is treated as already fetched, however it got there.

### The stack, roughly

A rough guide before the real tree is read — **not** a statement of conventions:

| | Main dependencies |
|---|---|
| backend | express / graphql-http / graphql-ws / @graphql-tools/* / sequelize / mariadb / ioredis / pm2 |

**Only the backend uses middleware.** See [`../middleware.md`](../middleware.md) for what runs beside it.

## What to fill in

### `package.json` — `name` and `description`

The boilerplate arrives with `"name": "TODO: fulfill here ❌️"`.

```json
{
  "name": "<myproject>-backend",
  "description": "<a one-line description written from the spec>"
}
```

**`"version": "0.0.0"` and `"private": true` are left as they are.** The tag carries the version, and `private` guards against an accidental publish.

### `.env.development`

The boilerplate's `.env.development` ships with **keys only, values empty**. Make the values match `docker-compose.development.yml` (below) and CI (`test-with-mariadb.yml`):

```
DATABASE_NAME=development
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
DATABASE_DIALECT=mysql
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
```

**Follow the keys the real boilerplate ships — the above is a guide.** Since the same run writes both the compose file and `.env.development`, the two are structurally guaranteed to agree.

## What to place

**The boilerplate ships startup scripts (`db:setup` / `db:seed:dev` / `db:refresh` / `dev`) but no docker or compose file — what is missing is the middleware.** Two files go into the backend repository itself, next to its `.env.development`. Not into the parent: the backend is an independent repository, and someone will clone it alone and work without the parent.

**Never overwrite either file if it is already there.** A repository adopted into Hora Kit very often brings its own docker setup, tuned to that project. Leave it, read it for what profiles it offers, and report the difference against the spec's manual-verification table.

### `docker.sh`

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

### `docker-compose.development.yml` — everything included, off by default via `profiles`

Get it into a state where what is needed **is already written**, so image names, versions and environment variables never have to be looked up again. Use **`profiles`, not commenting things out.**

| | Commented out | `profiles` |
|---|---|---|
| validated as YAML | ❌ | ✅ `docker compose config` passes |
| turning it on | edit the file | an environment variable or a flag |
| what a run has to do | find the line, uncomment it | one line in `.env.development` |

```
default (no profile)   mariadb / redis
profiles                elasticsearch / kafka / qdrant / minio
```

**Redis is a required dependency of the queue the Job convention runs on** ([`../middleware.md`](../middleware.md)), so a project with any Job cannot drop it.

**Write values in directly. Do not reference `.env`.** It is gitignored and is guaranteed not to exist right after a clone, so a referenced value would come out empty. Fix the host to localhost and fix the port.

**Publish every port on `127.0.0.1`.** `'3306:3306'` binds every interface on the machine, so a database whose password is `password` becomes reachable from whatever network the laptop is attached to — a cafe or a coworking LAN. `'127.0.0.1:3306:3306'` reaches this machine and nowhere else, and the application, the tooling and CI all connect over loopback anyway. The same holds for every service a profile turns on.

```yaml
services:
  mariadb:
    image: mariadb:10.5.12          # the same version as CI
    ports:
      - '127.0.0.1:3306:3306'   # loopback only: never every interface
    environment:
      MYSQL_USER: user
      MYSQL_PASSWORD: password
      MYSQL_DATABASE: development   # matches the file name and NODE_ENV. Does not mix with CI's live one
      MYSQL_ROOT_PASSWORD: password
```

Use the version written in the spec's manual-verification section, matching CI's `test-with-mariadb.yml`. **This avoids passing locally and failing in CI.**

### `COMPOSE_PROFILES` in `.env.development`

Decide which profiles to turn on from the spec's manual-verification section.

```
COMPOSE_PROFILES=minio
```

Using object storage → turn on `minio`. A search platform marked "not introduced this time" → leave `elasticsearch` off.

**Never write this into `.env`.** Run `docker compose config` to confirm `COMPOSE_PROFILES` takes effect, and report the result. If it does not, change `docker.sh` to take a profile as an argument instead.

### `npm install`

Run it in the repository once the values are filled in.

**`@openreachtech/hora-ecosystem` does not go into this repository's `package.json`.** One entry in the parent's devDependencies is enough — the catalog is readable from the parent whichever side is being implemented. This repository is its own independent git repo, and a standalone checkout has no parent `node_modules`: **the catalog is reference material for development, not a product dependency.**

## Skills to copy into the row

| Skill | Why it is copied |
|---|---|
| `hor-bank-id` | allocates exclusive row-id prefixes inside this repository. It has to be invocable, and safely editable, from a session working in the backend directly — so it lands in the row's own `.claude/skills/` |

```bash
cp -r .claude/skills/hor-bank-id <myproject>-backend/.claude/skills/hor-bank-id
```

**Never overwrite an existing copy** — skip the copy entirely if the destination exists. A human may have customized it inside their own backend repository.

## What to read once it is there

The tree itself is the authority — nothing in this handbook overrides it. If there is a `CLAUDE.md`, read it first. Then, at minimum, get hold of:

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

## What upstream is still missing

Report what is noticed; never rewrite upstream.

| What is missing | The stopgap |
|---|---|
| `CLAUDE.md` | read the tree in place instead |
| `docker.sh` / `docker-compose.development.yml` | placed by the setup run, as above |

The right place for `CLAUDE.md` is the boilerplate's own repository. **Reading the real tree stays even after a `CLAUDE.md` exists** — the real thing outranks any assumption.
