<!-- 日本語版: [middleware.ja.md](./middleware.ja.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# Middleware, and the default API style

What runs beside the backend, which of it may never be dropped, and what a spec has chosen when it says nothing about its API style. The spec's own tables stay the declaration — this file is where their default values and their coupling rules come from.

## The default middleware

What a spec's manual-verification table starts from. The spec declares what the project actually uses; versions written there are the servers' own, matching CI.

| Middleware | Version | profile | Purpose |
|---|---|---|---|
| MariaDB | 10.5.12 | (default) | the primary data store |
| Redis | 7.4 | (default) | the queue's store (BullMQ) |
| MinIO | latest | `minio` | S3-compatible object storage |
| Elasticsearch | — | `elasticsearch` | search, when a version introduces it |
| Kafka | — | `kafka` | event streaming, when a version introduces it |
| Qdrant | — | `qdrant` | vector search, when a version introduces it |

**Write the server's version, not an npm dependency's.** An npm client library's version says nothing about the server it connects to.

**Only the backend uses middleware.** A frontend repository holds neither a DB client nor a Redis client.

## The rules that bind the table

- **Redis cannot be dropped in a project with any background job.** The Job convention runs on BullMQ, and BullMQ requires Redis. A spec with any row in its background-jobs section must also declare Redis in its manual-verification table
- **A profile is turned on by the spec, not by hand.** Which optional services run locally follows the spec's manual-verification section, through `COMPOSE_PROFILES` ([`origins/renchan.md`](./origins/renchan.md))
- **The MariaDB version matches CI** (`test-with-mariadb.yml`), so what passes locally passes there

## The default API style

**GraphQL is what these boilerplates are built around, so a spec that says nothing has said GraphQL.**

**REST is available, and choosing it needs a stated reason.** Reasons that count:

- a consumer that already exists and already speaks REST
- a third party that cannot speak GraphQL — a webhook, a callback, a device
- a transfer GraphQL is a poor fit for: a file download, a redirect, a raw payload
- a public surface where a fixed URL shape is part of the contract

**Both may exist in one backend, per server, and the spec's server table is where that is declared.** What belongs to the spec is which servers exist, who consumes each, and why.
