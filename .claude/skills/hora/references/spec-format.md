# The design document format

The authority on the format of `specs/<version>/spec.md`. **This file explains it; `specs/skeleton/spec.md` is the blank that gets filled in.**

`/hora-spec` writes the document in conversation, one approved section at a time. Whoever prefers to write it by hand still can.

**The first version is a whole document. Every version after it is a diff against the one before.**

---

## What may be sloppy, and what may not

**Make a format somebody a little sloppy can still write.** A missing `target` or `depends` is inferred and recorded as a question.

| Fine to be sloppy about | Must be written |
|---|---|
| forgetting an annotation | the implementation scope — what to build now, what is out of scope |
| how sections are numbered | **the use cases** and **the acceptance criteria** of every feature, and **the version's own criteria** (`none` where it has none) |
| the order chapters appear in | **which kind each operation is** |
| the wording of a heading | **who may call each operation**, and what happens when somebody else does |
| typos | how existing assets are handled |

Inferring any of the right-hand column would mean inventing what the spec does not say (`structure.md`, invariant 2).

---

## Directory layout

**There is one structural requirement: `spec.md` sits directly under the version directory.** Names, folders and nesting depth are free.

```
specs/
  1.0.0/
    spec.md          ← the entry point. The only fixed name
    sources/         ← drop-off: documents that ARE the spec
    annex/           ← drop-off: documents that EXPLAIN it
    request/         ← drop-off: what somebody WANTS this version to do
    attendance/
      spec.md        ← a feature file. Linked from spec.md
      monthly/
        spec.md      ← nesting allowed. id is attendance--monthly
  1.1.0/
    spec.md          ← a DIFF against 1.0.0
```

**Everything hora reads is reached by following links from `spec.md`.** A file nothing links to is never read, and raises an `orphan` question (`blocking: no`). An empty directory, a `.gitkeep` and `request/` raise nothing.

### The three drop-off directories

**They exist so somebody with documents to hand over has a place to put them without reading this file.** They ship empty.

| | Placing a document there says |
|---|---|
| `sources/` | **it is part of the specification** |
| `annex/` | **it only explains the specification** |
| `request/` | **this is what I want this version to do.** Never specification text |

**The first two change nothing about how a file is read.** Only the `Sources` and `Annex` tables decide that. What the directories do is tell stage 0 what the person meant.

**`request/` is different: it is the agenda for this version.** `/hora-spec` turns it into sections the ordinary way — a proposal for what it asks for, a question for what it leaves open, an approval before anything is written.

| | `Sources` | `Annex` | `request/` |
|---|---|---|---|
| Declared in a table | yes | yes | **never** |
| `/hora-plan` extracts tasks from it | yes | no | **never — it does not read it at all** |

**A request is never promoted to a `Source`.** A source says what the product must do; a request says what somebody wants worked out. **Leave it where it is once the version is written**, and do not carry it forward.

**A document in `sources/` that nobody confirmed is still not a source.** The directory expresses intent; the table records a decision.

### Declaring sources and annex

```markdown
## Sources

| Source | Provides |
|---|---|
| [00-overview.md](./spec/00-overview.md) | domain, terms, non-functional requirements |
```

**A declared source is read exactly like a feature file** — the same extraction of `id`/`target`/`depends`, tasks and contracts. **Everything else linked is interpretation only**, gathered under an `Annex` section.

**Which table a document goes into is not a judgment about quality — it is whether anybody is willing to be held to it.** A current requirements list is a `Source`; a two-year-old design document is `Annex` however good it is.

**A file that is not text — a PDF, a mockup, a spreadsheet — is linked from `Annex` with one line saying what it shows.** Whatever was read out of it reaches the spec the ordinary way: put up as a check, confirmed, written into the section that owns it. **Never pasted in as though a drawing were a stated requirement.**

### Split by feature once it grows

