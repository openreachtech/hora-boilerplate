# The design document format

The authority on the format of `specs/<version>/spec.md`. **This file explains the format; `specs/skeleton/spec.md` is the blank spec that gets filled in.** The blank is copied once, for the first version only ("The blank spec is not copied into a diff version").

**`/hora-spec` writes the document, in conversation, one approved section at a time**, and reads this file to know the format. Whoever prefers to write it by hand still can.

**The first version's `spec.md` is a whole document; every one after it is a diff against the version before it** ("From the second version on, write a diff").

---

## The thinking behind the format

**Make a format that someone a little sloppy can still write.** A missing `target` or `depends` is inferred from the content and recorded as a question. **A missing `id` is the one annotation never inferred** — `/hora` ties that section's tasks to the H1's `id` instead ("The folder name becomes the `id`"; `structure.md`, invariant 2).

**But "what to build" and "what counts as done" have to be written.** Inferring those means inventing what the spec does not say.

| Fine to be sloppy about | Must be written |
|---|---|
| forgetting an annotation | the implementation scope (what to build this time, what is out of scope) |
| how sections are numbered | **the use cases** and **the acceptance criteria** of every feature, and **the version's own acceptance criteria** (`none` where it has none) |
| the order chapters appear in | **which kind each API operation is** (query / mutation / subscription / REST) |
| the wording of a heading | **who may call each API operation**, and what happens when somebody else does |
| typos (raised as a question, but not blocking) | how existing assets are handled, and links to supporting material |

---

## Directory layout

**There is exactly one structural requirement: `spec.md` sits directly under the version directory.** File names, folder names and nesting depth are free.

```
specs/
  1.0.0/
    spec.md               ← the entry point. One per version. The only fixed name
    sources/              ← drop-off: documents that ARE the spec (below). Recognized, not required
    annex/                ← drop-off: documents that EXPLAIN it (below). Recognized, not required
    request/              ← drop-off: what somebody WANTS this version to do (below). Never spec text
    attendance/
      spec.md              ← a feature file (optional). Linked from spec.md
      monthly/
        spec.md            ← nesting is allowed. id is attendance--monthly
    spec/
      00-overview.md        ← a declared source (below). Any name, any location
    docs/
      RPA_CORE_SPEC.md       ← supporting material. Linked from spec.md's Annex, not declared as a source
  1.1.0/
    spec.md               ← a DIFF against 1.0.0. Only the sections this version changes
    request/
      csv-export.md          ← "add a CSV export for the admin" — a page of notes, in anybody's words
    spec/
      00-overview.md          ← kept per version even if the content is the same
```

**Everything `/hora` reads is reached by following links from `spec.md`.** A file nothing links to is never read, and raises a question (`orphan`, `blocking: no`).

**An empty directory, a `.gitkeep`, and `request/` raise nothing.** A placeholder is not an orphan, and `request/` is read before the document is written and is never linked from it.

### `sources/`, `annex/` and `request/` — a drop-off convention, and nothing more

**Three directory names are recognized, so that somebody with something to hand over has a place to put it without reading this file.** They ship empty in `specs/1.0.0/`.

| | |
|---|---|
| `specs/<version>/sources/` | put a document here to say **it is part of the specification** |
| `specs/<version>/annex/` | put a document here to say **it only explains the specification** |
| `specs/<version>/request/` | put a document here to say **this is what I want this version to do.** Not specification text, and never becomes any |

**The first two change nothing about how any file is read.** `/hora` still reads only what `spec.md` links to, and the `Sources` and `Annex` tables still decide which of the two a file is. What the directories do is tell **stage 0 of `/hora-spec`** where to look and what the person meant (`../../hora-spec/references/investigation.md`).

**`request/` is a different kind of answer: it is the agenda for this version**, in whatever words the person had. `/hora-spec` turns it into sections through the ordinary route — a **proposal** for what it asks for, a question for what it leaves open, and an approval before anything is written.

| | `Sources` | `Annex` | `request/` |
|---|---|---|---|
| Declared in a table in `spec.md` | yes | yes | **never** |
| Linked from `spec.md` | yes | yes | **never** |
| `/hora-plan` extracts tasks from it | yes | no | **never — `/hora-plan` does not read it at all** |
| What it is after the stages have run | still the specification | still the explanation | **spent.** The sections it produced are the specification |

**A request is never promoted to a `Source`.** A source says "this is what the product must do"; a request says "this is what I want somebody to work out". Promoting one would put a wish list where `/hora-plan` extracts tasks from it.

**Leave the file where it is once its version is written.** It is the record of what was actually asked for. **It is not carried into the next version** (invariant 3).

**Recognized, never required**, in either direction:

- a document placed anywhere else under `specs/<version>/` is found by stage 0 all the same, and asked about instead of checked
- a project that brings its own layout across keeps it
- writing the tables by hand and using neither directory produces the same document

**A document sitting in `sources/` that nobody confirmed is still not a source.** The directory expresses an intent; the table records a decision.

**A linked file is read one of two ways, decided by whether it is declared under a `Sources` section** — not by where it sits or what it is named.

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

`/hora` then reads each listed file exactly as it would read a `<feature>/spec.md` — the same extraction rules, including deriving `id`/`target` from the spec's own scheme.

**Everything else linked but not declared is supporting material, read for interpretation only.**

**Gather those links under an `Annex` section in the entry point** rather than scattering them. `Annex` is `Sources` run in reverse: `Sources` promotes files into feature files; `Annex` only gathers relative links in one place.

