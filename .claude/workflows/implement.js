// Official sample code does not pass lint as-is.
// Always run `npm run lint` before copying it in. Two mismatches already found.
//
//   the while-based loop-until-dry  → while / let are forbidden. Rewritten as recursion
//   filter(Boolean)                 → passing a constructor to a higher-order function
//                                     is forbidden. Use filter(one => one !== null)
//                                     instead — it also states the intent clearly
//                                     (Boolean also drops 0, '' and false)
//
// A top-level `return` must not be written.
//
// A workflow carries `export const meta`, so it can only be parsed with
// sourceType: module, and in that mode ESLint does not accept a top-level
// `return` as syntax (it is a parse error, not a rule, so eslint-disable has
// no effect on it). Instead of returning a result, the final hora-recorder
// writes it into .hora/. The state lives in a file; a return value would just
// be a second copy of it.

export const meta = {
  name: 'hora-implement',
  description: 'Implement the unchecked tasks of one spec version in parallel',
  whenToUse: 'Stage 2 of /hora, when a version holds more tasks than a serial run should carry',
  phases: [
    {
      title: 'Scout',
      detail: 'read .hora/tasks/<version>/ once per declared repository',
    },
    {
      title: 'Implement',
      detail: 'one agent per task, chained where tasks share a file',
    },
    {
      title: 'Verify',
      detail: 'adversarial check against the acceptance criteria',
    },
    {
      title: 'Install',
      detail: 'serial npm install/uninstall for dependencies the tasks just reported needing',
    },
    {
      title: 'Lint',
      detail: 'npm run lint per repository, fixed and retried up to a limit when it fails',
    },
    {
      title: 'Test',
      detail: 'a continuous dispatcher: logic / finding / saving tests, prioritized in that order',
    },
    {
      title: 'Record',
      detail: 'the only agent that writes .hora/',
    },
  ],
}

const TASK_LIST_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'tasks',
    'unreadable',
  ],
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'title',
          'repository',
          'depends',
          'conflictKey',
          'constraints',
        ],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          repository: { type: 'string' },
          depends: {
            type: 'array',
            items: { type: 'string' },
          },
          conflictKey: { type: ['string', 'null'] },
          constraints: { type: ['string', 'null'] },
        },
      },
    },
    unreadable: {
      type: 'array',
      items: { type: 'string' },
    },
  },
}

const TEST_REQUEST_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'category',
    'file',
  ],
  properties: {
    category: {
      type: 'string',
      enum: [
        'logic',
        'finding',
        'saving',
      ],
    },
    file: { type: 'string' },
  },
}

const RESULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'done',
    'touchedFiles',
    'newIdentifiers',
    'registrations',
    'dependencies',
    'conflictProof',
    'contractDrift',
    'reinvention',
    'specIssues',
    'testRequests',
  ],
  properties: {
    done: { type: 'boolean' },
    touchedFiles: {
      type: 'array',
      items: { type: 'string' },
    },
    newIdentifiers: {
      type: 'array',
      items: { type: 'string' },
    },
    registrations: {
      type: 'array',
      items: { type: 'string' },
    },
    dependencies: {
      type: 'array',
      items: { type: 'string' },
    },
    conflictProof: {
      type: 'array',
      items: { type: 'string' },
    },
    contractDrift: {
      type: 'array',
      items: { type: 'string' },
    },
    reinvention: {
      type: 'array',
      items: { type: 'string' },
    },
    specIssues: {
      type: 'array',
      items: { type: 'string' },
    },
    testRequests: {
      type: 'array',
      items: TEST_REQUEST_SCHEMA,
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'satisfied',
    'unmet',
    'missingTests',
    'contractDrift',
    'specIssues',
    'specAssumptions',
  ],
  properties: {
    satisfied: { type: 'boolean' },
    unmet: {
      type: 'array',
      items: { type: 'string' },
    },
    missingTests: {
      type: 'array',
      items: { type: 'string' },
    },
    contractDrift: {
      type: 'array',
      items: { type: 'string' },
    },
    specIssues: {
      type: 'array',
      items: { type: 'string' },
    },
    specAssumptions: {
      type: 'array',
      items: { type: 'string' },
    },
  },
}

const LINT_VIOLATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'rule',
    'file',
    'line',
    'message',
  ],
  properties: {
    rule: { type: 'string' },
    file: { type: 'string' },
    line: { type: 'integer' },
    message: { type: 'string' },
  },
}

const LINT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'passed',
    'failures',
  ],
  properties: {
    passed: { type: 'boolean' },
    failures: {
      type: 'array',
      items: LINT_VIOLATION_SCHEMA,
    },
  },
}

