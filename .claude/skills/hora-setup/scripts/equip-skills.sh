#!/bin/bash

# Copy a conventions package's skills into this repository's .claude/skills/,
# so they become directly invocable here.
#
# Why: skill discovery only looks at the session's own .claude/skills/. A
# package's skills live wherever that package was installed, which is never
# that path — so without this step, everything it ships stays invisible.
#
# This script does not know how the package is distributed. /hora-setup
# resolves the directory holding the skills — from a dependency tree, a
# submodule, a cloned repository, a plain path — and passes it in.
#
# Safe to re-run: it synchronizes rather than overlays. Every previously
# equipped directory is removed first, then the source is copied fresh, so a
# skill the package renamed or dropped does not linger as a live match
# candidate.
#
# Usage: .claude/skills/hora-setup/scripts/equip-skills.sh <source directory>
#
# The source directory holds one subdirectory per skill, each named by the
# `name:` that skill declares. Names are copied as-is: this repository never
# matches a package's skill by name, so the naming scheme is the package's
# own business.

set -euo pipefail

SOURCE_ROOT="${1:-}"
DEST_ROOT='.claude/skills'

if [ -z "$SOURCE_ROOT" ]; then
  echo "usage: $0 <directory holding the conventions package's skills>" >&2
  exit 1
fi

# Without this check, an unmatched glob below would loop once over the
# literal '*', mkdir a directory named '*', and die on the copy with a
# message naming a glob instead of the real cause.
if [ ! -d "$SOURCE_ROOT" ]; then
  echo "error: $SOURCE_ROOT not found." >&2
  echo "Run this from the hora repository's root, with the conventions package already fetched." >&2
  exit 1
fi

# Remove what an earlier equip left behind, before copying. Copying alone
# only overwrites, so a renamed or dropped skill would stay equipped forever
# — and, since matching reads every description under .claude/skills/, stay a
# live candidate.
#
# Which directories are the package's is decided by git, not by name: a
# directory here is package-equipped exactly when .gitignore ignores it, and
# this repository's own skills are named back in there. A naming scheme the
# package changes cannot invalidate that.
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
