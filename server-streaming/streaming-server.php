<?php

set_time_limit(0);

$streamSize = getenv('STREAM_SIZE') ?: 1000000;
$apiCallDelay = getenv('API_CALL_DELAY_MS') ?: 5000;
$port = getenv('PORT') ?: 3030;

$server = stream_socket_server('tcp://0.0.0.0:' . $port, $errno, $errstr);

if (!$server) {
    die("Error: $errstr ($errno)\n");
}

echo "Server is running on port $port\n";

function handleClient($client)
{
    global $streamSize, $apiCallDelay;

    $request = fread($client, 4096);
    if (strpos($request, "/stream") !== false) {
        $responseHeaders = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\n";
        fwrite($client, $responseHeaders);

        for ($count = 0; $count <= $streamSize; $count++) {
            $data = "data stream $count\n";
            fwrite($client, $data);
        }

        fclose($client);
    } elseif (strpos($request, "/api-call") !== false) {
        $responseHeaders = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n";
        fwrite($client, $responseHeaders);

        $response = ['data' => 'API response data'];
        usleep($apiCallDelay * 1000);
        fwrite($client, json_encode($response));

        fclose($client);
    } else {
        $responseHeaders = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n";
        fwrite($client, $responseHeaders);
        fwrite($client, "Not Found");
        fclose($client);
    }
}

while (true) {
    $client = stream_socket_accept($server);
    if ($client) {
        $pid = pcntl_fork();

        if ($pid == -1) {
            die("Error: Fork failed\n");
        } elseif ($pid == 0) {
            // Child process
            handleClient($client);
            exit(0); // Exit the child process
        }

        // Parent process continues to accept new connections
        fclose($client);
    }
}

// Close the server socket (This part will not be reached in the parent process)
fclose($server);