const ADHOC_RESOLUTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'applied',
    'rule',
    'file',
    'branch',
  ],
  properties: {
    applied: { type: 'boolean' },
    rule: { type: 'string' },
    file: { type: 'string' },
    branch: { type: 'string' },
  },
}

const TEST_RUN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'passed',
    'failures',
    'environmentIssue',
  ],
  properties: {
    passed: { type: 'boolean' },
    failures: {
      type: 'array',
      items: { type: 'string' },
    },
    environmentIssue: { type: ['string', 'null'] },
  },
}

const INSTALL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'installed',
    'applied',
    'failures',
  ],
  properties: {
    installed: {
      type: 'array',
      items: { type: 'string' },
    },
    applied: {
      type: 'array',
      items: { type: 'string' },
    },
    failures: {
      type: 'array',
      items: { type: 'string' },
    },
  },
}

/**
 * Build the prompt that reads one repository's task list.
 *
 * @param {string} repository - Repository suffix, as declared in the spec.
 * @returns {string} Prompt for hora-scout.
 */
const buildScoutPrompt = repository => [
  `Read .hora/tasks/${args.version}/${repository}.md and return its unfinished tasks.`,
  `The repository is ${repository}.`,
  'Do not return tasks marked `- [x]` or entries under the `## Withdrawn` section.',
].join('\n')

/**
 * Build the prompt that implements one task.
 *
 * @param {*} task - Task as returned by hora-scout.
 * @returns {string} Prompt for hora-implementer.
 */
const buildImplementPrompt = task => [
  `Task to implement: ${task.title}`,
  '',
  `Repository        ${task.repository}`,
  `Spec               id: ${task.id} under specs/${args.version}/`,
  `Task list          .hora/tasks/${args.version}/${task.repository}.md`,
  `Contracts          .hora/contracts/${args.version}/`,
  'Terms              .hora/glossary.md',
  task.constraints === null
    ? 'Design constraint  none'
    : `Design constraint  ${task.constraints}`,
  task.conflictKey === null
    ? ''
    : `Conflict           other tasks also touch ${task.conflictKey}. Regenerate it if it is an aggregation file`,
  '',
  'Do not touch any file outside this task. Do not write to git or .hora/.',
].join('\n')

/**
 * Build the prompt that verifies one implementation.
 *
 * @param {*} task - Task that was implemented.
 * @param {*} result - What hora-implementer reported.
 * @returns {string} Prompt for hora-verifier.
 */
const buildVerifyPrompt = (task, result) => [
  `Task to verify: ${task.title}`,
  '',
  `Spec               the acceptance criteria of id: ${task.id} under specs/${args.version}/`,
  `Contracts          .hora/contracts/${args.version}/`,
  `Files the implementation touched  ${result.touchedFiles.join(' / ')}`,
  '',
  'Look for where the acceptance criteria are not met. Where you cannot tell, default to "not met".',
  task.repository === 'backend'
    ? 'This is backend, so do not run the tests. Judge by reading the code and the tests side by side.'
    : 'You may run the tests.',
].join('\n')

/**
 * Build the prompt that lints one repository's changed files so far.
 *
 * @param {string} repository - Repository suffix, as declared in the spec.
 * @param {Array<string>} files - Files touched in this repository, this run, so far.
 * @returns {string} Prompt for the lint agent.
 */
const buildLintPrompt = (repository, files) => [
  `In ${repository}, run npx eslint on exactly these files (no other agent is touching this repository, so you may use it exclusively):`,
  '',
  files.join('\n'),
  '',
  `Run it from inside the ${repository} repository — the outer root's single \`*-${repository}*\` directory — by cd'ing into it first, in the same command, with each path above rewritten relative to it. From the outer root, that root's own eslint.config.js ignores every implementation repository: eslint reports "File ignored because of a matching ignore pattern", exits 0, and lint passes without having read a line of the code.`,
  '',
  'Report every failure as its own rule name, file, line number, and message, so each violation can be told apart from any other.',
].join('\n')

/**
 * Format one lint violation as a single readable line.
 *
 * @param {*} violation - One `LINT_VIOLATION_SCHEMA` entry.
 * @returns {string} Readable line.
 */
const formatViolation = violation => `${violation.file}:${violation.line} ${violation.rule} — ${violation.message}`

/**
 * Format a list of lint violations as readable lines.
 *
 * @param {Array<*>} violations - `LINT_VIOLATION_SCHEMA` entries.
 * @returns {string} Readable lines, one per violation.
 */
const formatViolations = violations => violations
  .map(violation => formatViolation(violation))
  .join('\n')

/**
 * Build the prompt that fixes one repository's reported lint failures.
 *
 * @param {string} repository - Repository suffix, as declared in the spec.
 * @param {Array<*>} failures - What `npx eslint` reported, as `LINT_VIOLATION_SCHEMA` entries.
 * @returns {string} Prompt for the lint-fix agent.
 */
