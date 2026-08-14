---
name: bank-id
description: Allocate an exclusive, collision-free row-id prefix for a requester inside one backend repository, so two writers never pick the same id. Use it before writing an explicit id into a seeder or a test that creates its own rows.
---

# bank-id

Hand this skill a **requester id** and it returns an **id prefix** you may use, exclusively, for every row you create in this repository — in any table, in any seeder or test — for as long as this project exists.

## Why

Several writers touch the same backend repository over time: every feature `/hora-build` takes through its checkpoints writes into the same tables, and a human team may split work by hand. When two of them pick the same explicit row `id`, whichever runs its seeder last silently overwrites or collides with the other's data. `bank-id` gives each requester its own slice of the id space, once.

**Being serial does not remove the need.** A seeder written for feature A is still in the tree when feature B writes its own, and both are loaded together on the next database refresh. What has to be exclusive is the id space across time, not across concurrent processes.

## The id shape

Every explicit id is an 8-digit integer, split into two parts.

```
1  0  0  0  0  0  0  1
└──┬──┘ └────┬────┘
 prefix    free (yours alone)
(100-999)  (00000-99999)
```

- **The first 3 digits (100-999, 900 values)** are the prefix `bank-id` hands out. One requester, one prefix, forever
- **The last 5 digits (00000-99999)** are yours to use however you like, in whatever order is convenient
- **A prefix is not scoped to one table.** Once you hold `137`, you may use `13700001` in `users` and `13700001` in `reservations` — different tables have independent primary keys

900 prefixes comfortably exceeds the number of features any one project realistically produces. Overflow is not handled.

## The requester id

Whatever uniquely names the caller, chosen by the caller:

- **`/hora-build`'s own main session** passes the feature's `id`, once per feature, and hands the prefix it gets back to every agent working in that repository. **The agents themselves never call this skill** — several units of one checkpoint run at once, and each asking for itself would queue them behind one another's `mkdir` for no gain
- a human working by hand picks their own name (`alice`), or a per-feature name for more than one slice

The same requester id always gets back the same prefix. Asking twice, or retrying after a crash, is always safe.

## State

Both live directly under the backend repository's own root — never under the outer app repository's `.hora/`, which belongs to `/hora` and means something unrelated there.

```
<backend-repo>/.hora/id-bank.json     the registry
<backend-repo>/.hora/id-bank.lock/    the lock (a directory — mkdir is atomic on POSIX)
```

`id-bank.json` is a flat object, requester id to prefix, as a string so a leading `1` is never mistaken for an octal digit:

```json
{
  "sign-up": "100",
  "verify-two-factor": "101",
  "alice": "102"
}
```

## Allocating (the normal call)

1. Try `mkdir <backend-repo>/.hora/id-bank.lock`.
2. If it fails because the directory already exists, wait 1 second and retry. **Stop retrying after 5 attempts (5 seconds total)** and go to "A lock that will not clear" — do not remove the lock yourself here.
3. Once `mkdir` succeeds, you hold the lock. Read `id-bank.json` (treat a missing file as `{}`).
4. If the requester id is already a key, that value is the answer. Go to step 6.
5. Otherwise, pick the lowest integer in `100..999` not already used as a value, add `{ "<requester id>": "<that number>" }`, and write the whole file back (rewrite it whole — a partial write would corrupt the JSON for the next reader).
6. `rmdir <backend-repo>/.hora/id-bank.lock` to release the lock, then return the prefix.

**Never skip the lock**, even to only read the file — a reader running concurrently with a writer's rewrite can observe a half-written file.

## A lock that will not clear

Reaching the retry limit means another writer is either still working or died mid-update. From outside these look identical, so **never remove the lock yourself to force through.** Report the failure instead:

- **`/hora` stops the whole session** and states plainly: "the lock `bank-id` uses did not clear, so this session is ending. Running `/hora` again will clear it automatically and continue" (see "Clearing a stale lock"). This should be rare — the lock is taken once per feature, by the main session, for the few seconds one allocation takes
- **A human running this by hand** may wait and retry, or run the clearing step below themselves

## Clearing a stale lock

A lock still standing at the very start of a fresh run cannot belong to anything still alive — nothing in this project holds it across separate invocations. Clearing it is therefore safe at that moment, and only then.

```
rm -rf <backend-repo>/.hora/id-bank.lock
```

`/hora-build` runs this, unconditionally, as its very first action against the backend row on any invocation. A human recovering from the failure above runs the same command by hand.

## Using the prefix once you have it

Combine it with your own 5 digits when you write an explicit id — in a seeder, or inside a test that creates its own fixture. Do not derive ids from anything but your own prefix, and do not read or reason about another requester's rows.
