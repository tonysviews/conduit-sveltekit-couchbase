#!/bin/bash
set -e

# Log all subsequent commands to logfile. FD 3 is now the console
# for things we want to show up in "docker logs".
LOGFILE=/opt/couchbase/var/lib/couchbase/logs/container-startup.log
exec 3>&1 1>>${LOGFILE} 2>&1

export PATH=/opt/couchbase/bin:${PATH}

wait_for_uri() {
  expected=$1
  shift
  uri=$1
  echo "Waiting for $uri to be available..."
  while true; do
    status=$(curl -s -w "%{http_code}" -o /dev/null $*)
    if [ "x$status" = "x$expected" ]; then
      break
    fi
    echo "$uri not up yet, waiting 2 seconds..."
    sleep 2
  done
  echo "$uri ready, continuing"
}

panic() {
  cat <<EOF 1>&3
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Error during initial configuration - aborting container
Here's the log of the configuration attempt:
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
EOF
  cat $LOGFILE 1>&3
  echo 1>&3
  kill -HUP 1
  exit
}

couchbase_cli() {
  couchbase-cli $* || {
    echo Previous couchbase-cli command returned error code $?
    panic
  }
}

wait_for_uri 200 http://127.0.0.1:8091/ui/index.html

echo "Creating cluster"
couchbase_cli cluster-init \
  --cluster localhost \
  --cluster-name RealWorld-Conduit \
  --cluster-username $COUCHBASE_ADMIN \
  --cluster-password $COUCHBASE_ADMIN_PASSWORD \
  --services data,index,query \
  --cluster-ramsize 512
echo

echo "Creating bucket"
couchbase_cli bucket-create \
  --cluster localhost \
  --username $COUCHBASE_ADMIN \
  --password $COUCHBASE_ADMIN_PASSWORD \
  --bucket $COUCHBASE_BUCKET \
  --bucket-type couchbase \
  --bucket-ramsize 256
echo

echo "Creating scope"
couchbase_cli collection-manage \
  --cluster localhost \
  --username $COUCHBASE_ADMIN \
  --password $COUCHBASE_ADMIN_PASSWORD \
  --bucket $COUCHBASE_BUCKET \
  --create-scope $COUCHBASE_SCOPE
echo

echo "Creating Articles collection"
couchbase_cli collection-manage \
  --cluster localhost \
  --username $COUCHBASE_ADMIN \
  --password $COUCHBASE_ADMIN_PASSWORD \
  --bucket $COUCHBASE_BUCKET \
  --create-collection $COUCHBASE_SCOPE.articles
echo

echo "Creating Users collection"
couchbase_cli collection-manage \
  --cluster localhost \
  --username $COUCHBASE_ADMIN \
  --password $COUCHBASE_ADMIN_PASSWORD \
  --bucket $COUCHBASE_BUCKET \
  --create-collection $COUCHBASE_SCOPE.users
echo

echo "Creating Comments collection"
couchbase_cli collection-manage \
  --cluster localhost \
  --username $COUCHBASE_ADMIN \
  --password $COUCHBASE_ADMIN_PASSWORD \
  --bucket $COUCHBASE_BUCKET \
  --create-collection $COUCHBASE_SCOPE.comments
echo

echo "Creating RBAC '$COUCHBASE_USER' user on $COUCHBASE_BUCKET bucket"
couchbase_cli user-manage \
  --set \
  --rbac-username $COUCHBASE_USER \
  --rbac-password $COUCHBASE_PASSWORD \
  --roles "bucket_full_access[$COUCHBASE_BUCKET],scope_admin[$COUCHBASE_BUCKET],bucket_admin[$COUCHBASE_BUCKET]" \
  --auth-domain local \
  -c 127.0.0.1 \
  -u $COUCHBASE_ADMIN \
  -p $COUCHBASE_ADMIN_PASSWORD
echo

echo "Configuration completed!" | tee /dev/fd/3
