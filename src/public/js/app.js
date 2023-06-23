//socketIO
const socket = io();

//Call
const myFace = document.getElementById("myFace");
const audioButton = document.getElementById("audioButton");
const cameraButton = document.getElementById("cameraButton");
const cameraSelect = document.getElementById("cameras");

const call = document.getElementById("call");

//Peer Call
const peerFace = document.getElementById("peerFace");
const peerAudioButton = document.getElementById("peerAudioButton");
const peerCameraButton = document.getElementById("peerCameraButton");
const peerCameraSelect = document.getElementById("peerCameras");

const peerCall = document.getElementById("peerCall");

call.hidden = true;
peerCall.hidden = true;

let myStream;
let cameraState = true;
let audioState = true;
let roomName;
let myPeerConnection;

const getMedia = async (deviceId) => {
  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
};
const handleAudioClick = () => {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  audioState = !audioState;
  audioState
    ? (audioButton.innerText = "Mute")
    : (audioButton.innerText = "Audio On");
};
const handleCamerClick = () => {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));

  cameraState = !cameraState;
  cameraState
    ? (cameraButton.innerText = "Camera Off")
    : (cameraButton.innerText = "Camera On");
};
const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label == camera.label) {
        option.selected = true;
      }
      cameraSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
};

const handleCameraChange = async () => {
  await getMedia(cameraSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
};

audioButton.addEventListener("click", handleAudioClick);
cameraButton.addEventListener("click", handleCamerClick);
cameraSelect.addEventListener("input", handleCameraChange);

//Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

const initCall = async () => {
  welcome.hidden = true;
  call.hidden = false;
  peerCall.hidden = false;
  await getMedia();
  makeConnection();
};
const handleWelcomeSubmit = async (e) => {
  e.preventDefault();
  const input = welcomeForm.querySelector("input");
  roomName = input.value;
  await initCall();

  socket.emit("join_room", roomName);
  input.value = "";
};
const handleIceCandidate = (data) => {
  console.log("ice : ", data.candidate);
  console.log("sent ice");
  socket.emit("ice", data.candidate, roomName);
};
// const handleAddStream = (data) => {
//   console.log("get stream");
//   console.log(data);
//   peerFace.srcObject = data.stream;
// };
const handleTrack = (data) => {
  console.log("handle track");
  peerFace.srcObject = data.streams[0];
};

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

//Socket Code
socket.on("welcome", async () => {
  console.log("someone joined");
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent offer");
  socket.emit("offer", offer, roomName);
});
socket.on("offer", async (offer) => {
  console.log("received offer");
  myPeerConnection.setRemoteDescription(offer);

  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  console.log("sent answer");
  socket.emit("answer", answer, roomName);
});
socket.on("answer", (answer) => {
  console.log("received answer");
  myPeerConnection.setRemoteDescription(answer);
});
socket.on("ice", (data) => {
  console.log("ice added");
  myPeerConnection.addIceCandidate(data);
});
//RTC Code
const makeConnection = () => {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });

  myPeerConnection.addEventListener("icecandidate", handleIceCandidate);
  // myPeerConnection.addEventListener("addstream", handleAddStream);
  myPeerConnection.addEventListener("track", handleTrack);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
};
