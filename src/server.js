import express from "express";
import { Server } from "socket.io";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";
const __dirname = path.resolve();

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");
app.use("/public", express.static(__dirname + "/src/public"));
app.get("/", (req, res) => res.render("home"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const io = new Server(server);
//realtime chat with socketIO
const getPublicRooms = () => {
  const { rooms, sids } = io.sockets.adapter;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });

  return publicRooms;
};
io.on("connection", (socket) => {
  socket["nickname"] = "annonymous";
  socket.on("enter_room", ({ roomName, nickname }, showRoom) => {
    showRoom();
    socket.join(roomName);
    socket["nickname"] = nickname;
    //send message except myself
    socket
      .to(roomName)
      .emit("welcome", { msg: `${socket["nickname"]} joined` });
    io.sockets.emit("room_change", getPublicRooms());
  });
  socket.on("room_list", (getRoomList) => {
    getRoomList(getPublicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", { msg: `${socket["nickname"]} left` });
    });
  });
  socket.on("disconnect", () => {
    io.sockets.emit("room_change", getPublicRooms());
  });
  socket.on("submit_msg", ({ msg, roomName, nickname }, done) => {
    socket.to(roomName).emit("submit_msg", { msg, nickname });
    done();
  });
  socket.on("changed_nickname", ({ nickname }) => {
    const oldNickname = socket.nickname;
    socket["nickname"] = nickname;
    socket.rooms.forEach((room) => {
      socket.to(room).emit("changed_nickname", { nickname, oldNickname });
    });
  });
});

server.listen(3000, handleListen);

//realtime chat with websocket
// //socket list
// const sockets = [];

// wss.on("connection", (socket) => {
//   console.log("back connected");
//   sockets.push(socket);
//   socket["nickname"] = "annonymous";
//   //get Message
//   socket.on("message", (msg) => {
//     const { type, payload } = JSON.parse(msg);
//     switch (type) {
//       case "message":
//         sockets.forEach((sk) => {
//           sk.send(`${socket.nickname} : ${payload}`);
//         });
//         break;
//       case "nickname":
//         socket["nickname"] = payload;
//         break;
//       default:
//         break;
//     }
//   });
//   //close
//   socket.on("close", () => {
//     console.log("disconnected");
//   });
// });
