/**
 * ja/en pair check for docs/.
 *
 * Every document under docs/ ships as an en/ja pair edited in the same
 * commit. This script mechanizes the two halves of that rule a machine can
 * see. First, the same-change check: when a git diff base is resolvable, a
 * change to one side of a pair without the other fails, and a new document
 * arriving without its twin fails — while a document that was already
 * unpaired before the diff only warns, so a legacy unpaired file does not
 * fail every run until somebody touches it. Second, heading parity: for
 * every pair on disk, the ordered sequence of heading levels (code fences
 * excluded) must match.
 *
 * The check reads structure, not meaning: a body edit that changes one
 * language's sense while both files are touched is review's job, not this
 * script's.
 *
 * Repairing a divergence touches one side by design — the wrong half is
 * brought to the right one, and the right one has nothing to edit. That is
 * mechanically indistinguishable from forgetting the twin, so it is declared
 * rather than detected: a `Pair-exception: <path> — <reason>` trailer in any
 * commit message in the range turns that path's failure into a warning that
 * names the reason. The exception is loud by construction, and it expires
 * with the range that carried it.
 *
 * Usage: `node scripts/check-docs-pairs.mjs [--base <git ref>]` — the diff
 * base defaults to `origin/$GITHUB_BASE_REF` on CI and `origin/main`
 * elsewhere. When no merge base is resolvable, the same-change check is
 * skipped with a warning and heading parity still runs.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const DOCS_DIR = 'docs'

/**
 * Resolve the twin path of a document.
 *
 * @param {string} filePath - A path like `docs/name.md` or `docs/name.ja.md`.
 * @returns {string} The other language's path.
 */
function twinOf (filePath) {
  return filePath.endsWith('.ja.md')
    ? `${filePath.slice(0, -'.ja.md'.length)}.md`
    : `${filePath.slice(0, -'.md'.length)}.ja.md`
}

/**
 * Run a git command and return its trimmed stdout, or null on failure.
 *
 * @param {Array<string>} args - Arguments passed to git.
 * @returns {string | null} Trimmed stdout, or null when git exited non-zero.
 */
function git (args) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: [
        'ignore',
        'pipe',
        'ignore',
      ],
    })
      .trim()
  } catch {
    return null
  }
}

/**
 * Resolve the ref the same-change check diffs against.
 *
 * @returns {string} A git ref.
 */
function resolveBaseRef () {
  const baseArgIndex = process.argv.indexOf('--base')

  if (baseArgIndex !== -1) {
    return process.argv[baseArgIndex + 1]
  }

  if (process.env.GITHUB_BASE_REF) {
    return `origin/${process.env.GITHUB_BASE_REF}`
  }

  return 'origin/main'
}

/**
 * Fold one line into the heading-extraction state.
 *
 * @param {object} params - Parameters.
 * @param {{
 *   headings: Array<object>,
 *   inFence: boolean,
 * }} params.state - The state so far.
 * @param {string} params.line - The line to fold in.
 * @param {number} params.lineNumber - Its 1-indexed line number.
 * @returns {object} The state after the line.
 */
