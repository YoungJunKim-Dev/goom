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
io.on("connection", (socket) => {
  socket.on("update item", (arg1, arg2, callback) => {
    console.log(arg1); // 1
    console.log(arg2); // { name: "updated" }
    setTimeout(() => {
      callback({
        status: "ok",
      });
    }, 1000);
    socket.emit("callback test", () => {
      console.log("hello");
    });
  });
});

const cb = () => {
  console.log("print cb");
};

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
