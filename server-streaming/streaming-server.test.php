<?php

// Test stream route
$response = file_get_contents('http://localhost:3030/stream');
if (strpos($http_response_header[0], 'HTTP/1.1 200 OK') === false) {
    echo "Test failed: Stream route did not return HTTP/1.1 200 OK\n";
} elseif (strpos($response, 'data stream') === false) {
    echo "Test failed: Stream route did not contain 'data stream'\n";
} else {
    echo "Test passed: Stream route\n";
}

// Test API call route
$response = file_get_contents('http://localhost:3030/api-call');
if (strpos($http_response_header[0], 'HTTP/1.1 200 OK') === false) {
    echo "Test failed: API call route did not return HTTP/1.1 200 OK\n";
} else {
    $responseData = json_decode($response, true);
    if (is_array($responseData) && isset($responseData['data']) && $responseData['data'] === 'API response data') {
        echo "Test passed: API call route\n";
    } else {
        echo "Test failed: API call route did not return the expected JSON data\n";
    }
}
