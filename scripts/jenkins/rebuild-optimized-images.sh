#!/bin/bash
#
# Rebuild optimized image list.
# See http://github.com/dcycle/thumbor-example
#
set -e

# The token must be set as an environment variable
if [ -v "$DIGITALOCEAN_ACCESS_TOKEN" ]; then
  >&2 echo "Please set the DIGITALOCEAN_ACCESS_TOKEN environment variable"
  exit 1
fi
# The ssh key must be set as an environment variable
if [ -v "$DIGITALOCEAN_SSH_KEY" ]; then
  >&2 echo "Please set the DIGITALOCEAN_SSH_KEY environment variable"
  exit 1
fi
# The THUMBOR_SECURITY_KEY key must be set as an environment variable
if [ -v "$THUMBOR_SECURITY_KEY" ]; then
  >&2 echo "Please set the THUMBOR_SECURITY_KEY environment variable"
  exit 1
fi
# The TDJ_IMAGE_MAP_DEPLOY_PRIVATE_KEY key must be set as an environment variable
if [ -v "$TDJ_IMAGE_MAP_DEPLOY_PRIVATE_KEY" ]; then
  >&2 echo "Please set the TDJ_IMAGE_MAP_DEPLOY_PRIVATE_KEY environment variable"
  exit 1
fi

# Create a droplet
DROPLET_NAME=docker-tdj-images

doctl compute droplet create "$DROPLET_NAME" --size 4gb --image ubuntu-20-04-x64 --ssh-keys "$DIGITALOCEAN_SSH_KEY"

sleep 45

IP=$(doctl compute droplet get "$DROPLET_NAME" --format PublicIPv4 --no-header)
echo "Created Droplet at $IP"

sleep 45

ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no \
  root@"$IP" "mkdir -p docker-tdj-images"
scp -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no \
  -r * root@"$IP":docker-tdj-images
ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no \
  root@"$IP" "cd docker-tdj-images && export THUMBOR_SECURITY_KEY=$THUMBOR_SECURITY_KEY && ./scripts/install-docker-and-rebuild-optimized-images.sh"
scp -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no \
  root@"$IP":docker-tdj-images/thumbor-example/unversioned/mapping-beta-tdj-comm.json mapping-beta-tdj-comm.json
cat mapping-beta-tdj-comm.json
rm -rf tdj-image-mapping
ssh-agent bash -c 'ssh-add "$TDJ_IMAGE_MAP_DEPLOY_PRIVATE_KEY"; git clone git@github.com:alberto56/tdj-image-mapping.git'
cd tdj-image-mapping
cp ../mapping-beta-tdj-comm.json ./docs/mapping-beta-tdj-comm.json
git add ./docs/mapping-beta-tdj-comm.json
git config --global user.email "do-not-reply@mediatribe.net"
git config --global user.name "Jenkins (I am a robot)"
git commit -m "Jenkins automatically updating mapping-beta-tdj-comm.json" | echo "mapping-beta-tdj-comm.json probably has no changes"
ssh-agent bash -c 'ssh-add "$TDJ_IMAGE_MAP_DEPLOY_PRIVATE_KEY"; git push origin main'
