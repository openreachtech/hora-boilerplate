# The design document format

The authority on the format of `specs/<version>/spec.md`. **This file is the explanation; `specs/skeleton/spec.md` is the blank spec you fill in.**

**This file explains the format. It is not the thing you fill in** — `specs/skeleton/spec.md` is the blank spec, copied into `specs/<version>/spec.md`. `specs/1.0.0/spec.md` ships empty; a human writes it, reading this and filling in that, the same way every later version's `spec.md` gets written.

---

## The thinking behind the format

**Make a format that someone a little sloppy can still write.** A missing annotation (`id` / `target` / `depends`) is inferred from the content and filled in by `/hora`, which records that it inferred it as a question. Strict adherence to the format is not the goal.

**But "what to build" and "what counts as done" have to be written.** If `/hora` infers those, it ends up inventing what the spec does not say.

| Fine to be sloppy about | Must be written |
|---|---|
| forgetting an annotation | the implementation scope (what to build this time, what is out of scope) |
| how sections are numbered | **the use cases** and **the acceptance criteria** of every feature |
| the order chapters appear in | **which kind each API operation is** (query / mutation / subscription / REST) |
| typos (raised as a question, but not blocking) | how existing assets are handled, and links to supporting material |

---

## Directory layout

**There is exactly one structural requirement: `spec.md` sits directly under the version directory.** Beyond that, file names, folder names, and how deep the nesting goes are all free — a project's own layout does not need to change to be read by `/hora`.

```
specs/
  1.0.0/
    spec.md               ← the entry point. One per version. The only fixed name
    attendance/
      spec.md              ← a feature file (optional). Linked from spec.md
      monthly/
        spec.md            ← nesting is allowed. id is attendance--monthly
    spec/
      00-overview.md        ← a declared source (below). Any name, any location
    docs/
      RPA_CORE_SPEC.md       ← supporting material. Linked from spec.md's Annex, not declared as a source
  1.1.0/
    spec.md
    spec/
      00-overview.md          ← kept per version even if the content is the same
```

**Everything `/hora` reads is reached by following links from `spec.md`.** A file nothing links to — from `spec.md`, from a feature file, or transitively through either — is never read, and raises a question (`orphan`, `blocking: no`). This is the one thing that stays closed: not the shape of the directory, but the requirement that nothing depends on `/hora` noticing an unlinked file by luck.

**A linked file is read one of two ways, decided by whether it is declared under a `Sources` section — not by where it sits or what it is named.**

| | Declared under `Sources`, or is a `<feature>/spec.md` | Linked, but not declared |
|---|---|---|
| Read for | extraction — `id`/`target`/`depends`, tasks, contracts | interpretation only |
| Ever produces a feature | yes | never |

List a declared source by relative link, in a **Sources** section in the entry point (or a feature file):

```markdown
## Sources

| Source | Provides |
|---|---|
| [00-overview.md](./spec/00-overview.md) | domain, terms, non-functional requirements |
| [10-requirements.md](./spec/10-requirements.md) | `FR-*`/`NFR-*`/`SEC-*` |
```

`/hora` then reads each listed file exactly as it would read a `<feature>/spec.md` — the same extraction rules apply, including deriving `id`/`target` from the spec's own scheme and extracting at row granularity where those apply (see the annotations section below).

**Everything else linked but not declared is supporting material, read for interpretation only.** Reference it with a relative link from whichever file needs it.

**Gather those links under an `Annex` section in the entry point, instead of scattering them across whichever section happens to need one.** `Annex` is `Sources` run in reverse: `Sources` promotes a list of files into feature files, `Annex` only gathers relative links in one place and changes nothing about how they are read. A file listed there is exactly as interpretation-only as a bare link in running prose would be — listing it in `Annex` rather than under `Sources` is what keeps it that way.

```markdown
## Annex

| File | Provides |
|---|---|
| [RPA_CORE_SPEC.md](./docs/RPA_CORE_SPEC.md) | <one line: what it helps interpret, and which section or requirement it relates to> |
```

**This is a fixed part of `spec.md`'s format, unlike the files it lists.** The section is always named `Annex`, sits in the entry point, and needs no `<!-- target: -->`/`<!-- depends: -->` (below) — but which files exist under `specs/<version>/`, and what they are named, stays exactly as free as it always was. Where nothing is linked from a section's own prose and nothing warrants gathering in one place, `Annex` may be left out entirely.

