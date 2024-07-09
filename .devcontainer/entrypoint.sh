#!/bin/bash
set -e

# Start Couchbase server in the background
/entrypoint.sh couchbase-server &

# Wait for Couchbase to start up
echo "Waiting for Couchbase Server to start..."
until curl -s http://127.0.0.1:8091/ui/index.html > /dev/null; do
  sleep 2
done
echo "Couchbase Server started."

# Run initialization script if not already done
INIT_DONE_FILE=/opt/couchbase/var/lib/couchbase/init_done
if [ ! -f "$INIT_DONE_FILE" ]; then
  /opt/couchbase/bin/init-couchbase.sh
  touch $INIT_DONE_FILE
fi

# Wait for Couchbase server to exit
wait
