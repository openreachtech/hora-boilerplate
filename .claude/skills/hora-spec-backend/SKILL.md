---
name: hora-spec-backend
description: Stage 4 of /hora-spec. Declare the repositories and servers, then design the data model, the operation list and the background jobs that every stage-1 use case can be walked against. Invoked by /hora-spec, or directly.
---

# hora-spec-backend

**Stage 4 of `/hora-spec`.** Design what holds the data, what operates on it, and what runs outside the request — and prove, use case by use case, that the result can serve them.

Read `../hora/references/structure.md` and `../hora-spec/references/principles.md` first. `../hora-spec/references/stages.md` is the authority on this stage's exit condition, `../hora/references/spec-format.md` on the format of every table written here, and `../hora/references/asking.md` on how anything is put to a person.

**This stage holds no design rule of its own.** How a table is shaped, how an SDL is named, where a job belongs and how a queue is tuned all live in `@openreachtech/ai-agent-skills`. Invoke the skills the delegates table names and read them — never restate one of their rules here.

## What this stage reads

This is the stage that reads the backend properly: the migrations, the models, the SDL, the REST routes, the job definitions and the entry points, at depth.

**The whole existing data model and operation list goes out as checks, batched per area** — one for the tables, one for the operations, one for what runs outside the request. A person confirming the fourteenth table in a row has stopped reading (`../hora-spec/references/investigation.md`).

**A feature listed under `Baseline: inventoried` still owes its tables and its operations a row each here.** The section itself carries a name and one line (`../hora/references/spec-format.md`, "`baseline`") — but its tables are in the database everything designed here has to fit around, and its operations sit on a server stage 6 has to state a caller for. It costs almost no exchanges, since those rows sit inside the batched checks above.

| Read it, put it up as a check | Ask, or propose |
|---|---|
| which tables exist, and what columns they hold | why the model came out that way, and what it rules out |
| which operations exist, and what each returns | who each operation is *for* |
| which work already runs outside the request path | whether work that runs in the request still belongs there |
| what the existing tests assert | whether what they assert is what anybody wanted |

**A shortfall found while reading is a proposal, never a check.** "There is no index on this foreign key" states a fact; "add one" is this stage's own thinking.

---

## What this stage decides

```
which repositories exist, and which servers run inside the backend
one endpoint switched on role, or an endpoint per audience
what tables hold, in logical terms
which operations exist, of which kind, against which server
which processing does not run inside a request, and why not
```

## What it must not decide

| | Whose it is |
|---|---|
| a new use case, or a use case's wording | stage 1 |
| whether a feature is in this release | stage 2 |
| a user count, a retention period, an availability target | stage 3 |
| which screen calls an operation | stage 5 |
| who may call an operation | **stage 6.** This stage writes the operation; stage 6 writes its caller |
| a class name, a table name, a column name that lint has to accept | **`/hora-plan`**, against the lint rules |
| the migration, the model, the resolver, the job class | **`/hora-build`**, at checkpoints 3 to 7 |

---

## The order inside this stage

```
1. The repositories, and the servers inside the backend
2. Roles on one endpoint, or endpoints of their own
3. The data model
4. The operations, per server
5. What runs outside the request
6. Walk every stage-1 use case against 3, 4 and 5
```

**Step 6 is the exit condition, not a review.** A data model that is internally tidy and cannot represent one stated use case passes every other check in this document.

---

## 1. The repositories and the servers

**Declared, never assumed** — `/hora-setup` reads this table and stops without it.

```markdown
| Repository | Origin | Role |
|---|---|---|
| `acme-backend` | renchan | the API and jobs (holds the DB) |
| `acme-frontend-employee` | furo | the employee-facing screens |
| `acme-frontend-admin` | furo | the admin screens |

### 2.1 Servers

| Server | protocol | consumer |
|---|---|---|
| `employee-graphql` | GraphQL | `frontend-employee` |
| `admin-graphql` | GraphQL | `frontend-admin` |
| `worker` | — | an API server in the same repository (no contract needed) |
```

- **Exactly one backend.** One DB system = one repository. Zero, or two, stops the run
- **Frontends are zero or more.** An API-only release declares none, and stage 5 is then not applicable
- **Names read `<myproject>-<role>-<purpose>`**, from stage 1's project name
- **The server table is the unit contracts are cut from**, so it is always written. `consumer` decides whether a contract exists at all
- **A repository that already existed** gets the optional `Directory` column, and `/hora-setup` then never clones it

Everything else about this table is in `../hora/references/spec-format.md`.

## 2. Roles on one endpoint, or endpoints of their own

**The most consequential choice this stage makes.** `../hora-spec/references/principles.md` holds the full decision table; the three cases in one line each:

| The situation | What to do |
|---|---|
| roles come and go | **one endpoint, switched on role** |
| genuinely different entities — a different login, a different lifecycle | **separate endpoints, separate authentication** |
| one identity model, but unusually high security or unmanageably tangled permissions | endpoints per role. **Not the default** |

**Decide it from stage 1's actor table, not from the feature list.** Two actors who share a login are roles; two who do not are entities.

**Write the reason down**, in `.hora/spec/<version>/_stages.md` under "Decided in conversation". Stage 6 checks that it is there, and the next version's new role is decided against that reason or against nothing.

The package owns what an endpoint is and how its auth filter is wired. What belongs here is how many there are and who each is for.

## 3. The data model

Delegate to the skills covering the logical shape of a table. They own whether to normalize, how to hold a status or a category, which type to pick, how to store a time, how to version a master table, how to keep a history, and how to scale reads. Invoke them and design against what they say.

What belongs in the spec is the logical shape:

