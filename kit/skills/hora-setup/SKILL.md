---
name: hora-setup
description: Create the repositories the spec declares from the stack handbook, fill in the project's values, and read what was fetched in place. Idempotent — creates only what is missing, and re-evaluates on every version. Invoked by /hora, or directly as /hora-setup.
---

# hora-setup

**Code setup.** Create the repositories the spec declares, fill in this project's values, and read the real tree that arrived.

Read `../hora/references/structure.md` first — the repository layout, where a per-repository command runs, and the invariants. **This skill is strictly read-only on `specs/`.**

**This skill holds no knowledge of any technology stack.** Which boilerplate fills a declared row, what gets filled in, and what to read once it is there all come from the project's **stack handbook** — read `references/handbook.md` for where it lives and what it answers. A missing handbook, like a missing declaration, is a stop-and-ask, never a guess.

## What this skill is for

```
1. Create only the repositories that are missing, from the declaration and the handbook
2. Fill in the values that carry this project's name
3. Read what was fetched, in place, and record what was read
4. Where the equipped skills cover test caching, wire it over the rows that
   were created — and where nothing covers it, skip it and say so
```

**Step 4 owns nothing but the list.** Which directories are verification units is this skill's own knowledge — one per created row, each with the test command already recorded in `.hora/tree/<repository>.md` — and that list is the whole of what it hands over. What a cache declaration looks like, where it lives, and what git must ignore for it belong to the skills covering test caching, matched at run time by description like any other delegate. **Nothing here authors that declaration itself**, and a project with no such skill equipped is fully set up without one.

**It is idempotent, and it re-evaluates on every version.** Repositories arrive in later versions, so passing this once is not the end of it. Anything already there is passed over.

---

## 1. Create what is missing

**Which repositories to create is declared by the spec's repository layout section.** Never carry any assumption about which rows a project has.

If there is no declaration, **stop here and ask.** Adding a repository is an architectural decision.

| Detection | Action |
|---|---|
| No repository layout section | **stop and ask** |
| An `Origin` value the handbook's catalog does not list | **stop and ask.** It is not an origin |
| A row count outside an origin's stated bounds (the catalog's "how many") | **stop and ask.** The bounds are the stack's architectural constraints |
| No table of servers | **stop and ask.** Contracts cannot be derived |

**The repository layout must be written in the entry point (`specs/<version>/spec.md`).** Written in a feature file, it does not count as the declaration.

Settle the project name first, from `specs/<version>/spec.md`. **If it is not written, stop here and ask.** It must not be derived from the directory name, and — unlike most required roles — **it must not be taken from a declared Source either.** The project name and the repository layout are decisions, not facts to locate.

**Once it is settled, also fill in this repository's own `package.json`** (`name` / `description`) — it ships with the same placeholder a fetched boilerplate does. **Leave `version` and `private` as they are:** the tag carries the version, and `private` guards against an accidental publish.

The essentials for each declared row, in order — **the content of steps 1–2 and 5–8 comes from the row's origin document** (`references/handbook.md`):

```
0. Settle this row's directory (below), and register it in the exclusion lists
1. Find the version to fetch, as the origin document directs — a released state,
   never an unreleased head (../hora/references/structure.md, invariant 3)
2. Fetch it into that directory, from the source the origin document names
3. rm -rf <dir>/.git && git -C <dir> init && git -C <dir> checkout -b release/<version>
4. git -C <dir> commit --allow-empty -m "Release <version>" (the branch's opening
   marker — see ../hora/references/commits.md)
5. Fill in every value the origin document lists, with this project's values
6. Place every file the origin document lists, deciding anything spec-dependent
   from the spec's declared sections, as the document directs
7. Install dependencies, as the origin document directs
8. Copy the skills the origin document declares into <dir>/.claude/skills/,
   each only if it is not already there
```

### Step 0 — which directory a row lives in, and excluding it

**A row's directory is `<project name>-<declared row>`, unless the layout's optional `Directory` column says otherwise.**

| The `Directory` column is | Treatment |
|---|---|
| **omitted** | `<project name>-<declared row>`. Fetch the boilerplate into it if it is missing. **The default, and the only case a new project meets** |
| **written** | look for exactly that directory, **and never fetch.** A stated directory declares that the repository already exists — if it is not there, **stop and ask** |

**Then register the directory in both of this repository's own exclusion lists, unless it already matches them.**

