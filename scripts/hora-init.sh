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
#   @openreachtech/hora-addon-*     every add-on installed. None is required
#
# Every package but the first names its command after itself. One that does not stops the
# run rather than being passed over, because a package left unequipped fails silently.
#
# Add-ons go in two passes: every package's skills first, then every add-on's wings (with its
# definition). A wing may extend a skill another add-on installs, so it waits until every
# skill is in place. Only an add-on's installer takes `--only`; the skills libraries install
# skills alone.
#
# Run in the boilerplate itself, it equips nothing. That is told by the name of the directory,
# which is the one thing a repository made from the boilerplate never has: it is named for its
# project. The directory to judge is the first argument and defaults to the working directory;
# everything else here still works from the working directory.
#
#   sh scripts/hora-init.sh [<directory>]

set -eu

directory=${1:-$PWD}

if [ "$(basename "$directory")" = hora-boilerplate ]; then
  echo "hora-init: skipped, $directory is the boilerplate itself" >&2
  exit 0
fi

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

for dir in "$scope"/hora-addon-*; do
  [ -d "$dir" ] || continue
  name=${dir##*/}
  require_command "$name"
  "$name" install --only skills
done

for dir in "$scope"/hora-addon-*; do
  [ -d "$dir" ] || continue
  "${dir##*/}" install --only wings
done

node kit/scripts/equip-own-skills.mjs
