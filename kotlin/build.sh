#!/usr/bin/env bash

cd ../server-streaming/
./build.sh
cd -

docker build -t kotlin_server .