```markdown
## Annex

| File | Provides |
|---|---|
| [RPA_CORE_SPEC.md](./docs/RPA_CORE_SPEC.md) | <one line: what it helps interpret, and which section or requirement it relates to> |
```

**The section is always named `Annex` and sits in the entry point**, and needs no `<!-- target: -->`/`<!-- depends: -->`. Where nothing warrants gathering, it may be left out entirely.

**There is exactly one starting point: `spec.md`.**

### Split by feature once it grows

While it fits in one file, there is no need to split it. Once it grows, make a subdirectory **per feature**, place a `spec.md` in it, and link it from the entry point.

**Splitting by repository is allowed, but only when a single contract document already pins the API down and every per-repository file references it.** One feature usually spans several repositories. Split by repository without that authority and **the shape of an API ends up written independently in two places, which will disagree** — both written by humans, so `/hora` can only stop with a question.

What stays in the entry point is **only what applies to the whole version.**

```
repository layout / actors and roles / implementation scope / terminology /
non-functional requirements / implementation plan / existing assets /
manual verification / version acceptance criteria
+ links to the feature files
```

**The version's acceptance criteria stay in the entry point however far the document is split.** Each one spans several features by definition, and the sweep reads one section rather than hunting through every feature file.

**A feature file writes `target` on its H1.**

### The folder name becomes the `id`

**Folder names are kebab-case.**

**The path relative to `specs/<version>/` becomes the feature file's H1 `id`, as is.** The path is unique, so `id`'s uniqueness is structurally guaranteed.

```
attendance/spec.md               →   id: attendance
attendance/monthly/spec.md       →   id: attendance--monthly
attendance-monthly/spec.md       →   id: attendance-monthly
```

| Symbol | Meaning |
|---|---|
| `--` | **separates folders.** Used for nothing else |
| `-` | separates words (kebab-case) |

**Never use `--` in a folder or file name.** Reserving it for separation makes the reverse lookup from `id` to path unique.

**Nesting is allowed, with no limit on depth.** A deeper path makes a longer `id`, which is its own brake. To show grouping alone, give headings to the entry point's feature list instead.

**A `##` section's `id` joins to its feature's `id` with a single `-`.**

```
attendance--monthly-data-model
attendance--monthly-screen
```

A task's reference is `<!-- spec: <id> -->` alone, with no namespace. Without a prefix it would collide with another feature's `data-model`. **This is a rule, not a suggestion.**

When a `##`'s `id` is forgotten, `/hora` **does not invent one.** It ties that section's tasks to the H1's `id` and reports it. Only the granularity of tasks gets coarser.

**Only the directory name is authoritative for the version.** If the text inside contradicts it, `/hora` raises a question. The first version is always `1.0.0`.

### From the second version on, write a diff

**Only the lowest version is full. Everything after it is a diff against the version right before it.**

```
1.0.0   full
1.0.1   a diff from 1.0.0
1.1.0   a diff from 1.0.1      ← not a diff from 1.0.0
```

`/hora` resolves it by overwriting keyed on `id`. **A section that was not written carries over as it was.** To withdraw one, add `kicked: yes` instead of deleting it.

| What the diff wrote | Result |
|---|---|
| heading and annotations only | annotations are overwritten one by one. **The body carries over from the previous version** |
| heading, annotations and body | the whole body is replaced |

To change one annotation, write only the heading and that annotation.

**Annex material is not diffed in parts.** Prose cannot be patched, so **the version that wants to change it places the whole text.**

**Past versions must not be rewritten.** Fixing 1.0.0's material for 1.1.0's sake changes what 1.0.0 meant retroactively. Place the full text on the 1.1.0 side instead.

#### The blank spec is not copied into a diff version

**`specs/skeleton/spec.md` is the first version's starting point and only the first version's.** Copied into `specs/1.1.0/spec.md`, it lands every required section as an empty heading — and an empty heading means "the body carries over", so twenty sections would sit there saying nothing while appearing to have been written.

**A diff version's `spec.md` holds two things:**

```markdown
# <project name> design document

## 1. Document information          ← always restated: the product version changed

| Item | Content |
|---|---|
| Product version | 1.1.0 |
| ...

## 12. CSV export                   ← and then only the sections this version changes
<!-- id: csv-export -->
```

Everything else **is absent on purpose, and absent is how it carries over.** The required-sections table below is checked against the **resolved** document, so a section 1.0.0 declared satisfies it for every version after it.

**Somebody who would rather not write even that can put a page of notes in `request/`** and run `/hora-spec`.

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

**A feature file must carry `target` on its H1.** It becomes the default for the whole file.

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

The entry point's `spec.md` is a document about the whole version, so its H1 needs no `target`.

### `id`

kebab-case. Unique within the document. **Once given, it never changes.**

Never use a section number as an identifier. Insert one section and every number shifts, breaking every reference recorded in `.hora/tasks/`.

```
❌  <!-- spec: §6.2 -->        becomes §6.3 the moment a section is inserted
✅  <!-- spec: data-model -->  stays the same however the number changes
```

A section number may stay on the heading for a human to read. `/hora` only looks at `id`.

A reference from `.hora/tasks/` takes the form `<!-- spec: <id> -->`. **No file name, no version** — there is one entry point per version, and the version is carried by the path `.hora/tasks/<version>/`.

### `target`

**Which repositories this feature touches.** Matches a repository name's suffix.

| Value | Meaning |
|---|---|
| a row in the repository layout | that repository. **The name with `<myproject>-` removed** (`<myproject>-frontend-admin` → `frontend-admin`; the backend is a single repository, so always `backend`) |
| `app` | `<myproject>-app`. Something that spans several repositories |
| `none` | no feature is generated from this section |

