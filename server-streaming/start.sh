#!/bin/bash

# Start the streaming server in the background
php streaming-server.php &

# Wait for the server to start (you can adjust the sleep duration as needed)
sleep 2

# Run the test script
php streaming-server.test.php

sleep infinity