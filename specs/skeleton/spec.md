<!--
  A blank spec. It gets copied to specs/<version>/spec.md and filled in.

      /hora-spec                        writes it with you, in conversation
      cp specs/skeleton/spec.md specs/1.0.0/spec.md    to fill it in by hand

  Headings and table headers only — nothing here is filled in for you, and
  nothing here explains itself. What each section is for, which ones are
  required, and what makes /hora stop and ask are all in
  .claude/skills/hora/references/spec-format.md. Read that; write this.

  /hora-spec does the copying itself, and writes each section once you have
  read and approved it. Nothing else ever writes into specs/, except
  /hora-plan, one approved edit at a time.

  specs/skeleton/ is not a version. /hora only ever reads directories under
  specs/ whose name is a semver version, so this one is never planned, never
  implemented, and never reported as unfinished.

  The repository layout's Directory column is only for adopting Hora Kit onto
  a repository that already exists under another name. A new project leaves
  the whole column out.

  Sections 9 onward are examples of feature sections, not a fixed list.
  Delete the ones this project has no use for, add the ones it needs, and
  renumber freely — /hora reads `id`, never a section number.

  Section 15 is required, and `none` is a valid body for it. A feature's own
  acceptance criteria stop at that feature's gate, so a behavior that spans
  several features is written there instead — one `###` per version, each with
  its own `id`, and every criterion naming the features it spans. See
  spec-format.md, "A criterion is checked at its own feature's gate" and
  "15. Version acceptance criteria".

  Have documents already? Drop them into specs/<version>/sources/ (things
  that ARE the spec — requirements, an API reference) or annex/ (things that
  EXPLAIN it — mockups, diagrams, an old design doc). Both ship empty.
  /hora-spec's stage 0 reads them, confirms the split with you, and fills in
  the Sources and Annex tables below. Neither directory is required — any
  layout works, and writing the tables by hand works too.

  Only have a rough idea? Put it in specs/<version>/request/ — a mail, a
  ticket, a page of bullets, in your own words — and run /hora-spec. Stage 0
  reads it as what you want this version to do, and the seven stages turn it
  into the sections below, one approved section at a time. Nothing in it
  becomes spec text on its own, and /hora-plan never reads it.

  This whole file is the FIRST version's starting point. From the second
  version on, spec.md is a diff against the version before it — do not copy
  this file into 1.1.0, or twenty empty headings land in a document that only
  needed one new feature. See spec-format.md, "From the second version on".

  A feature section may also carry `<!-- built: spec | backend | frontend -->`,
  and it is deliberately absent from every block below. It is ONLY for adopting
  Hora Kit onto code that already runs — it says how far that feature was
  already implemented, so that working code is not rebuilt — and it must never
  be guessed. /hora-spec confirms it with you, one feature at a time, showing
  what it found — under `Authority: as-built` with the derived gate as the
  default to select; a `to-spec` feature never carries it at all. A new
  project writes it nowhere.

  Section 5's `Baseline:` line is required whenever `Current implementation:`
  is not `none`, and a new project leaves it blank like everything else. It
  says how much of the inherited code this version's tag actually claims:
  `verified`, every existing feature specified and accepted like any other, or
  `inventoried`, which permits a feature to carry
  `<!-- baseline: inventoried -->` and be listed instead — a heading, its
  annotations and one line of prose, built but neither specified nor accepted.
  Write it in this file; a declared Source may not satisfy it. See
  spec-format.md, "5. Existing assets".
-->

# <project name> design document

## 1. Document information

| Item | Content |
|---|---|
| Product version |  |
| Document revision |  |
| Author |  |
| Question language |  |
| Annotation source |  |

**Project name: `<myproject>`**


## 2. Repository layout

| Repository | Origin | Role | Directory |
|---|---|---|---|
|  |  |  |  |

### 2.1 Servers

| Server | protocol | consumer |
|---|---|---|
|  |  |  |


## 3. Actors and roles

| Actor | Identified by | Roughly how many | Inside / outside |
|---|---|---|---|
|  |  |  |  |


## 4. Implementation scope

### Built this time (<version>)

-

### Out of scope for now (to be built later)

-

### Permanently out of scope

-


## 5. Existing assets

Current implementation:
Treatment:
Authority:
Baseline:


## 6. Terminology and domain concepts

| Term | Description |
|---|---|
|  |  |


## 7. Non-functional requirements

| Item | Requirement |
|---|---|
|  |  |


## 8. Manual verification

| Middleware | Version | profile | Purpose |
|---|---|---|---|
|  |  |  |  |


## 9. Data model
<!-- id: data-model -->
<!-- target: backend -->
<!-- depends: none -->

### 9.1 <table name>

| Column | Type | Constraint | Description |
|---|---|---|---|
|  |  |  |  |

### Acceptance criteria
<!-- acceptance -->

-


## 10. GraphQL
<!-- id: graphql -->
<!-- target:  -->
<!-- depends:  -->

| schema | input | result | kind | caller |
|---|---|---|---|---|
|  |  |  |  |  |

### Use cases
<!-- usecases -->

-

### Acceptance criteria
<!-- acceptance -->

-


## 11. RESTful API
<!-- id: rest -->
<!-- target:  -->
<!-- depends:  -->

| method | path | renderer | request | response | caller |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

### Use cases
<!-- usecases -->

-

### Acceptance criteria
<!-- acceptance -->

-


## 12. Background jobs
<!-- id: jobs -->
<!-- target: backend -->
<!-- depends:  -->

| Job | Trigger | Queue | Payload | Why not in the request path |
|---|---|---|---|---|
|  |  |  |  |  |

### Acceptance criteria
<!-- acceptance -->

-


## 13. Screens
<!-- id: screens -->
<!-- target:  -->
<!-- depends:  -->

### 13.1 <screen name>

For:

| Calls | Kind | When |
|---|---|---|
|  |  |  |

### Use cases
<!-- usecases -->

-

### Acceptance criteria
<!-- acceptance -->

-


## 14. Implementation plan

### Milestone 1 (MVP)

1.

### Milestone 2

2.

### Fine to leave for later

-


## 15. Version acceptance criteria

### <version>
<!-- id: version-acceptance-<version> -->

-


## 16. Key file map

| Path | Role |
|---|---|
|  |  |


## Sources

| Source | Provides |
|---|---|
|  |  |


## Annex

| File | Provides |
|---|---|
|  |  |
