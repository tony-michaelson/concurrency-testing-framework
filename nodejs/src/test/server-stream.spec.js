const http = require("http");
const assert = require("assert");

const HOSTNAME = process.env.TEST_TARGET_STREAMING_HOST || "localhost";
const PORT = process.env.TEST_TARGET_STREAMING_PORT || 3030;
const STREAM_SIZE = process.env.STREAM_SIZE || 1000000;

// Helper function to make HTTP GET requests
function makeHttpGetRequest(path, callback) {
  const options = {
    hostname: HOSTNAME,
    port: PORT,
    path: path,
    method: "GET",
  };

  const req = http.request(options, (res) => {
    let responseData = "";
    res.on("data", (chunk) => {
      responseData += chunk;
    });

    res.on("end", () => {
      callback(res.statusCode, responseData, null);
    });
  });

  req.on("error", (error) => {
    callback(null, null, error);
  });

  req.end();
}

describe("HTTP Streaming Server Tests", () => {
  describe("GET /stream", () => {
    it("should return a status code of 200 and stream data", function (done) {
      this.timeout(7000);

      makeHttpGetRequest("/stream", (statusCode, data, error) => {
        assert.strictEqual(statusCode, 200);
        assert.strictEqual(data.length, calculateStreamSize());
        assert.strictEqual(error, null);
        done();
      });
    });
  });

  describe("GET /api-call", () => {
    it("should return a status code of 200", function (done) {
      this.timeout(7000); // Adjust the timeout as needed

      makeHttpGetRequest("/api-call", (statusCode, data, error) => {
        assert.strictEqual(statusCode, 200);
        // response expected is: {"data":"API response data"}
        assert.strictEqual(JSON.parse(data).data, "API response data");
        assert.strictEqual(error, null);
        done();
      });
    });
  });
});

function calculateStreamSize() {
  let size = 0;
  for (let count = 0; count <= STREAM_SIZE; count++) {
    data = "data stream " + count + "\n";
    size += data.length;
  }
  return size;
}
