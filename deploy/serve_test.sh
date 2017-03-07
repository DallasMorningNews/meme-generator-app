#!/bin/bash
set -e

### Configuration ###

SERVER=ubuntu@52.21.39.126
APP_DIR=/var/www/meme-generator
KEYFILE=~/.ssh/dmnapps.pem
REMOTE_PATH=/etc/nginx/site-locations/meme-generator


### Library ###

function run()
{
  echo "Running: $@"
  "$@"
}


### Automation steps ###

if [[ "$KEYFILE" != "" ]]; then
  KEYARG="-i $KEYFILE"
else
  KEYARG=
fi

run scp $KEYARG deploy/nginx $SERVER:$REMOTE_PATH
echo
echo "---- Restarting nginx on test server ----"
run ssh $KEYARG -T $SERVER "sudo service nginx restart"