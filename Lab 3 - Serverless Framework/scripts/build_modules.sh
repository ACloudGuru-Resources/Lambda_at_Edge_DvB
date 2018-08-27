#!/bin/bash
rm -rf './functions/originResponse/node_modules'
docker build --tag amazonlinux:nodejs .
docker run --rm --volume "${PWD}/functions/originResponse":/build amazonlinux:nodejs /bin/bash -c "source ~/.bashrc; npm install --only=prod"