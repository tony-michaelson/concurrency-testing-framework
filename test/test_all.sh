#!/usr/bin/env bash

SYSTEM_NAME=$1
if [ -z "$SYSTEM_NAME" ]
then
    echo "No system name supplied"
    exit 1
fi

FILE_NAME="${SYSTEM_NAME}_all"
docker run -it --rm \
    --network="host" \
    -e HOSTNAME=localhost \
    -v"$(pwd):/app/" \
    -w /app/ \
    py_requests_tester \
    python3 requests.py \
    --concurrent_requests_begin=1 \
    --report_filename=./results/summary-${FILE_NAME}.json \
    --chart_data_varname=${FILE_NAME} \
    --chart_data_filename=./results/test-results.json \
    --concurrent_requests_end=15

FILE_NAME="${SYSTEM_NAME}_no_lg_input"
docker run -it --rm \
    --network="host" \
    -e HOSTNAME=localhost \
    -v"$(pwd):/app/" \
    -w /app/ \
    py_requests_tester \
    python3 requests.py \
    --concurrent_requests_begin=1 \
    --report_filename=./results/summary-${FILE_NAME}.json \
    --chart_data_varname=${FILE_NAME} \
    --chart_data_filename=./results/test-results.json \
    --input_requests_lg=0 \
    --concurrent_requests_end=15

FILE_NAME="${SYSTEM_NAME}_no_lg_input_no_cpu"
docker run -it --rm \
    --network="host" \
    -e HOSTNAME=localhost \
    -v"$(pwd):/app/" \
    -w /app/ \
    py_requests_tester \
    python3 requests.py \
    --concurrent_requests_begin=1 \
    --report_filename=./results/summary-${FILE_NAME}.json \
    --chart_data_varname=${FILE_NAME} \
    --chart_data_filename=./results/test-results.json \
    --input_requests_lg=0 \
    --cpu_requests=0 \
    --concurrent_requests_end=40
