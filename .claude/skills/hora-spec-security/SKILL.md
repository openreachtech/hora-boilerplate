---
name: hora-spec-security
description: Stage 6 of /hora-spec. Give every operation and every screen a stated caller and a stated refusal, name every piece of personal or regulated data, and record why the role-or-endpoint split went the way it did. The one gate with no not-applicable case. Invoked by /hora-spec, or directly.
---

# hora-spec-security

**Stage 6 of `/hora-spec`.** Answer two questions about everything stages 4 and 5 designed: **who may reach this, and what happens when somebody else tries.**

Read `../hora/references/structure.md` and `../hora-spec/references/principles.md` first. `../hora-spec/references/stages.md` is the authority on this stage's exit condition, and `../hora/references/asking.md` on how anything is put to a person.

**This stage is never not applicable.** A release with no authentication at all still has to say so, and why. An unstated caller is an operation that will be implemented with whatever filter its neighbours had, and nothing in the resulting code says that nobody ever decided.

## What this stage reads, and the one distinction that decides everything

This is the stage that reads the auth filters, the role checks and the public-operation allowlists — enough to say, for every operation, who may call it today.

| | |
|---|---|
| **who may call it today** | **a fact.** Read it and put it up as a check |
| **who should be able to call it** | **a decision nobody has made.** Ask it |

Those two are one word apart in English and are not the same claim. "Anyone with a session token can call `deleteAccount`" is something the code says; the same sentence with *should* is something no code can say, and on a product that already runs it is usually something nobody ever said either.

**That gap is this stage's entire yield on an adopted project.** Read the current answer, put it in front of somebody, and watch which ones surprise them — every surprise is an authorization nobody decided, already deployed.

**Ask about every operation whose current answer surprises anybody, and about every operation with no filter at all.** Use the question tool, batched, with the current setting shown alongside each choice.

---

## What this stage decides

```
who may call each operation, and what happens when somebody else does
who may open each screen
which fields are personal, regulated, or must never be logged
why the release has the endpoints it has, rather than roles, or the reverse
what has to be true before this is exposed to the internet at all
```

## What it must not decide

| | Whose it is |
|---|---|
| a new operation, or a new table | stage 4 |
| a new screen | stage 5 |
| how an auth filter is wired, or how a public operation is allowed through | the package's skills covering the server engine |
| whether the built code has a defect | **the package's audit skills**, at checkpoint 8. They audit code; this stage writes what that audit checks against |
| a token lifetime, a hashing algorithm, a header | the package's own skills, at checkpoint 6 |

---

## The pass

**Walk every operation from stage 4 and every screen from stage 5. No exceptions, no sampling.**

```
for each operation:
    who may call it — which actor, in which role, on which endpoint
    may they call it for somebody else's data, or only their own
    what happens when somebody else calls it — refused how, told what
    is it callable before signing in at all

for each screen:
    which actor is it for
    what does somebody else see — a refusal, a redirect, or nothing at all

for each field:
    is it personal, regulated, or secret
    who may read it, who may change it
    may it appear in a log, an error message, an export, a URL
```

**Under `Authority: as-built` the walk stays complete but the confirming batches.** For those features, "who may call each of these today" goes up one check per endpoint — a table of operations and their current callers, corrected rather than composed — instead of one exchange per operation. The declaration made today's configuration the intended one.

**The exception that never batches: anything reachable without authentication.** An operation callable before signing in, a screen that renders to nobody-in-particular, an allowlisted public operation — **each one is put up alone, by name, whatever the declaration says.** "Anyone can call this today" is a fact; "anyone may call this" is a decision, and it is the one decision `as-built` must not make silently.

**`Baseline: inventoried` reaches nothing in this stage.** All it lowers is that a listed feature owes no use cases and no acceptance criteria, and neither block ever answered any of the four questions above. Every operation a listed feature exposes still names its caller and its refusal, and any of its operations reachable without authentication is still put up alone, by name. **The refusal goes in the operation's own row** rather than in an `<!-- acceptance -->` block, because a listed section has none.

**"Only their own" is the case most often wrong and least often stated.** An operation that correctly refuses a member of staff who is not signed in, and happily returns a colleague's month to one who is, passes every test anybody wrote for it.

**Ask what a refusal looks like, not only that there is one.** "Not found" and "not allowed" leak different things.

---

## The endpoint split gets its reason written down

Stage 4 made the choice; the exit condition here is that the reason exists in writing.

