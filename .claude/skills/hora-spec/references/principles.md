# The thinking a spec is written with

**What every stage applies while it talks to somebody.** `stages.md` says what must be true before a stage is over; this says what to weigh on the way there.

---

## The boundary this file sits on

| | Owns | Example |
|---|---|---|
| **here** | **the question to ask, and what to weigh in answering it** — at the stage where no code exists yet | *"does this write have to have finished by the time the person sees a response?"* |
| **the conventions package** | **how the answer is built, and what counts as done properly** | *where a job's classes live, how they are wired, and when one gets a queue of its own* |

**The test: if a line here could be checked against the package and found to disagree, it does not belong here.** Nothing below states a type, a naming rule, a directory or a retry policy.

**Where a stage needs one of those rules in order to ask a sensible question, it invokes the skill and reads it.**

---

## 1. Everything starts from a use case

**Who, doing what, to get what done — and through what kind of interface.** Until that is fixed, a data model has nothing to hold, an operation has nobody calling it, and a surface has no reason to exist.

**Break down what was asked. Do not transcribe it.** A request arrives as a feature list, because that is how the person has been thinking about it. Turning "attendance, approval, payroll" into the six things somebody actually completes is the work of stage 1.

**Propose. A stage that only asks is doing half the job.** The gaps in a request are invisible from inside it — the case nobody thought of, the flow two screens longer than it needs to be, the role that turns out to be two roles.

---

## 2. A release carrying too much is the normal failure

**Not a risk to watch for — the default outcome, unless somebody actively narrows it.**

**So narrow it, out loud, at stage 2.** The question that does the work is not "is this important?" — everything is important — but:

```
which use case is impossible without it?
```

**The goal of a spec is not coverage. It is the fewest use cases somebody actually needs, served in the best form available.** Ten features half-served is worse than four served well, and slower, because the four carry the ten's design compromises.

**Say when a release is overloaded even after being told it is fine.** State it once, propose the split, and if the answer is still no, record it and carry on. **The decision belongs to whoever asked for the product; saying nothing does not.**

---

## 3. Build for now. Design for what was named

**Implement only what this release needs. That is not permission to make the next release impossible.**

| The spec says | What the design does |
|---|---|
| out of scope **for now** | leave a seam. Keep what is behind it replaceable |
| **permanently** out of scope | do not abstract it. Exclude it entirely |

**Also name what nobody has planned but somebody can see coming.** A notification channel that is email today, a search that is a substring match today, a single tenant that becomes several. None of it is built now; all of it is a sentence in the "for now" list. **A foreseen requirement with no seam named is a wish, not a design constraint.**

---

## 4. The default interface style is whatever the project already has

**A spec that says nothing has chosen whatever the project's template provides**, and that is a legitimate answer.

**Choosing something else needs a stated reason.** Reasons that count:

- a consumer that already exists and already speaks it
- a third party that cannot speak the default — a webhook, a callback, a device
- a transfer the default is a poor fit for — a file download, a redirect, a raw payload
- a public surface where a fixed URL shape is part of the contract

**Several styles may exist in one repository, one per server**, and the server table is where that is declared. What belongs in the spec is which servers exist, who consumes each, and why.

---

## 5. Roles on one endpoint, or endpoints of their own

**The most consequential choice stage 4 makes, and the one most often made by accident.** Ask who the users actually are before asking how permissions work.

| The situation | What to do | Why |
|---|---|---|
| **roles come and go** — a new one per client, per plan, per team | **one endpoint, switched on role** | every added role is a row of configuration, not a new server, schema and auth filter |
| **genuinely different entities** — a different table, a different login, a different lifecycle | **separate endpoints, separate authentication** | one identity model that has to be two is where privilege escalation gets built by accident |
| one identity model, but **unusually high security** or **unmanageably tangled permissions** | endpoints per role, so which operations exist differs by endpoint | a missed check becomes a missing endpoint rather than a silent hole. **Not the default** — it multiplies the schema and every operation added afterwards |

**Say which one, and why, in the spec.** The next version's new role is decided against that reason or against nothing.

---

## 6. Scale is a number, or it is nothing

**Ask for four numbers, at stage 3.**

```
users at launch
users foreseen, and by when
the heaviest single operation, and how much it touches
how long data is kept, and what happens to it after
```

**A number changes the design; an adjective does not.** Whether a total is stored or recalculated, whether a list is paginated from the first day, whether a report is a query or a job — each has a different answer at two hundred records and at two million, and no answer at all at "a lot".

**The heaviest single operation gets a seam of its own.** Keeping that one thing separable costs a sentence now. Scaling everything because one thing is heavy is the alternative.

**Where nobody knows the number, write what was assumed, and record it.**

---

## 7. Synchronous if it finishes now. A job if it might not

**Ask one question of every write: does it have to have finished before the person sees a response?**

| Answer | Where it goes |
|---|---|
| yes, and it finishes in the request | an ordinary operation |
| yes for the caller, no for the side effect (a mail, an audit line, a cache) | a deferred side effect: the response goes first, the work follows |
| no — it is long, it is retried, it is scheduled, it depends on something slow | a queued background job |

**A job that must scale alone gets its own queue.** That is decided here, at the spec, not discovered later.

**An external call is the case worth naming explicitly.** Anything that leaves the process can be slow or down, and putting it in the request path makes somebody else's outage your error page.

---

## 8. Authorization is the thing left unsaid

**Ask it of every operation and every surface, without exception**: who may reach this, and what happens when somebody else does.

**Ask it of the data too.** Which fields are personal, which are regulated, who may read them, and what a log file is allowed to contain.

**An unstated caller is an operation that will be implemented with whatever filter its neighbours had.** That is what makes this the one gate in the document with no "not applicable" case.

**The package's audit skills own what kinds of defect exist, and they audit code, not documents.** What belongs to the spec is the stated caller, the stated failure behavior, and the named sensitive field.
