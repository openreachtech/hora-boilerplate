# What every hora skill assumes

`/hora`, `/hora-spec` (and its seven stage skills), `/hora-setup`, `/hora-plan`, `/hora-build` and `/hora-accept` all stand on this file. **It is written once here and read by all of them** — a copy in a skill is what goes stale.

---

## The division of labor

**Hora Kit owns the order and the gates. It does not own how anything is built, or what counts as a pass.**

| | Who owns it | Where it lives |
|---|---|---|
| which phase runs next, and when a project is ready for it | Hora Kit | `/hora` |
| **the order a spec is decided in, and what must be settled before the next thing** | Hora Kit | `/hora-spec` |
| which repositories exist, and what fills them | Hora Kit | `/hora-setup` |
| which version is being built, and which features it holds | Hora Kit | `/hora-plan` |
| **the order of the checkpoints, and each one's exit condition** | Hora Kit | `/hora-build` |
| **how to write a resolver, a migration, a component, a test** | **`@openreachtech/ai-agent-skills`** | that package's own skills |
| **how to shape a table, an SDL, a job, a screen** | **`@openreachtech/ai-agent-skills`** | whichever of its skills covers that work |
| **what an acceptance review looks at, and what it fails on** | **`@openreachtech/ai-agent-skills`** | whichever of its skills covers that work |

**Never write a procedure, a convention or a pass/fail criterion into a hora skill when a skill in `ai-agent-skills` already holds it.** State the work and delegate it. A copy disagrees with the original the first time the package is updated, and nothing announces that it has.

### No hora file ever names one of those skills

**A skill's name belongs to the package, which is free to change it.** A renamed skill does not disagree with anything: the name stops matching, the gate runs without its convention, and the run reports a pass.

| | |
|---|---|
| **a hora file** | **states the kind of work.** "the CSS conventions this project uses", "how a background job is written" |
| **the equipped skills** | **state what they cover**, in their own `description:` |
| **the match between the two** | **made at run time, never written down in advance** |

**This applies to every hora file** — `checkpoints.md`, `stages.md`, an agent definition, a `docs/` page. A name written "just as an example" is the same copy.

**Skills Hora Kit itself ships may be named freely** — `/hora-spec`, `/hora-plan`, `/hora-build`, `/hora-accept`, `bank-id`, `hora-implementer`, `hora-verifier`, `hora-digester`. They live in this repository, so a rename here is a rename everywhere.

### How the match is made

`/hora-setup` runs `.claude/skills/hora-setup/scripts/equip-skills.sh`, which copies every skill the package ships into this repository's `.claude/skills/`. They are then invocable through the ordinary `Skill` tool.

```
1. The checkpoint, stage or acceptance step states the kind of work
2. The MAIN SESSION reads the equipped skills' own descriptions under
   .claude/skills/, and picks the ones that cover that work, on the surface
   the row being worked in requires
3. It records which it picked, against the checkpoint, in .hora/
4. It hands those names to the agent that runs the work, each with a digest
   of that skill (../../hora-build/SKILL.md, "Step 3 — the digest each
   matched skill is read through")
```

**A digest is the one copy this rule admits.** It carries the version it was derived from, so it stops being read the moment that version moves, and it names its source. It reduces what an agent holds resident, and it decides nothing.

**Step 4's digest reaches a step that writes to a convention. A step whose skill *is* the criteria invokes that skill in full.** An agent writing code opens the skill the moment a question surfaces; a security audit or an acceptance review has no such moment, because the missing check is the one nobody thinks to ask about.

**Step 2 is the main session's, never an agent's.** An agent that picked its own would pick differently on a rerun, and nothing would say which set the first run used.

**Step 3 is what keeps this reproducible**, and it makes a package rename visible in a diff.

**Match against what a description says, never against what a name sounds like.** Two package skills can differ by one word in the name and serve different surfaces.

**The prefix says which surface a skill serves**, and it is the one part of a name worth reading:

| Prefix | Applies to |
|---|---|
| `hb-` (hora-backend) | the backend repository |
| `hf-` (hora-frontend) | a frontend repository |
| `hc-` (hora-core) | either |

If nothing equipped covers the work, **say so and continue without it.** Guessing at a substitute is worse than proceeding and reporting the gap.

---

## The structure this assumes

One project is made of several git repositories. The outer one is the hora repository, and the implementation repositories are nested inside it. **Every hora skill runs at the outer root.**

