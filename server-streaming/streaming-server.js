const http = require("http");
const fs = require("fs");
const path = require("path");

const FILENAME = "bigfile.txt";
const apiCallDelay = parseInt(process.env.API_CALL_DELAY_MS) || 5000;
const port = parseInt(process.env.PORT) || 3030;
const STREAM_SIZE = process.env.STREAM_SIZE || 1000000;

const server = http.createServer((req, res) => {
  if (req.url === "/stream") {
    const filePath = path.join(__dirname, FILENAME);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found");
      } else {
        const fileStream = fs.createReadStream(filePath);
        res.setHeader("Content-Type", "text/plain");
        fileStream.pipe(res);

        fileStream.on("error", (err) => {
          console.error(err);
          res.statusCode = 500;
          res.end("Internal Server Error");
        });
      }
    });
  } else if (req.url === "/api-call") {
    setTimeout(() => {
      const responseData = JSON.stringify({ data: "API response data" });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(responseData);
    }, apiCallDelay);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

function writeToFile(data) {
  const filePath = "bigfile.txt";

  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log(`Data has been written to ${filePath}`);
    }
  });
}

function createBigFile() {
  let data = "";
  for (let count = 0; count <= STREAM_SIZE; count++) {
    data += "data stream " + count + "\n";
  }
  return data;
}

writeToFile(createBigFile());

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