```
.gitignore          /*-backend*/ and /*-frontend*/ already cover a default name
eslint.config.js    `ignores` already covers '*-backend*/' and '*-frontend*/'
```

**A directory named anything else matches neither, and both failures are silent.** An unexcluded implementation repository gets committed wholesale into the hora repository, and the root's eslint walks into a repository whose config is not its own. Add one entry per unmatched directory, to both files, and **report that you added it.** Write the entry exactly as declared, with no wildcard around it — the built-in patterns cover a family of generated names; a declared directory is one literal name.

**If `<that directory>` already exists, skip steps 1–4 for that row** — treat it as already fetched, however it got there. **A row with a `Directory` column always takes this path.** `../hora/references/commits.md`'s branch rule still applies to it (fetch and branch from `origin/main` if `release/<version>` is missing, with the same empty marker once created) — it is just not the fresh-`git init` case. This is not only for the idempotent re-run: a boilerplate may be private, so a non-interactive session's own fetch fails for lack of credentials until a human places the row beforehand — the origin document says whether that applies. **Still run steps 5 onward for that row** — each is its own idempotent check, not an all-or-nothing skip.

**Step 8 never overwrites an existing copy.** A human may have customized a copied skill inside their own repository. This copy is also why such a skill can be invoked without `/hora`: it lands in the row's own `.claude/skills/`, reachable and safely editable from a session working there directly.

`.git` is thrown away and re-initialized so that hundreds of commits from somebody else's repo never land on a product repository's `main`.

**This never happens to a repository that already existed.** A row skipped past step 3 keeps its own history untouched — Hora Kit is adopted onto a repository, never over it.

When this step finishes, make an initial commit in each repository it created, on the `release/<version>` branch checked out in step 3, after the empty marker from step 4. Keep the boilerplate's own files separate from the values this run filled in:

```
Initial commit from <boilerplate> <fetched version>
Fulfill project values for <myproject>
```

---

## 2. Read what was fetched, in place

**This skill does not bake in knowledge of the boilerplates' conventions, and neither does the handbook.** The newest released state is always fetched, so anything written down would eventually disagree with the real thing.

The order to read in:

1. If there is a `CLAUDE.md`, read it (the authority, updated by the maintainer along with the code)
2. Otherwise read the tree in place. **The minimum to get hold of is the origin document's own read checklist** (`references/handbook.md`, "What to read once it is there")

The real tree beats any assumption — and beats the handbook. This step stays even after a `CLAUDE.md` exists.

### Record what was read, and what version it was read at

Write it to `.hora/tree/<repository>.md`, with the fetched boilerplate and version at the top:

```markdown
# myproject-backend
<!-- boilerplate: <name> <fetched version> -->
<!-- test cache: wired by <the names you matched> | not equipped, skipped -->

## Directory layout
...
```

**Re-read and rewrite it whenever the recorded version no longer matches the row's own.** Otherwise, trust what is recorded.

**Step 4's outcome is one line in this file, per row, and it is written either way** — the names that were matched, or that nothing equipped covered it. A delegation that went unfilled records having gone unfilled; a line left out is indistinguishable from a run in which nobody looked.

**This is a cache, not a source.** It exists because `/hora-build` crosses many sessions. **On any disagreement, the tree wins**, and the record gets rewritten from it.

---

## What this skill does not do

| Not done | Why |
|---|---|
| Baking the boilerplate into the template (vendoring) | upstream is updated piecemeal over time. It would also contradict the parent's `.gitignore` |
| Keeping `.git` and holding an upstream remote | mixes somebody else's commits into the product repo's history |
| Turning it into a submodule | the consistency gained is not worth the added complexity |
| Restating the handbook's contents in this file | the boilerplate owns them, and a copy here goes stale the first time it moves |
| Authoring a test cache's own declaration | its shape belongs to whichever equipped skill covers caching, and a copy here goes stale the first time that moves |
| Baking the boilerplate's conventions into this file | they will disagree with the real thing eventually. Step 2 reads it in place instead |
| Bumping a dependency's version | following upstream is a human's deliberate action |
| Starting the middleware | a human does that when they want it. `/hora-accept` is where an environment becomes a prerequisite, and it says so rather than acting |

---

## References

| File | Content |
|---|---|
| `references/handbook.md` | the stack handbook: where it lives, what the catalog holds, what each origin document answers, and the rules of the contract |
| `../hora/references/structure.md` | the layout, the per-repository command rule, the invariants |
| `../hora/references/commits.md` | the branch each created repository starts on |