```markdown
### 9.1 `attendances`

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | bigint | PK | |
| `staff_id` | bigint | FK → `staffs.id`, NOT NULL | who clocked in |
| `worked_on` | date | NOT NULL, unique with `staff_id` | the day, in the staff member's timezone |
| `started_at` | datetime | NOT NULL | |
| `finished_at` | datetime | NULL until they clock out | |
```

- **Every table names which use cases it serves** — **except a table belonging to a listed feature, which names that feature instead**, since a listed section states no use case (`../hora/references/spec-format.md`, "`baseline`")
- **Stage 3's numbers are inputs here.** Whether a monthly total is a stored column or a query is decided by the volume, and the decision is recorded with the number that produced it
- **A deferred feature's seam is honored here** — stage 2 named it, and this is where it is left open
- **Do not name the model class or the migration.** `/hora-plan` decides identifiers against the lint rules

## 4. The operations

**GraphQL is the default; REST needs a stated reason** (`../hora-spec/references/principles.md`).

```markdown
| schema | input | result | kind |
|---|---|---|---|
| `attendances` | `AttendancesInput(pagination, month)` | `AttendancesResult` | query |
| `createAttendance` | `CreateAttendanceInput` | `CreateAttendanceResult` | mutation |
| `closeMonth` | `CloseMonthInput` | `CloseMonthResult` | mutation |
```

**Every operation states its kind, and the kind is never inferred.** `/hora-build` branches on the value at three separate checkpoints. Ask, and write what was said.

**An input whose fields nobody has decided stops the run.** Writing it anyway means inventing the shape of an API.

```
AttendancesInput(pagination, month)   the contents indicated in parentheses
                                      → derivable from an existing schema. Fine
AttendancesInput                      fields unknown
                                      → ask. blocking: yes
```

Writing the SDL directly is the most reliable option, and a spec may do that instead of the table.

**A REST server's row is written only when the server table declares a REST protocol**, and the renderer's own name is what gets implemented:

```markdown
| method | path | renderer | request | response |
|---|---|---|---|---|
| `GET` | `/v1/attendances` | `GetAttendancesRenderer` | `?page=&limit=` | `AttendancesResponse` |
```

## 5. What runs outside the request

**Ask one question of every write: does it have to have finished before the person sees a response?**

```markdown
## 12. Background jobs

| Job | Trigger | Queue | Payload | Why not in the request path |
|---|---|---|---|---|
| close a month | `closeMonth` mutation | `close` | `{ month, staffIds }` | reads every record for the month; minutes at 5000 staff (#nfr) |
| email a filed correction | after `createAttendance` | (post-worker) | `{ attendanceId }` | the caller does not wait on somebody else's mail server |
```

- **"Why not in the request path" is a required column.** A job with no reason is a job somebody will move back into the request later
- **A job that must scale alone gets its own queue.** Stage 3 already named which thing it is
- **Anything that leaves the process is worth naming here.** An external call in the request path makes somebody else's outage your error page
- **Redis must be in stage 3's middleware table** if this section has any row at all. Go back and add it

## 6. Walk the use cases

**Take each use case from stage 1 and walk it, step by step, against the tables, the operations and the jobs as drafted.**

| Look for | It means |
|---|---|
| a step with no operation behind it | the operation list is short |
| a state the model cannot represent | the data model is wrong, not the use case |
| a step that needs data from two places that are not connected | a relation is missing |
| a use case that completes but takes minutes in the request | step 5 was not applied to it |
| an operation no use case needs | either a use case is missing (stage 1) or the operation is — **unless it belongs to a listed feature, which justifies it by name** |

**Where a walk fails, fix the design here and say what changed.** A screen built on an operation list that cannot serve a use case is a screen that will be rebuilt.

**Where the fix needs somebody who is not here**, record `unmet-usecase` (`blocking: yes`), naming the use case and the step that fails, and carry on.

---

## Delegates

**This table lists work, not names.** Match each row against the equipped skills' own descriptions when you reach it (`../hora/references/structure.md`, "No hora file ever names one of those skills").

| What is needed |
|---|
| the logical shape of a table — normalization, status, types, times, history, read scaling |
| SDL, type and field naming, nullability, enums, pagination |
| a REST renderer's route and version |
| whether work belongs in the request, in a post-worker, or in a job |
| a queue, a schedule, a retry, a concurrency limit |
| a side effect that runs after the response |
| what an endpoint is, and what its auth filter does |

**Invoke what you matched. Do not summarize it here, and do not design from memory.** If nothing equipped covers a row, say so by the work it names, carry on without it, and record the gap.

---

## Exit condition

The layout and server table declared; every table, operation and job written with its kind and its reason; every stage-1 use case walked without a gap; every `<!-- acceptance -->` block this stage wrote checkable at its own feature's gate, with anything reaching further handed to stage 2. `../hora-spec/references/stages.md` is the authority.

---

## When it sends the run back

| Found here | Goes to |
|---|---|
| a use case nobody stated, or one that is wrong as written | **stage 1** |
| the design shows the release is too large | **stage 2** |
| the volume the design assumes was never established | **stage 3** |

---

## References

| File | Content |
|---|---|
| `../hora/references/asking.md` | a check, a proposal or a question — and the question tool this stage defaults to |
| `../hora-spec/SKILL.md` | the approval rule, the state file, the closing report |
| `../hora-spec/references/stages.md` | this stage's exit condition |
| `../hora-spec/references/principles.md` | roles or endpoints, GraphQL or REST, synchronous or a job, scale as a number |
| `../hora/references/spec-format.md` | the format of every table here, and what stops the run |
| `../hora-build/references/checkpoints.md` | checkpoints 3 to 7, which build what this stage designs |
