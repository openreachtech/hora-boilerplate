---
name: hora-setup
description: Create the repositories a spec declares, fill in the project's values, equip the conventions package, and read what arrived. Idempotent — creates only what is missing, and re-evaluates on every version. Invoked by /hora, or directly as /hora-setup.
---

# hora-setup

**Code setup.** Create the repositories the spec declares, fill in this project's values, and read the real tree that arrived.

Read `../hora/references/structure.md` first — the layout, where a per-repository command runs, and the invariants. **This skill is strictly read-only on `specs/`.**

```
1. Create only the repositories that are missing
2. Fill in the values that carry this project's name
3. Equip the conventions package
4. Read what arrived, in place, and record what was read
```

**It is idempotent, and it re-evaluates on every version.** Rows arrive in later versions, so passing once is not the end of it. Anything already there is passed over.

---

## 1. Create what is missing

**The spec's repository layout section says which repositories to create.** Never carry an assumption about how many there are, or what roles they play.

| Detection | Action |
|---|---|
| no repository layout section | **stop and ask** |
| no row declaring the `provider` role | **stop and ask.** Something has to own the data |
| two rows declaring they own the same data store | **stop and ask** |
| no server table | **stop and ask.** Contracts cannot be derived |

**The layout must be in the entry point (`specs/<version>/spec.md`).** Written in a feature file, it does not count as the declaration.

**Settle the project name first, from the spec.** If it is not written, stop and ask. It must not be derived from a directory name, and — unlike most required roles — **it must not be taken from a declared Source either.** Once settled, fill it into the hora repository's own manifest, which ships with a placeholder.

For each declared row:

```
0. Settle its directory, and register it in the exclusion lists (below)
1. Create it, if it is missing, from the row's `Template` (below)
2. Point it at its own fresh history:
     git -C <dir> init
     git -C <dir> checkout -b release/<version>
     git -C <dir> commit --allow-empty -m "Release <version>"
3. Fill in the values carrying the project's name — its manifest, and whatever
   else the template ships with a placeholder in it
4. Fill in its environment configuration, from the spec's services table
5. Install its dependencies, with that repository's own command
6. Make its initial commit, on release/<version>
```

**Step 2's `checkout -b` right after `init` matters.** `HEAD` is unborn at that point, so `checkout -b` points the first commit at the named branch instead of whatever default `git init` configured — often `main`, the one branch the commit rules say never to commit straight to.

### Step 0 — which directory a row lives in, and excluding it

**A row's directory is `<project name>-<row suffix>`, unless the layout's `Directory` column says otherwise.**

| The `Directory` column is | Treatment |
|---|---|
| **omitted** | `<project>-<row>`. Create it from `Template` if missing. **The default** |
| **written** | look for exactly that directory, **and never create.** A stated directory declares the repository already exists — if it is not there, **stop and ask** |

**Then register the directory in both of this repository's exclusion lists, unless it already matches them** — the gitignore, and the lint config's ignore list.

**A directory named outside the default pattern matches neither, and both failures are silent.** An unexcluded implementation repository gets committed wholesale into the hora repository, and the root's lint walks into a repository whose config is not its own. **Add one entry per unmatched directory, to both files, and report that you did.**

### Step 1 — creating a row from its `Template`

| The `Template` column says | What to do |
|---|---|
| **a repository to clone** | fetch its newest released tag, not a branch head (`../hora/references/structure.md`, invariant 3). Then **discard its history**: `rm -rf <dir>/.git` |
| **a command that scaffolds** | run it, in a directory of that name |
| **`existing`** | create nothing. The row is expected to be there already |

**`.git` is discarded so that hundreds of somebody else's commits never land on a product repository's `main`.** Keeping it would allow pulling upstream updates, which is not worth that cost.

**If the directory already exists, skip steps 1 and 2 for that row** — treat it as already created, however it got there. **Still run steps 3 onward**, each of which is its own idempotent check.

**This is not only for the idempotent re-run.** A private template's clone fails in a non-interactive session for lack of credentials, so a human commonly places the directory themselves beforehand.

