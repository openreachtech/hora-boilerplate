#!/bin/sh
#
# Equip every Hora Kit package installed here into .claude/, then this repository's own skill.
#
# Run by `npm run hora:init`, which `postinstall` calls, so npm puts node_modules/.bin on PATH
# and the working directory is the repository root.
#
# Packages are found by name rather than listed, so a package added to devDependencies is
# equipped by the next `npm install` with nothing here to edit:
#
#   @openreachtech/hora             always, and first. Its command is `hora-core`
#   @openreachtech/hora-skills-*    every skills library installed
#
# Every package but the first names its command after itself. One that does not stops the
# run rather than being passed over, because a package left unequipped fails silently.

set -eu

scope=node_modules/@openreachtech

require_command () {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "hora-init: $1 is installed but provides no command named $1" >&2
    exit 1
  fi
}

hora-core install

for dir in "$scope"/hora-skills-*; do
  [ -d "$dir" ] || continue
  name=${dir##*/}
  require_command "$name"
  "$name" install
done

node kit/scripts/equip-own-skills.mjs
