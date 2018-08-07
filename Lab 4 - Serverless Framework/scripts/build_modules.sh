#!/bin/bash

docker build --tag amazonlinux:nodejs .
docker run --rm --volume ${PWD}/functions/originResponse:/build amazonlinux:nodejs /bin/bash -c "source ~/.bashrc; npm init -f -y; npm install sharp --save; npm install --only=prod"
docker run --rm --volume ${PWD}/functions/viewerRequest:/build amazonlinux:nodejs /bin/bash -c "source ~/.bashrc; npm init -f -y; npm install querystring --save; npm install --only=prod"