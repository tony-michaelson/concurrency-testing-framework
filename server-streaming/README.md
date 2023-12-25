# Node File Streaming Server

#### For the "streaming" type service:

| PATH      | Description                                | ENV Var           |
| --------- | ------------------------------------------ | ----------------- |
| /stream   | Stream data with a word stream             | STREAM_SIZE       |
| /api-call | Simulate an API call with delayed response | API_CALL_DELAY_MS |

#### ENV Vars Description:

| ENV Var           | Description                                    | Default Value |
| ----------------- | ---------------------------------------------- | ------------- |
| STREAM_SIZE       | Size of the data stream                        | 1000000       |
| API_CALL_DELAY_MS | Delay in milliseconds for simulating API calls | 5000          |

### Build Local Container

You need to build a local container so the other docker-compose setups can use this server in their architecture.

```
./build.sh
```
