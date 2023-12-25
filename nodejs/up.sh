#!/usr/bin/env bash

export JS_IMAGE=${1:-"node:21.5.0-slim"}
export JS_START_CMD=${2:-"node /app/server.js"}

export NUMBER_OF_PRIMES=${NUMBER_OF_PRIMES:-1500}
export STREAMING_SERVER_PORT=${STREAMING_SERVER_PORT:-3030}
export STRING_CONCAT_SIZE=${STRING_CONCAT_SIZE:-10000}
export API_CALL_DELAY_MS=${API_CALL_DELAY_MS:-1000}
export STREAM_SIZE=${STREAM_SIZE:-1000000}

if ! command -v docker-compose &>/dev/null; then
  echo "Docker Compose is not installed. Please install it and try again."
  exit 1
fi

if [ ! -f "docker-compose.yml" ]; then
  echo "docker-compose.yml file not found in the current directory."
  exit 1
fi

docker-compose up