**`target` decides which checkpoints a feature runs through.** A feature whose `target` is `backend` alone skips the frontend gate; one that names a frontend row runs it. One feature is one file whatever it touches, so getting `target` wrong changes what gets built, not where a line is filed.

**Make it match the `Repository` column** of the repository layout section — not its `Directory` column. `/hora` stops with a question on a mismatch.

Several values are comma-separated (`<!-- target: backend, frontend-admin -->`).

**It is not cut per server.** A repository is the unit of a write conflict and of a git branch, and that is what `target` names.

**`none` does not mean "do not read".** Some sections produce no feature and must still be read — non-functional requirements, the implementation plan, terminology, future design constraints.

### `depends`

The `id` of the sections it depends on. Used to guarantee implementation order. State `<!-- depends: none -->` explicitly when there are none.

### `authority`

**Only ever written when adopting Hora Kit onto a project that already has code.** It overrides the document-level `Authority` line (`Existing assets`, below) for one feature.

```markdown
## Monthly aggregation
<!-- id: attendance--monthly -->
<!-- authority: to-spec -->        ← the document says as-built; this feature is still being finished
```

**A mixed adoption is the normal one.** Write the document's majority position in `Existing assets` and override the exceptions per feature.

**`authority: to-spec` and `built:` on the same feature is a contradiction, and `/hora` stops on it.** `built:` says "this already is what it should be"; `to-spec` says "the spec is what it should be, and the code is not there yet".

### `built`

**Only ever written when adopting Hora Kit onto a project that already has code.** It says how far this feature was implemented before Hora Kit ever read the spec, so that working code is not rebuilt.

```markdown
## Attendance
<!-- id: attendance -->
<!-- target: backend, frontend-employee -->
<!-- built: backend -->
```

The value is the gate the existing code already reaches.

| Value | Means | Effect on the feature's checkpoints |
|---|---|---|
| *(omitted)* | nothing exists yet | **the default. Every checkpoint starts `[ ]`** |
| `spec` | the specification exists; no code does | 1–2 not applicable |
| `backend` | the backend gate's work is already there | 1–9 not applicable |
| `frontend` | the frontend gate's work is already there too | 1–17 not applicable |

`/hora-plan` marks each of those `[x]` with the reason `built before Hora Kit was adopted`, mechanically — a not-applicable state, never a claim that the checkpoint ran.

**Checkpoint 18, acceptance, can never be claimed by `built`.** It stays `[ ]` whatever the value is: **adopting the kit does not rebuild what works, but it does find out what actually works.**

**When acceptance sends one back, the not-applicable marks it lands on are cleared.** "Built before Hora Kit was adopted" stops being true the moment that code has to change.

**`built` must never be inferred.** A half-finished screen and a finished one look identical from a file listing. **Somebody states it and it is written down, or it is absent.**

**`Authority: as-built` is the one declaration that changes how it is stated** (`Existing assets`, below). For the features it reaches, the value is **derived from the evidence** — the last gate whose work exists in every repository the feature targets — put up as a table and confirmed per feature by selection. The person decided the direction once, in the declaration (`asking.md`, "What is never asked").

**It is asked at stage 1 of `/hora-spec`**, and only where stage 0 found something already running (`../../hora-spec-usecases/SKILL.md`). On a new project nobody is asked at all.

**Not inferring it does not mean asking blind.** The evidence — which resolvers, migrations, tests and screens exist — is laid out alongside the choice. Where no declaration exists, **no option is recommended**.

**Absence has one meaning.** Stage 1 settles it either way, and records in `.hora/spec/<version>/_stages.md` when the answer was "nothing is running here".

**It is not `kicked`.** `kicked` withdraws a feature that should not exist; `built` records one that already does.

### `baseline`

**Only ever written when adopting Hora Kit onto a project that already has code**, and only where the document declared `Baseline: inventoried` (`Existing assets`, below). It says this feature is **listed: not specified, and not accepted.**

```markdown
## Payroll
<!-- id: payroll -->
<!-- target: backend, frontend-admin -->
<!-- depends: attendance -->
<!-- built: frontend -->
<!-- baseline: inventoried -->

Monthly payroll calculation and payslip export, running in `admin-console`.
```

**A heading, the annotations, and one line of prose. Nothing else.** No `<!-- usecases -->`, no `<!-- acceptance -->`, no screen section, no data-model table — a listed section carrying any of them is a stop.

**What the running code still owes the document is three rows, each justified by the feature's name in place of a use case**: a row in the data model, a row in the operation list, and **one line in the screens section of the repository each screen belongs to** (`../../hora-spec-frontend/SKILL.md`). **None of the three is the screen section the listed section may not carry** — they sit in the version's own sections, beside every other feature's. Leave them out and the spec stops describing the database and the frontend that actually exist.

**`built:` is required on a listed feature, and it is recorded rather than acted on.** Required, because "this code exists" has to be a checkable declaration. Recorded, because **no checkpoint of a listed feature is ever marked** — not `[x]`, not not-applicable. The version that later specifies the feature restates the value and has it confirmed.

| | `built:` alone | `built:` with `baseline: inventoried` |
|---|---|---|
| Checkpoints 1–17 | not applicable, mechanically, with the reason | **nothing is marked** |
| Checkpoint 18 | `[ ]`, and the acceptance sweep runs it | `[ ]`, and no run has it in scope |
| What the spec says about the feature | its use cases and its acceptance criteria | its name and one line |

**The listing itself needs no not-applicable reason.** A listed feature marks 18 as nothing at all and is absent from the count instead — the shape `## Withdrawn` already uses (`../../hora-plan/SKILL.md`).