const buildLintFixPrompt = (repository, failures) => [
  `npx eslint failed in ${repository} (it was run from inside that repository, so every path below is relative to it). Fix every violation below, then stop — do not run lint yourself, it is checked again afterward.`,
  '',
  formatViolations(failures),
].join('\n')

/**
 * Build the prompt that resolves a genuine lint rule contradiction: pick the
 * lowest-protection-tier rule among every distinct violation seen so far,
 * disable it ad hoc for the one file it was reported on, and merge that in.
 *
 * @param {string} repository - Repository suffix, as declared in the spec.
 * @param {Array<*>} violations - Every distinct violation seen so far, as `LINT_VIOLATION_SCHEMA` entries.
 * @returns {string} Prompt for the lint-contradiction agent.
 */
const buildResolveLintContradictionPrompt = (repository, violations) => [
  `In ${repository}, npx eslint's fix loop is not converging (the same violation came back, or the retry limit ran out without one repeating).`,
  'Do not stop the run over this — pick exactly one violation to resolve ad hoc, from every distinct one seen so far:',
  '',
  formatViolations(violations),
  '',
  'Pick from the first tier below that has a candidate:',
  '  1. any @stylistic/* rule',
  '  2. any other rule that is not no-restricted-*',
  '  3. any no-restricted-* rule other than no-restricted-syntax',
  '  4. no-restricted-syntax, only if nothing else qualifies',
  'Within the tier you pick from: prefer the rule with no configurable options, then the one with fewer configurable options, then the alphabetically first rule name.',
  '',
  'Then, on a new branch named adhoc/<rule-name>-in-<filename>:',
  `  - add a \`files\`-scoped override to the eslint.config.js inside the ${repository} repository — the outer root's single \`*-${repository}*\` directory, never the outer root itself, which does not lint that repository at all — disabling exactly that one rule for exactly that one file`,
  '  - mark the override with a `// TODO: Kick out this block after resolved the issue.` comment',
  '  - commit it, merge it back into the branch you started from, then delete the adhoc/ branch',
  '',
  'Report which rule and file you picked, and the branch name you used.',
].join('\n')

/**
 * Where every command of the Test phase runs: inside the backend repository,
 * never at the outer root, whose config is not that repository's.
 */
const BACKEND_WORKING_DIRECTORY_NOTE = 'Run every command from inside the backend repository — the outer root\'s single `*-backend*` directory — by cd\'ing into it first, in the same command. Its jest.config.js, test.sh and npm scripts are not the outer root\'s.'

/**
 * The same, for a prompt that lists the files to run: their paths need rewriting once inside.
 */
const BACKEND_WORKING_DIRECTORY_NOTE_FOR_FILES = `${BACKEND_WORKING_DIRECTORY_NOTE} Rewrite each path above relative to that repository.`

/**
 * Build the prompt that runs every pending logic-category test together.
 *
 * @param {Array<string>} files - Logic-category test files pending in the queue.
 * @returns {string} Prompt for the test agent.
 */
const buildRunLogicPrompt = files => [
  'Run these logic-category tests together, in one Jest invocation (they use no fixture, so nothing else needs to be done first):',
  '',
  files.join('\n'),
  '',
  BACKEND_WORKING_DIRECTORY_NOTE_FOR_FILES,
  '',
  'If a failure is not something a code or test change could fix — the middleware is not running, a network call reached nothing, and the like — report it as environmentIssue instead of failures. Do not expect a fix agent to resolve it; nothing about the code is wrong.',
].join('\n')

/**
 * Build the prompt that refreshes the backend's shared SQLite database (teardown, migrate, reseed) before a finding- or saving-category run.
 *
 * @returns {string} Prompt for the test agent.
 */
const buildRefreshPrompt = () => [
  'No other agent is touching this repository, so you may use it exclusively.',
  'Refresh the database exactly the way test.sh\'s setupStorage does: teardown, migrate, then reseed both master and development data.',
  BACKEND_WORKING_DIRECTORY_NOTE,
].join('\n')

/**
 * Build the prompt that runs every pending finding-category test together, after the database has just been refreshed.
 *
 * @param {Array<string>} files - Finding-category test files pending in the queue.
 * @returns {string} Prompt for the test agent.
 */
const buildRunFindingPrompt = files => [
  'The database was just refreshed. Run these finding-category tests together, bypassing test.sh (call npx jest directly, with the same NODE_OPTIONS/NODE_ENV test.sh\'s own npm script sets, and --maxWorkers=75%):',
  '',
  files.join('\n'),
  '',
  BACKEND_WORKING_DIRECTORY_NOTE_FOR_FILES,
  '',
  'If a failure is not something a code or test change could fix — the middleware is not running, the shared SQLite file is missing or was altered outside this run, and the like — report it as environmentIssue instead of failures. Do not expect a fix agent to resolve it; nothing about the code is wrong.',
].join('\n')

