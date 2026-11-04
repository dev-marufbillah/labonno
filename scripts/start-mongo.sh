#!/usr/bin/env bash
#
# Starts a local MongoDB as a single-node replica set (rs0).
#
# Why a replica set and not a plain mongod? Order creation runs inside a transaction,
# and MongoDB only allows transactions on a replica set. A bogus transaction failure at
# checkout is the most common local-setup trap — this script avoids it.
#
#   npm run db:mongo
#
# Works on macOS and Linux. On Windows, use WSL (or a free MongoDB Atlas cluster and put
# its mongodb+srv:// URI in MONGODB_URI — see docs/HANDOVER.md).
set -euo pipefail

PORT="${MONGO_PORT:-27017}"
DATA_DIR="$(cd "$(dirname "$0")/.." && pwd)/.mongo-data"
LOG_FILE="$DATA_DIR/mongod.log"

find_mongod() {
  if command -v mongod >/dev/null 2>&1; then
    command -v mongod
    return
  fi
  for candidate in \
    /opt/homebrew/bin/mongod \
    /usr/local/bin/mongod \
    /usr/bin/mongod \
    "$HOME/.local/bin/mongod"; do
    if [ -x "$candidate" ]; then
      echo "$candidate"
      return
    fi
  done
  return 1
}

if ! MONGOD="$(find_mongod)"; then
  cat <<'MSG'
mongod was not found on this machine.

Install MongoDB Community 7.x:
  macOS   : brew tap mongodb/brew && brew install mongodb-community@7.0
  Ubuntu  : https://www.mongodb.com/docs/manual/installation/
  Windows : use WSL, or skip local Mongo entirely and use a free Atlas cluster
            (https://cloud.mongodb.com) — put its URI in MONGODB_URI.

MSG
  exit 1
fi

mkdir -p "$DATA_DIR"

if nc -z 127.0.0.1 "$PORT" 2>/dev/null || (echo >"/dev/tcp/127.0.0.1/$PORT") 2>/dev/null; then
  echo "MongoDB is already listening on port $PORT — nothing to do."
else
  echo "Starting mongod ($MONGOD) on 127.0.0.1:$PORT …"
  "$MONGOD" \
    --dbpath "$DATA_DIR" \
    --port "$PORT" \
    --bind_ip 127.0.0.1 \
    --replSet rs0 \
    --wiredTigerCacheSizeGB 0.25 \
    --fork \
    --logpath "$LOG_FILE"
fi

echo "Waiting for the server to accept connections …"
for _ in $(seq 1 30); do
  nc -z 127.0.0.1 "$PORT" 2>/dev/null && break
  sleep 1
done

# Initiate the replica set if it has not been initiated yet. Uses the mongodb driver that
# is already installed for the app, so no mongosh is required.
node - "$PORT" <<'NODE'
const { MongoClient } = require("mongodb");
const port = process.argv[2];
const uri = `mongodb://127.0.0.1:${port}/?directConnection=true`;
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

(async () => {
  try {
    await client.connect();
    const admin = client.db("admin");
    try {
      const status = await admin.command({ replSetGetStatus: 1 });
      console.log(`Replica set "${status.set}" is already up (state: ${status.myState}).`);
    } catch {
      await admin.command({ replSetInitiate: { _id: "rs0", members: [{ _id: 0, host: `127.0.0.1:${port}` }] } });
      console.log('Initiated replica set "rs0".');
    }
  } catch (error) {
    console.error("Could not reach MongoDB:", error.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
})();
NODE

echo
echo "MongoDB ready → mongodb://127.0.0.1:$PORT"
echo "Data directory : $DATA_DIR (git-ignored)"
echo "Log file       : $LOG_FILE"
echo "Next step      : npm run seed  &&  npm run dev"
