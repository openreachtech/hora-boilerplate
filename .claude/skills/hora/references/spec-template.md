# The design document template

The authority on the format of `specs/<version>/spec.md`.

**This file must not be copied into `specs/`.** `specs/` is where a human writes, and `/hora` never writes into it. `specs/1.0.0/spec.md` ships empty — a human writes it, referring to this template, the same way every later version's `spec.md` gets written.

---

## The thinking behind the format

**Make a format that someone a little sloppy can still write.** A missing annotation (`id` / `target` / `depends`) is inferred from the content and filled in by `/hora`, which records that it inferred it as a question. Strict adherence to the format is not the goal.

**But "what to build" and "what counts as done" have to be written.** If `/hora` infers those, it ends up inventing what the spec does not say.

| Fine to be sloppy about | Must be written |
|---|---|
| forgetting an annotation | the implementation scope (what to build this time, what is out of scope) |
| how sections are numbered | acceptance criteria |
| the order chapters appear in | how existing assets are handled |
| typos (raised as a question, but not blocking) | links to supporting material |

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
| Ever produces a task | yes | never |

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

Where the task goes. Matches a repository name's suffix.

| Value | Meaning |
|---|---|
| a row in the repository layout | that repository. **The name with `<myproject>-` removed** (`<myproject>-frontend-admin` → `frontend-admin`; the backend is a single repository, so always `backend`) |
| `app` | `<myproject>-app`. A task that spans several repositories |
| `none` | no task is generated from this section |

**Make it match the name written in the repository layout section.** `/hora` stops with a question on a mismatch.

Several values are comma-separated (`<!-- target: backend, frontend-admin -->`).

**It is not cut per server.** What `target` decides is "which task file it is written to", and that is about a write conflict and a git unit — a repository. Which server it is implemented for is shown by the server table and the task's own text.

**`none` does not mean "do not read".** Some sections produce no task and `/hora` must still always read them (non-functional requirements, the implementation plan, terminology, future design constraints). All `target` controls is **which file a task is written to.**

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

**Two roles cannot be satisfied by a declared Source and must be written directly in `spec.md`: the project name and the repository layout.** Both are decisions, not facts to locate. A Source might contain evidence for either (a database name, a tech-stack table) but that is indirect evidence, not a stated decision — and Stage 0 needs both before it has any reason to read a Source deeply. Getting either wrong is expensive to undo (every repository gets renamed), so `/hora` never infers them from Source content, however strongly implied.

**Every other required role may be satisfied either by `spec.md`'s own text or by a declared Source — `/hora` looks in both, not only the former.** The same role-recognition that already applies to `spec.md`'s own required sections applies to a declared Source's sections too: a heading in `00-overview.md` that is recognizably "the implementation scope" satisfies that role, whether or not `spec.md` also repeats it. Only when a role is found in neither place is it missing.

**This is not an open-ended search.** `/hora` reads `spec.md` itself and whatever is reachable from it — a feature file, a declared Source, supporting material linked from either — and nothing else. A role's content sitting in a file `spec.md` does not link to, declare, or reach transitively is exactly as invisible as if it did not exist.

**None of the required sections above need `<!-- id: -->`/`<!-- target: -->`/`<!-- depends: -->` written on them.** Every one of them always has the same role: `target: none`, `depends: none`, and an `id` fixed by that role, not invented per project. There is nothing here for a human to decide, so there is nothing to write. `/hora` recognizes each one by its role — the same way it already reads a `target: none` section's content for meaning (a repository-layout table, a scope split into three kinds, and the like) — not by matching heading text literally, so rewording or translating a heading does not break anything.