While it fits in one file, do not split it. Once it grows, make a subdirectory **per feature** with a `spec.md` in it, and link it from the entry point.

**Splitting by repository is allowed only when a single contract document already pins the interface down.** One feature usually spans several repositories; split by repository without that authority and the shape of an interface ends up written in two places, which will disagree.

What stays in the entry point is **only what applies to the whole version**: the repository layout, actors, implementation scope, terminology, non-functional requirements, existing assets, the implementation plan, manual verification, and **the version's acceptance criteria**.

### The folder name becomes the `id`

**The path relative to `specs/<version>/`, with folders joined by `--`.** The path is unique, so the `id` is too.

```
attendance/spec.md           →  attendance
attendance/monthly/spec.md   →  attendance--monthly
attendance-monthly/spec.md   →  attendance-monthly
```

| | |
|---|---|
| `--` | **separates folders. Nothing else** |
| `-` | separates words (kebab-case) |

**Never use `--` in a folder or file name.**

**A `##` section's `id` joins its feature's with a single `-`** — `attendance--monthly-data-model`. A task's reference is `<!-- spec: <id> -->` with no namespace, so without the prefix two features' `data-model` would collide.

**When a `##` has no `id`, hora does not invent one.** It ties that section's tasks to the H1's `id` and reports it. Only task granularity gets coarser.

---

## From the second version on, write a diff

**Only the lowest version is full. Each later one is a diff against the version right before it** — not against the lowest.

```
1.0.0   full
1.0.1   a diff from 1.0.0
1.1.0   a diff from 1.0.1
```

Hora resolves it by overwriting keyed on `id`. **A section that was not written carries over unchanged.** To withdraw one, add `kicked: yes` rather than deleting it.

| What the diff wrote | Result |
|---|---|
| heading and annotations only | annotations overwritten one by one. **The body carries over** |
| heading, annotations and body | the whole body is replaced |

**Annex material is not diffed in parts.** Prose cannot be patched, so the version that wants to change it places the whole text.

**Past versions are never rewritten.** Fixing 1.0.0's text for 1.1.0's sake changes what 1.0.0 meant retroactively.

**The blank spec is copied into the first version only.** Copied into a later one, its empty headings would each mean "the body carries over" — twenty sections saying nothing while appearing to have been written. A diff version's `spec.md` holds its H1, its document information, and only the sections it changes.

---

## Section annotations

Written as an HTML comment **directly under** the heading, so it moves with the section.

```markdown
## 6. Data model
<!-- id: data-model -->
<!-- target: core -->
<!-- depends: none -->
```

Required at `##`. Optional below, where it inherits from the parent. **A feature file carries `target` on its H1**, which becomes the file's default.

### `id`

kebab-case, unique in the version. **Once given, it never changes.**

**Never use a section number as an identifier.** Insert one section and every number shifts, breaking every recorded reference.

```
❌  <!-- spec: §6.2 -->        becomes §6.3 the moment a section is inserted
✅  <!-- spec: data-model -->  survives any renumbering
```

### `target`

**Which repositories this feature touches** — a row's name with the project prefix removed. Also `app` (spanning several) and `none` (produces no feature).

**`target` decides which checkpoints a feature runs.** A feature whose rows are all providers skips the consumer gate. Getting it wrong changes what gets built.

**Match it to the layout's `Repository` column, not its `Directory` column.** Several values are comma-separated.

**`none` does not mean "do not read".** Non-functional requirements, the implementation plan and terminology all carry `none` and are all read.

### `depends`

The `id`s this section depends on, guaranteeing implementation order. **Write `none` explicitly when there are none.**

### `built`, `authority`, `baseline`, `kicked`

**The first three are only ever written when adopting hora onto a project that already has code.** Together they answer three separate questions.

| Annotation | Answers |
|---|---|
| `authority: as-built \| to-spec` | when the spec and the code disagree, which is the requirement |
| `built: spec \| provider \| consumer` | **how far this feature was already implemented** |
| `baseline: inventoried \| verified` | whether this feature is specified at all, or merely listed |

