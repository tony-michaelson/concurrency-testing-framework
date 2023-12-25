#!/usr/bin/env bash

cd ./server-streaming/
./build.sh
cd -

cd ./kotlin/
./build.sh
cd -

cd ./dart/
./build.sh
cd -

cd ./test/
./build.sh