**Paying the debt is where a reason does get added, and it lands on other features, never on this one.** The payment re-schedules every transitive dependent, whose checkpoints 1 to 17 carry `accepted in <earlier version>` — the second reason that does not come from a checkpoint's own line (`done-criteria.md`, "Not applicable is a state, and it needs a reason").

**Exactly two blocking checks are suspended, and nothing else is.** `missing-usecase` and `missing-acceptance` are not raised for a listed section ("Required sections", below). Every operation the feature exposes still states its kind, its caller and its refusal (`../../hora-spec-security/SKILL.md`).

**It is never inferred, and never recommended.** **`Authority: as-built` lifts nothing here**: deriving *how far* existing code reaches works out a decision somebody already made, while deciding *that nobody will verify this at all* is a decision of its own. It is asked per feature, batched at most four at a time, with the evidence laid out and no option recommended (`asking.md`, "What is never asked").

**Contradictions `/hora` stops on:**

| | Why |
|---|---|
| `baseline: inventoried` under `Baseline: verified` | the permission was never granted |
| `baseline: inventoried` with no `built:` | nothing makes "this code exists" checkable |
| `baseline: inventoried` with `authority: to-spec` | `to-spec` runs every checkpoint against the existing code; listing says none of them runs |
| `baseline: inventoried` on a section a later version adds | new work is not inherited code |
| `baseline: inventoried` on a feature whose acceptance record holds a passing block, in any version (`.hora/acceptance/`) | **an accepted feature un-accepted by an annotation.** It drops out of every later sweep's scope with nothing saying so. **The in-version stop cannot see this one**: that one fires on an `[x]` in the version being planned, and an accepted feature's marks sit in a released version's task file, which reconciliation never opens |
| a listed feature with `[x]` on any checkpoint, a checkbox on its plan entry, or an acceptance verdict reading a bare `passed` | a record claiming a pass nothing earned |
| **a version acceptance criterion that reaches a listed feature with no `rests on:` line** | the same claim with nothing saying so |

**Paying it is a version's ordinary work, not a special path.** The version that next changes the feature writes its use cases and acceptance criteria, flips the annotation to `<!-- baseline: verified -->`, and restates `built:` for confirmation — or declares `authority: to-spec` and lets every checkpoint run against the existing code. **That feature's first acceptance ever runs at full live reach**, and **every feature that depended on it has its checkpoint 18 cleared, transitively** (`../../hora-plan/SKILL.md`).

**A feature may depend on a listed one.** New work on an adopted product almost always sits on inherited behavior. The dependent records what it rests on, and its own acceptance is re-earned when the debt is paid. **A pass resting on unstated behavior is allowed to exist; a pass that hides what it rests on is not.**

**A version acceptance criterion may reach one too, on the same terms**, provided all of the following hold at once ("15. Version acceptance criteria", below):

| | |
|---|---|
| **the criterion carries `rests on: #<id> (not accepted)`** | in the section itself, approved like any other text. **A criterion that reaches a listed feature without it is the stop** (above) |
| **the listed feature is still not in scope** | what the sweep verifies is the criterion. The listed part is a precondition the run passes through |
| **the verdict is already counted** | a version holding any listed feature can never write a bare `passed` (`../../hora-accept/SKILL.md`, "Recording the result"). **No grammar is added for this case** |
| **a finding in the rested-on part goes to the debt, not to a checkpoint** | there is no checkpoint of a listed feature to send a run back into. Pay it this version, or change the criterion through `/hora-spec`. Both readings recorded, neither recommended |

**The dependent's `Rests on:` line does different work.** That line records what one feature's own pass rests on (`../../hora-plan/SKILL.md`, "One file per feature"). A version criterion is the version's claim about the product, so its mark belongs beside the criterion, where the person approving the claim reads it.

**The mark is read against the resolved document and against the version being recorded, never against a frozen one.** A criterion written in 1.0.0 keeps its `rests on:` line for as long as the file exists; when a later version pays the debt, the mark is simply no longer in force. **A stale mark is not a mismatch to fix.**

**The annotation carries forward, and that is what makes the debt a debt.** A listing written in 1.0.0 still stands in 1.4.0 — a version that says nothing about the feature leaves it listed. **It stops only when a version writes `<!-- baseline: verified -->` in its own diff.**

**That is a different question from what the `Baseline:` line reaches** (`Existing assets`, below). The declaration reaches only inherited code; the annotation, once written on a feature, stays until somebody takes it off.

**It is not `kicked`, and it is not `built`.** `kicked` withdraws a feature that should not exist. `built` records how far one that does exist was implemented. `baseline: inventoried` records that nobody has yet said what one that does exist is *for*.

### `kicked`

**To withdraw a feature, add this instead of deleting the section.**

```markdown
# Payroll
<!-- id: payroll -->
<!-- target: backend, frontend-admin -->
<!-- kicked: yes -->
```

Deleting it leaves `/hora` unable to tell "absent" from "deleted", since under the diff scheme every unchanged section is absent.

`/hora` reads `kicked: yes` and withdraws the task, **raising a removal task if it was already implemented.** Removing a task does not remove the code that was written.

**Do not write the reason in the body.** Writing the body replaces the whole body, so the spec's own text would be lost on revival. The place for the reason is the **implementation scope.**

```markdown
### Out of scope for now (to be built later)
- Payroll → planned for 1.1.0. Deferred because it needs the confirmed attendance totals
```

### The two blocks every feature carries

