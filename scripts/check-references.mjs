/**
 * Reference-existence check for levers.md.
 *
 * levers.md defines its own maintenance rule: a row whose file or section no
 * longer exists is a defect in the table. This script is that rule's
 * detector. It reads the "Owned by" column of every lever table, resolves
 * each backtick path against levers.md's own directory, and searches each
 * quoted section title in the resolved file as a literal substring — the
 * same search the table's section titles are written out for.
 *
 * Usage: `node scripts/check-references.mjs` — exits non-zero when any cited
 * file is missing or any cited section title no longer appears in its file.
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const LEVERS_PATH = '.claude/skills/hora/references/levers.md'

/**
 * Split a markdown table row into trimmed cells, honoring escaped pipes.
 *
 * @param {string} line - A table row starting with `|`.
 * @returns {Array<string>} Trimmed cell contents.
 */
function splitTableRow (line) {
  return line
    .replace(/^\|/u, '')
    .replace(/\|$/u, '')
    .split(/(?<!\\)\|/u)
    .map(cell => cell.trim())
}

/**
 * Tell whether a trimmed line is the header row of a lever table.
 *
 * @param {string} line - A trimmed line.
 * @returns {boolean} True on `| Lever | Owned by |`.
 */
function isLeverHeaderRow (line) {
  const cells = splitTableRow(line)

  return cells.length === 2
    && cells[0] === 'Lever'
    && cells[1] === 'Owned by'
}

/**
 * Tell whether the row at an index sits inside a lever table, by walking up
 * through contiguous table rows to the block's header.
 *
 * @param {object} params - Parameters.
 * @param {Array<string>} params.lines - The file's lines.
 * @param {number} params.index - The 0-indexed row to test.
 * @returns {boolean} True when the block above starts with a lever header.
 */
function isInLeverTable ({
  lines,
  index,
}) {
  const previous = lines[index - 1]?.trim() ?? ''

  if (!previous.startsWith('|')) {
    return false
  }

  if (isLeverHeaderRow(previous)) {
    return true
  }

  return isInLeverTable({
    lines,
    index: index - 1,
  })
}

/**
 * Collect the "Owned by" cell of every data row in every lever table.
 *
 * A lever table is recognized by its header row reading exactly
 * `| Lever | Owned by |`; other tables in the file (the homes, the
 * not-a-home list) carry different headers and are skipped.
 *
 * @param {Array<string>} lines - The file's lines.
 * @returns {Array<{
 *   lineNumber: number,
 *   cell: string,
 * }>} One entry per lever row, with its 1-indexed line number.
 */
function collectOwnedByCells (lines) {
  return lines
    .map((line, index) => ({
      line: line.trim(),
      index,
    }))
    .filter(({ line }) => line.startsWith('|'))
    .filter(({ line }) => !/^[-\s|]+$/u.test(line))
    .filter(({ line }) => !isLeverHeaderRow(line))
    .filter(({ index }) => isInLeverTable({
      lines,
      index,
    }))
    .map(({ line, index }) => ({
      lineNumber: index + 1,
      cell: splitTableRow(line)
        .at(-1) ?? '',
    }))
}

/**
 * Fold one token of an "Owned by" cell into the citations collected so far.
 *
 * A backtick span ending in `.md` opens a citation; a quoted string is a
 * section title of the citation most recently opened. Escaped quotes inside
 * a title are unescaped, so the title matches the target file's raw text.
 *
 * @param {object} params - Parameters.
 * @param {Array<{
 *   filePath: string,
 *   titles: Array<string>,
 * }>} params.citations - The citations collected so far.
 * @param {string} params.token - The token to fold in.
 * @returns {Array<{
 *   filePath: string,
 *   titles: Array<string>,
 * }>} The citations after the token.
 */
function foldCitationToken ({
  citations,
  token,
}) {
  if (token.startsWith('`') && token.slice(1, -1)
    .endsWith('.md')) {
    return citations.concat({
      filePath: token.slice(1, -1),
      titles: [],
    })
  }

  if (token.startsWith('`')) {
    return citations
  }

  const lastCitation = citations.at(-1)

  if (lastCitation) {
    lastCitation.titles.push(
      token
        .slice(1, -1)
        .replaceAll('\\"', '"')
    )
  }

  return citations
}

/**
 * Extract the citations from one "Owned by" cell.
 *
 * The cell is scanned left to right for quoted strings (escapes honored, so
 * a title may contain nested quotes and backticks) and backtick spans, and
 * the token sequence is folded into citations.
 *
 * @param {string} cell - The cell's text.
 * @returns {Array<{
 *   filePath: string,
 *   titles: Array<string>,
 * }>} One entry per backtick path, in order of appearance.
 */
function extractCitations (cell) {
  return [...cell.matchAll(/"(?:\\.|[^"\\])*"|`[^`]*`/gu)]
    .map(match => match[0])
    .reduce(
      (citations, token) => foldCitationToken({
        citations,
        token,
      }),
      []
    )
}

/**
 * Verify one citation against the filesystem.
 *
 * @param {object} params - Parameters.
 * @param {string} params.baseDir - The directory citations resolve against.
 * @param {Map<string, string>} params.contentCache - Read files, by path.
 * @param {{
 *   lineNumber: number,
 *   filePath: string,
 *   titles: Array<string>,
 * }} params.citation - The citation to verify.
 * @returns {Array<string>} Failure messages, empty when the citation holds.
 */
function verifyCitation ({
  baseDir,
  contentCache,
  citation,
}) {
  const resolvedPath = path.resolve(baseDir, citation.filePath)

  if (!fs.existsSync(resolvedPath)) {
    return [`${LEVERS_PATH}:${citation.lineNumber}: file not found: ${citation.filePath}`]
  }

  if (!contentCache.has(resolvedPath)) {
    contentCache.set(
      resolvedPath,
      fs.readFileSync(resolvedPath, 'utf8')
    )
  }

  const content = contentCache.get(resolvedPath)

  return citation.titles
    .filter(title => !content.includes(title))
    .map(title => `${LEVERS_PATH}:${citation.lineNumber}: section "${title}" not found in ${citation.filePath}`)
}

/**
 * Run the check and report.
 *
 * @returns {number} The number of failures found.
 */
function main () {
  const leversFullPath = path.resolve(LEVERS_PATH)
  const lines = fs.readFileSync(leversFullPath, 'utf8')
    .split('\n')

  const contentCache = new Map()

  const citations = collectOwnedByCells(lines)
    .flatMap(({ lineNumber, cell }) =>
      extractCitations(cell)
        .map(citation => ({
          lineNumber,
          ...citation,
        }))
    )

  const failures = citations.flatMap(citation =>
    verifyCitation({
      baseDir: path.dirname(leversFullPath),
      contentCache,
      citation,
    })
  )

  failures.forEach(failure => {
    process.stderr.write(`${failure}\n`)
  })

  const titleCount = citations.reduce(
    (sum, { titles }) => sum + titles.length,
    0
  )

  process.stdout.write(`checked ${citations.length} citations (${titleCount} section titles), ${failures.length} failure(s)\n`)

  return failures.length
}

process.exitCode = main() === 0
  ? 0
  : 1
