# Python Requests Tester

## Build the Image

```
docker build -t py_requests_tester .
```

## Run Tests

```
docker run -it --rm \
    --network="host" \
    -e HOSTNAME=localhost \
    -v"$(pwd):/app/" \
    -w /app/ \
    py_requests_tester \
    python3 requests.py
```

## Usage

This script takes a beginning and ending number and will walk up to the ending number. For each iteration it will create requests for all the paths in the list of endpoints multiplied by the current number in the iteration.

i.e. if you run this with --concurrent_requests_begin=1 and --concurrent_requests_end=5 by the 5th iteration given 7 paths in the endpoints list you will create 70 concurrent requests. You can modify the multiplier for each endpoint using an arg flag. If you set --cpu_requests=2, for example, then you will create 5 \* 2 requests in the 5th iteration.

```
usage: requests.py [-h] [--baseURL BASEURL] [--concurrent_requests_begin CONCURRENT_REQUESTS_BEGIN]
                   [--concurrent_requests_end CONCURRENT_REQUESTS_END] [--input_requests_lg INPUT_REQUESTS_LG]
                   [--input_requests_sm INPUT_REQUESTS_SM] [--hello_requests HELLO_REQUESTS]
                   [--string_concat_requests STRING_CONCAT_REQUESTS] [--cpu_requests CPU_REQUESTS] [--consume_requests CONSUME_REQUESTS]
                   [--api_call_requests API_CALL_REQUESTS] [--json_input_file JSON_INPUT_FILE] [--json_input_file_sm JSON_INPUT_FILE_SM]
                   [--report_filename REPORT_FILENAME] [--chart_data_filename CHART_DATA_FILENAME]
                   [--chart_data_varname CHART_DATA_VARNAME]

Async HTTP Requester

options:
  -h, --help            show this help message and exit
  --baseURL BASEURL     Base URL
  --concurrent_requests_begin CONCURRENT_REQUESTS_BEGIN
                        Number of concurrent requests to begin with
  --concurrent_requests_end CONCURRENT_REQUESTS_END
                        Number of concurrent requests to end with
  --input_requests_lg INPUT_REQUESTS_LG
                        Set multiplier of concurrent requests for /input#37mb
  --input_requests_sm INPUT_REQUESTS_SM
                        Set multiplier of concurrent requests for /input#114B
  --hello_requests HELLO_REQUESTS
                        Set multiplier of concurrent requests for /hello
  --string_concat_requests STRING_CONCAT_REQUESTS
                        Set multiplier of concurrent requests for /string-concat
  --cpu_requests CPU_REQUESTS
                        Set multiplier of concurrent requests for /cpu
  --consume_requests CONSUME_REQUESTS
                        Set multiplier of concurrent requests for /consume
  --api_call_requests API_CALL_REQUESTS
                        Set multiplier of concurrent requests for /api-call
  --json_input_file JSON_INPUT_FILE
                        filename for large JSON input
  --json_input_file_sm JSON_INPUT_FILE_SM
                        filename for small JSON input
  --report_filename REPORT_FILENAME
                        Filename to write report to
  --chart_data_filename CHART_DATA_FILENAME
                        Filename to write chart data to
  --chart_data_varname CHART_DATA_VARNAME
                        Var name to assign chart data to
```
