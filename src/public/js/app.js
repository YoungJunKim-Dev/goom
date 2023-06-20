const messageList = document.querySelector("ul");
const nicknameForm = document.querySelector("#nickname");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => {
  const message = { type, payload };
  const msgStr = JSON.stringify(message);
  console.log(typeof msgStr);
  return msgStr;
};

socket.addEventListener("open", () => {
  console.log("front connected");
});

socket.addEventListener("close", () => {
  console.log("front disconnected");
});

socket.addEventListener("message", async (messageEvent) => {
  const message = await messageEvent.data;
  const li = document.createElement("li");
  li.innerText = message;
  messageList.append(li);
  console.log(message);
});

const handleSubmit = (event, type) => {
  event.preventDefault();
  let input = "";
  type === "message"
    ? (input = messageForm.querySelector("input"))
    : (input = nicknameForm.querySelector("input"));
  console.log(type);
  socket.send(makeMessage(type, input.value));
  input.value = "";
};

nicknameForm.addEventListener("submit", (event) => {
  handleSubmit(event, "nickname");
});
messageForm.addEventListener("submit", (event) => {
  handleSubmit(event, "message");
});