**There is exactly one starting point: `spec.md`.** A file that cannot be reached from it is never read, regardless of its name or where it sits.

### Split by feature once it grows

While it fits in one file, there is no need to split it. Once it grows, make a subdirectory **per feature**, place a file named `spec.md` in it, and link it from the entry point.

**Splitting by repository is allowed, but only when a single contract document already pins the API down and every per-repository file only references it.** One feature usually spans several repositories (a table lives in the backend, a screen in a frontend, an API sits at the boundary between them). Split by repository without that single authority in place, and one feature's description tears into two files, and **the shape of an API ends up written independently in two places, which will disagree.** Since both are written by humans, `/hora` has no way to judge which is correct, and can only stop with a question.

The contract (`.hora/contracts/`) exists precisely because "backend and frontend deriving a schema independently disagree". Splitting the spec by repository reopens that same disagreement at the spec stage — unless a single document already settles it and every per-repository file defers to it instead of writing its own shape.

What stays in the entry point is **only what applies to the whole version.**

```
repository layout / implementation scope / terminology / non-functional requirements /
implementation plan / existing assets / manual verification
+ links to the feature files
```

**A feature file writes `target` on its H1** (as above). It shows which repository the feature is implemented in, right at the top of the file.

### The folder name becomes the `id`

**Folder names are kebab-case.** They are not class definitions, so the name itself says so.

**The path relative to `specs/<version>/` becomes the feature file's H1 `id`, as is.** The path is unique, so the uniqueness of `id` is structurally guaranteed.

```
attendance/spec.md               →   id: attendance
attendance/monthly/spec.md       →   id: attendance--monthly
attendance-monthly/spec.md       →   id: attendance-monthly
```

| Symbol | Meaning |
|---|---|
| `--` | **separates folders.** Used for nothing else |
| `-` | separates words (kebab-case) |

**Never use `--` in a folder or file name.** Reserving it for separation alone makes the reverse lookup from `id` to path unique.

**Nesting is allowed. There is no limit on depth.** Going deeper makes the `id` longer, which is itself a natural brake. If all that is wanted is to show grouping, giving headings to the entry point's feature list expresses it better (it can carry both order and explanation).

**A `##` section's `id` joins to its feature's `id` with a single `-`.**

```
attendance--monthly-data-model
attendance--monthly-screen
```

A task's reference is `<!-- spec: <id> -->` alone, with no namespace. Without a prefix, it would collide with another feature's `data-model`. **This is a rule, not a suggestion.**

When a `##`'s `id` is forgotten, `/hora` **does not invent one.** It ties that section's tasks to the H1's `id` and reports it as a question. Only the granularity of tasks gets coarser.

Splitting by feature naturally results in some file's section pointing at just one repository. **That is a result, not a rule of splitting by repository.**

**Only the directory name is authoritative for the version.** If the text inside the document contradicts it, `/hora` raises a question. The first version is always `1.0.0`.

### From the second version on, write a diff

**Only the lowest version is full. Everything after it is a diff against the version right before it.** Only the sections that changed need to be written.

```
1.0.0   full
1.0.1   a diff from 1.0.0
1.1.0   a diff from 1.0.1      ← not a diff from 1.0.0
```

`/hora` resolves it by overwriting keyed on `id`. **A section that was not written carries over as it was in the previous version.** To withdraw one, do not delete the section — add `kicked: yes` instead (below).

| What the diff wrote | Result |
|---|---|
| heading and annotations only | annotations are overwritten one by one. **The body carries over from the previous version** |
| heading, annotations and body | the whole body is replaced |

To change just one annotation, write only the heading and that annotation. There is no need to copy the body over.

**Annex material is not diffed in parts.** Prose cannot be patched, so **the version that wants to change it places the whole text.** A version that does not change it need not hold a copy. It is the same overwrite rule as `spec.md`.

**Past versions must not be rewritten.** Fixing 1.0.0's material for the sake of 1.1.0 changes the meaning of 1.0.0's spec retroactively, and what was actually built there can no longer be reproduced. To fix it, place the full text on the 1.1.0 side instead.

---

## Section annotations

Written as an HTML comment **directly under** the heading. The annotation moves with the section if it is relocated.

```markdown
## 6. Data model
<!-- id: data-model -->
<!-- target: backend -->
<!-- depends: none -->
```

