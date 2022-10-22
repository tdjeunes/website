#!/bin/bash
set -e

./scripts/destroy.sh

docker run --rm -d \
  --name tdjsite \
  -p 80 -v "$PWD"/docs:/usr/share/nginx/html:ro nginx:alpine

docker port tdjsite 80
