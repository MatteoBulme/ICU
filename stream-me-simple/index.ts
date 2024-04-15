const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const NodeWebcam = require("node-webcam");
const serveStatic = require("serve-static");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const publicPath = path.join(__dirname, "public");
const webcam = NodeWebcam.create();

app.use(serveStatic(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  console.log("Client connected");

  const captureInterval = setInterval(() => {
    webcam.capture(path.join(publicPath, "output.jpg"), (err, data) => {
      if (!err) {
        io.emit("webcamData", { image: true, buffer: data });
        console.log(data);
        return;
      }

      console.error(err);
    });
  }, 1000);

  // Stop capturing when the client disconnects
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(captureInterval);
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
