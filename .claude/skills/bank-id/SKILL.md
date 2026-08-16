---
name: bank-id
description: Allocate an exclusive, collision-free row-id prefix for a requester inside one repository, so two writers never pick the same id. Use it before writing an explicit id into a seeder or a test that creates its own rows.
---

# bank-id

Hand this skill a **requester id** and it returns an **id prefix** you may use, exclusively, for every row you create in this repository — in any table, in any seeder or test — for as long as this project exists.

**Not needed where the data store generates its own unique keys.** With random or database-assigned ids there is nothing to collide, and this skill does not apply.

## Why

Several writers touch the same repository over time: every feature `/hora-build` takes through its checkpoints writes into the same tables, and a human team may split work by hand. **When two of them pick the same explicit row id, whichever runs its seeder last silently overwrites or collides with the other's data.**

**Being serial does not remove the need.** A seeder written for feature A is still in the tree when feature B writes its own, and both are loaded together on the next database refresh. **What has to be exclusive is the id space across time, not across concurrent processes.**

## The id shape

Every explicit id is an 8-digit integer, split into two parts.

```
1  0  0  0  0  0  0  1
└──┬──┘ └────┬────┘
 prefix    free (yours alone)
(100-999)  (00000-99999)
```

- **The first 3 digits (100–999)** are the prefix this skill hands out. One requester, one prefix, forever
- **The last 5 digits** are yours to use however you like, in whatever order is convenient
- **A prefix is not scoped to one table.** Once you hold `137`, you may use `13700001` in two different tables — their keys are independent

900 prefixes comfortably exceeds the number of features any one project realistically produces. **Overflow is not handled.**

**A project whose keys are not 8-digit integers keeps the mechanism and changes the shape**, recording what it uses in `.hora/tree/<repository>.md`. What matters is that the space is partitioned and the partition is recorded.

## The requester id

Whatever uniquely names the caller, chosen by the caller:

- **`/hora-build`'s main session** passes the feature's `id`, once per feature, and hands the prefix to every agent working in that repository. **The agents never call this skill themselves** — several units of one checkpoint run at once, and each asking for itself would queue them behind one another's lock for no gain
- **a human working by hand** picks their own name, or a per-feature name for more than one slice

**The same requester id always gets back the same prefix.** Asking twice, or retrying after a crash, is always safe.

## State

Both live directly under the repository's own root — never under the outer hora repository's `.hora/`, which means something unrelated there.

```
<repo>/.hora/id-bank.json     the registry
<repo>/.hora/id-bank.lock/    the lock (a directory — mkdir is atomic)
```

`id-bank.json` is a flat object, requester id to prefix, **as a string so a leading digit is never reinterpreted**:

```json
{
  "sign-up": "100",
  "verify-two-factor": "101",
  "alice": "102"
}
```

## Allocating

```
1. Try `mkdir <repo>/.hora/id-bank.lock`.
2. If it fails because the directory exists, wait 1 second and retry. Stop
   after 5 attempts and go to "A lock that will not clear" — do not remove the
   lock yourself here.
3. Once mkdir succeeds, you hold the lock. Read id-bank.json (a missing file
   is {}).
4. If the requester id is already a key, that value is the answer. Go to 6.
5. Otherwise pick the lowest number in 100..999 not already used as a value,
   add it under the requester id, and write the whole file back — rewrite it
   whole, since a partial write would corrupt the JSON for the next reader.
6. rmdir the lock, then return the prefix.
```

**Never skip the lock, even to only read the file.** A reader running concurrently with a writer's rewrite can observe a half-written file.

## A lock that will not clear

Reaching the retry limit means another writer is either still working or died mid-update. **From outside these look identical, so never remove the lock yourself to force through.** Report the failure instead:

- **`/hora` stops the whole session** and states plainly: "the lock `bank-id` uses did not clear, so this session is ending. Running `/hora` again will clear it automatically and continue." This should be rare — the lock is taken once per feature, for the few seconds one allocation takes
- **a human running this by hand** may wait and retry, or run the clearing step below

## Clearing a stale lock

**A lock still standing at the very start of a fresh run cannot belong to anything still alive** — nothing in this project holds it across separate invocations. Clearing it is therefore safe at that moment, and only then.

```
rm -rf <repo>/.hora/id-bank.lock
```

`/hora-build` runs this unconditionally as its first action against the repository on any invocation.

## Using the prefix

Combine it with your own digits when you write an explicit id — in a seeder, or in a test creating its own fixture. **Derive an id from your own prefix alone, and do not read or reason about another requester's rows.**
