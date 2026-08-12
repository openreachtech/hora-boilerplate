#!/bin/bash

# Copy every skill shipped by @openreachtech/ai-agent-skills into this
# repository's .claude/skills/, so they become directly invocable here.
#
# Why: skill discovery only looks at the session's own .claude/skills/, and
# a package's skills live under node_modules/, never under that path.
# Without this step, everything ai-agent-skills ships stays invisible for
# the rest of the session.
#
# ai-agent-skills already ships its skills flattened under dist/skills/ (one
# directory per skill, named after the `name:` the skill declares, unique
# across the package), so this script clones them as-is. No renaming, no
# rewriting.
#
# Run this from the repository root (myproject-app). It does not depend on
# any declared repository being cloned — like @openreachtech/hora-ecosystem,
# ai-agent-skills comes from this repository's own devDependencies, so it is
# ready as soon as this repository's own `npm install` has run. Safe to
# re-run: it synchronizes rather than overlays — every package-equipped
# directory is removed first (below), then copied fresh, so a skill the
# package renamed or dropped does not linger as a live match candidate.
#
# Usage: .claude/skills/hora-setup/scripts/equip-skills.sh
#
# Note on names: a skill lands under the name it declares in its own
# frontmatter — hb- for backend, hf- for frontend, hc- for either. Those
# prefixes have already changed twice, so .gitignore and eslint.config.js do
# not match on them: they ignore this whole directory and name this
# repository's own skills back in, which no renaming can invalidate.

set -euo pipefail

SOURCE_ROOT='node_modules/@openreachtech/ai-agent-skills/dist/skills'
DEST_ROOT='.claude/skills'

# Without this check, an unmatched glob below would loop once over the
# literal '*', mkdir a directory named '*' under .claude/skills/, and die
# on the cp with a message that names a glob instead of the real cause.
if [ ! -d "$SOURCE_ROOT" ]; then
  echo "error: $SOURCE_ROOT not found." >&2
  echo "Run this from the repository root (myproject-app), after its own \`npm install\` has run." >&2
  exit 1
fi

# Remove what an earlier equip left behind, before copying. cp alone only
# overwrites: a skill the package renamed or dropped would stay equipped
# forever — and, since matching reads every description under
# .claude/skills/, stay a live candidate. Which directories are the
# package's is not decided by name (the prefixes have changed before):
# a directory here is package-equipped exactly when .gitignore ignores it,
# and this repository's own skills are named back in there — so git is the
# one authority this check cannot drift from.
for equipped_dir in "$DEST_ROOT"/*/; do
  [ -d "$equipped_dir" ] || continue

  if git check-ignore --quiet "$equipped_dir"; then
    rm -rf "$equipped_dir"
    echo "removed stale: $(basename "$equipped_dir")"
  fi
done

for skill_dir in "$SOURCE_ROOT"/*/; do
  [ -d "$skill_dir" ] || continue

  skill_name=$(basename "$skill_dir")
  dest_dir="$DEST_ROOT/$skill_name"

  mkdir -p "$dest_dir"
  cp -R "$skill_dir." "$dest_dir/"

  echo "equipped: $skill_name"
done
