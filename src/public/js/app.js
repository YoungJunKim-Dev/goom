//socketIO
const socket = io();

//DOM variables
const nicknameSave = document.getElementById("nicknameSave");
const nicknameSaveForm = nicknameSave.querySelector("form");

const nicknameChange = document.getElementById("nicknameChange");
const nicknameChangeForm = nicknameChange.querySelector("form");

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

const room = document.getElementById("room");
const roomForm = room.querySelector("form");

//initial settings
room.hidden = true;
nicknameChange.hidden = true;
const roomChange = (rooms) => {
  const ul = welcomeForm.querySelector("ul");
  const roomH2 = welcomeForm.querySelector("h2");
  ul.innerHTML = "";
  if (rooms.length === 0) {
    roomH2.innerText = "Currently, No Room exists";
  } else {
    roomH2.innerText = "Opened Room List";
    rooms.forEach((room) => {
      const li = document.createElement("li");
      li.innerText = room;
      ul.appendChild(li);
    });
  }
};
socket.emit("room_list", roomChange);

let nickname = "annonymous";
let roomName;

//functions
const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
};
const showRoom = (name) => {
  welcome.hidden = true;
  room.hidden = false;
  const roomTitle = room.querySelector("h1");
  roomTitle.innerText = `Welcome to ${name} Room`;
};
const handleRoomSubmit = (event) => {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  roomName = input.value;
  socket.emit("enter_room", { roomName, nickname }, () => showRoom(roomName));
};
const handleMsgSubmit = (event) => {
  event.preventDefault();
  const input = roomForm.querySelector("input");
  const msg = input.value;
  socket.emit("submit_msg", { msg, roomName, nickname }, () => {
    addMessage(`You : ${msg}`);
  });
  input.value = "";
};
const handleNicknameSave = (event) => {
  event.preventDefault();
  const input = nicknameSaveForm.querySelector("input");
  nickname = input.value;
  const nicknameTitle = nicknameChangeForm.querySelector("h2");
  nicknameTitle.innerText = nickname;
  nicknameChange.hidden = false;
  nicknameSave.hidden = true;
  socket.emit("changed_nickname", { nickname });
};
const handleNicknameChange = (event) => {
  event.preventDefault();
  nicknameSave.hidden = false;
  nicknameChange.hidden = true;
};
//socket
socket.on("welcome", ({ msg }) => {
  addMessage(msg);
});
socket.on("bye", ({ msg }) => {
  addMessage(msg);
});
socket.on("submit_msg", ({ msg, nickname }) => {
  addMessage(`${nickname} : ${msg}`);
});
socket.on("changed_nickname", ({ nickname, oldNickname }) => {
  addMessage(`${oldNickname}'s nickname has changed to ${nickname}`);
});
socket.on("room_change", (rooms) => {
  console.log("here");
  roomChange(rooms);
});

//eventListeners
welcomeForm.addEventListener("submit", handleRoomSubmit);
roomForm.addEventListener("submit", handleMsgSubmit);

nicknameSaveForm.addEventListener("submit", handleNicknameSave);
nicknameChangeForm.addEventListener("submit", handleNicknameChange);
