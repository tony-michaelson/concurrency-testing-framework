# Concurrency Testing

## Requirements

- [Docker Engine 24+](https://docs.docker.com/engine/install/)
- [Docker Compose v3+](https://docs.docker.com/compose/install/)
- bash

## Quickstart

- cd ./server-streaming and build a local image according to README.me in /server-streaming
- cd ./nodejs, ./dart, or ./kotlin and ./up.sh

## Layout

Setup for each runtime environment is:

```
                +-------------+
                |             |
                |   NGINX     |
                |   Load      |
                |   Balancer  |
                |             | ------------------------------------------------
                +-------------+                              |                  |
                  /       |       \                          |                  |
                 /        |        \                         |                  |
                /         |         \                        |                  |
               /          |          \                       |                  |
              /           |           \                      |                  |
             /            |            \                     |                  |
+------+-------+  +------+-------+  +------+-------+  +------+-------+  +-------+--------+
|              |  |              |  |              |  |              |  |                |
|   server1    |  |   server2    |  |   server3    |  |   server4    |  |    streaming   |
|              |  |              |  |              |  |              |  |                |
+--------------+  +--------------+  +--------------+  +--------------+  +----------------+
```

## HTTP Endpoints

### For the four "server" type services:

| PATH           | Description                                                                     | ENV Vars                                |
| -------------- | ------------------------------------------------------------------------------- | --------------------------------------- |
| /input         | Deserialize JSON and walk the object tree                                       |                                         |
| /hello         | Respond with "Hello!"                                                           |                                         |
| /string-concat | Perform CPU-intensive string operation and stream response                      | STRING_CONCAT_SIZE                      |
| /cpu           | Find $NUMBER_OF_PRIMES using coro-prime-sieve then respond with the list        | NUMBER_OF_PRIMES                        |
| /consume       | Consume a stream from the streaming_server and respond with data once completed | STREAMING_SERVER, STREAMING_SERVER_PORT |
| /api-call      | Make a GET HTTP request to the streaming_server and return the response         | STREAMING_SERVER, STREAMING_SERVER_PORT |
| Default (404)  | Handle unknown routes with a "Not Found" response                               |                                         |

### For the "streaming" type service:

| PATH          | Description                                       | ENV Var           |
| ------------- | ------------------------------------------------- | ----------------- |
| /stream       | Stream data with a word stream                    | STREAM_SIZE       |
| /api-call     | Simulate an API call with delayed response        | API_CALL_DELAY_MS |
| Default (404) | Handle unknown routes with a "Not Found" response |                   |

### ENV Vars Description:

| ENV Var               | Description                                       | Default Value          |
| --------------------- | ------------------------------------------------- | ---------------------- |
| STRING_CONCAT_SIZE    | Size of CPU-intensive string concatenation        | 10000                  |
| NUMBER_OF_PRIMES      | Number of primes for CPU-intensive math operation | 1500                   |
| STREAMING_SERVER      | Hostname of the streaming server                  | N/A (No Default Value) |
| STREAMING_SERVER_PORT | Port of the streaming server                      | N/A (No Default Value) |
| STREAM_SIZE           | Size of the data stream                           | 1000000                |
| API_CALL_DELAY_MS     | Delay in milliseconds for simulating API calls    | 5000                   |

## Start the Servers

From either the "nodejs", "kotlin" or "dart" folder run:

````bash
./up.sh \
    NUMBER_OF_PRIMES=15000 \
    API_CALL_DELAY_MS=5000 \
    STREAM_SIZE=1000000 \
    STREAMING_SERVER_PORT=3030 \
    STRING_CONCAT_SIZE=200000```
````

## Testing

[README](./test/README.md)