Besides the annotations, a feature section carries two marked subsections. **Both are required, and they are not the same thing.** The one exception is a section listed under `Baseline: inventoried`, which carries a name and one line instead (`baseline`, above).

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

**A feature with acceptance criteria but no use cases builds operations that are each correct and together unreachable.** `/hora-plan` stops with `missing-usecase` (`blocking: yes`).

**Where a feature is split across several `##` sections**, write the use cases **once, on the feature's H1**, and let the sections inherit them. Acceptance criteria stay per section.

### Deferring and reviving

Write `kicked: yes` in that version, and `kicked: no` in the next one. **The file of a past version is not rewritten.**

```markdown
<!-- specs/1.1.0/payroll/spec.md -->

# Payroll
<!-- id: payroll -->
<!-- kicked: no -->
```

No `target`, no `depends`, no body. It all carries over.

---

## Required sections

| Section | `target` | Role | May a declared Source satisfy it instead of `spec.md`'s own text? |
|---|---|---|---|
| **Application prefix** (the project name) | `none` | **the prefix every repository name is built from. `/hora` stops without it** | **No — write it directly in `spec.md`** |
| **Repository layout** | `none` | **declares which repositories and servers to create, and where an already-existing one sits. Written in the entry point. `/hora` stops without it** | **No — write it directly in `spec.md`** |
| **Actors and roles** | `none` | **who uses this product, and how each of them is identified. Every permission and every screen is written against this table, so `/hora` stops without it** | Yes |
| Implementation scope | `none` | declares what to build this time and what is out of scope | Yes |
| Existing assets | `none` | port existing code, or build new | Yes — **except its `Baseline` line** |
| Manual verification | `none` | the middleware needed, and its version | Yes |
| Terminology | `none` | the source of `glossary.md` | Yes |
| Implementation plan | `none` | the order of tasks | Yes |
| **Version acceptance criteria** | `none` | **what the product must do across features once this version is built. The whole-version sweep is the only run that checks it** | Yes |
| Non-functional requirements | `none` | constraints that apply to every task | Yes |
| Sources (optional) | `none` | lists files, by any name, that act as feature files without being named `spec.md` | — |
| Annex (optional) | `none` | gathers relative links to supporting material in one place. A file listed here never becomes a feature file | — |
| (below this, one section per feature) | a repository name / `app` | what gets implemented | — |

**Every feature section carries its own `<!-- usecases -->` and `<!-- acceptance -->` blocks**, and an API's table states **the kind of every operation and who may call it**. None of the four may be inferred, and each is `blocking: yes` when missing.

**One declaration lowers that floor, and only for the first two of the four.** A section carrying `<!-- baseline: inventoried -->` raises neither `missing-usecase` nor `missing-acceptance` (`baseline`, above). **The operation's kind and its caller are not lifted for it**, because those describe code that is already running and already reachable.

**This table is checked against the resolved document, never against one version's file.** A diff that writes nothing but one new feature is complete. **A feature section this version adds is the exception**: nothing carries over into it, so it needs its own use cases and acceptance criteria.

**Three roles must be written directly in `spec.md`: the project name, the repository layout, and `Existing assets`' `Baseline` line.** All three are decisions, not facts to locate, and `/hora-setup` needs the first two before it reads a Source deeply.

**`Baseline` is carved out because it decides how much of an inherited product gets verified before the tag.** A declaration that leaves features unaccepted is legitimate only because every later reader of the spec sees it (`structure.md`, invariant 2). **`Authority` stays satisfiable by a Source**: every consequence of getting it wrong still arrives through a checkpoint or a finding.

**Every other required role may be satisfied either by `spec.md`'s own text or by a declared Source.** A heading in `00-overview.md` that is recognizably "the implementation scope" satisfies that role. Only when a role is found in neither place is it missing.

**This is not an open-ended search.** `/hora` reads `spec.md` and whatever is reachable from it, and nothing else.

**None of the required sections need `<!-- id: -->`/`<!-- target: -->`/`<!-- depends: -->`.** Every one always has the same role: `target: none`, `depends: none`, and an `id` fixed by that role. `/hora` recognizes each by its role, not by matching heading text literally, so rewording or translating a heading breaks nothing.

**This is different from a feature section's `id`**, which is chosen once by a human and must never change afterward.

---

## The blank spec is a separate file, and it lives under `specs/`

**`specs/skeleton/spec.md` is the blank spec** — every heading and every table header, with nothing filled in.

```bash
cp specs/skeleton/spec.md specs/1.0.0/spec.md
```

**The two are split on purpose.** A template with its explanation woven through it is a template you have to strip before using. **This file explains; that file gets filled in.**

**It sits under `specs/` because that is where it is used.** Copying it is a plain `cp` inside one directory.

**`specs/skeleton/` is not a version.** `/hora` reads only the directories under `specs/` whose name is a semver version, so it is never planned, implemented, or counted as unfinished. It raises no `orphan` question either.

**`/hora-spec` does the copying, and anybody who prefers to run the `cp` themselves still can.** Only two skills ever write into `specs/` (`structure.md`, invariant 1).

The skeleton's sections 9 onward are **examples of feature sections, not a fixed list.** Delete, add and renumber freely: `/hora` reads `id`, never a section number.

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

**`Question language` is the language `/hora` writes into `.hora/questions/`.** A question stays in a file and is read by whoever edits `specs/` next, so it cannot be settled by the operator's convenience alone. **Never write two side by side.**

**`Annotation source` only needs writing when the spec already carries its own permanent identifier per requirement or element** (`FR-010`, `TBL-01`, `SCR-03`) plus a table mapping each prefix to a target. Point this at that table and `/hora` takes `id` from the element's own identifier and `target` from the table.

