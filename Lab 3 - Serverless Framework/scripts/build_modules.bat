if exist rmdir /S /Q .\functions\originResponse\node_modules
docker build --tag amazonlinux:nodejs .
docker run --rm --volume "%cd%/functions/originResponse":/build amazonlinux:nodejs /bin/bash -c "source ~/.bashrc; npm install --only=prod"