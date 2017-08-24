#!/bin/bash
set -e

### Configuration ###

SERVER=ubuntu@52.5.68.162
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
echo "---- Pulling site from production server ----"
run ssh $KEYARG -T $SERVER "sudo rm /etc/nginx/site-locations/meme-generator"
echo
echo "---- Restarting nginx on production server ----"
run ssh $KEYARG -T $SERVER "sudo service nginx restart"
