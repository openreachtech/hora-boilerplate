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
# directory per skill, name unique, no frontmatter left to strip), so this
# script clones them as-is. No renaming, no rewriting.
#
# Run this from the repository root (myproject-app). It does not depend on
# any declared repository being cloned — like @openreachtech/hora-ecosystem,
# ai-agent-skills comes from this repository's own devDependencies, so it is
# ready as soon as this repository's own `npm install` has run. Safe to
# re-run: each destination is a straight copy of its source, so re-running
# just overwrites it with whatever the package currently holds.
#
# Usage: .claude/skills/hora-setup/scripts/equip-skills.sh
#
# Note on names: each skill keeps the directory name the package ships, which
# carries a content hash (backend-renchan-stub-api-1c0186b5eae9). The hash
# changes when the package is updated, so anything referring to one of these
# skills must match it by its prefix, never by its full name.

set -euo pipefail

SOURCE_ROOT='node_modules/@openreachtech/ai-agent-skills/dist/skills'
DEST_ROOT='.claude/skills'

for skill_dir in "$SOURCE_ROOT"/*/; do
  skill_name=$(basename "$skill_dir")
  dest_dir="$DEST_ROOT/$skill_name"

  mkdir -p "$dest_dir"
  cp -R "$skill_dir." "$dest_dir/"

  echo "equipped: $skill_name"
done
