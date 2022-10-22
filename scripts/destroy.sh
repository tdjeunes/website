#!/bin/bash
set -e

docker kill tdjsite 2>/dev/null || true
docker rm tdjsite 2>/dev/null || true
