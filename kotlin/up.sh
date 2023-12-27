#!/usr/bin/env bash

export NUMBER_OF_PRIMES=${NUMBER_OF_PRIMES:-1500}
export STREAMING_SERVER_PORT=${STREAMING_SERVER_PORT:-3030}
export STRING_CONCAT_SIZE=${STRING_CONCAT_SIZE:-10000}
export API_CALL_DELAY_MS=${API_CALL_DELAY_MS:-1000}
export STREAM_SIZE=${STREAM_SIZE:-1000000}
export WORKER_GROUP_SIZE=${WORKER_GROUP_SIZE:-16}
export CALL_GROUP_SIZE=${CALL_GROUP_SIZE:-16}

echo "Worker group size: $WORKER_GROUP_SIZE"
echo "Call group size: $CALL_GROUP_SIZE"
echo "Number of primes: $NUMBER_OF_PRIMES"
echo "Streaming server port: $STREAMING_SERVER_PORT"
echo "String concat size: $STRING_CONCAT_SIZE"
echo "API call delay: $API_CALL_DELAY_MS"
echo "Stream size: $STREAM_SIZE"

if ! command -v docker-compose &>/dev/null; then
  echo "Docker Compose is not installed. Please install it and try again."
  exit 1
fi

if [ ! -f "docker-compose.yml" ]; then
  echo "docker-compose.yml file not found in the current directory."
  exit 1
fi

docker-compose up
docker-compose down