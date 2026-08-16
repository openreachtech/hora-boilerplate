<!--
  A blank spec. It gets copied to specs/<version>/spec.md and filled in.

      /hora-spec                                       writes it with you
      cp specs/skeleton/spec.md specs/1.0.0/spec.md    to fill it in by hand

  Headings and table headers only. What each section is for, which ones are
  required, and what makes hora stop and ask are all in
  .claude/skills/hora/references/spec-format.md. Read that; write this.

  Four things worth knowing before you start:

  1. This is the FIRST version's starting point only. From the second version
     on, spec.md is a diff against the version before it — copy this file into
     1.1.0 and twenty empty headings land in a document that needed one new
     feature.

  2. Sections 9 onward are EXAMPLES of feature sections, not a fixed list.
     Delete, add and renumber freely — hora reads `id`, never a number.

  3. Have documents already? Drop them into specs/<version>/sources/ (things
     that ARE the spec) or annex/ (things that EXPLAIN it). Only have a rough
     idea? Put it in specs/<version>/request/, in your own words, and run
     /hora-spec. All three ship empty, and none is required.

  4. Sections 5's `Authority` and `Baseline` lines, and a feature's
     `<!-- built: -->` annotation, are ONLY for adopting hora onto code that
     already runs. A new project leaves all three out. None may be guessed —
     /hora-spec confirms each with you, one feature at a time.

  specs/skeleton/ is not a version. Hora only reads directories under specs/
  whose name is a semver version, so this one is never planned, never
  implemented, and never reported as unfinished.
-->

# <project name> design document

## 1. Document information

| Item | Content |
|---|---|
| Product version |  |
| Document revision |  |
| Author |  |
| Question language |  |
| Conventions package |  |
| Annotation source |  |

**Project name: `<myproject>`**


## 2. Repository layout

| Repository | Roles | Template | Purpose | Directory |
|---|---|---|---|---|
|  |  |  |  |  |

### 2.1 Servers

| Server | Protocol | Consumer |
|---|---|---|
|  |  |  |

### 2.2 Operation kinds

| Kind | Means |
|---|---|
|  |  |


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

| Service | Version | Purpose | Optional |
|---|---|---|---|
|  |  |  |  |


## 9. Data model
<!-- id: data-model -->
<!-- target:  -->
<!-- depends: none -->

### 9.1 <table name>

| Column | Type | Constraint | Description |
|---|---|---|---|
|  |  |  |  |

### Acceptance criteria
<!-- acceptance -->

-


## 10. Operations
<!-- id: operations -->
<!-- target:  -->
<!-- depends:  -->

| Operation | Input | Result | Kind | Caller |
|---|---|---|---|---|
|  |  |  |  |  |

### Use cases
<!-- usecases -->

-

### Acceptance criteria
<!-- acceptance -->

-


## 11. Background jobs
<!-- id: jobs -->
<!-- target:  -->
<!-- depends:  -->

| Job | Trigger | Queue | Payload | Why not in the request path |
|---|---|---|---|---|
|  |  |  |  |  |

### Acceptance criteria
<!-- acceptance -->

-


## 12. Surfaces
<!-- id: surfaces -->
<!-- target:  -->
<!-- depends:  -->

### 12.1 <surface name>

For:

| Calls | Kind | When |
|---|---|---|
|  |  |  |

States — nothing yet / waiting / failed / not allowed:

-

### Use cases
<!-- usecases -->

-

### Acceptance criteria
<!-- acceptance -->

-


## 13. Implementation plan

### Milestone 1 (MVP)

1.

### Milestone 2

2.

### Fine to leave for later

-


## 14. Version acceptance criteria

### <version>
<!-- id: version-acceptance-<version> -->

-


## 15. Key file map

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
