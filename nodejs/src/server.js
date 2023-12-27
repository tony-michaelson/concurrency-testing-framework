const http = require("http");
const {
  Worker,
  parentPort,
  isMainThread,
  workerData,
} = require("worker_threads");

const streamingServer = process.env.STREAMING_SERVER;
const streamingServerPort = process.env.STREAMING_SERVER_PORT;
const numberOfPrimes = process.env.NUMBER_OF_PRIMES;
const stringConcatSize = process.env.STRING_CONCAT_SIZE;

if (isMainThread) {
  const server = http.createServer((req, res) => {
    const url = new URL(
      `http://localhost:${process.env.PORT || 3000}${req.url}`
    );
    const pathname = url.pathname;

    if (pathname === "/input" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          const inputData = JSON.parse(body);
          const size = walkObject(inputData);
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Processed Input: " + size + " elements");
        } catch (error) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end(`Error: ${error.message}`);
        }
      });
    } else if (pathname === "/string-concat" || pathname === "/cpu") {
      setupWorker(req, res, pathname);
    } else if (pathname === "/consume") {
      handleConsumeRequest(req, res);
    } else if (pathname === "/hello") {
      handleHelloRequest(req, res);
    } else if (pathname === "/api-call") {
      handleAPICallRequest(req, res);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} else {
  handleRequestWithWorker(workerData);
}

function setupWorker(req, res, pathname) {
  const worker = new Worker(__filename, {
    workerData: { url: pathname },
  });

  worker.on("message", (result) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(result);
  });

  worker.on("error", (error) => {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`Error: ${error.message}`);
  });
}

async function handleRequestWithWorker(workerData) {
  const { url } = workerData;

  if (url === "/string-concat") {
    const result = performStringOperation();
    parentPort.postMessage(result);
  } else if (url === "/cpu") {
    try {
      const result = await performMathOperation();
      parentPort.postMessage(JSON.stringify(result));
    } catch (error) {
      parentPort.postMessage(`Error: ${error.message}`);
    }
  }
}

function handleConsumeRequest(req, res) {
  const options = {
    hostname: streamingServer,
    port: streamingServerPort,
    path: "/stream",
    method: "GET",
  };

  const request = http.request(options, (response) => {
    let data = "";

    response.on("data", (chunk) => {
      data += chunk;
    });

    response.on("end", () => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(data);
    });
  });

  request.on("error", (error) => {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`Error: ${error.message}`);
  });

  request.end();
}

function handleHelloRequest(req, res) {
  // Handle the "/hello" route logic in the main thread
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello!");
}

function handleAPICallRequest(req, res) {
  // Handle the "/api-call" route logic in the main thread
  simulateAPICall()
    .then((response) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(response);
    })
    .catch((error) => {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(`Error: ${error.message}`);
    });
}

// Rest of the functions remain the same

function walkObject(obj, depth = 0) {
  let elementCount = 0;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      elementCount++;

      if (typeof value === "object" && !Array.isArray(value)) {
        elementCount += walkObject(value, depth + 1); // todo; tco optimize
      }
    }
  }
  return elementCount;
}

function performStringOperation() {
  let result = "";
  for (let i = 0; i < stringConcatSize; i++) {
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

  const n = +numberOfPrimes || 100;
  return findPrimes(n);
}

function simulateAPICall() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: streamingServer,
      port: streamingServerPort,
      path: "/api-call",
      method: "GET",
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve(data);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}
