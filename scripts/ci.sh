#!/bin/bash
# Runs the CI pipeline for the project
set -e

echo ""
echo "Construction du site"
echo ""
pwd
ls -lah
rm -rf ./docs/_site
mkdir -p ./docs/_site
docker run --user root --rm -v ./docs:/srv/jekyll jekyll/minimal:3.8 jekyll build
echo ""
echo "Validation avec https://github.com/dcycle/docker-html-validate"
docker run --user root --rm -v "$(pwd)":/code dcycle/html-validate:3 /code/docs/_site/index.html
./scripts/links.sh
echo ""
echo "Terminé!"
echo ""