```
myproject-app/                     ← cwd. Holds specs/, .hora/ and .claude/. Holds no application code
  myproject-backend/               ← from renchan. Contains several servers. Is gitignored
  myproject-frontend-employee/     ← from furo
  myproject-frontend-admin/        ← from furo
```

**The spec declares the layout. No hora skill may assume one.**

- **One backend repository.** Keep `one DB system = one repository`. **If a second one is declared, stop and ask** (`blocking: yes`)
- **One backend holds several servers.** An employee GraphQL server, an admin GraphQL server, a REST-API, a JSON-RPC and a Worker can live side by side in separate folders. **An API server and a Worker that share a DB belong in one repository**
- **Frontends do not come in pairs, and there may be several.** furo cannot hold more than one Nuxt app per repository, so repositories split along groups of screens
- **Names read `<myproject>-<role>-<purpose>`** — `myproject-frontend-admin`, not `myproject-admin-frontend`. Role first keeps repositories of the same role adjacent and makes `app` → `backend` → `frontend-*` the order of implementation
- **A repository that already existed before Hora Kit rarely follows that name, and is not renamed to.** The layout declaration's optional `Directory` column says where such a row actually sits. **The `Repository` column is still what `target` is derived from**, so a directory is only ever a place on disk
- **More arrive in later versions**

The `myproject` part is the project name. **Use the name written in the spec. Do not derive it from the directory name.** Glued onto `<role>-<purpose>`, call it the **project prefix**.

The nesting is Claude Code's requirement, not git's: a session cannot write outside its cwd.

---

## Where a per-repository command runs

Every hora skill runs at the outer root, but **every command that acts on a repository runs with that repository as its working directory**, as one command, with paths relative to it:

```
cd myproject-backend && npx eslint app/... server/...
```

**This is a rule about commands in general, not a list of three.** What decides it is whether the command reads or writes anything belonging to a repository: its config (`eslint.config.js`, `jest.config.js`, `pm2.config.cjs`, `jsconfig.json`), its `package.json` and `node_modules/`, its `.env.development` and `docker-compose.development.yml`, its migrations, seeders and generated output, its own git history, its own source. Whatever `/hora-setup` turns up in the real tree — `./docker.sh`, a `test.sh`, a `db:*` npm script, an `e2e/docker/` stack — is covered from the moment it is found.

**`git -C <repository>` is the same rule spelled with git's own option**, and is the form these skills use. An option counts only where it relocates the working directory the way `cd` does.

**The reverse holds too.** A command belonging to the hora repository — `npm run lint` at the root — runs at the root.

**A wrong working directory does not reliably announce itself.**

| Run from the outer root | What actually happens |
|---|---|
| `npx eslint …` | **passes, having read nothing** (below) |
| `npm install <package>` | **succeeds against the wrong repository.** The dependency lands in `myproject-app`'s `package.json` |
| `npx jest …` | fails loudly — a repository's `jest.config.js` is not the root's |

Only the last says so. The outer root's own `eslint.config.js` ignores `*-backend*/` and `*-frontend*/`, so every implementation file matches an ignore pattern: eslint exits `0`, and a check that never ran is indistinguishable from one that passed.

**`--config <repository>/eslint.config.js` from the root is not a substitute.** That config's relative `ignores` then resolve against the root, so files the repository excludes get linted anyway.

---

## Invariants

These three must not be broken.

### 1. Ownership is split

| Directory | Who writes | What a hora skill may do |
|---|---|---|
| `specs/` | **`/hora-spec`, `/hora-plan`, and humans** | **write, and only with approval: `/hora-spec` a section at a time, `/hora-plan` an edit at a time. Every other skill is read-only** |
| `.hora/` | hora skills | write (humans read only) |

**Two skills may write there, and both do it the same way.**

```
1. state what is missing, or what was decided in the conversation
2. show the exact text, in full, as it will be written
3. wait for approval of THAT text
4. write it
```

| | Writes | Granularity of approval |
|---|---|---|
| **`/hora-spec`** | a whole version's spec, from a conversation with whoever wants the product — **and, from the second version on, that version's diff** | **a section**, at the end of the stage that drafted it |
| **`/hora-plan`** | the holes and contradictions found while planning | **an edit** |

**Approval is never blanket.** "Yes, fix them all" is not approval of text nobody has read. Go back to step 2 for each unit.

**What is protected is not the act of typing — it is that no requirement enters `specs/` without a human having read the exact words.** A skill that writes unapproved text has invented a requirement, which is invariant 2.

