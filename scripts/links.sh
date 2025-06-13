#!/bin/bash
# Vérification des liens brisés dans le site
set -e

docker kill tdj-apache-app || true
docker rm tdj-apache-app || true
echo ""
echo "Vérification des liens brisés avec https://github.com/dcycle/docker-broken-link-checker"
docker run -dit --name tdj-apache-app -p 8081:80 -v "$PWD"/docs/_site:/usr/local/apache2/htdocs/ httpd:2.4
docker run --rm --link tdj-apache-app:site dcycle/broken-link-checker:3 -o text http://site