**The project name is written as prose, right under the table.** It becomes the **project prefix** of every repository name. **It is not derived from a directory name, so it must always be written here.**

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

- **This section belongs in the entry point.** The layout applies to the whole version
- **The backend is exactly one.** One DB system = one repository, so `/hora` stops with a question at zero, or at two or more
- **Frontends are zero or more, freely.** `furo` cannot hold more than one Nuxt app per repository, so repositories split along groups of screens
- **One backend holds several servers side by side.** **The server table is the unit contracts are derived from, so it must always be written**, and its `consumer` column says which frontend looks at which contract
- **Adding a row in a later version** makes `/hora-setup` create that repository when the version is planned
- **Names read `<myproject>-<role>-<purpose>`** — `<myproject>-frontend-admin`, not `<myproject>-admin-frontend`
- **`Origin` is either `renchan` (backend) or `furo` (frontend).** `<myproject>-app` is not written here — it always exists
- **`target`'s value is this table's repository name with `<myproject>-` removed**

#### `Directory` — for a repository that already exists under another name

**A fifth column, optional, and only ever needed when adopting Hora Kit onto a project that already exists.**

```markdown
| Repository | Origin | Role | Directory |
|---|---|---|---|
| `acme-backend` | renchan | the API and jobs (holds the DB) | `legacy-api` |
```

| The column is | What `/hora-setup` does |
|---|---|
| **omitted** | looks for `<myproject>-<role-purpose>`, and clones the boilerplate into it if it is missing. **The default** |
| **written** | looks for exactly that directory, **and never clones.** If it is not there, `/hora-setup` stops and asks |

**`target`'s value still comes from the `Repository` column, never from `Directory`.** `target` is a permanent classification recorded in `.hora/tasks/`; a directory is a place on one person's disk.

**Writing `Directory` also changes what gets excluded.** The hora repository's `.gitignore` and `eslint.config.js` exclude implementation repositories **by name** (`*-backend*/`, `*-frontend*/`), and a directory named anything else matches neither. `/hora-setup` registers it in both and reports that it did. An unexcluded repository gets committed wholesale into the hora repository.

### 3. Actors and roles

```markdown
| Actor | Identified by | Roughly how many | Inside / outside |
|---|---|---|---|
| member of staff | an email and password issued on hire | 200, 5000 foreseen | inside |
| manager | the same login, with a `manager` role | 20 | inside |
| administrator | a separate login, issued by us | 3 | inside |
```

**Every permission, every screen and every endpoint decision is written against this table.** Two actors who share a login are roles on one endpoint; two who do not are separate entities (`../../hora-spec/references/principles.md`).

- **`Identified by` is the column that does the work.** "A manager" says nothing about whether there is one login or two
- **An actor named nowhere else in the document is either a missing feature or a role that does not exist.** Both are worth asking about
- **A missing actor is an authentication mechanism nobody designed**

### 4. Implementation scope

**Always keep the two kinds of "out of scope" apart. Confusing them wrecks the design.**

```
out of scope for now (to be built later)  → /hora leaves an extension point,
                                             kept replaceable
permanently out of scope                  → /hora does not abstract it.
                                             Excludes it from the design
```

Read the first as the second and the structure cannot take it later. Read the second as the first and an abstraction layer gets built that nobody uses.

Write "for now" entries with what unblocks them (`<feature C> → planned for 1.1.0`).

### 5. Existing assets

```markdown
Current implementation: <none (new) / repository name or path>
Treatment: <port it (read the logic and move it) / reference it (match the behavior only, rewrite the implementation)>
Authority: <as-built (what runs is what this version is) / to-spec (the spec is; the code catches up)>
Baseline: <verified (every existing feature is specified and accepted before the tag) / inventoried (a feature may be listed unaccepted, one at a time, by its own annotation)>
```

**Required, since it changes what gets built.**

**`Authority` says which side wins when the spec and the code disagree, and it is a different axis from `Treatment`.** `Treatment` answers "may the old code be used as material"; `Authority` answers "when the two diverge, which is the requirement".

| | `as-built` | `to-spec` |
|---|---|---|
| What this version's spec describes | **the product as it runs today** | the product as it should be |
| A divergence between spec and code | the spec text gets corrected | **a task** — the code gets corrected |
| Something the code does that no spec states | drafted into the spec, as a check | **reported, never resolved alone** (`undeclared-behavior`) |
| New work | the next version, as a diff | this version |

**`Authority` is required whenever `Current implementation` is not `none`, and never asked on a new project.** Where it is missing on an existing project, `/hora` stops (`existing-assets`, `blocking: yes`). **`Treatment` stays required alongside it in both cases.**

**`as-built` reaches only the features that carry `built:` in the version that declared it.** It does not carry forward onto new work through the diff rule. Adopting another existing repository later means that version restates `Existing assets`.

**`Baseline` answers "how much of what already runs is actually accepted before this version is tagged".** Adoption has always answered `verified`; writing it down turns that from an unstated default into a decision somebody made.

| | `verified` | `inventoried` |
|---|---|---|
| What every inherited feature owes | its use cases and its acceptance criteria, like any other feature | **either that, or a name and one line** (`baseline`, above) |
| What the tag claims | a verified baseline | **what was accepted, and no more — the rest is named** |
| What acceptance covers | every feature | **the accepted ones.** A listed feature has no checkbox to be in scope by |
| What a verdict may read | `passed` | **`passed over 17 of 20 features; 3 not accepted` — never a bare `passed`** |

