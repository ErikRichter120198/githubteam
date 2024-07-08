const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"], // Allow only GET and POST requests
    allowedHeaders: ["Content-Type"], // Allow only headers with Content-Type
    credentials: true, // Enable credentials if necessary
  },
});

const PORT = 3000;

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("join", () => {
    const rooms = Array.from(io.sockets.adapter.rooms.keys()).filter(
      (room) => room !== socket.id
    );
    const room = rooms.find(
      (room) => io.sockets.adapter.rooms.get(room).size === 1
    );
    if (room) {
      socket.join(room);
      socket.to(room).emit("offer", socket.id, socket.id);
    } else {
      socket.join(socket.id);
    }
  });

  socket.on("offer", (id, description) => {
    socket.to(id).emit("offer", socket.id, description);
  });

  socket.on("answer", (id, description) => {
    socket.to(id).emit("answer", description);
  });

  socket.on("candidate", (candidate) => {
    socket.broadcast.emit("candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