| What was chosen | What has to be written |
|---|---|
| one endpoint, switched on role | that roles are expected to change, and that every operation therefore states its role |
| endpoints of their own | that these are different entities — a different login, a different lifecycle — and that the two authentications are separate |
| endpoints per role, one identity model | **the reason this was worth multiplying the schema for**: the security level, or the permission tangle it removes |

The next version's new role is decided against that reason or against nothing. It goes in `.hora/spec/<version>/_stages.md`, under "Decided in conversation, and not visible in `spec.md`".

---

## The kinds of defect to ask about

**The package's audit skills are the authority on what kinds exist** — match them against the equipped descriptions, invoke them, and read the list. They audit code, not documents, so what is borrowed is the list of kinds, never a verdict.

Turn each kind into a question about the spec rather than about code:

| The kind | The spec-stage question |
|---|---|
| missing or over-broad authorization | does every operation name a caller? Does any role have more than its use cases need? |
| exposure | which servers and datastores are reachable from outside, and which must never be |
| secrets and environment | what secrets does this need, and who issues them |
| logging and personal data | which fields must never appear in a log, an error, or an export |
| rate limiting | which operation would be worth abusing — a sign-up, a sign-in, a search, a send |
| uploads | is anything uploaded, what may it be, how large, and who may read it back |
| error leakage | does a refusal say more than it should |

**Where the answer is "nothing to say", write that.** "No uploads at 1.0.0" is a statement somebody can check; silence is not.

---

## What it writes

**Show each addition in full and wait for approval** (`../hora-spec/SKILL.md`).

**The caller goes on the operation, in the section that already holds it** — not in a security appendix. A permission written somewhere else is a permission nobody reads next to the thing it governs.

```markdown
| schema | input | result | kind | caller |
|---|---|---|---|---|
| `attendances` | `AttendancesInput(pagination, month)` | `AttendancesResult` | query | a member of staff, own records only. A manager, for their own team |
| `closeMonth` | `CloseMonthInput` | `CloseMonthResult` | mutation | a manager, own team only |
```

And the rest as non-functional requirements, since they constrain every feature:

```markdown
| Item | Requirement |
|---|---|
| Authentication | staff and managers share one login on `employee-graphql`, switched on
                   role. Administrators authenticate separately on `admin-graphql` |
| Authorization | every operation states its caller in its own table. An operation
                  reached by anybody else is refused with `not-allowed`, never
                  with a silent empty result |
| Personal data | `staffs.email`, `staffs.name`, every `attendances` row. Never
                  written to a log, never included in an error message |
| Rate limiting | sign-in only, at 1.0.0 |
| Exposure | only the two GraphQL servers are reachable. MariaDB and Redis are not |
```

### The acceptance criteria this stage adds

**A refusal is a behavior, so it is testable, so it belongs in `<!-- acceptance -->`.** Add one per operation whose refusal matters — **except on a listed section, where it stays in the operation's own row** ("The pass", above):

```markdown
- `closeMonth` called by a member of staff is refused with `not-allowed`
- `attendances` called for another member of staff's records returns nothing of theirs
```

**This is the point of doing security at the spec stage rather than only auditing code.** A refusal with an acceptance criterion is tested at checkpoint 6; a refusal that exists only in prose is checked by whoever happens to think of it.

---

## Exit condition

Every operation naming its caller and its refusal; every screen naming its actor; every personal or regulated field named; the endpoint split's reason written. `../hora-spec/references/stages.md` is the authority.

**Where a caller cannot be settled because the person who decides is not here**, record `missing-authorization` (`blocking: yes`), naming the operation, and carry on. **Never write a caller nobody stated** — an invented permission reads exactly like a decided one.

---

## When it sends the run back

| Found here | Goes to |
|---|---|
| a role turns out to be two roles, or two turn out to be one | **stage 1**, then stage 4 |
| an operation needs splitting so that permissions can differ | **stage 4** |
| a screen needs splitting for the same reason | **stage 5** |
| the security level was never established | **stage 3** |

---

## References

| File | Content |
|---|---|
| `../hora/references/asking.md` | a check, a proposal or a question — and the question tool this stage defaults to |
| `../hora-spec/SKILL.md` | the approval rule, the state file, the closing report |
| `../hora-spec/references/stages.md` | this stage's exit condition |
| `../hora-spec/references/principles.md` | "Authorization is the thing left unsaid", and the roles-or-endpoints table |
| `../hora-build/references/checkpoints.md` | checkpoint 8, the audit that checks code against what this stage wrote |
| `../hora/references/spec-format.md` | where a caller and a criterion each belong |