/**
 * Build the prompt that regenerates every `_orders/` folder's `_.test.js`, then refreshes the backend's shared SQLite database (teardown, migrate, reseed) before a saving-category run.
 *
 * @returns {string} Prompt for the test agent.
 */
const buildPrepareSavingPrompt = () => [
  'No other agent is touching this repository, so you may use it exclusively.',
  'For every folder under _orders/, scan its files and rewrite its _.test.js to import every sibling in file-name order — the same "scan and rewrite the whole file" rule as any other aggregation file.',
  'Then refresh the database exactly the way test.sh\'s setupStorage does: teardown, migrate, then reseed both master and development data.',
  BACKEND_WORKING_DIRECTORY_NOTE,
].join('\n')

/**
 * Build the prompt that runs the whole `_orders/` tree together, right after it was just prepared.
 *
 * @returns {string} Prompt for the test agent.
 */
const buildRunSavingPrompt = () => [
  'The database was just refreshed and every _orders/ aggregator was just regenerated. Run the whole _orders/ tree together, bypassing test.sh (call npx jest directly, with the same NODE_OPTIONS/NODE_ENV test.sh\'s own npm script sets, plus --runInBand and --detectOpenHandles — a single process, no worker parallelism, since the shared SQLite file cannot tolerate more than one connection at a time).',
  '',
  BACKEND_WORKING_DIRECTORY_NOTE,
  '',
  'If a failure is not something a code or test change could fix — the middleware is not running, the shared SQLite file is missing or was altered outside this run, and the like — report it as environmentIssue instead of failures. Do not expect a fix agent to resolve it; nothing about the code is wrong.',
].join('\n')

/**
 * Build the prompt that fixes a failing test batch's reported failures.
 *
 * @param {string} category - Which queue this batch came from (`logic` / `finding` / `saving`).
 * @param {Array<string>} files - The file(s) that were run.
 * @param {Array<string>} failures - What the test run reported.
 * @returns {string} Prompt for the test-fix agent.
 */
const buildTestFixPrompt = (category, files, failures) => [
  `These ${category}-category test file(s) failed: ${files.join(' / ')} (they were run from inside the backend repository, so every path here and below is relative to it). Fix every violation below, then stop — do not run the tests yourself, they are checked again afterward.`,
  '',
  failures.join('\n'),
].join('\n')

/**
 * Build the prompt that applies what a repository's just-finished tasks
 * reported needing — dependencies via npm, and conflict-proof changes by
 * editing their shared file directly.
 *
 * @param {string} repository - Repository suffix, as declared in the spec.
 * @param {Array<string>} dependencyLines - Dependencies the tasks reported needing.
 * @param {Array<string>} conflictProofLines - Conflict-proof changes the tasks reported needing.
 * @returns {string} Prompt for the install agent.
 */
const buildInstallPrompt = (repository, dependencyLines, conflictProofLines) => [
  `Apply what ${repository}'s tasks just finished report needing.`,
  'No other agent is touching this repository, so you may use it exclusively.',
  '',
  'Dependencies (run npm install / npm uninstall):',
  dependencyLines.length === 0
    ? '(none reported)'
    : dependencyLines.join('\n'),
  '',
  'Conflict-proof changes (edit the shared file directly, in place):',
  conflictProofLines.length === 0
    ? '(none reported)'
    : conflictProofLines.join('\n'),
  '',
  'Do not commit. /hora commits afterward — package.json and package-lock.json as two separate commits, anything else as its own commit.',
].join('\n')

/**
 * Build the prompt that writes every report into .hora/.
 *
 * @param {*} progress - What runResolved produced.
 * @param {Array<string>} unreadableLines - Task lines the scout could not read.
 * @returns {string} Prompt for hora-recorder.
 */
const buildRecordPrompt = (progress, unreadableLines) => [
  `Version: ${args.version}`,
  '',
  'Below are the reports from the implementer and verifier agents. Fold them into .hora/.',
  '',
  JSON.stringify(
    {
      finished: progress.finished,
      installs: progress.installs,
      lints: progress.lints,
      eslintExceptions: progress.lints.flatMap(one => one.eslintExceptions),
      stuck: progress.stuck,
      unreadable: unreadableLines,
    },
    null,
    2
  ),
].join('\n')

/**
 * Key that decides which tasks must not run at the same time.
 *
 * @param {*} task - Task to key.
 * @returns {string} Shared key for conflicting tasks, or the task's own id.
 */
const readConflictKey = task => (task.conflictKey === null
  ? `solo:${task.id}`
  : `shared:${task.conflictKey}`)