#### `built`

The value is the gate the existing code already reaches.

| Value | Effect on the feature's checkpoints |
|---|---|
| *(omitted)* | **the default. Every checkpoint starts `[ ]`** |
| `spec` | 1–2 not applicable |
| `provider` | 1–9 not applicable |
| `consumer` | 1–17 not applicable |

`/hora-plan` marks those mechanically, with the reason `built before hora was adopted`. **Checkpoint 18 is never among them: adopting the kit does not rebuild what works, but it does find out what actually works.**

**When acceptance sends a run back, the marks it lands on are cleared.**

**`built` must never be inferred.** A half-finished screen and a finished one look identical from a file listing. Somebody states it, or it is absent.

**`Authority: as-built` is the one declaration that changes how it is stated.** For the features it reaches, the value is derived from the evidence, put up as a table, and confirmed per feature by selection.

#### `authority`

Overrides the document-level `Authority` line for one feature. **A mixed adoption is the normal one** — write the document's majority position and override the exceptions.

**`authority: to-spec` and `built:` on the same feature is a contradiction, and hora stops on it.** `built:` says "this already is what it should be"; `to-spec` says "the spec is, and the code is not there yet".

#### `baseline`

**Admissible only where the document declared `Baseline: inventoried`.** It says this feature is **listed: not specified, and not accepted.**

```markdown
## Payroll
<!-- id: payroll -->
<!-- target: core, admin -->
<!-- built: consumer -->
<!-- baseline: inventoried -->

Monthly payroll calculation and payslip export, running in `admin-console`.
```

**A heading, the annotations, and one line of prose. Nothing else.** No use-case block, no acceptance block, no screen section, no data-model table of its own — a listed section carrying any of them is a stop.

**What the running code still owes the document is three rows**, sitting in the version's own sections beside every other feature's: a row in the data model, a row in the operation list, and one line in the surface section of each repository its screens belong to. Each is justified by the feature's name in place of a use case. Leave them out and the spec stops describing the database and the interface that actually exist.

**`built:` is required, and it is recorded rather than acted on.** Required, because "this code exists" has to be checkable. Recorded, because **no checkpoint of a listed feature is ever marked** — not `[x]`, not not-applicable.

| | `built:` alone | `built:` with `baseline: inventoried` |
|---|---|---|
| Checkpoints 1–17 | not applicable, with the reason | **nothing is marked** |
| Checkpoint 18 | `[ ]`, and the sweep runs it | `[ ]`, and no run has it in scope |
| What the spec says | its use cases and acceptance criteria | its name and one line |

**Exactly two checks are suspended, and nothing else:** `missing-usecase` and `missing-acceptance`. **Every operation still states its kind, its caller and its refusal.**

**It is never inferred and never recommended.** `Authority: as-built` lifts nothing here: deriving *how far* code reaches works out a decision somebody made, while deciding *that nobody will verify this at all* is a decision of its own.

**Contradictions hora stops on:**

| | Why |
|---|---|
| `baseline: inventoried` under `Baseline: verified` | the permission was never granted |
| `baseline: inventoried` with no `built:` | nothing makes "this code exists" checkable |
| `baseline: inventoried` with `authority: to-spec` | `to-spec` runs every checkpoint against the code; listing says none runs |
| `baseline: inventoried` on a section a later version adds | new work is not inherited code |
| `baseline: inventoried` on a feature whose acceptance record holds a pass | **an accepted feature un-accepted by an annotation** |
| a listed feature with any `[x]`, a checkbox on its plan entry, or a bare `passed` verdict | a record claiming a pass nothing earned |
| a version criterion reaching a listed feature with no `rests on:` line | the same claim, with nothing saying so |

