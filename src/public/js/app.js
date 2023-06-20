const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const hello = () => {
  console.log(hello);
};
const handleRoomSubmit = (event) => {
  event.preventDefault();
  const input = form.querySelector("input");
  //socket io에서는 object 전송가능
  socket.emit("update item", "1", { name: "updated" }, (response) => {
    console.log(response.status); // ok
  });
};
socket.on("callback test", (cb) => {
  setTimeout(() => {
    cb();
  }, 3000);
});
form.addEventListener("submit", handleRoomSubmit);
