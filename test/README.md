# Python Requests Tester

## Build the Image

```
docker build -t py_requests_tester .
```

## Run Tests

```
docker run -it --rm --network="host" -e HOSTNAME=$(hostname) -v"$(pwd):/app/" -w /app/ py_requests_tester python3 requests.py
```

## Usage

This script will run with no flags set using default values. Otherwise to tune it check the usage screen.

```
usage: requests.py [-h] [--baseURL BASEURL] [--concurrent_requests CONCURRENT_REQUESTS]
                   [--concurrent_input_requests CONCURRENT_INPUT_REQUESTS] [--concurrent_hello_requests CONCURRENT_HELLO_REQUESTS]
                   [--concurrent_string_concat_requests CONCURRENT_STRING_CONCAT_REQUESTS]
                   [--concurrent_cpu_requests CONCURRENT_CPU_REQUESTS] [--concurrent_consume_requests CONCURRENT_CONSUME_REQUESTS]
                   [--concurrent_api_call_requests CONCURRENT_API_CALL_REQUESTS] [--filename FILENAME]
                   [--summary_filename SUMMARY_FILENAME]

Async HTTP Requester

options:
  -h, --help            show this help message and exit
  --baseURL BASEURL     Base URL
  --concurrent_requests CONCURRENT_REQUESTS
                        Number of concurrent requests
  --concurrent_input_requests CONCURRENT_INPUT_REQUESTS
                        Set concurrent requests for /input
  --concurrent_hello_requests CONCURRENT_HELLO_REQUESTS
                        Set concurrent requests for /hello
  --concurrent_string_concat_requests CONCURRENT_STRING_CONCAT_REQUESTS
                        Set concurrent requests for /string-concat
  --concurrent_cpu_requests CONCURRENT_CPU_REQUESTS
                        Set concurrent requests for /cpu
  --concurrent_consume_requests CONCURRENT_CONSUME_REQUESTS
                        Set concurrent requests for /consume
  --concurrent_api_call_requests CONCURRENT_API_CALL_REQUESTS
                        Set concurrent requests for /api-call
  --filename FILENAME   filename for large JSON input
  --filename_sm FILENAME_SM
                        filename for small JSON input
  --summary_filename SUMMARY_FILENAME
                        Summary Filename
```
