import express from "express";
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
const wss = new WebSocketServer({ server });

//realtime chat with websocket
//socket list
const sockets = [];

wss.on("connection", (socket) => {
  console.log("back connected");
  sockets.push(socket);
  socket["nickname"] = "annonymous";
  //get Message
  socket.on("message", (msg) => {
    const { type, payload } = JSON.parse(msg);
    switch (type) {
      case "message":
        sockets.forEach((sk) => {
          sk.send(`${socket.nickname} : ${payload}`);
        });
        break;
      case "nickname":
        socket["nickname"] = payload;
        break;
      default:
        break;
    }
  });
  //close
  socket.on("close", () => {
    console.log("disconnected");
  });
});

server.listen(3000, handleListen);