**The annotation carries forward, and that is what makes the debt a debt.** A listing written in 1.0.0 still stands in 1.4.0. **It stops only when a version writes `<!-- baseline: verified -->` in its own diff**, writes the feature's two blocks, and restates `built:` for confirmation — or declares `authority: to-spec` and lets every checkpoint run. **That feature's first acceptance then runs at full live reach**, and every feature depending on it has its checkpoint 18 cleared, transitively.

**A feature may depend on a listed one.** New work on an adopted product almost always sits on inherited behavior. The dependent records `Rests on: #<id> (not accepted)`. **A pass resting on unstated behavior is allowed to exist; a pass that hides what it rests on is not.**

#### `kicked`

**To withdraw a feature, add `<!-- kicked: yes -->` instead of deleting the section.** Under the diff scheme every unchanged section is absent, so deleting one leaves hora unable to tell "absent" from "deleted".

Hora withdraws the task and **raises a removal task if it was already implemented** — removing a task does not remove the code.

**Do not write the reason in the body**; writing a body replaces the whole body, so the text would be lost on revival. The reason goes in the implementation scope.

**Reviving takes three lines** — the heading, the `id`, and `<!-- kicked: no -->`. Everything else carries over.

### The two blocks every feature carries

**Both are required, and they are not the same thing.** The one exception is a section carrying `baseline: inventoried`.

```markdown
### Use cases
<!-- usecases -->

- a member of staff clocks in on arrival, and the day's hours appear in the list

### Acceptance criteria
<!-- acceptance -->

- a second clock-in on the same day is rejected
```

| | States | Checked by |
|---|---|---|
| **use cases** | who does what, for what purpose, end to end | checkpoints 2, 9 and 11, and the acceptance review |
| **acceptance criteria** | an observable behavior, present or absent | the tests written alongside the code |

**A feature with acceptance criteria but no use cases builds operations that are each correct and together unreachable.**

**Where a feature spans several `##` sections, write the use cases once on the H1** and let the sections inherit them. Acceptance criteria stay per section.

---

## Required sections

| Section | Role | May a declared Source satisfy it? |
|---|---|---|
| **Project name** | **the prefix every repository name is built from** | **No — write it in `spec.md`** |
| **Repository layout** | **which repositories and servers exist, and each row's roles** | **No — write it in `spec.md`** |
| **Actors and roles** | who uses this, and how each is identified | Yes |
| Implementation scope | what to build now, what is out of scope | Yes |
| Existing assets | port existing code, or build new | Yes — **except its `Baseline` line** |
| Manual verification | the services needed, and their versions | Yes |
| Terminology | the source of the glossary | Yes |
| Implementation plan | the order of the work | Yes |
| **Version acceptance criteria** | what the product must do across features | Yes |
| Non-functional requirements | constraints applying to every feature | Yes |
| Sources / Annex (optional) | declared sources, and gathered supporting links | — |
| (below this, one per feature) | what gets implemented | — |

**Every feature section carries its own two blocks, and every operation states its kind and its caller.** None of the four may be inferred, and each is `blocking: yes` when missing.

**Three roles must be written directly in `spec.md`: the project name, the repository layout, and the `Baseline` line.** All three are decisions rather than facts to locate, and `/hora-setup` needs the first two before it reads anything deeply. `Baseline` is carved out because it decides how much of an inherited product gets verified before the tag — a declaration leaving features unaccepted is legitimate only because every later reader sees it.

**This table is checked against the resolved document, never against one version's file.** A diff writing nothing but one new feature is complete. **A feature section this version adds is the exception**: nothing carries over into it.

**None of the required sections need annotations.** Each always has the same role, so hora recognizes them by role — rewording or translating a heading breaks nothing. **This differs from a feature's `id`, which is chosen once and never changes.**

---

## What goes in each section

### 1. Document information