**Required whenever `Current implementation` is not `none`, and never asked on a new project** — the same rule and the same stop as `Authority`.

**`Baseline: inventoried` is a permission, and by itself it marks nothing.** A version that declares it and lists no feature behaves exactly like `verified`. **Approval is per section and never blanket** (`structure.md`), so the line is approved on its own, before any feature is listed against it.

**It reaches only the features that carry `<!-- baseline: -->` in the version that declared it, and it does not carry forward onto new work.** **The reach has to be stated because omission is how the diff scheme propagates.**

**It must be written directly in `spec.md`** — one of the three roles a declared `Source` may not satisfy ("Required sections", above).

### 6. Terminology and domain concepts

Becomes the source of `.hora/glossary.md`. **Identifiers (class names, table names) are decided by `/hora-plan` after checking them against the lint rules**, so a term and its description are enough here.

### 7. Non-functional requirements

Produces no feature of its own, **but becomes a design constraint on every one of them**, so `/hora` always reads it.

### 8. Manual verification

```markdown
| Middleware | Version | profile | Purpose |
|---|---|---|---|
| MariaDB | 10.5.12 | (default) | the primary data store |
| Redis | 7.4 | (default) | BullMQ |
| MinIO | latest | `minio` | S3-compatible object storage |
```

What `/hora-setup` uses to decide `docker-compose.development.yml`'s profiles and `.env.development`'s `COMPOSE_PROFILES`.

**Write the server's version.** An npm dependency does not indicate the server's version. **Redis cannot be dropped in a project with any Job (BullMQ).**

### 9 onward — the feature sections

Each one carries its annotations, then its content, then its `<!-- usecases -->` and `<!-- acceptance -->` blocks.

**A data model section is the one that carries acceptance criteria without use cases of its own.** A table has no user-facing use case; the features built on it do.

**An API table must state the kind of every operation**, and the kind is never inferred (`structure.md`, invariant 2). `/hora-build` branches on the value at three separate checkpoints. Leave it out and `/hora-plan` stops with `undefined-api-kind` (`blocking: yes`).

**It must also state who may call every operation**, in the same table. An operation whose caller was never stated gets implemented with whatever filter its neighbours had. Leave it out and `/hora-plan` stops with `missing-authorization` (`blocking: yes`).

```markdown
| schema | input | result | kind | caller |
|---|---|---|---|---|
| `rpaFlows` | `RpaFlowsInput(pagination)` | `RpaFlowsResult` | query | any signed-in user, own flows only |
| `createRpaFlow` | `CreateRpaFlowInput` | `CreateRpaFlowResult` | mutation | any signed-in user |
| `rpaFlowUpdated` | `RpaFlowUpdatedInput` | `RpaFlowUpdatedResult` | subscription | the owner of the flow |
```

**The caller belongs beside the operation, never in a security appendix.**

**If an input's fields are unknown, `/hora` would have to invent the shape of an API, so it stops.**

```
RpaFlowsInput(pagination)  the contents are indicated in parentheses
                           → derived after an existing schema. Does not stop
RpaFlowsInput              fields unknown
                           → stops with blocking: yes
```

Writing the SDL directly is the most reliable option.

**The RESTful API section is written only when the repository layout declares a REST server**, and a project with none leaves it out. The same rules apply, and **the renderer's own name is what gets implemented and what the frontend's client is built against.**

```markdown
| method | path | renderer | request | response | caller |
|---|---|---|---|---|---|
| `GET` | `/v1/rpa-flows` | `GetRpaFlowsRenderer` | `?page=&limit=` | `RpaFlowsResponse` | the phone app, with a device token |
```

**A background-jobs section states what does not run inside a request, and why not.** It is written only where something does, and a project with any row must also declare Redis in the manual verification table.

```markdown
| Job | Trigger | Queue | Payload | Why not in the request path |
|---|---|---|---|---|
| compile a flow | `createRpaFlow` mutation | `compile` | `{ rpaFlowId }` | minutes at real flow sizes, and retried |
| email the result | after `compileRpaFlow` | (post-worker) | `{ rpaFlowId }` | the caller does not wait on somebody else's mail server |
```

**"Why not in the request path" is a required column, not a note.** A job with no stated reason is one somebody moves back into the request later. `/hora-build`'s checkpoint 7 builds what this table declares.

### 14. Implementation plan

`/hora-plan` extracts the order of `_plan.md` from this. **It does not derive an order of its own.**

**These are the project's own milestones**, unrelated to `/hora-build`'s checkpoints.

**Check that "fine to leave for later" matches the scope section's "out of scope for now".** `/hora` stops with a question if the two do not clearly correspond.

### 15. Version acceptance criteria

**Every feature's own criteria stop at that feature's gate. This section is where the behavior that spans several of them is written**, and the whole-version sweep is the only run that checks it (`../../hora-accept/SKILL.md`, "What is in scope").

```markdown
## 15. Version acceptance criteria

### 1.0.0
<!-- id: version-acceptance-1-0-0 -->

- a newly hired member of staff signs up, clocks in, and appears in the admin's list
  spans: #sign-up, #attendance, #user-admin
- an approved month refuses a clock-in from every screen that offers one
  spans: #attendance, #approval
```

**`spans:` is required on every criterion.** Every finding names the checkpoint it sends the run back to, and in which feature, so a criterion that names no feature leaves a sweep with a real failure and nowhere to send it. **Where a finding could land in more than one, it goes to the feature whose checkpoint is earliest.**

**Written `none` where the version has none.** A section left out is indistinguishable from a version in which nobody considered the question.

