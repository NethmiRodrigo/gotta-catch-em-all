const http = require("http");
const fs = require("fs");
const path = require("path");

const hostname = "0.0.0.0"; // This will make your server accessible on all network interfaces
const port = 3000; // You can change this to any available port you prefer

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, "index.html");
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading index.html");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