| Item | Content |
|---|---|
| Product version | matches the directory name |
| Document revision | this document's own revision, separate from the product version |
| Author | a name |
| Question language | the language hora writes into `.hora/questions/` |
| Conventions package | **what `/hora-setup` equips, and what every gate delegates to.** A name and a version, or `none` |
| Annotation source | omit for the default. Or a link to a table mapping the spec's own identifier prefixes to a target |

**The project name is written as prose right under the table.** It becomes the prefix of every repository name, and **it is never derived from a directory name.**

**`Annotation source` is only needed when the spec already carries its own permanent identifier per requirement** (`FR-010`, `TBL-01`) plus a table mapping each prefix to a target.

### 2. Repository layout

```markdown
| Repository | Roles | Template | Purpose |
|---|---|---|---|
| `<project>-core` | provider | <a template, or `existing`> | the operations and jobs; holds the data store |
| `<project>-admin` | consumer | <a template, or `existing`> | the admin screens |

### 2.1 Servers

| Server | Protocol | Consumer |
|---|---|---|
| `employee-api` | <the project's own> | `<project>-employee` |
| `worker` | — | a server in the same repository (no contract needed) |
```

**`/hora-setup` reads this table to decide what to create. Without it, it stops.**

- **This section belongs in the entry point**
- **Every row declares one or more roles** — `provider`, `consumer`, or both (`structure.md`)
- **One data store has exactly one provider.** Two rows writing the same store is a stop
- **The server table is the unit contracts are cut from**, so it is always written. Its `Consumer` column decides whether a contract exists at all
- **`Template` says how a missing row is created** — a repository to clone at its newest tag, a scaffold command, or `existing`
- **A row added in a later version** is created when that version is planned

#### `Directory` — for a repository that already exists

An optional column, needed only when adopting hora onto an existing project.

| The column is | What `/hora-setup` does |
|---|---|
| **omitted** | looks for `<project>-<row>`, and creates it from `Template` if missing |
| **written** | looks for exactly that directory, **and never creates.** If it is not there, it stops and asks |

**`target` still comes from the `Repository` column.** A directory is a place on one person's disk; `target` is a permanent classification.

**Writing `Directory` also changes what gets excluded.** The hora repository excludes implementation repositories by name pattern, and a directory named anything else matches neither the gitignore nor the lint ignore list. `/hora-setup` registers it in both and reports that it did.

### 3. Actors and roles

```markdown
| Actor | Identified by | Roughly how many | Inside / outside |
|---|---|---|---|
| member of staff | an email and password issued on hire | 200, 5000 foreseen | inside |
| manager | the same login, with a `manager` role | 20 | inside |
| administrator | a separate login, issued by us | 3 | inside |
```

**Every permission and every screen is written against this table**, so hora stops without it.

- **`Identified by` is the column that does the work.** "A manager" says nothing about whether there is one login or two
- **An actor named nowhere else is either a missing feature or a role that does not exist**
- **A missing actor is an authentication mechanism nobody designed**

### 4. Implementation scope

**Keep the two kinds of "out of scope" apart. Confusing them wrecks the design.**

```
out of scope for now (to be built later)  → leave an extension point,
                                             kept replaceable
permanently out of scope                  → do not abstract it. Exclude it
                                             from the design
```

Read the first as the second and the structure cannot take it later. Read the second as the first and an abstraction layer gets built that nobody uses.

**Write "for now" entries with what unblocks them.**

### 5. Existing assets

```markdown
Current implementation: <none (new) / a repository name or path>
Treatment: <port it / reference it (match the behavior, rewrite the implementation)>
Authority: <as-built (what runs is what this version is) / to-spec (the spec is)>
Baseline: <verified (every existing feature specified and accepted before the tag)
           / inventoried (a feature may be listed unaccepted, one at a time)>
```

**`Authority` and `Treatment` are different axes.** `Treatment` answers "may the old code be used as material"; `Authority` answers "when the two diverge, which is the requirement".

