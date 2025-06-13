#!/bin/bash
set -e

docker kill my-apache-app || true
docker rm my-apache-app || true
docker run -dit --name my-apache-app -p 8080:80 -v "$PWD"/docs/archives/avant-2025:/usr/local/apache2/htdocs/archives/avant-2025 httpd:2.4
