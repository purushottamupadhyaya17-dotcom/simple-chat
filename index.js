const http = require("http");
const fs = require("fs");
const { Server } = require("socket.io");

const MESSAGE_FILE = "messages.json";

// Load old messages
let messages = [];
if (fs.existsSync(MESSAGE_FILE)) {
  messages = JSON.parse(fs.readFileSync(MESSAGE_FILE));
}

const server = http.createServer((req, res) => {
  const html = fs.readFileSync("index.html");
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
});

const io = new Server(server);

io.on("connection", socket => {
  // Send old messages to new user
  socket.emit("load messages", messages);

  socket.on("chat message", msg => {
    messages.push(msg);

    // Save to file
    fs.writeFileSync(MESSAGE_FILE, JSON.stringify(messages, null, 2));

    // Send to everyone
    io.emit("chat message", msg);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});