**An improvement a skill thought of is a proposal, and it is labelled one.** Proposing is expected; the silent proposal is what is forbidden.

**`specs/skeleton/spec.md` is written to by nobody, and is not a version.** It is the blank spec copied to `specs/1.0.0/spec.md`, **for the first version only** (`spec-format.md`). `/hora` reads only the directories under `specs/` whose name is a semver version, so the skeleton is never planned, implemented, or counted as unfinished.

**Every other skill — `/hora-setup`, `/hora-build`, `/hora-accept`, and every agent — is strictly read-only on `specs/`.** They report a problem there; they never fix it. A typo and a broken layout are treated the same.

**`/hora-build`'s checkpoint 1 is where the routing happens, not an exception.** A design hole goes to `/hora-spec` at the stage that owns it, a one-line hole to `/hora-plan`'s propose-and-approve procedure (`../../hora-build/references/checkpoints.md`, checkpoint 1).

### 2. The boundary of inference

| | Example | Treatment |
|---|---|---|
| Classifying | `target` / `depends` | **May be inferred.** It attaches a label and adds no information |
| Filling in content | requirements / use cases / acceptance criteria / implementation scope / **which kind an API operation is** / **how far a feature was already built (`built`)** / **whether a feature is verified or merely listed (`baseline`)** / how existing assets are used | **Must not be inferred.** It would mean inventing what the spec does not say |
| **A permanent identifier** | **`id`** | **Must not be invented.** Derive it only where it can be derived (`/hora-plan`) |

**`id` is not `target`.** A wrong `target` changes which checkpoints apply; `id` is the permanent reference key from `.hora/tasks/`. Inferred from heading text, it changes the next time somebody edits the heading, and recorded references come loose in silence.

#### This forbids inferring. It does not forbid reading

```
read the code, draft what it shows, show it, let somebody confirm it   allowed
read the code and write the requirement it implies                     forbidden
```

The middle step is the whole invariant. Putting a reading to a person **as a check** — "I read it as this; is that right?" — invents nothing (`asking.md`).

**What no amount of reading settles is intent.** Which operations exist is a fact. Who they are *for*, who *should* be allowed to call them, and how much of a feature counts as finished are not in the tree.

**`Authority: as-built` is a human moving this invariant's reach, once, in writing** (`spec-format.md`, "Existing assets"). Somebody who writes it has decided that the running system is the requirement, for every feature the declaration covers — so drafting `built:` and use cases off the system is working out a stated decision. **Where no such line is written, this section applies in full.**

**`Baseline: inventoried` moves nothing about inference.** It admits that a feature may be *listed* rather than specified, and a listed feature is admissible precisely because nothing is drafted for it and nothing is claimed about it. **Whether a feature is verified or listed is itself intent: never derived, never batched as one answer over a whole document, and never recommended** (`asking.md`).

**Do not try to keep the number of questions down** (`asking.md`, "Do not economize on asking").

### 3. Pin things to stay reproducible

Follow upstream only on purpose.