| | `as-built` | `to-spec` |
|---|---|---|
| What this version's spec describes | **the product as it runs today** | the product as it should be |
| A divergence | the spec text gets corrected | **a task** — the code gets corrected |
| Something the code does that no spec states | drafted into the spec, as a check | **reported, never resolved alone** |
| New work | the next version, as a diff | this version |

**`Authority` and `Baseline` are both required whenever `Current implementation` is not `none`, and neither is asked on a new project.** Where either is missing on an existing project, hora stops (`existing-assets`, `blocking: yes`).

**`Baseline` answers how much of what already runs is actually accepted before this version is tagged.**

| | `verified` | `inventoried` |
|---|---|---|
| What an inherited feature owes | its two blocks, like any other feature | **either that, or a name and one line** |
| What acceptance covers | every feature | **the accepted ones** |
| What a verdict may read | `passed` | **never a bare `passed`** |

**`Baseline: inventoried` is a permission, and by itself it marks nothing.** A version declaring it and listing no feature behaves exactly like `verified`. **It is approved on its own, in prose, before any feature is listed against it.**

**Both lines reach only the features carrying the matching annotation in the version that declared them, and neither carries forward onto new work.** The reach has to be stated because omission is how the diff scheme propagates.

### 6. Terminology

Becomes the source of `.hora/glossary.md`. **A term and its description are enough** — `/hora-plan` decides identifiers, against the project's lint rules.

### 7. Non-functional requirements

Produces no feature, **but becomes a design constraint on every one of them.**

### 8. Manual verification

```markdown
| Service | Version | Purpose | Optional |
|---|---|---|---|
| <the data store> | 10.5.12 | the primary data store | no |
| <the queue> | 7.4 | background jobs | no |
| <object storage> | latest | file uploads | yes |
```

What `/hora-setup` uses to decide the local environment's configuration.

**Write the server's version, not a client library's.** **A queue cannot be dropped from a project with any background job.**

### 9 onward — the feature sections

Each carries its annotations, its content, then its two blocks.

**A data model section is the one that carries acceptance criteria without use cases of its own.** A table has no user-facing use case; the features built on it do.

**An operation table states the kind of every operation and who may call it.** Neither is ever inferred — `/hora-build` branches on the kind at three separate checkpoints.

```markdown
| Operation | Input | Result | Kind | Caller |
|---|---|---|---|---|
| `rpaFlows` | `RpaFlowsInput(pagination)` | `RpaFlowsResult` | <a kind this project defines> | any signed-in user, own flows only |
```

**Which kinds exist is the project's own** — declared once alongside the server table, and used consistently. Hora requires only that every operation names one of them.

**The caller belongs beside the operation, never in a security appendix.**

**If an input's fields are unknown, hora would have to invent the shape of an interface, so it stops.**

```
RpaFlowsInput(pagination)  contents indicated in parentheses
                           → derived after an existing shape. Does not stop
RpaFlowsInput              fields unknown
                           → stops with blocking: yes
```

**A background-jobs section states what does not run inside a request, and why not.**

```markdown
| Job | Trigger | Queue | Payload | Why not in the request path |
|---|---|---|---|---|
| compile a flow | `createRpaFlow` | `compile` | `{ rpaFlowId }` | minutes at real sizes, and retried |
```

**"Why not in the request path" is a required column, not a note.** A job with no stated reason is one somebody moves back into the request later.

### 14. Implementation plan

`/hora-plan` extracts the build order from this and **derives no order of its own.** These are the project's own milestones, unrelated to the eighteen checkpoints.

**Check that "fine to leave for later" matches the scope section's "out of scope for now".**

### 15. Version acceptance criteria

**Every feature's own criteria stop at that feature's gate. This section holds the behavior that spans several of them**, and the whole-version sweep is the only run that checks it.

```markdown
### 1.0.0
<!-- id: version-acceptance-1-0-0 -->

- a newly hired member of staff signs up, clocks in, and appears in the admin's list
  spans: #sign-up, #attendance, #user-admin
- a month's approved total reaches the payslip export unchanged
  spans: #attendance, #approval
  rests on: #payroll (not accepted)
```