Required at the `##` level. Optional at `###` and below (it inherits from the parent; state it to override).

**A feature file must carry `target` on its H1.** It becomes the default for the whole file, which every `##` inherits. **It always shows, at the very start of the file, "which repository is this feature implemented in".**

```markdown
# Audit log
<!-- id: audit -->
<!-- target: backend, frontend-admin -->
<!-- depends: none -->

## 1. The audit log's data model
<!-- id: audit-data-model -->
                                  ← inherits the H1 since target is not written
## 2. The audit log list screen
<!-- id: audit-screen -->
<!-- target: frontend-admin -->    ← stated explicitly, overriding it
```

If the whole file belongs to one frontend, writing it once on the H1 covers every section. For a feature that spans repositories, write both on the H1 and narrow it just for the screen section.

The entry point's `spec.md` is a document about the whole version, so its H1 needs no `target`.

### `id`

kebab-case. Unique within the document. **Once given, it never changes.**

Never use a section number as an identifier. Insert one section and every number shifts, breaking every reference recorded in `.hora/tasks/`.

```
❌  <!-- spec: §6.2 -->        becomes §6.3 the moment a section is inserted
✅  <!-- spec: data-model -->  stays the same however the number changes
```

A section number may stay on the heading for a human to read. `/hora` only looks at `id`.

A reference from `.hora/tasks/` takes the form `<!-- spec: <id> -->`. **No file name, no version.** There is exactly one entry point per version, so the file name is always the same value, and the version is already carried by the path `.hora/tasks/<version>/` itself.

### `target`

**Which repositories this feature touches.** Matches a repository name's suffix.

| Value | Meaning |
|---|---|
| a row in the repository layout | that repository. **The name with `<myproject>-` removed** (`<myproject>-frontend-admin` → `frontend-admin`; the backend is a single repository, so always `backend`) |
| `app` | `<myproject>-app`. Something that spans several repositories |
| `none` | no feature is generated from this section |

**`target` decides which checkpoints a feature runs through.** A feature whose `target` is `backend` alone skips the frontend gate entirely; one that names a frontend row runs it. It no longer decides which file a task is written to — one feature is one file, whatever it touches — so getting it wrong changes what gets built, not just where a line is filed.

**Make it match the name written in the repository layout section.** `/hora` stops with a question on a mismatch.

Several values are comma-separated (`<!-- target: backend, frontend-admin -->`).

**It is not cut per server.** A repository is the unit of a write conflict and of a git branch, and that is what `target` names. Which server a feature is implemented for is shown by the server table and by the feature's own text.

**`none` does not mean "do not read".** Some sections produce no feature and `/hora` must still always read them (non-functional requirements, the implementation plan, terminology, future design constraints). All `target` controls is **which repositories a feature touches, and therefore which checkpoints it runs.**

### `depends`

The `id` of the sections it depends on. Used to guarantee implementation order. State `<!-- depends: none -->` explicitly when there are none.

### `kicked`

**To withdraw a feature, add this instead of deleting the section.**

```markdown
# Payroll
<!-- id: payroll -->
<!-- target: backend, frontend-admin -->
<!-- kicked: yes -->
```

Deleting it leaves `/hora` unable to tell "absent" from "deleted", since under the diff scheme every section that was not changed is "absent".

`/hora` reads `kicked: yes` and withdraws the task, **raising a removal task if it was already implemented.** Removing a task does not remove the code that was written, so without this, a feature that is not in the spec keeps living in the code.

**Do not write the reason in the body.** Since writing the body replaces the whole body, the spec's own text would get replaced by a sentence explaining why, and what should carry over on revival would be lost. The place for the reason is the **implementation scope.**

```markdown
### Out of scope for now (to be built later)
- Payroll → planned for 1.1.0. Deferred because it needs the confirmed attendance totals
```

`kicked` is a mechanical, per-section flag; the reason and the kind (to be built later / permanently out of scope) belong to the implementation scope.

### The two blocks every feature carries

Besides the annotations, a feature section carries two marked subsections. **Both are required, and they are not the same thing.**

```markdown
### Use cases
<!-- usecases -->

- a member of staff clocks in on arrival, and the day's hours appear in the list
- a member of staff who forgot to clock in files yesterday's hours the next day

### Acceptance criteria
<!-- acceptance -->

- a second clock-in on the same day is rejected
```

