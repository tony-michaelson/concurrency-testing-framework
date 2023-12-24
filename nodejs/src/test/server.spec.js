const http = require("http");
const assert = require("assert");

const HOSTNAME = process.env.TEST_TARGET_HOST || "localhost";
const PORT = process.env.TEST_TARGET_PORT || 3000;
const NUMBER_OF_PRIMES = process.env.NUMBER_OF_PRIMES || 1500;
const STRING_CONCAT_SIZE = process.env.STRING_CONCAT_SIZE || 10000;
const STREAM_SIZE = process.env.STREAM_SIZE || 1000000;

function makeHttpRequest(path, method, data) {
  return new Promise((resolve, reject) => {
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
        resolve({
          statusCode: res.statusCode,
          data: responseData,
          error: null,
        });
      });
    });

    req.on("error", (error) => {
      reject({ statusCode: null, data: null, error: error });
    });

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

describe("HTTP Server Tests", () => {
  describe("POST /input", () => {
    it("should return 'Processed Input: 4 elements' with a status code of 200", async () => {
      const postData = JSON.stringify({
        calmgNtp: "n4GGqWu3djciWC5",
        eN6iQD: "kwPbp3",
        "2aj": "9ChZBEGOwO4STr",
        "8MbOcmc": "egykBM8KxkoH",
      });

      const { statusCode, data, error } = await makeHttpRequest(
        "/input",
        "POST",
        postData
      );

      assert.strictEqual(statusCode, 200);
      assert.strictEqual(data, "Processed Input: 4 elements");
      assert.strictEqual(error, null);
    });
  });

  describe("GET /hello", () => {
    it("should return 'Hello!' a status code of 200", async () => {
      const { statusCode, data, error } = await makeHttpRequest(
        "/hello",
        "GET",
        null
      );

      assert.strictEqual(statusCode, 200);
      assert.strictEqual(data, "Hello!");
      assert.strictEqual(error, null);
    });
  });

  describe("GET /string-concat", () => {
    it("should return expected data with a status code of 200", async function () {
      this.timeout(10000);
      const { statusCode, data, error } = await makeHttpRequest(
        "/string-concat",
        "GET",
        null
      );

      const expectedData = performStringOperation();

      assert.strictEqual(statusCode, 200);
      assert.strictEqual(data, expectedData);
      assert.strictEqual(error, null);
    });
  });

  describe("GET /cpu", () => {
    it("should return a list of prime numbers with a status code of 200", async function () {
      this.timeout(10000);
      const expectedPrimes = await performMathOperation();
      const { statusCode, data, error } = await makeHttpRequest(
        "/cpu",
        "GET",
        null
      );
      const primes = JSON.parse(data);

      assert.strictEqual(statusCode, 200);
      assert.deepStrictEqual(primes, expectedPrimes);
      assert.strictEqual(error, null);
    });
  });

  describe("GET /consume", () => {
    it("should return some data with a status code of 200", async function () {
      this.timeout(10000);
      try {
        const response = await makeHttpRequest("/consume", "GET", null);
        const { statusCode, data, error } = response;

        assert.strictEqual(statusCode, 200);
        assert.strictEqual(data.length, calculateStreamSize());
        assert.strictEqual(error, null);
      } catch (err) {
        assert.fail(err);
      }
    });
  });

  describe("GET /api-call", () => {
    it("should return a valid JSON response with a status code of 200", async function () {
      this.timeout(10000); // Adjust the timeout as needed
      const { statusCode, data, error } = await makeHttpRequest(
        "/api-call",
        "GET",
        null
      );

      assert.strictEqual(statusCode, 200);
      // response expected is: {"data":"API response data"}
      assert.strictEqual(JSON.parse(data).data, "API response data");
      assert.strictEqual(error, null);
    });
  });
});

function performStringOperation() {
  let result = "";
  for (let i = 0; i < STRING_CONCAT_SIZE; i++) {
    result += "This is a CPU-intensive operation. ";
  }
  return result;
}

async function performMathOperation() {
  async function* generate() {
    for (var i = 2; ; i++) {
      yield i;
    }
  }

  async function* filter(ch, prime) {
    while (true) {
      var i = (await ch.next()).value;
      if (i % prime != 0) {
        yield i;
      }
    }
  }

  async function findPrimes(n) {
    var ch = generate();
    const primes = [];
    for (var i = 0; i < n; i++) {
      const prime = (await ch.next()).value;
      primes.push(prime);
      ch = filter(ch, prime);
    }
    return primes;
  }

  const n = +NUMBER_OF_PRIMES || 100;
  return findPrimes(n);
}

function calculateStreamSize() {
  let size = 0;
  for (let count = 0; count <= STREAM_SIZE; count++) {
    data = "data stream " + count + "\n";
    size += data.length;
  }
  return size;
}