- **`spans:` is required on every criterion.** Every finding names the checkpoint it sends the run back to, so a criterion naming no feature leaves a sweep with a real failure and nowhere to send it. **Where a finding could land in more than one, it goes to the earliest**
- **Written `none` where the version has none.** A section left out is indistinguishable from a version where nobody considered the question
- **One `###` per version, each with its own `id`.** The diff rule keys on `id`, so a version adding one criterion does not restate every criterion the product ever had
- **These accumulate, and every later sweep checks all of them**
- **A criterion reaching a listed feature carries `rests on:`**
- **This section states behavior, never a number or a limit.** Those belong to the non-functional requirements

### 16. Key file map

Write it where you can. Hora decides placement together with the real tree `/hora-setup` read.

---

## How to write use cases

**One use case is one person completing one thing, from where they start to where they are done.** Not a feature list, not a screen inventory, not a restatement of the interface.

| Write | Not |
|---|---|
| who is doing it | "the system does X" |
| what they are trying to achieve | "there is a button for X" |
| where it starts and where it ends | a step in the middle, with no beginning |
| enough that somebody with no access to the code could follow it | selectors, endpoints, table names |

**Three checkpoints verify against a use case, each asking something different:**

| Checkpoint | Asks |
|---|---|
| 2 | can the spec, as written, support this at all? |
| 9 | can the interface that was actually built support it, call by call? |
| 11 | can a person actually do it, on the surface that was actually designed? |

**All three run at this feature's own gate, so a use case may not reach forward into a feature built after it.**

---

## How to write acceptance criteria

**Do not write a condition common to every feature.** That lint and tests pass is true of all of them. Write this section's specific **behavior.**

```markdown
- `createRpaFlow` returns an error on a duplicate `flow_key`
- an empty `nl_procedure` produces a validation error
- compiled rows tied to a deleted flow disappear with it
```

**A use case is not an acceptance criterion, and neither substitutes for the other.**

### A criterion is checked at its own feature's gate, so it may not reach forward

**One question decides whether a criterion belongs to a feature:**

> **At that feature's checkpoint 18 — against a product in which this feature and its `depends` are built, and nothing later is — can this be observed?**

**It may lean on everything already built.** A criterion resting on a predecessor is the ordinary case. **What it may not do is name something built after it.**

```
❌  a user who signed up appears in the admin user list
      #sign-up's criterion, and the list is #user-admin, built later
✅  a second sign-up with the same email is refused, and changes nothing
```

**A forward reference is a `blocking: yes` stop at `/hora-plan`, not a note**, because four separate runs act on one: checkpoint 1 builds from the criteria, 6 and 16 write a test for each, the verifier reports the untestable one, and 18 fails the feature by construction.

**Three places take a behavior that reaches forward, tried in this order:**

| | Where it goes | When |
|---|---|---|
| **1** | **the order changes** — reorder, or add a `depends` | the dependency is real and the features simply run in the wrong order. The cheapest fix |
| **2** | **its own section, depending on both** | the behavior is closed inside two features and adds no code of its own |
| **3** | **the version's own criteria** | it genuinely spans three or more features |

**3 is last for a reason.** A criterion moved to the version gate is verified once, at the end, instead of at a gate that runs while the code is one commit old.

**Where nobody present can place it, it is a question, not a guess.**

#### A behavior that exists only once two sections cooperate

**Write it as its own section, depending on both.** Hora never splits this out on its own, so a scenario left unwritten simply never becomes a feature.

```markdown
## Signing in right after signing up
<!-- id: sign-up-then-sign-in -->
<!-- target: core -->
<!-- depends: sign-up, sign-in -->

Adds no code of its own. This section exists only to test the two together.
```

The "adds no code of its own" line carries straight into the task's `Constraint` — hora copies it, it does not decide it.