| | States | What checks it |
|---|---|---|
| **use cases** | who does what, for what purpose, end to end | checkpoints 2, 9 and 11 of `/hora-build`, and the acceptance review |
| **acceptance criteria** | an observable behavior that is either present or absent | the tests written alongside the code |

**A feature with acceptance criteria but no use cases is the failure this exists to prevent.** Every operation returns what it should, no screen strings them into anything a person can do, and nobody finds out until acceptance — at the far end of eighteen checkpoints, which is the most expensive place to find it. `/hora-plan` stops with `missing-usecase` (`blocking: yes`) rather than let that happen.

**Where a feature is split across several `##` sections** (a data model here, an API there, a screen further down), write the use cases **once, on the feature's H1**, and let the sections inherit them. Acceptance criteria stay per section, since each one describes its own behavior.

### Deferring and reviving

Write `kicked: yes` in that version, and `kicked: no` in the next one. **The file of a past version is not rewritten.**

```markdown
<!-- specs/1.1.0/payroll/spec.md -->

# Payroll
<!-- id: payroll -->
<!-- kicked: no -->
```

No `target`, no `depends`, no body. It all carries over from the previous version.

---

## Required sections

| Section | `target` | Role | May a declared Source satisfy it instead of `spec.md`'s own text? |
|---|---|---|---|
| **Application prefix** (the project name) | `none` | **the prefix every repository name is built from. `/hora` stops without it** | **No — write it directly in `spec.md`** |
| **Repository layout** | `none` | **declares which repositories and servers to create. Written in the entry point. `/hora` stops without it** | **No — write it directly in `spec.md`** |
| Implementation scope | `none` | declares what to build this time and what is out of scope | Yes |
| Existing assets | `none` | port existing code, or build new | Yes |
| Manual verification | `none` | the middleware needed, and its version | Yes |
| Terminology | `none` | the source of `glossary.md` | Yes |
| Implementation plan | `none` | the order of tasks | Yes |
| Non-functional requirements | `none` | constraints that apply to every task | Yes |
| Sources (optional) | `none` | lists files, by any name, that act as feature files without being named `spec.md` | — |
| Annex (optional) | `none` | gathers relative links to supporting material in one place. Unlike `Sources`, a file listed here never becomes a feature file and produces no task | — |
| (below this, one section per feature) | a repository name / `app` | what gets implemented | — |

**Every feature section carries its own `<!-- usecases -->` and `<!-- acceptance -->` blocks** (above), and an API's table states the kind of every operation (below). None of the three may be inferred, and each is `blocking: yes` when missing.

**Two roles cannot be satisfied by a declared Source and must be written directly in `spec.md`: the project name and the repository layout.** Both are decisions, not facts to locate. A Source might contain evidence for either (a database name, a tech-stack table) but that is indirect evidence, not a stated decision — and `/hora-setup` needs both before it has any reason to read a Source deeply. Getting either wrong is expensive to undo (every repository gets renamed), so `/hora` never infers them from Source content, however strongly implied.

**Every other required role may be satisfied either by `spec.md`'s own text or by a declared Source — `/hora` looks in both, not only the former.** The same role-recognition that already applies to `spec.md`'s own required sections applies to a declared Source's sections too: a heading in `00-overview.md` that is recognizably "the implementation scope" satisfies that role, whether or not `spec.md` also repeats it. Only when a role is found in neither place is it missing.

**This is not an open-ended search.** `/hora` reads `spec.md` itself and whatever is reachable from it — a feature file, a declared Source, supporting material linked from either — and nothing else. A role's content sitting in a file `spec.md` does not link to, declare, or reach transitively is exactly as invisible as if it did not exist.

**None of the required sections above need `<!-- id: -->`/`<!-- target: -->`/`<!-- depends: -->` written on them.** Every one of them always has the same role: `target: none`, `depends: none`, and an `id` fixed by that role, not invented per project. There is nothing here for a human to decide, so there is nothing to write. `/hora` recognizes each one by its role — the same way it already reads a `target: none` section's content for meaning (a repository-layout table, a scope split into three kinds, and the like) — not by matching heading text literally, so rewording or translating a heading does not break anything.