/**
 * Split tasks into chains, one per conflicting file.
 *
 * @param {Array<*>} readyTasks - Tasks ready to implement.
 * @returns {Array<Array<*>>} Chains that may run in parallel.
 */
const buildChains = readyTasks => {
  const keys = [
    ...new Set(
      readyTasks.map(task => readConflictKey(task))
    ),
  ]

  return keys.map(
    key => readyTasks.filter(task => readConflictKey(task) === key)
  )
}

const TEST_RETRY_LIMIT = 3

/**
 * Run a test batch, fixing and retrying up to a limit when it fails.
 *
 * @param {Function} runOnce - Runs the batch. Returns a TEST_RUN_SCHEMA result, or null when the agent died.
 * @param {Function} fixOnce - Given the failures, fixes them. Returns null when the agent died.
 * @param {number} attempt - Which attempt this is (1-based).
 * @returns {Promise<*>} The final result, or null when any agent died. Stops immediately, without ever calling fixOnce, once `environmentIssue` is set — retrying a broken environment does not fix it, and a fix agent would only rewrite code that was never wrong.
 */
const runWithFix = async (runOnce, fixOnce, attempt) => {
  const result = await runOnce()

  if (result === null) {
    return null
  }

  if (result.passed || result.environmentIssue !== null || attempt >= TEST_RETRY_LIMIT) {
    return result
  }

  const fixed = await fixOnce(result.failures)

  return fixed === null
    ? null
    : runWithFix(runOnce, fixOnce, attempt + 1)
}

/**
 * Shared, mutable test-request queues (one per category) and a flag marking whether something is already draining them. Necessary because several chains submit requests concurrently and must share one dispatcher; every other piece of state in this file stays immutable and threaded through recursion instead, but there is no single control path here for that style to thread through.
 */
const testCoordinator = {
  queues: {
    logic: [],
    finding: [],
    saving: [],
  },
  dispatching: false,
}

/**
 * Run every pending logic-category request together, in one Jest invocation.
 *
 * @returns {Promise<void>}
 */
const runLogicBatch = async () => {
  const batch = testCoordinator.queues.logic
  testCoordinator.queues.logic = []

  const files = batch.map(entry => entry.file)

  const result = await runWithFix(
    () => agent(
      buildRunLogicPrompt(files),
      { label: 'test:logic', phase: 'Test', schema: TEST_RUN_SCHEMA }
    ),
    failures => agent(
      buildTestFixPrompt('logic', files, failures),
      { label: 'test:logic:fix', phase: 'Test' }
    ),
    1
  )

  batch.forEach(entry => {
    entry.resolve(result)
  })
}

/**
 * Refresh the database, then run every pending finding-category request together.
 *
 * @returns {Promise<void>}
 */
const runFindingBatch = async () => {
  const batch = testCoordinator.queues.finding
  testCoordinator.queues.finding = []

  const files = batch.map(entry => entry.file)

  const result = await runWithFix(
    async () => {
      const refreshed = await agent(
        buildRefreshPrompt(),
        { label: 'test:refresh', phase: 'Test' }
      )

      return refreshed === null
        ? null
        : agent(
          buildRunFindingPrompt(files),
          { label: 'test:finding', phase: 'Test', schema: TEST_RUN_SCHEMA }
        )
    },
    failures => agent(
      buildTestFixPrompt('finding', files, failures),
      { label: 'test:finding:fix', phase: 'Test' }
    ),
    1
  )

  batch.forEach(entry => {
    entry.resolve(result)
  })
}

/**
 * Regenerate every `_orders/` folder's aggregator, refresh the database, then run every pending saving-category request together in one single-process Jest invocation. Safe to bundle regardless of what table they touch — the assertion discipline (`.claude/agents/hora-implementer.md`) is what makes this safe, not anything computed here.
 *
 * @returns {Promise<void>}
 */
const runSavingBatch = async () => {
  const batch = testCoordinator.queues.saving
  testCoordinator.queues.saving = []

  const files = batch.map(entry => entry.file)

  const result = await runWithFix(
    async () => {
      const prepared = await agent(
        buildPrepareSavingPrompt(),
        { label: 'test:saving:prepare', phase: 'Test' }
      )

      return prepared === null
        ? null
        : agent(
          buildRunSavingPrompt(),
          { label: 'test:saving', phase: 'Test', schema: TEST_RUN_SCHEMA }
        )
    },
    failures => agent(
      buildTestFixPrompt('saving', files, failures),
      { label: 'test:saving:fix', phase: 'Test' }
    ),
    1
  )

  batch.forEach(entry => {
    entry.resolve(result)
  })
}

/**
 * Process the test coordinator's queues until every category is empty, following logic > finding > saving priority and re-checking from the top after every single action (a fresh request may have arrived meanwhile).
 *
 * @returns {Promise<void>} Resolves once every queue is empty.
 */
