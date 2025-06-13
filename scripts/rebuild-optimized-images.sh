#!/bin/bash
# Rebuild omtimized image list.
# See https://github.com/dcycle/thumbor-example

set -e

git clone https://github.com/dcycle/thumbor-example.git

# mv media folder to thumbor-example
mv docs/media thumbor-example/my-media

cd thumbor-example

# Generate image mapping for media folder
./scripts/generate-image-map.sh \
  ./app/my-media \
  beta.terredesjeunes.org/media \
  x800,604x400,604x200,800x,200x,800x800,604x,1100x \
  ./app/unversioned/mapping-beta-tdj-comm.json