function foldHeadingLine ({
  state,
  line,
  lineNumber,
}) {
  if (/^\s*(?:```|~~~)/u.test(line)) {
    return {
      headings: state.headings,
      inFence: !state.inFence,
    }
  }

  if (state.inFence) {
    return state
  }

  const match = line.match(/^(?<marks>#{1,6})\s+(?<text>.*)$/u)

  if (!match) {
    return state
  }

  return {
    headings: state.headings.concat({
      level: match.groups.marks.length,
      text: match.groups.text.trim(),
      lineNumber,
    }),
    inFence: false,
  }
}

/**
 * Extract the headings of a markdown file, code fences excluded.
 *
 * @param {string} filePath - The file to read.
 * @returns {Array<{
 *   level: number,
 *   text: string,
 *   lineNumber: number,
 * }>} The headings in document order.
 */
function extractHeadings (filePath) {
  return fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .reduce(
      (state, line, index) => foldHeadingLine({
        state,
        line,
        lineNumber: index + 1,
      }),
      {
        headings: [],
        inFence: false,
      }
    )
    .headings
}

/**
 * Collect the declared pair exceptions in a commit range.
 *
 * A `Pair-exception: <path> — <reason>` trailer in any commit message in the
 * range declares that this path was changed on one side deliberately.
 *
 * @param {object} params - Parameters.
 * @param {string} params.mergeBase - The commit hash diffed against.
 * @returns {Map<string, string>} Reasons, by declared path.
 */
function collectPairExceptions ({
  mergeBase,
}) {
  const messages = git([
    'log',
    '--format=%B',
    `${mergeBase}..HEAD`,
  ]) ?? ''

  return new Map(
    [...messages.matchAll(/^Pair-exception:\s*(?<filePath>\S+)\s*(?:[-—–:]\s*(?<reason>.*))?$/gmu)]
      .map(match => {
        const reason = match.groups.reason
          ?.trim() ?? ''

        return [
          match.groups.filePath,
          reason === ''
            ? 'no reason given'
            : reason,
        ]
      })
  )
}

/**
 * Classify one changed document for the same-change check.
 *
 * @param {object} params - Parameters.
 * @param {Array<string>} params.changedDocs - Every changed doc path.
 * @param {string} params.filePath - The changed doc to classify.
 * @param {string} params.mergeBase - The commit hash diffed against.
 * @param {Map<string, string>} params.exceptions - Declared exceptions.
 * @returns {{
 *   kind: string,
 *   message: string,
 * } | null} A finding, or null when the pair was changed together.
 */
function classifyChangedDoc ({
  changedDocs,
  filePath,
  mergeBase,
  exceptions,
}) {
  const twinPath = twinOf(filePath)

  if (changedDocs.includes(twinPath)) {
    return null
  }

  if (exceptions.has(filePath)) {
    return {
      kind: 'warning',
      message: `${filePath} changed without its twin ${twinPath}, declared: ${exceptions.get(filePath)}`,
    }
  }

  if (fs.existsSync(twinPath)) {
    return {
      kind: 'failure',
      message: `${filePath} changed without its twin ${twinPath} (declare a Pair-exception trailer if this repairs a divergence)`,
    }
  }

  if (git(['cat-file', '-e', `${mergeBase}:${filePath}`]) !== null) {
    return {
      kind: 'warning',
      message: `${filePath} is unpaired (predates this diff); its twin ${twinPath} is still owed`,
    }
  }

  return {
    kind: 'failure',
    message: `${filePath} is new and has no twin ${twinPath}`,
  }
}

/**
 * Run the same-change check against a merge base.
 *
 * @param {object} params - Parameters.
 * @param {string} params.mergeBase - The commit hash to diff against.
 * @returns {Array<{
 *   kind: string,
 *   message: string,
 * }>} The findings.
 */
function collectSameChangeFindings ({
  mergeBase,
}) {
  const changedDocs = (git(['diff', '--name-only', mergeBase]) ?? '')
    .split('\n')
    .filter(filePath => /^docs\/.+\.md$/u.test(filePath))

  const exceptions = collectPairExceptions({
    mergeBase,
  })

  return changedDocs
    .map(filePath => classifyChangedDoc({
      changedDocs,
      filePath,
      mergeBase,
      exceptions,
    }))
    .filter(finding => finding !== null)
}

/**
 * Compare one pair's heading sequences.
 *
 * @param {object} params - Parameters.
 * @param {string} params.enPath - The English file.
 * @param {string} params.jaPath - The Japanese file.
 * @returns {{
 *   kind: string,
 *   message: string,
 * } | null} A finding, or null when the sequences match.
 */
function comparePair ({
  enPath,
  jaPath,
}) {
  const enHeadings = extractHeadings(enPath)
  const jaHeadings = extractHeadings(jaPath)

  if (enHeadings.length !== jaHeadings.length) {
    return {
      kind: 'failure',
      message: `${enPath} has ${enHeadings.length} headings, ${jaPath} has ${jaHeadings.length}`,
    }
  }

  const mismatchIndex = enHeadings.findIndex(
    (heading, index) => heading.level !== jaHeadings[index].level
  )

  if (mismatchIndex === -1) {
    return null
  }

  const enHeading = enHeadings[mismatchIndex]
  const jaHeading = jaHeadings[mismatchIndex]

  return {
    kind: 'failure',
    message: `${enPath}:${enHeading.lineNumber} (h${enHeading.level} "${enHeading.text}") does not match ${jaPath}:${jaHeading.lineNumber} (h${jaHeading.level} "${jaHeading.text}")`,
  }
}

/**
 * Run the heading-parity check over every complete pair on disk.
 *
 * @returns {{
 *   findings: Array<{
 *     kind: string,
 *     message: string,
 *   }>,
 *   pairCount: number,
 * }} The findings, and how many pairs were compared.
 */
function collectParityFindings () {
  const docFiles = fs.readdirSync(DOCS_DIR, {
    recursive: true,
  })
    .filter(name => name.endsWith('.md'))
    .map(name => path.join(DOCS_DIR, name))

  const unpairedFindings = docFiles
    .filter(filePath => !fs.existsSync(twinOf(filePath)))
    .map(filePath => ({
      kind: 'warning',
      message: `${filePath} has no twin on disk`,
    }))

  const pairedEnFiles = docFiles
    .filter(filePath => !filePath.endsWith('.ja.md'))
    .filter(enPath => fs.existsSync(twinOf(enPath)))

  const parityFindings = pairedEnFiles
    .map(enPath => comparePair({
      enPath,
      jaPath: twinOf(enPath),
    }))
    .filter(finding => finding !== null)

  return {
    findings: [
      ...unpairedFindings,
      ...parityFindings,
    ],
    pairCount: pairedEnFiles.length,
  }
}

/**
 * Run both checks and report.
 *
 * @returns {number} The number of failures found.
 */
function main () {
  const mergeBase = git([
    'merge-base',
    resolveBaseRef(),
    'HEAD',
  ])

  const sameChangeFindings = mergeBase === null
    ? [{
      kind: 'warning',
      message: 'no merge base resolvable; same-change check skipped',
    }]
    : collectSameChangeFindings({ mergeBase })

  const {
    findings: parityFindings,
    pairCount,
  } = collectParityFindings()

  const findings = [
    ...sameChangeFindings,
    ...parityFindings,
  ]

  const warnings = findings.filter(finding => finding.kind === 'warning')
  const failures = findings.filter(finding => finding.kind === 'failure')

  warnings.forEach(warning => {
    process.stderr.write(`warning: ${warning.message}\n`)
  })

  failures.forEach(failure => {
    process.stderr.write(`${failure.message}\n`)
  })

  process.stdout.write(`checked ${pairCount} pair(s), ${failures.length} failure(s), ${warnings.length} warning(s)\n`)

  return failures.length
}

process.exitCode = main() === 0
  ? 0
  : 1