const dispatchTests = async () => {
  const { queues } = testCoordinator

  const nextBatch = [
    { hasWork: queues.logic.length > 0, run: runLogicBatch },
    { hasWork: queues.finding.length > 0, run: runFindingBatch },
    { hasWork: queues.saving.length > 0, run: runSavingBatch },
  ].find(candidate => candidate.hasWork)

  if (!nextBatch) {
    return
  }

  await nextBatch.run()
  await dispatchTests()
}

/**
 * Submit one test request and resolve once it has actually been run (not merely enqueued). Backend-only: a frontend task reports no test requests, because its tests are run by its own verifier, inside that repository.
 *
 * @param {*} request - One entry from a task's reported `testRequests`.
 * @returns {Promise<*>} The run result for this specific request, or null when the agent that ran it died.
 */
const requestTest = request => new Promise(resolve => {
  const entry = {
    file: request.file,
    resolve,
  }

  testCoordinator.queues[request.category] = [
    ...testCoordinator.queues[request.category],
    entry,
  ]

  if (!testCoordinator.dispatching) {
    testCoordinator.dispatching = true

    dispatchTests()
      .then(() => {
        testCoordinator.dispatching = false
      })
  }
})

/**
 * Implement one task, then verify it.
 *
 * @param {*} task - Task to implement.
 * @returns {Promise<*>} Task with its result and verdict, or null when the agent died.
 */
const implementOne = async task => {
  const result = await agent(
    buildImplementPrompt(task),
    {
      label: `impl:${task.repository}:${task.id}`,
      phase: 'Implement',
      agentType: 'hora-implementer',
      schema: RESULT_SCHEMA,
    }
  )

  if (result === null) {
    return null
  }

  const dispatchable = task.repository === 'backend'
    ? result.testRequests
    : []

  if (dispatchable.length !== result.testRequests.length) {
    log(`${task.repository}:${task.id} reported ${result.testRequests.length} test request(s), which only a backend task may do. Not dispatched — every command of the Test phase runs inside the backend repository`)
  }

  const testResults = await parallel(
    dispatchable.map(
      request => () => requestTest(request)
    )
  )

  const verdict = await agent(
    buildVerifyPrompt(task, result),
    {
      label: `verify:${task.id}`,
      phase: 'Verify',
      agentType: 'hora-verifier',
      schema: VERDICT_SCHEMA,
    }
  )

  return {
    task,
    result,
    verdict,
    testResults,
  }
}

/**
 * Run one chain of conflicting tasks, one after another.
 *
 * @param {{ pending: Array<*>, done: Array<*> }} state - Remaining and finished tasks.
 * @returns {Promise<Array<*>>} Finished tasks of this chain.
 */
const runChain = async state => {
  if (state.pending.length === 0) {
    return state.done
  }

  const finished = await implementOne(state.pending[0])

  return runChain({
    pending: state.pending.slice(1),
    done: [
      ...state.done,
      finished,
    ],
  })
}

/**
 * Group one result field's reported lines this pass's finished tasks left, by repository.
 *
 * @param {Array<*>} finishedThisPass - Finished tasks (with their implementer result).
 * @param {string} field - Which `RESULT_SCHEMA` field to group (`dependencies` or `conflictProof`).
 * @returns {{[repository: string]: Array<string>}} Reported lines, keyed by repository.
 */
const groupReportsByRepository = (finishedThisPass, field) => finishedThisPass.reduce(
  (grouped, one) => (
    one.result[field].length === 0
      ? grouped
      : {
        ...grouped,
        [one.task.repository]: [
          ...(grouped[one.task.repository] ?? []),
          ...one.result[field],
        ],
      }
  ),
  {}
)

/**
 * Group this pass's finished tasks by repository.
 *
 * @param {Array<*>} finishedThisPass - Finished tasks (with their implementer result).
 * @returns {{[repository: string]: Array<*>}} Finished tasks, keyed by repository.
 */
const groupTasksByRepository = finishedThisPass => finishedThisPass.reduce(
  (grouped, one) => ({
    ...grouped,
    [one.task.repository]: [
      ...(grouped[one.task.repository] ?? []),
      one.task,
    ],
  }),
  {}
)

/**
 * Collect every touched file for a repository, across every task finished so far.
 *
 * @param {Array<*>} allFinished - Every finished task so far, past passes included.
 * @param {string} repository - Repository suffix, as declared in the spec.
 * @returns {Array<string>} Deduplicated file paths.
 */
const collectTouchedFiles = (allFinished, repository) => [
  ...new Set(
    allFinished
      .filter(one => one.task.repository === repository)
      .flatMap(one => one.result.touchedFiles)
  ),
]

