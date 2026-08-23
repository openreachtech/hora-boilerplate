<!-- 日本語版: [artifacts.ja.md](./artifacts.ja.md) — 片方を直したら、同じコミットでもう片方も直してください -->

# What each API kind produces

The spec states the kind of every operation — `query`, `mutation`, `subscription`, or REST — and the kind is never inferred. The build checkpoints branch on that value; **what each value actually produces, at each layer, is this stack's answer and lives here.** How any of it is *written* stays with the equipped skills and the real trees.

## The contract a server's consumers read

One contract file per server whose consumer is elsewhere, under `.hora/contracts/<version>/`:

| The server's protocol | The contract file |
|---|---|
| GraphQL | the SDL, as `<server>.graphql` |
| REST | the route table — method, path, renderer, request and response shapes — as `<server>.md` |

A server whose only consumer lives in the same repository (a worker) needs no contract file.

## At schema design

| Kind | What has to be designed |
|---|---|
| GraphQL query | the SDL for the operation |
| GraphQL mutation | the SDL for the operation |
| GraphQL subscription | the SDL, plus the schema half of a subscription resolver |
| REST | the renderer's route and version |

**Type interfaces and constants belong to schema design.** A `.d.ts` under `types/resolvers/` and an enum-like constant are the schema expressed as types — the stub already needs both before the real implementation exists.

## At the actual implementation

| Kind | What has to be implemented |
|---|---|
| GraphQL query | a query resolver |
| GraphQL mutation | a mutation resolver |
| GraphQL subscription | a subscription resolver |
| REST | the renderer itself |

## At the frontend's API client

| Kind | What has to be built |
|---|---|
| GraphQL query / mutation | a GraphQL operation client |
| GraphQL subscription | a GraphQL operation client, its subscription side |
| REST | a RESTful client |

## Shared frontend logic

**Furo is OOP: shared logic is a class, not a function and not a composable.** Logic used by more than one component or page exists as a class under the app's modules folder.
