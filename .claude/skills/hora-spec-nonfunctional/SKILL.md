---
name: hora-spec-nonfunctional
description: Stage 3 of /hora-spec. Turn "it should be fast" into the four numbers that change a design — users now, users foreseen, the heaviest operation, and how long data is kept — plus availability, the security level and the services the project needs. Invoked by /hora-spec, or directly.
---

# hora-spec-nonfunctional

**Stage 3 of `/hora-spec`.** Get the numbers that decide stage 4's design, and the services `/hora-setup` needs in order to bring anything up at all.

Read `../hora/references/structure.md` and `../hora-spec/references/principles.md` first. **`../hora/references/asking.md` fixes how anything here is put to a person**, and `../hora-spec/references/stages.md` is the authority on this stage's exit condition.

**Where something is already running, today's numbers can be read and put up as checks** — how many rows each table holds, how long data has been kept, which services the stack brings up. **What the product must carry tomorrow cannot be**, and that is what this stage is for: a system reports its present, never its intended future.

**Offer numbers as options, never as a blank.** "How many users?" produces a shrug; `200 / 2,000 / 20,000`, with today's row count named alongside, produces an answer in one exchange.

**Nothing in a conventions package owns this stage, and nothing could.** No skill states what a project's user count or availability target should be. What is written below is which questions to ask; every answer is the requester's.

---

## What this stage decides

```
how many users now, and how many foreseen
which single operation is the heaviest, and how much it touches
what availability is expected, and what an outage costs
how long data is kept, and what happens to it after
how high the security requirement is, and why
which services the project needs, and at which version
```

## What it must not decide

| | Whose it is |
|---|---|
| whether a total is stored or recalculated | stage 4. This stage supplies the number that decides it |
| which operation becomes a job | stage 4 |
| who may read a field | stage 6 |
| a cache, an index, a replica, a queue | stage 4, and the conventions package |

**This stage produces constraints, not designs.** A number written here becomes a constraint on every feature, and the design it forces is stage 4's to make.

---

## The four numbers

**A number changes the design. An adjective does not.**

```
1. How many users at launch? How many within two years?

2. Which one thing will be slowest or largest? How much does it touch — how
   many records, how many rows read, how big a file, how many external calls?

3. What happens if it is down for an hour? For a day? Who notices first?

4. How long is this data kept? What happens to it after — deleted, archived,
   anonymized?
```

**Question 2 is why this stage exists before stage 4.** One expensive thing among many cheap ones is the normal shape of a system, and the cheap way to survive it is to keep that one thing separable — its own job, its own queue, its own server later. Decided here it costs a sentence; found later it costs the request path it is already sitting in.

**Question 3 is asked in consequences, not in nines.** "How many nines?" gets a number nobody has thought about. "What happens if it is down for a day?" gets the answer the design actually needs.

**Where nobody knows a number, write what was assumed, in the spec, and record it** (`spec-assumption`, `blocking: no`). **An assumed number that is written down gets corrected when it is wrong; an unwritten one gets designed against silently.**

```markdown
| Users | 200 at launch, 5000 within two years (assumed: the current
          spreadsheet has 180 rows. Confirm with the client) |
```

---

## Everything else worth asking

| Ask | Because |
|---|---|
| what a person may not wait for | anything above a few seconds decides stage 4's job placement, not a spinner at stage 5 |
| what has to be true in law or in policy | retention, consent, an audit trail, where the data may physically sit |
| which external services this depends on | each can be slow or down, and stage 4 has to decide what happens then |
| what has to be reported, and to whom | a report that reads everything is usually the heaviest operation, and usually forgotten |
| how a user's mistake is undone | a system with no way back is a support burden that never appears in a requirement |
| what has to be logged, and what must never be | stage 6 needs both halves |

**Propose the ones nobody raised.** Retention and undo are the two most often missing, and both are cheap now.

---

## What it writes

**Show each section in full and wait for approval** (`../hora-spec/SKILL.md`).

```markdown
## Non-functional requirements

| Item | Requirement |
|---|---|
| Users | 200 at launch, 5000 foreseen within two years |
| Heaviest operation | the monthly close reads every record for the month for
                       every member of staff. Must be separable — see #close |
| Response | a surface responds within 1s at launch volumes. The monthly close
             may take minutes, and must not block a response |
| Availability | working hours, weekdays. An hour's outage is tolerable; a day
                 stops payroll |
| Retention | attendance records kept 7 years (statutory). Nothing user-deleted |
| Security | staff records are personal data. See #security |
| External dependencies | none at 1.0.0 |
```

**And the services, which is what `/hora-setup` reads:**

```markdown
## Manual verification

| Service | Version | Purpose | Optional |
|---|---|---|---|
| <the data store> | 10.5.12 | the primary data store | no |
| <the queue> | 7.4 | background jobs | no |
| <object storage> | latest | file uploads | yes |
```

- **Write the server's version, not a client library's.** A dependency version does not indicate the server's, and without it hora has to guess
- **A queue cannot be left out of a project with any background job.** Where this stage already knows one is coming, declare it now
- **A service the table omits is one that never comes up**, and acceptance stops rather than reviewing something that is not really running

---

## Exit condition

The four numbers written, as numbers or as stated assumptions; availability, retention and the security level written; every service declared with its version.

---

## When it sends the run back

| Found here | Goes to |
|---|---|
| the heaviest operation serves a use case nobody stated | **stage 1** |
| the volume makes a feature unreasonable for this release | **stage 2** |

**A number that arrives later and is ten times what was written comes back here**, and stage 4 is re-entered after it. That is the whole reason this stage precedes the design rather than accompanying it.

---

## References

| File | Content |
|---|---|
| `../hora/references/asking.md` | **a check, a proposal or a question** |
| `../hora-spec/SKILL.md` | the approval rule, the state file, the closing report |
| `../hora-spec/references/stages.md` | this stage's exit condition |
| `../hora-spec/references/principles.md` | "Scale is a number, or it is nothing" |
| `../hora/references/spec-format.md` | the format of both tables written here |
| `../hora-setup/SKILL.md` | what it does with the services table |