const LINT_RETRY_LIMIT = 3

/**
 * Key that identifies one lint violation regardless of which attempt reported it.
 *
 * @param {*} violation - One `LINT_VIOLATION_SCHEMA` entry.
 * @returns {string} Identity key (rule, file and line — never the message).
 */
const readViolationKey = violation => `${violation.rule} ${violation.file} ${violation.line}`

/**
 * Whether any violation just reported exactly matches one already seen on an earlier attempt — definitive proof of a loop.
 *
 * @param {Array<*>} seenSoFar - Every violation kept across every earlier attempt.
 * @param {Array<*>} justReported - What the latest lint run reported.
 * @returns {boolean} True once a genuine loop is proven.
 */
const hasRepeatedViolation = (seenSoFar, justReported) => {
  const seenKeys = new Set(seenSoFar.map(violation => readViolationKey(violation)))

  return justReported.some(violation => seenKeys.has(readViolationKey(violation)))
}

/**
 * Merge freshly reported violations into what has been seen so far, deduplicated by identity. Never shrinks — every distinct violation ever reported stays, even across an ad-hoc reset.
 *
 * @param {Array<*>} seenSoFar - Every violation kept across every earlier attempt.
 * @param {Array<*>} justReported - What the latest lint run reported.
 * @returns {Array<*>} Every distinct violation seen so far, fresh ones included.
 */
const distinctViolations = (seenSoFar, justReported) => {
  const seenKeys = new Set(seenSoFar.map(violation => readViolationKey(violation)))
  const fresh = justReported.filter(violation => !seenKeys.has(readViolationKey(violation)))

  return [
    ...seenSoFar,
    ...fresh,
  ]
}

/**
 * Lint one repository's changed files so far, fixing and retrying up to a
 * limit when it fails. A genuine contradiction — the same (rule, file, line)
 * violation reported again, or the retry limit reached without one — is
 * resolved by disabling exactly one rule for exactly one file ad hoc (see
 * `buildResolveLintContradictionPrompt`), then continuing with the retry
 * count reset. This never gives up and returns `passed: false`.
 *
 * @param {{ repository: string, files: Array<string>, attempt: number, seenSoFar: Array<*>, exceptionsSoFar: Array<*> }} state - Repository, its touched files, which attempt this is since the last reset (1-based), every distinct violation reported so far, and every ad-hoc override already applied.
 * @returns {Promise<*>} The lint result tagged with its repository and any ad-hoc overrides applied, or null when an agent died.
 */
const lintOne = async state => {
  const { repository, files, attempt, seenSoFar, exceptionsSoFar } = state

  const result = await agent(
    buildLintPrompt(repository, files),
    {
      label: `lint:${repository}:${attempt}`,
      phase: 'Lint',
      schema: LINT_SCHEMA,
    }
  )

  if (result === null) {
    return null
  }

  if (result.passed) {
    return { repository, passed: true, failures: [], eslintExceptions: exceptionsSoFar }
  }

  const allSeen = distinctViolations(seenSoFar, result.failures)
  const stuck = hasRepeatedViolation(seenSoFar, result.failures) || attempt >= LINT_RETRY_LIMIT

  const resolution = stuck
    ? await agent(
      buildResolveLintContradictionPrompt(repository, allSeen),
      {
        label: `lint-contradiction:${repository}`,
        phase: 'Lint',
        schema: ADHOC_RESOLUTION_SCHEMA,
      }
    )
    : await agent(
      buildLintFixPrompt(repository, result.failures),
      {
        label: `lint-fix:${repository}:${attempt}`,
        phase: 'Lint',
      }
    )

  if (resolution === null || (stuck && !resolution.applied)) {
    return null
  }

  return stuck
    ? lintOne({
      repository,
      files,
      attempt: 1,
      seenSoFar: allSeen,
      exceptionsSoFar: [
        ...exceptionsSoFar,
        { rule: resolution.rule, file: resolution.file, branch: resolution.branch },
      ],
    })
    : lintOne({ repository, files, attempt: attempt + 1, seenSoFar: allSeen, exceptionsSoFar })
}

/**
 * Install one repository's reported dependencies and conflict-proof changes,
 * tagged with which repository it was.
 *
 * @param {string} repository - Repository suffix, as declared in the spec.
 * @param {Array<string>} dependencyLines - Dependencies the tasks reported needing.
 * @param {Array<string>} conflictProofLines - Conflict-proof changes the tasks reported needing.
 * @returns {Promise<*>} The install result tagged with its repository, or null when the agent died.
 */
const installOne = async (repository, dependencyLines, conflictProofLines) => {
  const result = await agent(
    buildInstallPrompt(repository, dependencyLines, conflictProofLines),
    {
      label: `install:${repository}`,
      phase: 'Install',
      schema: INSTALL_SCHEMA,
    }
  )

  return result === null
    ? null
    : { repository, ...result }
}