**This is different from a feature section's `id`.** A feature's `id` is chosen once, by a human (or taken from the spec's own existing scheme, above), and must never change afterward — that permanence is what makes `.hora/tasks/`'s references safe. A required section's role never varies project to project, so there is no choice being made, and nothing to keep permanent beyond the role itself.

---

## The blank spec is a separate file, and it lives under `specs/`

**`specs/skeleton/spec.md` is the blank spec** — every heading and every table header, with nothing filled in and nothing explaining itself.

```bash
cp specs/skeleton/spec.md specs/1.0.0/spec.md
```

**The two are split on purpose.** A template with its explanation woven through it is a template you have to strip before you can use it, and an explanation cramped into HTML comments is one nobody reads twice. **This file explains; that file gets filled in.**

**It sits under `specs/` rather than beside this file because that is where it is used.** Copying it is a plain `cp` inside one directory, and the copy lands in the shape it is meant to have — `specs/<version>/spec.md`, the one structural requirement of the whole format.

**`specs/skeleton/` is not a version, and is never treated as one.** `/hora` reads only the directories under `specs/` whose name is a semver version, so the skeleton is never planned, never implemented, and never counted as unfinished. It also raises no `orphan` question: that rule is about files inside a version that nothing links to.

**Copying it is a human's action.** No hora skill writes into `specs/` — `/hora-plan` is the single exception, and only one approved edit at a time, in conversation.

The skeleton's sections 8 onward are **examples of feature sections, not a fixed list.** Delete what a project has no use for, add what it needs, renumber freely: `/hora` reads `id`, never a section number.

---

## What goes in each section

### 1. Document information

| Item | Content |
|---|---|
| Product version | match the directory name (`1.0.0`) |
| Document revision | this document's own revision number. Separate from the product version |
| Author | a name |
| Question language | `Japanese` / `English`. Defaults to the language of whoever runs `/hora` |
| Annotation source | omit for the default. Or a link to a table in this spec mapping identifier prefixes to a target |

**`Question language` is the language `/hora` writes into `.hora/questions/`.** Whoever runs it is usually Japanese, so this may be left out — but **on a project whose client side includes foreign members, the operator's language leaves someone unable to read it.** A question stays in a file and is read by whoever edits `specs/` next, so it cannot be settled by the operator's convenience alone. **Never write two side by side:** a single question written twice leaves no original, and only one half ever gets updated.

**`Annotation source` only needs writing when the spec already carries its own permanent, unique identifier per requirement or element** (`FR-010`, `TBL-01`, `SCR-03`) plus a table mapping each identifier's prefix to a target. Point this at that table and `/hora` takes `id` from the element's own identifier and `target` from the table, instead of requiring `<!-- id: -->`/`<!-- target: -->` on every section. Omit the row for the default.

**The project name is written as prose, right under the table.** It becomes the **project prefix** of every repository name, and `/hora-setup` combines it with the repository layout table to create the actual repositories. **It is not derived from a directory name, so it must always be written here.**

### 2. Repository layout

```markdown
| Repository | Origin | Role |
|---|---|---|
| `<myproject>-backend` | renchan | the API and jobs (holds the DB) |
| `<myproject>-frontend-employee` | furo | the employee-facing screens |
| `<myproject>-frontend-admin` | furo | the admin screens |

### 2.1 Servers

| Server | protocol | consumer |
|---|---|---|
| `employee-graphql` | GraphQL | `frontend-employee` |
| `admin-graphql` | GraphQL | `frontend-admin` |
| `public-rest` | REST | the phone app |
| `worker` | — | an API server in the same repository (no contract needed) |
```

**`/hora-setup` reads this table to decide which repositories to clone. Without it, it stops.**

- **This section belongs in the entry point.** The layout applies to the whole version, so writing it in a feature file does not count as the declaration
- **The backend is exactly one.** The policy is one DB system = one repository, so `/hora` stops with a question at zero, or at two or more
- **Frontends are zero or more, freely.** Some projects have none at all (an API-only project for a phone app). `furo` cannot hold more than one Nuxt app per repository, so repositories split along groups of screens
- **One backend holds several servers side by side** (renchan-core's design). A GraphQL server for employees and one for admins may run separately. **The server table is the unit contracts are derived from, so it must always be written**, and its `consumer` column lets you read in one place which frontend looks at which contract
- **Adding a row in a later version** makes `/hora-setup` create that repository when the version is planned
- **Names read `<myproject>-<role>-<purpose>`** — `<myproject>-frontend-admin`, not `<myproject>-admin-frontend`. Role first keeps repositories of the same role adjacent, so `app` → `backend` → `frontend-*` is the order of implementation
- **`Origin` is either `renchan` (backend) or `furo` (frontend).** `<myproject>-app`, the repository this spec lives in, is not written here — it always exists
- **`target`'s value is this table's repository name with `<myproject>-` removed**

### 3. Implementation scope

**Always keep the two kinds of "out of scope" apart. Confusing them wrecks the design.**

```
out of scope for now (to be built later)  → /hora leaves an extension point,
                                             kept replaceable
permanently out of scope                  → /hora does not abstract it.
                                             Excludes it from the design
```

Read the first as the second and the structure cannot take it later. Read the second as the first and an abstraction layer gets built that nobody uses.

Write "for now" entries with what unblocks them (`<feature C> → planned for 1.1.0`, or `→ once the trigger condition is met`).

### 4. Existing assets

```markdown
Current implementation: <none (new) / repository name or path>
Treatment: <port it (read the logic and move it) / reference it (match the behavior only, rewrite the implementation)>
```

**Required, since it changes what gets built.** If "reimplement" is written but whether the code is visible is left unstated, `/hora` stops with a question.

### 5. Terminology and domain concepts

Becomes the source of `.hora/glossary.md`. **Identifiers (class names, table names) are decided by `/hora-plan` after checking them against the lint rules**, so a term and its description are enough here. Write a name down only if one has already been decided.

### 6. Non-functional requirements

Produces no feature of its own, **but becomes a design constraint on every one of them**, so `/hora` always reads it. Performance, availability, security, and the like.

### 7. Manual verification

```markdown
| Middleware | Version | profile | Purpose |
|---|---|---|---|
| MariaDB | 10.5.12 | (default) | the primary data store |
| Redis | 7.4 | (default) | BullMQ |
| MinIO | latest | `minio` | S3-compatible object storage |
```

What `/hora-setup` uses to decide `docker-compose.development.yml`'s profiles and `.env.development`'s `COMPOSE_PROFILES`.

**Write the server's version.** An npm dependency — a mariadb driver, say — does not indicate the server's version, and without this `/hora` has to guess. **Redis cannot be dropped in a project with any Job (BullMQ).**

### 8 onward — the feature sections

Each one carries its annotations, then its content, then its `<!-- usecases -->` and `<!-- acceptance -->` blocks (above, "The two blocks every feature carries").

**A data model section is the one that carries acceptance criteria without use cases of its own.** A table has no user-facing use case; the features built on it do.

**An API table must state the kind of every operation**, and the kind is never inferred (`structure.md`, invariant 2) — query, mutation and subscription are three different conventions on both sides of the wire, and `/hora-build` branches on the value at three separate checkpoints. Leave it out and `/hora-plan` stops with `undefined-api-kind` (`blocking: yes`).

```markdown
| schema | input | result | kind |
|---|---|---|---|
| `rpaFlows` | `RpaFlowsInput(pagination)` | `RpaFlowsResult` | query |
| `createRpaFlow` | `CreateRpaFlowInput` | `CreateRpaFlowResult` | mutation |
| `rpaFlowUpdated` | `RpaFlowUpdatedInput` | `RpaFlowUpdatedResult` | subscription |
```

**If an input's fields are unknown, `/hora` would have to invent the shape of an API, so it stops.**

```
RpaFlowsInput(pagination)  the contents are indicated in parentheses
                           → derived after an existing schema. Does not stop
RpaFlowsInput              fields unknown
                           → stops with blocking: yes
```

Writing the SDL directly is the most reliable option.

**The RESTful API section is written only when the repository layout declares a server whose protocol is REST**, and a project with none leaves it out entirely. The same rules apply — an unknown request or response shape stops with `blocking: yes` — and **the renderer's own name is what gets implemented and what the frontend's client is built against.**

```markdown
| method | path | renderer | request | response |
|---|---|---|---|---|
| `GET` | `/v1/rpa-flows` | `GetRpaFlowsRenderer` | `?page=&limit=` | `RpaFlowsResponse` |
```

### 12. Implementation plan

`/hora-plan` extracts the order of `_plan.md` from this. **It does not derive an order of its own.**

**These are the project's own milestones.** They have nothing to do with `/hora-build`'s checkpoints, which are the same eighteen for every feature.

**Check that "fine to leave for later" matches up with the scope section's "out of scope for now".** `/hora` stops with a question if the two do not clearly correspond.

### 13. Key file map

Write this where you can. `/hora` decides placement together with the real tree `/hora-setup` reads.

### Sources and Annex

Both optional, both covered above under "Directory layout". `Sources` promotes files into feature files; `Annex` only gathers relative links in one place and changes nothing about how they are read.

---

## How to write use cases

**One use case is one person completing one thing, from where they start to where they are done.** Not a feature list, not a screen inventory, and not a restatement of the API.

```markdown
### Use cases
<!-- usecases -->

- a member of staff clocks in on arrival, and the day's hours appear in their list
- a member of staff who forgot to clock in files yesterday's hours the next day,
  and their manager sees it waiting for approval
- a manager approves a month's attendance in one pass and the totals lock
```

| Write | Not |
|---|---|
| who is doing it | "the system does X" |
| what they are trying to achieve | "there is a button for X" |
| where it starts and where it ends | a step in the middle, with no beginning |
| enough that someone could follow it with no access to the code | selectors, endpoints, table names |

**A use case is what three separate checkpoints verify against**, each asking a different question of the same sentence:

| Checkpoint | Asks |
|---|---|
| 2 | can the spec, as written, support this at all? |
| 9 | can the API that was actually built support it, call by call? |
| 11 | can a person actually do it, on the screen that was actually designed? |

The three fail in different ways, and each failure is cheaper to fix at its own gate than at the next one.

**Without use cases, `/hora-plan` stops with `missing-usecase`** (`blocking: yes`). Inferring them would mean inventing what the product is for.

---

## How to write acceptance criteria

**Do not write a condition common to every feature.** That `npm run lint && npm test` passes is common to all of them, so it is not repeated. Write a section's specific **behavior.**

```markdown
### Acceptance criteria
<!-- acceptance -->

- `createRpaFlow` returns an error on a duplicate `flow_key`
- an empty `nl_procedure` produces a zod validation error
- `rpa_compiled_flows` tied to a deleted flow disappear via CASCADE
```

**Without one, `/hora` stops with a question** (`blocking: yes`). Acceptance criteria are the definition of "what counts as done", and `/hora` must not decide that. Filling it in by inference would leave the implementer grading their own work.

**A use case is not an acceptance criterion, and neither substitutes for the other.** The use case above ("a member of staff clocks in on arrival…") does not say what happens on a second clock-in; the criterion ("a second clock-in on the same day is rejected") does not say why anyone would clock in at all. A section needs both.

### A behavior that only exists once two sections cooperate

**Write it as its own section, depending on both.** "A user who just signed up can sign in with the same credentials" needs `#sign-up` and `#sign-in` to both already exist — it belongs to neither one alone. `/hora` never splits this out on its own (that would mean inventing a requirement the spec never stated), so a scenario left unwritten simply never becomes a feature.

```markdown
## Signing in right after signing up
<!-- id: sign-up-then-sign-in -->
<!-- target: backend -->
<!-- depends: sign-up, sign-in -->

Adds no code of its own — `#sign-up` and `#sign-in` already provide it. This section
only exists to test the two together.

### Acceptance criteria
<!-- acceptance -->

- a user who just signed up can sign in with the same credentials, receiving a session
```

The "adds no code of its own" line carries straight into the task's `Constraint`, the same way any other note in a section's body does — `/hora` copies it, it does not decide it.

---

## Supporting material

**The file itself: any name, any location.** Only `spec.md`'s own format is fixed; nothing under `specs/<version>/` beyond it has to follow a convention.

**How it is reached: gathered under `Annex` in the entry point** (above), or referenced inline with a relative link from whichever section needs it — both work, `Annex` just keeps them from being scattered one link per section.

```markdown
See the [RPA core spec](./docs/RPA_CORE_SPEC.md) for details.
```

`/hora` follows links starting from `spec.md`. **A file nothing links to is never read.** If an orphaned file exists, it raises a question (`blocking: no`). Not listing it under `Sources` is what keeps it interpretation-only, whether it is reached through `Annex` or an inline link.

Supporting material needs no annotation. Features are extracted from `spec.md`, feature files and declared Sources alone; supporting material is read as material for interpretation.
