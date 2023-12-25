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
DEFAULT_CHART_DATA_FILENAME = 'chart_data.json'

parser = argparse.ArgumentParser(description="Async HTTP Requester")
parser.add_argument("--baseURL", type=str, default=DEFAULT_BASE_URL, help="Base URL")

parser.add_argument("--concurrent_requests_begin", type=int, default=1, help="Number of concurrent requests to begin with")
parser.add_argument("--concurrent_requests_end", type=int, default=DEFAULT_CONCURRENT_REQUESTS, help="Number of concurrent requests to end with")

parser.add_argument("--input_requests_lg", type=int, default=0, help="Set multiplier of concurrent requests for /input#37mb")
parser.add_argument("--input_requests_sm", type=int, default=0, help="Set multiplier of concurrent requests for /input#114B")
parser.add_argument("--hello_requests", type=int, default=0, help="Set multiplier of concurrent requests for /hello")
parser.add_argument("--string_concat_requests", type=int, default=0, help="Set multiplier of concurrent requests for /string-concat")
parser.add_argument("--cpu_requests", type=int, default=0, help="Set multiplier of concurrent requests for /cpu")
parser.add_argument("--consume_requests", type=int, default=0, help="Set multiplier of concurrent requests for /consume")
parser.add_argument("--api_call_requests", type=int, default=0, help="Set multiplier of concurrent requests for /api-call")

parser.add_argument("--json_input_file", type=str, default=DEFAULT_FILENAME, help="filename for large JSON input")
parser.add_argument("--json_input_file_sm", type=str, default=DEFAULT_FILENAME_SM, help="filename for small JSON input")

parser.add_argument("--report_filename", type=str, default=DEFAULT_SUMMARY_FILENAME, help="Filename to write report to")
parser.add_argument("--chart_data_filename", type=str, default=DEFAULT_CHART_DATA_FILENAME, help="Filename to write chart data to")
parser.add_argument("--chart_rps_data_filename", type=str, default=DEFAULT_CHART_DATA_FILENAME, help="Filename to write chart rps data to")
args = parser.parse_args()

baseURL = args.baseURL
concurrent_requests_begin = args.concurrent_requests_begin
concurrent_requests_end = args.concurrent_requests_end
filename = args.json_input_file
filename_sm = args.json_input_file_sm
summary_filename = args.report_filename
chart_data_filename = args.chart_data_filename
chart_rps_data_filename = args.chart_rps_data_filename

def read_json(filename):
    with open(filename, "r") as f:
        return f.read()
    
post_data = read_json(filename)
post_data_sm = read_json(filename_sm)

endpoints = [
    ("/input#37mb", args.input_requests_lg or 1, post_data, "black"),
    ("/input#114B", args.input_requests_sm or 1, post_data_sm, "gray"),
    ("/hello", args.hello_requests or 1, None, "blue"),
    ("/string-concat", args.string_concat_requests | 1, None, "red"),
    ("/cpu", args.cpu_requests or 1, None, "purple"),
    ("/consume", args.consume_requests or 1, None, "green"),
    ("/api-call", args.api_call_requests or 1, None, "orange"),
]
    
async def make_request(session, url, data, method="GET"):
    start_time = time.time()
    async with session.request(method, url, data=data) as response:
        response_text = await response.text()
        response_code = response.status
    end_time = time.time()
    elapsed_time_ms = (end_time - start_time) * 1000.0
    return url, elapsed_time_ms, response_code

async def requests(concurrent_requests):
    main_start_time = time.time()
    async with aiohttp.ClientSession() as session:
        tasks = []
        
        data = None
        for endpoint, num_requests, post_data, color in endpoints:
            url = f"{baseURL}{endpoint}"
            if endpoint.startswith("/input"):
                data = post_data
                method = "POST"
            else:
                data = None
                method = "GET"
            
            for _ in range(num_requests * concurrent_requests):
                task = make_request(session, url, data, method)
                tasks.append(task)

        def process_response(path, elapsed_time_ms, response_code, summary={}):
            print(f"{path},{elapsed_time_ms:.2f},{response_code}")

            total_requests = summary.get(path, {}).get("total_requests", 0) + 1
            summary[path] = {
                "total_requests": total_requests,
                "total_time": summary.get(path, {}).get("total_time", 0) + elapsed_time_ms,
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

        main_end_time = time.time()
        main_elapsed_time_ms = (main_end_time - main_start_time) * 1000.0

        return {
            "concurrent_requests": concurrent_requests,
            "overal_elapsed_time_ms": main_elapsed_time_ms,
            "results": summary,
        }
    
def get_color_for_path(path, endpoints):
    for endpoint_info in endpoints:
        if endpoint_info[0] == path:
            return endpoint_info[3]
    return "unknown"

def sort_datasets_alphabetically(chart_data):
    chart_data["datasets"] = sorted(chart_data["datasets"], key=lambda x: x["label"])
    return chart_data

def generate_chart_data(test_batches_list, rps_data=False):
    chart_data = {
        "labels": [],
        "datasets": []
    }
    datasets_tmp = {}

    for this_batch in test_batches_list:
        concurrent_requests = this_batch["concurrent_requests"]
        chart_data["labels"].append(str(concurrent_requests))

        for endpoint, endpoint_results in this_batch["results"].items():
            requests_per_second = concurrent_requests / (endpoint_results["total_time"] / 1000.0)
            avg_time_per_request = endpoint_results["average_elapsed_time_ms"]
            if endpoint not in datasets_tmp:
                datasets_tmp[endpoint] = {
                    "label": endpoint,
                    "data": [
                        requests_per_second if rps_data else avg_time_per_request
                    ],
                    "borderColor": get_color_for_path('/'+endpoint, endpoints),
                    "fill": False
                }
            else:
                if rps_data:
                    datasets_tmp[endpoint]["data"].append(requests_per_second)
                else:
                    datasets_tmp[endpoint]["data"].append(avg_time_per_request)

        chart_data["datasets"] = list(datasets_tmp.values())

    return sort_datasets_alphabetically(chart_data)

async def main():
    master_report = []
    for concurrent_requests in range(concurrent_requests_begin, concurrent_requests_end + 1):
       report = await requests(concurrent_requests)
       master_report.append(report)

    chart_data = generate_chart_data(master_report)
    chart_rps_data = generate_chart_data(master_report, True)

    with open(summary_filename, "w") as f:
        f.write(json.dumps(master_report, indent=4))

    with open(chart_data_filename, 'w') as chart_file:
        json.dump(chart_data, chart_file, indent=4)

    with open(chart_rps_data_filename, 'w') as chart_rps_file:
        json.dump(chart_rps_data, chart_rps_file, indent=4)

if __name__ == "__main__":
    asyncio.run(main())