/**
 * Implement every task whose dependencies are already satisfied, then repeat.
 *
 * @param {{ pending: Array<*>, finished: Array<*>, installs: Array<*>, lints: Array<*>, resolvedIds: Array<string> }} state - Progress so far.
 * @returns {Promise<{ finished: Array<*>, installs: Array<*>, lints: Array<*>, stuck: Array<*> }>} Outcome.
 */
const runResolved = async state => {
  const ready = state.pending.filter(
    task => task.depends.every(id => state.resolvedIds.includes(id))
  )

  if (ready.length === 0) {
    return {
      finished: state.finished,
      installs: state.installs,
      lints: state.lints,
      stuck: state.pending,
    }
  }

  const chains = buildChains(ready)

  log(`Implementing ${ready.length} task(s) (${chains.length} in parallel / ${state.pending.length - ready.length} waiting)`)

  const chained = await parallel(
    chains.map(
      chain => () => runChain({ pending: chain, done: [] })
    )
  )

  const finishedThisPass = chained
    .flat()
    .filter(one => one !== null)

  const dependenciesByRepository = groupReportsByRepository(finishedThisPass, 'dependencies')
  const conflictProofByRepository = groupReportsByRepository(finishedThisPass, 'conflictProof')

  const repositoriesToInstall = [
    ...new Set([
      ...Object.keys(dependenciesByRepository),
      ...Object.keys(conflictProofByRepository),
    ]),
  ]

  const installs = await parallel(
    repositoriesToInstall.map(
      repository => () => installOne(
        repository,
        dependenciesByRepository[repository] ?? [],
        conflictProofByRepository[repository] ?? []
      )
    )
  )

  const tasksByRepository = groupTasksByRepository(finishedThisPass)
  const repositoriesToLint = Object.keys(tasksByRepository)
  const allFinishedSoFar = [
    ...state.finished,
    ...finishedThisPass,
  ]

  const lints = await parallel(
    repositoriesToLint.map(
      repository => () => lintOne({
        repository,
        files: collectTouchedFiles(allFinishedSoFar, repository),
        attempt: 1,
        seenSoFar: [],
        exceptionsSoFar: [],
      })
    )
  )

  const passedRepositories = new Set(
    lints
      .filter(one => one !== null)
      .filter(one => one.passed)
      .map(one => one.repository)
  )

  return runResolved({
    pending: state.pending.filter(task => !ready.includes(task)),
    finished: [
      ...state.finished,
      ...finishedThisPass,
    ],
    installs: [
      ...state.installs,
      ...installs.filter(one => one !== null),
    ],
    lints: [
      ...state.lints,
      ...lints.filter(one => one !== null),
    ],
    resolvedIds: [
      ...state.resolvedIds,
      ...finishedThisPass
        .filter(one => passedRepositories.has(one.task.repository))
        .filter(one => one.testResults.every(testResult => testResult !== null && testResult.passed))
        .map(one => one.task.id),
    ],
  })
}

if (typeof args?.version !== 'string' || !Array.isArray(args?.repositories)) {
  throw new Error('args needs { version, repositories }. repositories are the rows from the spec\'s repository layout')
}

phase('Scout')

const scouted = await parallel(
  args.repositories.map(
    repository => () => agent(
      buildScoutPrompt(repository),
      {
        label: `scout:${repository}`,
        phase: 'Scout',
        agentType: 'hora-scout',
        schema: TASK_LIST_SCHEMA,
        effort: 'low',
      }
    )
  )
)

const scanned = scouted.filter(one => one !== null)

const unreadable = scanned.flatMap(one => one.unreadable)

if (unreadable.length > 0) {
  log(`${unreadable.length} line(s) could not be read. Included in the report`)
}

const tasks = scanned.flatMap(one => one.tasks)

if (tasks.length === 0) {
  log('No unfinished tasks')
}

const outcome = tasks.length === 0
  ? { finished: [], installs: [], lints: [], stuck: [] }
  : await runResolved({
    pending: tasks,
    finished: [],
    installs: [],
    lints: [],
    resolvedIds: Array.isArray(args.resolvedIds)
      ? args.resolvedIds
      : [],
  })

if (outcome.stuck.length > 0) {
  log(`${outcome.stuck.length} task(s) left with unresolved dependencies. Either a cycle or a reference to a nonexistent id`)
}

phase('Record')

await agent(
  buildRecordPrompt(outcome, unreadable),
  {
    label: 'record',
    phase: 'Record',
    agentType: 'hora-recorder',
  }
)

log('Handed off to hora-recorder to fold into .hora/. /hora itself makes the commit')
