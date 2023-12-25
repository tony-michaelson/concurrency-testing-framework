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
    --chart_data_filename=./results/chart_data_${FILE_NAME}.json \
    --chart_rps_data_filename=./results/chart_rps_data_${FILE_NAME}.json \
    --concurrent_requests_end=20

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
    --chart_data_filename=./results/chart_data_${FILE_NAME}.json \
    --chart_rps_data_filename=./results/chart_rps_data_${FILE_NAME}.json \
    --input_requests_lg=0 \
    --concurrent_requests_end=20

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
    --chart_data_filename=./results/chart_data_${FILE_NAME}.json \
    --chart_rps_data_filename=./results/chart_rps_data_${FILE_NAME}.json \
    --input_requests_lg=0 \
    --cpu_requests=0 \
    --concurrent_requests_end=40
