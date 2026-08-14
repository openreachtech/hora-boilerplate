# What every hora skill assumes

`/hora`, `/hora-spec` (and its seven stage skills), `/hora-setup`, `/hora-plan`, `/hora-build` and `/hora-accept` all stand on what is written here. **It is written once, in this file, and read by all of them** — copy any of it into a skill and the copy is what goes stale.

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

**Never write a procedure, a convention or a pass/fail criterion into a hora skill when a skill in `ai-agent-skills` already holds it.** State the work and delegate it. A copy disagrees with the original the first time the package is updated, and nothing announces that it has — the copy still reads as authoritative.

This is the same reasoning `/hora-setup` already applies to the boilerplates: **read the real thing; do not bake in what it currently says.** The package is the real thing here.

### No hora file ever names one of those skills

**A skill's name belongs to the package, and the package is free to change it.** A name written into a checkpoint, a stage or a reference file is a copy of something Hora Kit does not own — and it is the one kind of copy that fails silently. A renamed skill does not disagree with anything: the name simply stops matching, the gate runs without its convention, and the run reports that it passed.

So the rule is the same one the procedures follow, applied to the names themselves:

| | |
|---|---|
| **a hora file** | **states the kind of work.** "the CSS conventions this project uses", "how a background job is written" |
| **the equipped skills** | **state what they cover**, in their own `description:`, which the package updates along with the skill |
| **the match between the two** | **made at run time, never written down in advance** |

**This applies to every hora file without exception** — `checkpoints.md`, `stages.md`, an agent definition, a `docs/` page. A name written "just as an example" is the same copy with a softer label on it.

**Skills Hora Kit itself ships may be named freely** — `/hora-spec`, `/hora-plan`, `/hora-build`, `/hora-accept`, `bank-id`, `hora-implementer`, `hora-verifier`. Those live in this repository, so a rename here is a rename everywhere, in the same commit.

### How the match is made

`/hora-setup` runs `.claude/skills/hora-setup/scripts/equip-skills.sh`, which copies every skill the package ships into this repository's own `.claude/skills/`. From then on they are invocable through the ordinary `Skill` tool, like any other.

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

**A digest is a copy, and it is the one copy this rule admits.** What "The division of labor" forbids is a copy that outlives its original in silence — a procedure written into a hora file still reads as authoritative after the package has changed, and nothing announces it. A digest carries the version it was derived from, so it stops being read the moment that version moves; it names its source, so the skill itself settles anything the digest states thinly. It reduces what an agent holds resident, and it decides nothing.

**Step 4's digest reaches a step that writes to a convention, and a step whose skill *is* the criteria invokes that skill in full.** The difference is what happens when the short form falls short: an agent writing code opens the skill the moment a question surfaces, so a thin digest costs one read. A skill that supplies the checks — a security audit, an acceptance review — has no such moment, because the missing check is exactly the one nobody thinks to ask about. **A summarized check list is a shorter check list, and it reports a pass.** So a security audit and an acceptance review run from the skill itself, every check in it.

**Step 2 is the main session's, never an agent's.** The main session is handed the equipped skills' descriptions as part of its own context, so the match is made once, in one place, where it can be recorded. An agent that picked its own would make a different choice on a rerun, and nothing would say which one the first run used.

**Step 3 is what keeps this reproducible.** A checkpoint that ran against a set of conventions and does not say which is a checkpoint nobody can re-derive. Recording it also makes a package rename visible in a diff: last run picked five skills for checkpoint 15, this one picked four.

**Match against what a description says, never against what a name sounds like.** What follows a prefix is a label, not a classification — one package skill is a Furo client and another is renchan SDL, and their names differ by no more than a word. **The description is the only thing that says which is which.**

**The prefix says which surface a skill serves**, and it is the one part of a name worth reading:

| Prefix | Applies to |
|---|---|
| `hb-` (hora-backend) | the backend repository |
| `hf-` (hora-frontend) | a frontend repository |
| `hc-` (hora-core) | either |

If nothing equipped covers the work a checkpoint states, **say so and continue without it.** The package may have dropped that skill, or it may never have covered this. Guessing at a substitute is worse than proceeding and reporting the gap.

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

