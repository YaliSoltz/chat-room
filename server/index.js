const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const port = 4000;

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

function reset() {
  setTimeout(() => {
    users = [];
    messages = [];
    reset();
  }, 5000);
}
reset();

let users = []; // list of users
let messages = []; //list of messages

io.on("connection", (socket) => {
  console.log(socket.id);

  // add user
  socket.on("join server", (username, avatar) => {
    let user = { username, avatar, id: socket.id };
    users.push(user);
    console.log(username, "joined the server");
    io.emit("new user", users, messages);
  });

  // add room
  socket.on("join room", (roomNum, username) => {
    socket.join(roomNum);
    console.log(roomNum);
    socket.to(roomNum).emit("new member", `${username} joined the room`);
  });

  // send message
  socket.on("send message", (content, room, sender) => {
    let message = {
      content,
      room,
      username: sender.username,
      avatar: sender.avatar,
    };
    messages.push(message);
    console.log(message);
    socket.to(room).emit("new message", messages);
  });
});

server.listen(port, () => console.log(`running on port ${port}`));