**This is different from a feature section's `id`.** A feature's `id` is chosen once, by a human (or taken from the spec's own existing scheme, above), and must never change afterward — that permanence is what makes `.hora/tasks/`'s references safe. A required section's role never varies project to project, so there is no choice being made, and nothing to keep permanent beyond the role itself.

---

## The template

Copy the following and fill it in. Replace anything in `<>`.

````markdown
# <project name> design document

## 1. Document information

| Item | Content |
|---|---|
| Product version | <match the directory name. e.g. 1.0.0> |
| Document revision | <this document's own revision number. Separate from the product version> |
| Author | <name> |
| Question language | <Japanese / English. If omitted, defaults to the language of whoever runs /hora> |
| Annotation source | <omit for the default (write `<!-- id: -->`/`<!-- target: -->` per section). Or: a link to a table already in this spec that maps its own identifier prefixes to a target — see below> |

<!--
  "Question language" is the language /hora writes into .hora/questions/.
  Whoever runs it is usually Japanese, so this may be left out, but on a
  project whose client side includes foreign members, the operator's language
  leaves someone unable to read it. A question stays in a file and is read by
  whoever edits specs/ next, so it cannot be settled by the operator's
  convenience alone.

  Never write two side by side. A single question written twice leaves no
  original, and only one half gets updated.

  "Annotation source" only needs writing when the spec already carries its
  own permanent, unique identifier per requirement or element (FR-010,
  TBL-01, SCR-03, and the like) plus a table mapping each identifier's
  prefix to a target. Point this at that table and /hora takes id from the
  element's own identifier and target from the table, instead of requiring
  `<!-- id: -->`/`<!-- target: -->` to be written on every section. Omit
  this row for the default.
-->

**Project name: `<myproject>`**

Becomes the **project prefix** of every repository name. `/hora` combines this name with the repository layout table below to create the actual repositories.
**It is not derived from a directory name, so it must always be written here.**


## 2. Repository layout

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

<!--
  /hora reads this table to decide which repositories to clone. Without it, it stops.

  This section belongs in the entry point (specs/<version>/spec.md).
  The layout applies to the whole version, so writing it in a feature file
  does not count as the declaration.

  For now the backend is exactly one. The policy is one DB system = one
  repository, so /hora stops with a question whether there are zero or two
  or more.
  Frontends are zero or more, freely. Some projects have none at all
  (an API-only project for a phone app).

  One backend holds several servers side by side (this is renchan-core's
  design). A GraphQL server for employees and one for admins may run
  separately. The server table is the unit /hora derives contracts from, so
  it must always be written. A consumer column lets you read, in one place,
  which frontend looks at which contract.

  Frontends need not come in pairs. Some projects are only an API for a phone
  app. furo cannot hold more than one Nuxt app per repository, so
  repositories split along groups of screens. Adding a row to this table in
  a later version makes /hora create the new repository during that
  version's Stage 0.

  Names read <myproject>-<role>-<purpose>. It is <myproject>-frontend-admin, not
  <myproject>-admin-frontend. Putting the role first keeps repositories of the
  same role adjacent, so app -> backend -> frontend-* is the order of
  implementation.

  Origin is either renchan (backend) or furo (frontend).
  <myproject>-app (the repository this spec lives in) is not written here. It
  always exists.

  target's value is this table's repository name with <myproject>- removed.
-->


## 3. Implementation scope

### Built this time (<version>)

- <feature A>
- <feature B>

### Out of scope for now (to be built later)

- <feature C> → <planned for 1.1.0 / once the trigger condition is met>

### Permanently out of scope

- <what will not be built>

<!--
  Always keep the two kinds of "out of scope" apart. Confusing them wrecks
  the design.

    out of scope for now (to be built later)  → /hora leaves an extension
                                                 point, kept replaceable
    permanently out of scope                  → /hora does not abstract it.
                                                 Excludes it from the design

  Read the first as the second and the structure cannot take it later.
  Read the second as the first and an abstraction layer gets built that
  nobody uses.
-->


## 4. Existing assets

Current implementation: <none (new) / repository name or path>
Treatment: <port it (read the logic and move it) / reference it (match the behavior only, rewrite the implementation)>

<!--
  Required, since it changes what /hora does.
  If "reimplement" is written but whether the code is visible is left
  unstated, /hora stops with a question.
-->


## 5. Terminology and domain concepts

| Term | Description |
|---|---|
| <Flow> | <description> |

<!--
  /hora turns this into the source of .hora/glossary.md.
  Identifiers (class names, table names) are decided by /hora after checking
  them against the lint rules, so a term and its description here are
  enough. Write down a name here if one has already been decided.
-->


## 6. Non-functional requirements

| Item | Requirement |
|---|---|
| <performance> | <> |
| <availability> | <> |
| <security> | <> |

<!-- This produces no task of its own, but becomes a design constraint on every task, so /hora always reads it. -->


## 7. Manual verification

| Middleware | Version | profile | Purpose |
|---|---|---|---|
| MariaDB | 10.5.12 | (default) | the primary data store |
| Redis | 7.4 | (default) | BullMQ |
| MinIO | latest | `minio` | S3-compatible object storage |

<!--
  What /hora uses to decide docker-compose.development.yml's profiles and
  .env's COMPOSE_PROFILES.

  Write the server's version. An npm dependency (a mariadb driver, say) does
  not indicate the server's version. Without this, /hora has to guess.

  Redis cannot be dropped in a project with any Job (BullMQ).
-->


## 8. Data model
<!-- id: data-model -->
<!-- target: backend -->
<!-- depends: none -->

### 8.1 <table name>

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | bigint | PK | |
| <> | <> | <> | <> |

### Acceptance criteria
<!-- acceptance -->

- <rpa_compiled_flows tied to a deleted flow disappear via CASCADE>
- <a duplicate flow_key is rejected by a unique constraint>


## 9. GraphQL
<!-- id: graphql -->
<!-- target: backend, frontend-admin -->
<!-- depends: data-model -->

| schema | input | result | kind |
|---|---|---|---|
| `rpaFlows` | `RpaFlowsInput(pagination)` | `RpaFlowsResult` | query |
| `createRpaFlow` | `CreateRpaFlowInput` | `CreateRpaFlowResult` | mutation |

<!--
  If an input's fields are unknown, /hora would have to invent the shape of
  an API, so it stops with a blocking question.

    RpaFlowsInput(pagination)  the contents are indicated in parentheses
                               → derived after an existing schema. Does not stop
    RpaFlowsInput              fields unknown
                               → stops with blocking: yes

  Writing the SDL directly is the most reliable option.
-->

### Acceptance criteria
<!-- acceptance -->

- <createRpaFlow returns an error on a duplicate flow_key>
- <an empty nl_procedure produces a zod validation error>


## 10. Screens
<!-- id: screens -->
<!-- target: frontend-admin -->
<!-- depends: graphql -->

### 10.1 <screen name>

<layout, transitions, state>

### Acceptance criteria
<!-- acceptance -->

- <>


## 11. Implementation plan

### Stage 1 (MVP)

1. <#data-model>
2. <basic CRUD for #graphql>

### Stage 2

3. <>

### Fine to leave for later

- <>

<!--
  /hora extracts the order in .hora/tasks/ from this. It does not derive its
  own order.
  Check that "fine to leave for later" matches up with #scope's "out of
  scope for now". /hora stops with a question if the two do not clearly
  correspond.
-->


## 12. Key file map

| Path | Role |
|---|---|
| `<myproject>-backend/app/models/RpaFlow.js` | <> |

<!-- Write this where you can. /hora decides placement together with the real tree it reads in Stage 0.5. -->
````

---

## How to write acceptance criteria

**Do not write a condition common to every task.** That `npm run lint && npm test` passes is common to all of them, so it is not repeated. Write a section's specific **behavior.**

```markdown
### Acceptance criteria
<!-- acceptance -->

- `createRpaFlow` returns an error on a duplicate `flow_key`
- an empty `nl_procedure` produces a zod validation error
- `rpa_compiled_flows` tied to a deleted flow disappear via CASCADE
```

**Without one, `/hora` stops with a question** (`blocking: yes`). Acceptance criteria are the definition of "what counts as done", and `/hora` must not decide that. Filling it in by inference would leave the implementer grading their own work.

### A behavior that only exists once two sections cooperate

**Write it as its own section, depending on both.** "A user who just signed up can sign in with the same credentials" needs `#sign-up` and `#sign-in` to both already exist — it belongs to neither one alone. `/hora` never splits this out on its own (that would mean inventing a requirement the spec never stated), so a scenario left unwritten simply never becomes a task.

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

Supporting material needs no annotation. Tasks are extracted from `spec.md` alone; supporting material is read as material for interpretation.