- **One backend repository.** Keep `one DB system = one repository`. **If a second one is declared, that is outside the policy, so stop and ask** (`blocking: yes`)
- **One backend holds several servers.** An employee GraphQL server, an admin GraphQL server, a REST-API, a JSON-RPC and a Worker can live side by side in separate folders (this is renchan-core's design). **An API server and a Worker server that share a DB also belong in one repository**
- **Frontends do not come in pairs, and there may be several.** Some projects only need an API for a phone app. **furo cannot hold more than one Nuxt app per repository**, so repositories split along groups of screens. One backend against several frontends comes from this asymmetry
- **Names read `<myproject>-<role>-<purpose>`.** It is `myproject-frontend-admin`, not `myproject-admin-frontend`. Putting the role first keeps repositories of the same role adjacent and makes `app` → `backend` → `frontend-*` the order of implementation (verified to be locale-independent)
- **A repository that already existed before Hora Kit rarely follows that name, and is not renamed to.** The layout declaration's optional `Directory` column says where such a row actually sits, and `/hora-setup` looks there instead. **The name in the `Repository` column is still what `target` is derived from**, so a directory is only ever a place on disk — nothing in `.hora/` depends on it
- **More arrive in later versions.** A project starts with an API for a phone app and gains an admin screen later

The `myproject` part is the project name. **Use the name written in the spec. Do not derive it mechanically from the directory name.** Glued onto `<role>-<purpose>` like this, call it the **project prefix** — the two terms name the same value, but "project prefix" is the word for this specific, repository-naming role.

The nesting is not git's requirement but Claude Code's: a session cannot write outside its cwd.

---

## Where a per-repository command runs

Every hora skill runs at the outer root, but **every command that acts on a repository runs with that repository as its working directory**, as one command, with paths relative to it:

```
cd myproject-backend && npx eslint app/... server/...
```

**This is a rule about commands in general, not a list of three.** `npx eslint`, `npx jest` and `npm` are only the ones met most often. What decides it is whether the command reads or writes anything that belongs to a repository — its config (`eslint.config.js`, `jest.config.js`, `pm2.config.cjs`, `jsconfig.json`), its `package.json` and `node_modules/`, its `.env.development` and `docker-compose.development.yml`, its migrations, seeders and generated output, its own git history, its own source. If it does, it runs from inside that repository, whether or not it is named here. **`/hora-setup` reads the real tree**, and whatever it turns up there — `./docker.sh`, a `test.sh`, a `db:*` npm script, an `e2e/docker/` stack, anything else that boilerplate ships at its own current tag — is covered from the moment it is found, with nothing to add to a list first.

**`git -C <repository>` is this same rule spelled with git's own option**, and is the form these skills use throughout. An option counts only where it genuinely relocates the working directory the way `cd` does; one that merely points at a single file does not (`--config`, below).

**The reverse direction holds too.** A command that belongs to the hora repository itself — `npm run lint` at the root — runs at the root, never from inside a declared row. What must not happen is a command reaching across the boundary in either direction (`done-criteria.md` gives the reason a cross-repository script must not be written into the parent either).

**A wrong working directory does not reliably announce itself. That is what makes this worth a rule of its own.**

| Run from the outer root | What actually happens |
|---|---|
| `npx eslint …` | **passes, having read nothing** (below) |
| `npm install <package>` | **succeeds against the wrong repository.** The dependency lands in `myproject-app`'s own `package.json`, where nothing imports it |
| `npx jest …` | fails loudly — a repository's `jest.config.js` is not the root's |

Only the last one says so. **Run lint from the outer root and it passes every time, having read nothing.** The outer root holds no application code, so its own `eslint.config.js` ignores `*-backend*/` and `*-frontend*/` — each repository lints itself, under its own config. Every implementation file therefore matches an ignore pattern: eslint prints `File ignored because of a matching ignore pattern`, exits `0`, and a check that never ran is indistinguishable from one that passed. Nothing fails, so nothing says so. One rule avoids all three.

**`--config <repository>/eslint.config.js` from the root is not a substitute.** It does load the right rules, but that config's own relative `ignores` then resolve against the root instead of the repository, so files the repository excludes get linted anyway.

---

## Invariants

These three must not be broken.

### 1. Ownership is split

| Directory | Who writes | What a hora skill may do |
|---|---|---|
| `specs/` | **`/hora-spec`, `/hora-plan`, and humans** | **write, and only with approval: `/hora-spec` a section at a time, `/hora-plan` an edit at a time. Every other skill is read-only** (below) |
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
| **`/hora-spec`** | a whole version's spec, from a conversation with whoever wants the product — **and, from the second version on, that version's diff against the one before it** | **a section**, at the end of the stage that drafted it |
| **`/hora-plan`** | the holes and contradictions found while planning | **an edit** |

**Approval is never blanket.** "Yes, fix them all" is not approval of text nobody has read yet, and one "yes" over a whole document is worse than none, because the record then says it was read. Go back to step 2 for each unit.

**What is protected here is not the act of typing — it is that no requirement ever enters `specs/` without a human having read the exact words.** A person made to type it themselves read it no more carefully; a skill that shows the text and waits protects exactly what this invariant protects. **A skill that writes unapproved text has invented a requirement, which is invariant 2.**

**An improvement a skill thought of is a proposal, and it is labelled one.** Proposing is expected — whoever asks for a product cannot see the gaps from inside their own request. What is forbidden is the proposal that goes in silently.

**`specs/skeleton/spec.md` is written to by nobody, and is not a version.** It is the blank spec that gets copied to `specs/1.0.0/spec.md` — `/hora-spec` does the copying, and a human may run the `cp` instead. **It is copied for the first version only**; every version after it is a diff, and copying the blank into one lands twenty empty headings that read as though somebody wrote them (`spec-format.md`). `/hora` reads only the directories under `specs/` whose name is a semver version, so the skeleton is never planned, implemented, or counted as unfinished.

**Every other skill — `/hora-setup`, `/hora-build`, `/hora-accept`, and every agent any of them starts — is strictly read-only on `specs/`.** On finding a problem there, they report it; they never fix it. A typo and a broken layout are treated the same. Allow "it is minor, I will just fix it" once and the rule is gone.

**`/hora-build`'s checkpoint 1 is not an exception to this — it is where the routing happens.** What that checkpoint finds missing is fixed through the two writers above: a design hole through `/hora-spec`, at the stage that owns it, and a one-line hole through `/hora-plan`'s own propose-and-approve procedure (`../../hora-build/references/checkpoints.md`, checkpoint 1). Same writers, same per-edit approval — reached from a checkpoint instead of from a planning run.

### 2. The boundary of inference

| | Example | Treatment |
|---|---|---|
| Classifying | `target` / `depends` | **May be inferred.** It only attaches a label, it adds no information |
| Filling in content | requirements / use cases / acceptance criteria / implementation scope / **which kind an API operation is** / **how far a feature was already built (`built`)** / **whether a feature is verified in this version or merely listed (`baseline`)** / how existing assets are used | **Must not be inferred.** It would mean inventing what the spec does not say |
| **A permanent identifier** | **`id`** | **Must not be invented.** Derive it only where it can be derived (`/hora-plan`) |

**`id` is not `target`.** Getting `target` wrong only changes which checkpoints apply, but `id` is the reference key from `.hora/tasks/` and is permanent — once given, it never changes. Inferred from heading text, the next run after someone edits the heading produces a different `id`, and recorded references come loose in silence.

#### This forbids inferring. It does not forbid reading

**Reading a repository, a document or a diagram is evidence-gathering, and it is not what this invariant is about.** What it forbids is evidence turning into a requirement without anybody having said so.

```
read the code, draft what it shows, show it, let somebody confirm it   allowed
read the code and write the requirement it implies                     forbidden
```

The middle step is the whole invariant. A skill that reads a repository and puts its findings to a person **as a check** — "I read it as this; is that right?" — has invented nothing: the person supplied the requirement, and the reading only saved them from dictating it. `asking.md` is the authority on how that is put.

**What no amount of reading settles is intent.** Which operations exist is a fact. Who they are *for*, who *should* be allowed to call them, and how much of a feature counts as finished are not in the tree at all, and a half-built screen and a finished one look identical from a file listing. Those stay in the right-hand column above, whatever was read.

**`Authority: as-built` is not an exception to this invariant — it is a human moving its reach, once, in writing** (`spec-format.md`, "Existing assets"). What the invariant forbids is the kit concluding intent; it has never forbidden a person deciding it in one declaration instead of twenty answers. Somebody who writes `as-built` has decided "what this system does is what I want it to do" for every feature the declaration covers — after that, drafting `built:` and use cases off the running system is working out the consequences of a stated decision, not inventing one. The declaration is explicit, it is in the spec where every later reader sees it, and checkpoint 18 still verifies everything it claimed. **Where no such line is written, this section applies in full, everywhere.**

**`Baseline: inventoried` is the second such declaration, and it moves nothing about inference at all.** It admits that a feature may be *listed* rather than specified — and a listed feature is admissible precisely because **nothing is drafted for it and nothing is claimed about it**: no use cases read off its screens, no criteria read off its tests, no checkpoint marked, no verdict. The one fact it records, that the code is there, is confirmed in writing before any checkpoint ever acts on it. So where `as-built` widens what may be *derived* and leans on checkpoint 18 to verify the result, `inventoried` derives nothing and reaches no verdict to be wrong about. **Whether a feature is verified or listed is itself intent, and it is never derived, never batched as one answer over a whole document, and never recommended** (`asking.md`).

**Do not try to keep the number of questions down.** People who are asked start writing it down in advance. Asking is also the mechanism that trains whoever writes the spec — and `asking.md` is about making each question cheap to answer, never about asking fewer of them.

### 3. Pin things to stay reproducible

Follow upstream only on purpose. Never drift to the newest thing by itself.

- Boilerplates come from `--branch <newest tag>` (not the HEAD of `main`)
- Supporting material referenced from a version's `spec.md` is closed inside that version. It is not shared across versions
- Do not bump versions in `package-lock.json` by yourself (`npm update` is a human's action)

---

## Where a lever lives

**A lever is anything that reduces how much work happens** — a declaration, an annotation, a section left out, a step a run gives up. The kit has many, and they are not free to sit wherever they were convenient to write. **This section is the rule that places them. It names no lever**, because an example here is a copy of a rule owned elsewhere, wearing a softer label ("The division of labor", above). Which lever sits in which home is `levers.md`; what any one of them means belongs to the file that owns it.

**A lever is homed by exactly one property: the subject of its sentence — what it is a statement *about*.** Not how much work it saves, not which skill noticed it, not where it is easiest to write. Ask the three questions in this order; the first match is the home.

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

**(a) A lever may reduce work. It may never reduce verification, and it may never reduce what is recorded.** Collapsing the runs must not collapse the records, and a run that gave up a step pays for it **in the record, never in the verdict's wording**. A lever whose effect is that something reads as verified when it was not is not a lever; it is the failure this whole design is built against.

**(b) A lever states its own reach where it is declared** — whether it carries forward under the diff rule. **Omission is how `specs/` propagates**, so a reach nobody wrote down is a silent permanent grant: the version that says nothing keeps it, and no later reader can tell that anybody chose it.

**What follows from the rule, and is worth stating because it is the mistake that gets made:** a lever that is a person's decision may never live in `.hora/`, however convenient it is to read it from there. A skill that finds a decision waiting for it in the file that skill itself writes has not been given a decision — it has made one.

---

## What language to write for humans

**What stays in a file follows the declaration; what is said in the moment follows the person in front of you.**

| What is written | Language |
|---|---|
| Question text (`.hora/questions/`) | **The spec's declaration. Absent that, the language of whoever ran it** |
| Notes attached to a task or a checkpoint (constraints, conflict warnings) | same as above |
| An acceptance record (`.hora/acceptance/`) | same as above |
| **Anything said in conversation** — a planner's proposed edit, a checkpoint's question, the closing report | **always the language of whoever ran it** |
| Task names, feature names | copied from the spec |
| Glossary terms | copied from the spec |
| Glossary identifiers | English (the lint rules assume English naming) |

The declaration lives in the spec's document information section.

```markdown
| Question language | Japanese |
```

**Why it has to be declarable.** Whoever runs this is usually Japanese, so the operator's language is a fine default — but **on a project whose client side includes foreign members, the operator's language leaves someone unable to read it.** A question stays in the file and is read by whoever edits `specs/` next, so it cannot be settled by the operator's convenience alone.

**Conversation does not follow the declaration.** It is aimed at the person who is right there and it does not stay in a file, so it always uses that person's language. **A proposed edit to `specs/` is the exception inside the exception:** it is discussed in that person's language, but written into the file in the language the file itself is written in.

**Never write two languages side by side.** A single question written twice leaves no original: one copy gets updated and the two disagree.

**Existing questions are not retranslated.** The file is append-only, so once the declaration changes or somebody else runs it, one file holds more than one language. **That is fine.** Retranslating a question somebody else wrote does more harm (it changes what they meant — and resolution is judged by reading `specs/`, which does not depend on the language).

---

## Citing a question in a report

**A count is not a report.** "Three questions raised" says that something wants attention and nothing about where it is. Whoever reads it then has to already know that `.hora/questions/` exists, which version directory to open, and what to look for once inside — and a question nobody can find is a question nobody answers, which is the same as never having raised it.

**Every question a run raised, or left open, is named and linked.** This holds in every report, from every skill, at every blocking value.

```
Q4  missing-authorization  blocking: yes
    `closeMonth` does not say who may call it
    → .hora/questions/1.0.0/open.md
```

| | |
|---|---|
| **a link, not a prose path** | write it as a relative markdown link, so it opens from wherever the report is being read rather than being retyped |
| **the `Q<n>` id and its one-line title** | the file is append-only and grows. A link to a file holding forty questions, with no id, is a link to a search |
| **never a bare count** | not for `blocking: yes`, not for `blocking: no`, not for the ones this run resolved |

**Where a run raised none, say that** — "no questions raised" is a result, and it needs no link.

**`blocking: no` gets the same treatment as `blocking: yes`.** It is the one people skip, on the grounds that nothing is stopping. What is actually true is that nothing is stopping *yet*: an `inferred-annotation` nobody checked and a `spec-assumption` nobody corrected are both decisions made by default, and both are cheapest to overturn in the run that raised them.

**An `eslint-exception` still gets its own line, by name, as it always did** — now with the link alongside it.

```
.hora/
  spec/<version>/_stages.md     the spec stages (0 to 7), what was decided in conversation
                                and is not visible in spec.md, the proposals that were
                                declined, and what one stage handed to a later one — a
                                criterion that reached past the feature it was drafted
                                for, waiting for stage 2 to place it. /hora-spec writes it
  spec/<version>/_assets.md     what stage 0 found in the existing repositories and the
                                declared sources, and what tag it read it at. /hora-spec
                                writes it. A cache and an audit trail, never a requirement
  spec/<version>/_divergence.md where the documents and the code disagree, one row per
                                divergence, each carrying where it was routed. /hora-spec
                                writes it; stage 7 refuses to pass while a row is unrouted
  tree/<repository>.md          what /hora-setup read in the real tree, and the tag it read it at
  digests/<skill-name>.md       one equipped skill's conventions in short form, and the
                                ai-agent-skills version they were derived from.
                                hora-digester writes it, /hora-build hands it to an agent.
                                A cache; the skill itself stays the authority
  tasks/<version>/
    _plan.md                    the feature order, and the acceptance tasks. /hora-plan writes it
    <feature-id>.md             one feature. /hora-plan creates it, checklist and all;
                                /hora-build writes the checkboxes and the matched skills into it
  contracts/<version>/          one file per server whose consumer is elsewhere
  questions/<version>/open.md   append-only. Answered by editing specs/
  acceptance/<version>/
    <feature-id>.md             every acceptance run for one feature, one
                                appended block each
    _sweep.md                   the whole-version sweep
  glossary.md                   append-only, not split per version
```

**There is no separate state file.** `git log .hora/` is the history of what ran, and the checkboxes hold what is done.
