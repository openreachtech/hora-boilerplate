---
name: bank-id
description: Allocate an exclusive, collision-free row-id prefix for a requester (a /hora task, or a person working by hand) inside one backend repository, so parallel writers never pick the same id. Use this before writing an explicit id into a seeder or a saving-category test.
---

# bank-id

Hand this skill a **requester id** and it returns an **id prefix** you may use, exclusively, for every row you create in this repository — in any table, in any seeder or test — for as long as this project exists.

## Why

Several writers touch the same backend repository over time: `/hora`'s parallel workflow dispatches many `hora-implementer` agents, and a human team may split work by hand without `/hora` at all. When two of them pick the same explicit row `id` for two unrelated rows, whichever runs its seeder or migration last silently overwrites or collides with the other's data. `bank-id` removes the need to coordinate directly — each requester gets its own slice of the id space, once, and never has to check anyone else's.

## The id shape

Every explicit id is an 8-digit integer, split into two parts.

```
1  0  0  0  0  0  0  1
└──┬──┘ └────┬────┘
 prefix    free (yours alone)
(100-999)  (00000-99999)
```

- **The first 3 digits (100-999, 900 values)** are the prefix `bank-id` hands out. One requester, one prefix, forever.
- **The last 5 digits (00000-99999)** are yours to use however you like, with no further coordination — pick them in whatever order is convenient.
- **A prefix is not scoped to one table.** Once you hold `137`, you may use `13700001` in `users`, `13700001` in `reservations`, and so on — different tables have independent primary keys, so reusing the same number across tables never collides.

900 prefixes comfortably exceeds the number of tasks any one version realistically produces. Overflow is not handled.

## The requester id

Whatever uniquely names the caller, chosen by the caller:

- `/hora`'s parallel workflow passes the task's own `id` (the same value as `<!-- spec: <id> -->` in `.hora/tasks/`)
- a human working by hand picks their own name (`alice`), or a per-feature name if they want more than one slice

The same requester id always gets back the same prefix. Asking twice, or retrying after a crash, is always safe.

## State

Both live directly under the backend repository's own root — never under the outer app repository's `.hora/`, which belongs to `/hora` itself and means something unrelated there.

```
<backend-repo>/.hora/id-bank.json     the registry
<backend-repo>/.hora/id-bank.lock/    the lock (a directory — mkdir is atomic on POSIX)
```

`id-bank.json` is a flat object, requester id to prefix, as a string so a leading `1` is never mistaken for an octal digit elsewhere:

```json
{
  "sign-up": "100",
  "verify-two-factor": "101",
  "alice": "102"
}
```

## Allocating (the normal call)

1. Try `mkdir <backend-repo>/.hora/id-bank.lock`.
2. If it fails because the directory already exists, wait 1 second and retry. **Stop retrying after 5 attempts (5 seconds total)** and go to "A lock that will not clear", below — do not remove the lock yourself here.
3. Once `mkdir` succeeds, you hold the lock. Read `id-bank.json` (treat a missing file as `{}`).
4. If the requester id is already a key, that value is the answer. Go to step 6.
5. Otherwise, pick the lowest integer in `100..999` not already used as a value, add `{ "<requester id>": "<that number>" }` to the object, and write the whole file back (rewrite it whole — never append text to the file directly, since a partial write would corrupt the JSON for the next reader).
6. `rmdir <backend-repo>/.hora/id-bank.lock` to release the lock, then return the prefix.

**Never skip the lock**, even to only read the file — a reader running concurrently with a writer's rewrite can otherwise observe a half-written file.

## A lock that will not clear

Reaching the retry limit in step 2 means another writer is either still working or died mid-update without releasing the lock — from outside, these look identical, so **never remove the lock yourself to force through**. Report the failure instead and let the caller decide:

- **`/hora`'s parallel workflow stops the whole session** and states plainly: "the lock `bank-id` uses did not clear, so this session is ending. Running `/hora` again will clear it automatically and continue." (see "Clearing a stale lock")
- **`/hora`'s serial run does the same.** Reaching this point in the serial run should be rare — only one task's `hora-implementer` ever holds the lock at a time, for the few seconds one allocation takes — but if it happens (a subagent call dying between `mkdir` and `rmdir`, say), stop and state the same thing: running `/hora` again clears it automatically and continues.
- **A human running this by hand** sees the same failure and may simply wait and retry, or run the clearing step below themselves.

## Clearing a stale lock

A lock still standing at the very start of a fresh run cannot belong to anything still alive — nothing in this project holds it across separate invocations, so it is always leftover from a run that ended abnormally. Clearing it is therefore always safe at that specific moment, and only then.

```
rm -rf <backend-repo>/.hora/id-bank.lock
```

Both `/hora` runs run this, unconditionally, as their very first action against the backend row — the parallel workflow before dispatching any task, the serial run at the start of Stage 2. A human recovering from the failure above runs the same command by hand.

## Using the prefix once you have it

Combine it with your own 5 digits when you write an explicit id — in a seeder, or inside a `saving`-category test that creates its own fixture. Do not derive ids from anything but your own prefix; do not read or reason about another requester's rows.
