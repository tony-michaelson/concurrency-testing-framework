const http = require("http");
const assert = require("assert");

const HOSTNAME = process.env.TEST_TARGET_HOST || "localhost";
const PORT = process.env.TEST_TARGET_PORT || 3000;

function makeHttpRequest(path, method, data, callback) {
  const options = {
    hostname: HOSTNAME,
    port: PORT,
    path: path,
    method: method,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data ? data.length : 0,
    },
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

  if (data) {
    req.write(data);
  }

  req.end();
}

describe("HTTP Server Tests", () => {
  describe("POST /input", () => {
    it("should return 'Processed Input: 4 elements' with a status code of 200", (done) => {
      const postData = JSON.stringify({
        calmgNtp: "n4GGqWu3djciWC5",
        eN6iQD: "kwPbp3",
        "2aj": "9ChZBEGOwO4STr",
        "8MbOcmc": "egykBM8KxkoH",
      });

      makeHttpRequest("/input", "POST", postData, (statusCode, data, error) => {
        assert.strictEqual(statusCode, 200);
        assert.strictEqual(data, "Processed Input: 4 elements");
        assert.strictEqual(error, null);
        done();
      });
    });
  });

  describe("GET /hello", () => {
    it("should return 'Hello!' a status code of 200", (done) => {
      makeHttpRequest("/hello", "GET", null, (statusCode, data, error) => {
        assert.strictEqual(statusCode, 200);
        assert.strictEqual(data, "Hello!");
        assert.strictEqual(error, null);
        done();
      });
    });
  });

  describe("GET /string-concat", () => {
    it("should return a status code of 200", (done) => {
      makeHttpRequest(
        "/string-concat",
        "GET",
        null,
        (statusCode, data, error) => {
          assert.strictEqual(statusCode, 200);
          const pattern = RegExp(/.*This is a CPU-intensive operation.*/);
          assert.strictEqual(pattern.test(data), true);
          assert.strictEqual(error, null);
          done();
        }
      );
    });
  });

  describe("GET /cpu", () => {
    it("should return a status code of 200", (done) => {
      makeHttpRequest("/cpu", "GET", null, (statusCode, data, error) => {
        assert.strictEqual(statusCode, 200);
        assert.strictEqual(data.length > 1, true);
        assert.strictEqual(error, null);
        done();
      });
    });
  });

  describe("GET /consume", () => {
    it("should return a status code of 200", function (done) {
      this.timeout(35000);
      makeHttpRequest("/consume", "GET", null, (statusCode, data, error) => {
        assert.strictEqual(statusCode, 200);
        assert.strictEqual(data.length > 1, true);
        assert.strictEqual(error, null);
        done();
      });
    });
  });

  describe("GET /api-call", () => {
    it("should return a status code of 200", function (done) {
      this.timeout(7000);
      makeHttpRequest("/api-call", "GET", null, (statusCode, data, error) => {
        assert.strictEqual(statusCode, 200);
        // response expected is: {"data":"API response data"}
        assert.strictEqual(JSON.parse(data).data, "API response data");
        assert.strictEqual(error, null);
        done();
      });
    });
  });
});