**A repository that already existed keeps its own history untouched.** Hora is adopted onto a repository, never over it.

**Never overwrite configuration a row already carries.** A repository adopted into hora very often brings its own environment setup, tuned to that project. Leave it, read what it offers, and **report the difference against the spec's services table.**

---

## 2. Equip the conventions package

The spec's document information declares one, or declares `none` (`../hora/references/spec-format.md`, "1. Document information").

```bash
.claude/skills/hora-setup/scripts/equip-skills.sh <the directory holding its skills>
```

**Resolve that directory however the package is distributed** — a dependency tree, a submodule, a cloned repository, a plain path. The script is a copy with a cleanup; it knows nothing about distribution.

**This does not wait on any row being created.** Run it on every invocation: the package may have been updated, and the script synchronizes rather than overlays, so a re-run leaves nothing stale behind.

**Everything `/hora-build` and `/hora-accept` delegate to comes from here.** Without this step, every one of those delegations has nothing to reach.

**Where the spec declares `none`, say so and continue.** Every gate then runs without conventions and records that it did.

Report what was equipped, by count, and **name anything a later checkpoint will look for and not find.**

---

## 3. Read what arrived, in place

**This skill bakes in no knowledge of any template's conventions.** The newest tag is always fetched, so anything written down here would eventually disagree with the real thing.

1. If there is a `CLAUDE.md` or equivalent, read it — the maintainer updates it alongside the code
2. Otherwise read the tree in place

At minimum, get hold of:

```
Directory layout          where things go
How servers are split     how several servers are separated, and their entry points
Naming conventions        how classes, files and tables are named
How tests are written     placement, naming, helpers, the mocking style
The existing interface    how it is defined
How things get registered automatic through directory scanning, or an
                          aggregation file to append to
Existing model definitions and how they map to migrations
Commands                  the lint, test, install and database commands, by name
The lint configuration    its rule set, and which rules are formatting-only
A local end-to-end stack  whether one ships, and its up/seed/clean commands
```

**"How things get registered" deserves particular care.** If registration is automatic, implementation only has to drop its own file in and the aggregation-file problem disappears entirely. If appending is required, several checkpoints end up touching one shared place. **It is the highest-value thing to check.**

**"The lint configuration" is what `/hora-build` needs to resolve a rule contradiction** (`../hora-build/SKILL.md`, "A lint rule contradiction"). Record which rules restrict what may appear in the code, and which only shape how it is formatted.

**The real tree beats any assumption. This step stays even after a `CLAUDE.md` exists.**

### Record what was read, and at what tag

Write it to `.hora/tree/<repository>.md`, with the tag at the top:

```markdown
# myproject-core
<!-- template: <name> <tag> -->

## Commands
| Purpose | Command |
|---|---|
| lint | … |
| lint, fixing what it can | … |
| test | … |
| install a dependency | … |

## Directory layout
...
```

**Re-read and rewrite it whenever the recorded tag no longer matches the row's own.** Otherwise, trust what is recorded.

**This is a cache, not a source.** It exists because `/hora-build` crosses many sessions. **On any disagreement, the tree wins**, and the record gets rewritten from it.

---

## What this skill does not do

| Not done | Why |
|---|---|
| vendoring a template into this repository | upstream is updated piecemeal, and it would contradict the gitignore |
| keeping `.git` and holding an upstream remote | mixes somebody else's commits into the product repository's history |
| making a row a submodule | the consistency gained is not worth the complexity |
| baking a template's conventions into this file | they will disagree with the real thing eventually. Step 3 reads them in place |
| upgrading a dependency | following upstream is a human's deliberate act |
| starting the services | a human does that when they want it. `/hora-accept` is where an environment becomes a prerequisite, and it says so rather than acting |

---

## References

| File | Content |
|---|---|
| `scripts/equip-skills.sh` | copies a conventions package's skills into `.claude/skills/` |
| `../hora/references/structure.md` | the layout, the per-repository command rule, the invariants |
| `../hora/references/spec-format.md` | the repository layout table, and the services table |
| `../hora/references/commits.md` | the branch each created repository starts on |