**One `###` per version, each with its own `id`.** The diff rule keys on `id`, so a subsection nobody rewrote carries over untouched. Written as one `##` body instead, a version adding a single criterion would have to restate every criterion the product has ever had.

**So these criteria accumulate, and every later sweep checks all of them.** A behavior that spanned three features in 1.0.0 is still supposed to hold in 1.4.0.

**A criterion may reach a feature the spec only listed, and it says so where it is written** (`baseline`, above).

```markdown
- a month's approved total reaches the payslip export unchanged
  spans: #attendance, #approval
  rests on: #payroll (not accepted)
```

**This section states behavior, never a number or a limit.** How fast, how many at once and how long anything is kept belong to the non-functional requirements.

### 16. Key file map

Write this where you can. `/hora` decides placement together with the real tree `/hora-setup` reads.

### Sources and Annex

Both optional, both covered above under "Directory layout".

**Stage 0 of `/hora-spec` is what fills them** (`../../hora-spec/references/investigation.md`).

**Which one a document goes into is not a judgment about quality.** It is whether anybody is willing to be held to it: a current requirements list is `Sources`, a two-year-old design document is `Annex` however good it is. **A document nobody can vouch for goes in `Annex`.**

**A file that is not text — a PDF, a screenshot, a mockup, a spreadsheet — is linked from `Annex` with one line saying what it shows.** Whatever was read out of it reaches the spec the ordinary way: put up as a check, confirmed, and written into the section that owns it. **Never pasted in as though a drawing were a stated requirement.**

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

**A use case is what three separate checkpoints verify against**, each asking a different question:

| Checkpoint | Asks |
|---|---|
| 2 | can the spec, as written, support this at all? |
| 9 | can the API that was actually built support it, call by call? |
| 11 | can a person actually do it, on the screen that was actually designed? |

**All three run at this feature's own gate, so a use case may not reach forward into a feature built after it** ("A criterion is checked at its own feature's gate", below). It goes where the same rule sends a criterion: the order changes, or the journey becomes the version's own.

**Without use cases, `/hora-plan` stops with `missing-usecase`** (`blocking: yes`).

---

## How to write acceptance criteria

**Do not write a condition common to every feature.** That `npm run lint && npm test` passes is common to all of them. Write a section's specific **behavior.**

```markdown
### Acceptance criteria
<!-- acceptance -->

- `createRpaFlow` returns an error on a duplicate `flow_key`
- an empty `nl_procedure` produces a zod validation error
- `rpa_compiled_flows` tied to a deleted flow disappear via CASCADE
```

**Without one, `/hora` stops with a question** (`blocking: yes`). Filling it in by inference would leave the implementer grading their own work.

**A use case is not an acceptance criterion, and neither substitutes for the other.** The use case above does not say what happens on a second clock-in; the criterion does not say why anyone would clock in at all.

### A criterion is checked at its own feature's gate, so it may not reach forward

**One question decides whether a criterion belongs to a feature:**

> **At that feature's checkpoint 18 — against a product in which that feature and its `depends` are built, and nothing later is — can this be observed?**

**What the criterion may lean on is everything already built: what this feature adds, and what its `depends` already provide.** A criterion resting on a predecessor is the ordinary case, not a defect.

**What it may not do is name something built after it.**

```markdown
❌  a user who signed up appears in the admin user list
      #sign-up's criterion, and the list is #user-admin, built later
✅  a second sign-up with the same email is refused, and changes nothing
      observable against what #sign-up itself adds
```

**A forward reference is a `blocking: yes` stop at `/hora-plan` (`forward-reference`), not a note**, because four separate places act on it: checkpoint 1 builds from the criteria, 6 and 16 write a test for each one and run it, `hora-verifier` reports the untestable one as `missingTests`, and 18 fails the feature by construction.

**Three places take a behavior that reaches forward, and they are tried in this order:**

| | Where the behavior goes | When this is the answer |
|---|---|---|
| **1** | **the order changes** — the features are reordered, or a `depends` is added | the dependency is real and the two features simply run in the wrong order. The cheapest fix |
| **2** | **its own section, depending on both** (below) | the behavior is closed inside two features and adds no code of its own |
| **3** | **the version's own acceptance criteria** ("15. Version acceptance criteria", above) | the behavior genuinely spans three or more features, or the product as a whole |

**The order is a rule, and 3 is last for a reason.** A criterion moved to the version gate is verified once, at the end, instead of at a gate that runs while the code is one commit old ("One feature at a time, never two", `../../hora-build/SKILL.md`).

**Where a criterion cannot be placed by anyone present, it is a question and not a guess.** Both readings go out with neither recommended.

### A behavior that only exists once two sections cooperate

**Write it as its own section, depending on both.** "A user who just signed up can sign in with the same credentials" needs `#sign-up` and `#sign-in` to both exist. `/hora` never splits this out on its own, so a scenario left unwritten simply never becomes a feature.

**This is destination 2 above.** The section is ordered after both, so its own checkpoint 18 is the first gate at which the behavior is observable at all.

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

The "adds no code of its own" line carries straight into the task's `Constraint` — `/hora` copies it, it does not decide it.

---

## Supporting material

**The file itself: any name, any location.**

**How it is reached: gathered under `Annex` in the entry point**, or referenced inline with a relative link from whichever section needs it.

```markdown
See the [RPA core spec](./docs/RPA_CORE_SPEC.md) for details.
```

`/hora` follows links starting from `spec.md`. **A file nothing links to is never read**, and raises a question (`blocking: no`). Not listing it under `Sources` is what keeps it interpretation-only.

Supporting material needs no annotation.
