/**
 * Equip the skills this repository authors itself.
 *
 * The packages equip theirs from `node_modules/`, and this places the ones written
 * here — `kit/skills/<name>/` copied to `.claude/skills/<name>/`, name for name. It runs
 * last in `hora:init`, after every package has installed, so a skill this repository
 * authors wins over a package's skill of the same name. That is what carries a skill
 * through the release where the package it used to ship in stops shipping it.
 *
 * The destination is emptied before the copy, the way a package's own install does it:
 * a file dropped from the source would otherwise stay behind in an installation that
 * reports success, and nothing would say so.
 *
 * `.claude/` is generated, never authored — `kit/skills/` is where the source lives, and
 * the copy is gitignored along with everything else the hook places.
 *
 * Usage: `node kit/scripts/equip-own-skills.mjs`
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const SOURCE_DIR = path.join('kit', 'skills')
const TARGET_DIR = path.join('.claude', 'skills')

/**
 * Collect the name of every skill this repository authors.
 *
 * @returns {Array<string>} Directory names under `kit/skills/`, empty when there are none.
 */
function collectSkillNames () {
  if (!fs.existsSync(SOURCE_DIR)) {
    return []
  }

  return fs.readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .toSorted()
}

/**
 * Place one skill, replacing whatever stands at its destination.
 *
 * @param {{
 *   skillName: string
 * }} params - Parameters.
 * @returns {void}
 */
function equipSkill ({
  skillName,
}) {
  const source = path.join(SOURCE_DIR, skillName)
  const target = path.join(TARGET_DIR, skillName)

  fs.rmSync(target, {
    recursive: true,
    force: true,
  })

  fs.cpSync(source, target, {
    recursive: true,
  })
}

/**
 * Place every skill this repository authors.
 *
 * @returns {number} Number of skills placed.
 */
function main () {
  const skillNames = collectSkillNames()

  if (skillNames.length === 0) {
    process.stdout.write('no skill of this repository to equip\n')

    return 0
  }

  fs.mkdirSync(TARGET_DIR, {
    recursive: true,
  })

  skillNames.forEach(skillName => {
    equipSkill({
      skillName,
    })
  })

  process.stdout.write(`equipped ${skillNames.length} skill(s) of this repository: ${skillNames.join(', ')}\n`)

  return skillNames.length
}

main()
