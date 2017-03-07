#!/bin/bash
set -e

### Configuration ###

SERVER=ubuntu@52.21.39.126
KEYFILE=~/.ssh/dmnapps.pem

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

echo
echo "---- Pulling site from test server ----"
run ssh $KEYARG -t $SERVER "sudo rm /etc/nginx/site-locations/meme-generator"
echo
echo "---- Restarting nginx on test server ----"
run ssh $KEYARG -T $SERVER "sudo service nginx restart"