- Boilerplates come from `--branch <newest tag>`, not the HEAD of `main`
- Supporting material referenced from a version's `spec.md` is closed inside that version
- Do not bump versions in `package-lock.json` by yourself (`npm update` is a human's action)

---

## Where a lever lives

**A lever is anything that reduces how much work happens** — a declaration, an annotation, a section left out, a step a run gives up. **This section is the rule that places them. It names no lever**; `levers.md` is the index of where the rule has been applied.

**A lever is homed by one property: the subject of its sentence.** Not how much work it saves, not which skill noticed it. Ask the three questions in order; the first match is the home.

```
1. Is it about THE PRODUCT?
     what must exist, who may use it, which side is the requirement when the
     spec and the code disagree, how much of something counts as finished or
     accepted
     -> intent (invariant 2's right-hand column). Only a person states it, and
        only in specs/, through show-the-text-and-wait, one unit at a time.
        Its SUBJECT'S REACH then picks the home:
          the whole project, needed before anything is read deeply, expensive
          to undo                        -> spec.md's own text
          this version's whole position  -> a required section of the resolved
                                            document
          one feature, as an exception   -> an annotation under its heading

2. Is it about ONE RUN?
     how much this invocation does, asserting nothing that outlives it
     -> the invocation form, and that run's own record. The kit narrows only
        against a written condition; a person may only widen

3. Does it merely FOLLOW from something already written under 1 or 2?
     -> a derivation. A skill writes it into .hora/, mechanically, checked
        against a written condition. NOTHING IS EVER DECLARED THERE, because
        humans read .hora/ and do not write it (invariant 1)
```

**Two clauses bind every home.**

**(a) A lever may reduce work. It may never reduce verification, and it may never reduce what is recorded.** A run that gave up a step pays for it **in the record, never in the verdict's wording**.

**(b) A lever states its own reach where it is declared** — whether it carries forward under the diff rule. **Omission is how `specs/` propagates**, so a reach nobody wrote down is a silent permanent grant.

**A lever that is a person's decision may never live in `.hora/`.** A skill that finds a decision waiting for it in the file that skill writes has not been given a decision — it has made one.

---

## What language to write for humans

**What stays in a file follows the declaration; what is said in the moment follows the person in front of you.**

| What is written | Language |
|---|---|
| Question text (`.hora/questions/`) | **The spec's declaration. Absent that, the language of whoever ran it** |
| Notes attached to a task or a checkpoint (constraints, conflict warnings) | same as above |
| An acceptance record (`.hora/acceptance/`) | same as above |
| **Anything said in conversation** — a proposed edit, a checkpoint's question, the closing report | **always the language of whoever ran it** |
| Task names, feature names | copied from the spec |
| Glossary terms | copied from the spec |
| Glossary identifiers | English (the lint rules assume English naming) |

The declaration lives in the spec's document information section.

```markdown
| Question language | Japanese |
```

**It has to be declarable** because a question stays in the file and is read by whoever edits `specs/` next. On a project whose client side includes foreign members, the operator's language leaves someone unable to read it.

**A proposed edit to `specs/` is the exception inside the exception:** discussed in that person's language, written into the file in the language the file is written in.

**Never write two languages side by side.** One copy gets updated and the two disagree.

**Existing questions are not retranslated.** The file is append-only, so it may hold more than one language. That is fine — retranslating changes what somebody else meant.

---

## Citing a question in a report

**A count is not a report.** "Three questions raised" says nothing about where they are, and a question nobody can find is a question nobody answers.

**Every question a run raised, or left open, is named and linked.** This holds in every report, from every skill, at every blocking value.

```
Q4  missing-authorization  blocking: yes
    `closeMonth` does not say who may call it
    → .hora/questions/1.0.0/open.md
```

| | |
|---|---|
| **a link, not a prose path** | a relative markdown link, so it opens from wherever the report is read |
| **the `Q<n>` id and its one-line title** | the file is append-only and grows. A link with no id is a link to a search |
| **never a bare count** | not for `blocking: yes`, not for `blocking: no`, not for the ones this run resolved |

**Where a run raised none, say that.**

**`blocking: no` gets the same treatment as `blocking: yes`.** Nothing is stopping *yet*: an `inferred-annotation` nobody checked and a `spec-assumption` nobody corrected are decisions made by default, cheapest to overturn in the run that raised them.

**An `eslint-exception` still gets its own line, by name, with the link alongside it.**

---

## What lives in `.hora/`

```
.hora/
  spec/<version>/_stages.md     the spec stages (0 to 7), what was decided in conversation
                                and is not visible in spec.md, the proposals that were
                                declined, and what one stage handed to a later one.
                                /hora-spec writes it
  spec/<version>/_assets.md     what stage 0 found in the existing repositories and the
                                declared sources, and the tag it read them at. A cache and
                                an audit trail, never a requirement
  spec/<version>/_divergence.md where the documents and the code disagree, one row per
                                divergence, each carrying where it was routed. Stage 7
                                refuses to pass while a row is unrouted
  tree/<repository>.md          what /hora-setup read in the real tree, and the tag it read it at
  digests/<skill-name>.md       one equipped skill's conventions in short form, and the
                                ai-agent-skills version they were derived from.
                                hora-digester writes it. A cache; the skill stays the authority
  tasks/<version>/
    _plan.md                    the feature order, and the acceptance tasks. /hora-plan writes it
    <feature-id>.md             one feature. /hora-plan creates it, checklist and all;
                                /hora-build writes the checkboxes and the matched skills into it
  contracts/<version>/          one file per server whose consumer is elsewhere
  questions/<version>/open.md   append-only. Answered by editing specs/
  acceptance/<version>/
    <feature-id>.md             every acceptance run for one feature, one appended block each
    _sweep.md                   the whole-version sweep
  glossary.md                   append-only, not split per version
```

**There is no separate state file.** `git log .hora/` is the history of what ran, and the checkboxes hold what is done.
