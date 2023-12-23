#!/usr/bin/env python3

import aiohttp
import asyncio
import argparse
import json
import time
import os

hostname = os.environ.get('HOSTNAME')

DEFAULT_BASE_URL = f"http://{hostname}:3000" if hostname else "http://localhost:3000"
DEFAULT_CONCURRENT_REQUESTS = 10
DEFAULT_FILENAME = 'input.json'
DEFAULT_FILENAME_SM = 'input-sm.json'
DEFAULT_SUMMARY_FILENAME = 'summary.json'

# Parse command-line arguments
parser = argparse.ArgumentParser(description="Async HTTP Requester")
parser.add_argument("--baseURL", type=str, default=DEFAULT_BASE_URL, help="Base URL")
parser.add_argument("--concurrent_requests", type=int, default=DEFAULT_CONCURRENT_REQUESTS, help="Number of concurrent requests")
parser.add_argument("--concurrent_input_requests", type=int, default=0, help="Set concurrent requests for /input")
parser.add_argument("--concurrent_hello_requests", type=int, default=0, help="Set concurrent requests for /hello")
parser.add_argument("--concurrent_string_concat_requests", type=int, default=0, help="Set concurrent requests for /string-concat")
parser.add_argument("--concurrent_cpu_requests", type=int, default=0, help="Set concurrent requests for /cpu")
parser.add_argument("--concurrent_consume_requests", type=int, default=0, help="Set concurrent requests for /consume")
parser.add_argument("--concurrent_api_call_requests", type=int, default=0, help="Set concurrent requests for /api-call")
parser.add_argument("--filename", type=str, default=DEFAULT_FILENAME, help="filename for large JSON input")
parser.add_argument("--filename_sm", type=str, default=DEFAULT_FILENAME_SM, help="filename for small JSON input")
parser.add_argument("--summary_filename", type=str, default=DEFAULT_SUMMARY_FILENAME, help="Summary Filename")
args = parser.parse_args()

baseURL = args.baseURL
concurrent_requests = args.concurrent_requests
filename = args.filename
filename_sm = args.filename_sm
summary_filename = args.summary_filename

def read_json(filename):
    with open(filename, "r") as f:
        return f.read()
    
post_data = read_json(filename)
post_data_sm = read_json(filename_sm)

endpoints = [
    ("/input#large", args.concurrent_input_requests or concurrent_requests, post_data),
    ("/input#small", args.concurrent_input_requests or concurrent_requests, post_data_sm),
    ("/hello", args.concurrent_hello_requests or concurrent_requests, None),
    ("/string-concat", args.concurrent_string_concat_requests | concurrent_requests, None),
    ("/cpu", args.concurrent_cpu_requests or concurrent_requests, None),
    ("/consume", args.concurrent_consume_requests or concurrent_requests, None),
    ("/api-call", args.concurrent_api_call_requests or concurrent_requests, None),
]
    
async def make_request(session, url, data, method="GET"):
    start_time = time.time()
    async with session.request(method, url, data=data) as response:
        response_text = await response.text()
        response_code = response.status
    end_time = time.time()
    elapsed_time_ms = (end_time - start_time) * 1000.0
    return url, elapsed_time_ms, response_code

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = []
        
        data = None
        for endpoint, num_requests, post_data in endpoints:
            url = f"{baseURL}{endpoint}"
            if endpoint.startswith("/input"):
                data = post_data
                method = "POST"
            else:
                data = None
                method = "GET"
            
            for _ in range(num_requests):
                task = make_request(session, url, data, method)
                tasks.append(task)

        def process_response(path, elapsed_time_ms, response_code, summary={}):
            print(f"{path},{elapsed_time_ms:.2f},{response_code}")

            total_requests = summary.get(path, {}).get("total_requests", 0) + 1
            summary[path] = {
                "total_requests": total_requests,
                "longest_elapsed_time_ms": max(elapsed_time_ms, summary.get(path, {}).get("longest_elapsed_time_ms", 0)),
                "shortest_elapsed_time_ms": min(elapsed_time_ms, summary.get(path, {}).get("shortest_elapsed_time_ms", 999999999)),
                "average_elapsed_time_ms": (summary.get(path, {}).get("average_elapsed_time_ms", 0) * (total_requests - 1) + elapsed_time_ms) / total_requests,
            }
            return summary

        print(f"Endpoint,Time (ms),Response Code")
        summary = {}
        for completed_task in asyncio.as_completed(tasks):
            url, elapsed_time_ms, response_code = await completed_task
            path = url.split("/")[-1]
            summary = process_response(path, elapsed_time_ms, response_code, summary)

        with open(summary_filename, 'w') as f:
            json.dump(summary, f, indent=4)

if __name__ == "__main__":
    asyncio.run(main())
