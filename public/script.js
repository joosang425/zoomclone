const socket = io('/');

const myPeer = new Peer();
const peers = {};

const videoGrid = document.getElementById('video-grid');

const myVideoBx = document.createElement('div');
const myNameTag = document.createElement('div');
const myVideo = document.createElement('video');
myVideo.muted = true;

const chatlist = document.querySelector(".chatting-list");

let myVideoStream;
// 유저의 브라우저로부터 Media Device들을 받아오는 과정
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream
    addVideoStream(myVideoBx, myNameTag, myVideo, stream);
    myPeer.on('call', call => {
      call.answer(stream);
      const callerVideoBx = document.createElement('div');
      const callerNameTag = document.createElement('div');
      const callerVideo = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(callerVideoBx, callerNameTag, callerVideo, userVideoStream);
      });
    });

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream);
    });
});

socket.on('message', data => {
  const li = document.createElement("li");
  li.innerHTML = `${data.message} - ${data.time}`
  chatlist.appendChild(li);
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const calleeVideoBx = document.createElement('div');
  const calleeNameTag = document.createElement('div')
  const calleeVideo = document.createElement('video');

  call.on('stream', (userVideoStream) => {
    addVideoStream(calleeVideoBx, calleeNameTag, calleeVideo, userVideoStream);
  });

  call.on('close', () => {
    removeVideoStream(calleeVideo, stream);
  });

  peers[userId] = call;
}

function addVideoStream(videoBx, nameTag, video, stream) {
  videoBx.style.marginRight = '10px';
  videoBx.style.marginBottom = '10px';

  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });

  videoBx.append(nameTag);
  videoBx.append(video);

  videoGrid.append(videoBx);

  if(videoGrid.childElementCount > 4){
    videoGrid.style.gridTemplateColumns = "1fr 1fr 1fr";
  }
}

function removeVideoStream(video, stream) {
  video.srcObject = stream;
  const videoParent = video.parentNode;
  videoGrid.removeChild(videoParent);
  if(videoGrid.childElementCount <= 4) {
    videoGrid.style.gridTemplateColumns = "1fr 1fr";
  }
}
/************************************ 채팅 송수신 ************************************/

$('html').keydown((e) => {
  if (e.which == 13) {
    send()
  }
})

function send() {
  var message = document.getElementById('chat_message').value;
  if(message.length !== 0) {
    document.getElementById('chat_message').value = '';

    socket.emit('message', {type: 'message', message: message, time: getTime()});
  }
}

function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function getTime(){
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  // add a zero in front of numbers<10
  m = checkTime(m);
  var time = h + ":" + m;
  return time;
}

socket.on('updateChat', (data) => {
  var chat = document.getElementById('chat')
  var msg = document.createElement('div')
  var bold = document.createElement('strong')
  var className = ''

  if(data.type == "system") {
    var node = document.createTextNode(`${data.message}`)
    bold.append(node)
    msg.appendChild(bold)
  }
  else {
    var part1 = document.createTextNode(`${data.time}`)
    var part2 = document.createTextNode(`${data.message}`)
    var br = document.createElement('br')
  
    msg.appendChild(part2)
    msg.appendChild(br)
    msg.appendChild(part1)
  }

  switch(data.type) {
    case 'message':
      className = 'other'
      break
    case 'system':
      className = 'system'
      break
  }

  msg.classList.add(className)
  chat.appendChild(msg)
  scrollToBottom()
})

const scrollToBottom = () => {
  $('#chat').scrollTop($('#chat').prop("scrollHeight"));
}

/************************************ 버튼 기능 함수들 ************************************/

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
    recognition.stop();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
    recognition.start();
  }
}
  
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const exit = () => {
  if(confirm("회의에서 나가시겠습니까?")){
    self.close()
  }
}

const setMuteButton = () => { 
  const html = `<i class="fas fa-microphone fa-lg"></i><span>Mic off</span>`
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `<i class="fas fa-microphone-slash fa-lg"></i><span>Mic on</span>`
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => { 
  const html = `<i class="fas fa-video fa-lg"></i><span>Cam off</span>`
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `<i class="fas fa-video-slash fa-lg"></i><span>Cam on</span>`
  document.querySelector('.main__video_button').innerHTML = html;
}


/************************************ 음성 인식 시작 \************************************/

try{
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
}
catch(e){
  console.error(e);
  $('.no-browser-support').show();
  alert('Google Chrome에서만 동작합니다.')
}

var speechContent = '';

recognition.continuous = true;
recognition.lang = "ko-KR";
var recognizing = false;

recognition.onresult = function(event) {
  var current = event.resultIndex;

  var transcript = event.results[current][0].transcript;

  if(typeof(event.results) == 'undefined'){
    console.log("undefined start")
    recognition.stop()
    recognizing = false
    recognition.start()
    console.log("undefined end")
    return;  
  }

  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

  if(!mobileRepeatBug) {
    speechContent += transcript;
  }

  //socket.emit('message', {type: 'mymessage', message: speechContent, time: getTime('mymessage')})
  socket.emit('message', {type: 'message', message: speechContent, time: getTime('message')})

  speechContent = '';
};

recognition.onstart = function() {
  console.log('Voice recognition activated.')
  recognizing = true;
}

recognition.onend = function() {
  console.log("ONEND");
  recognition.stop();
  recognizing = false;
}

recognition.onerror = function(event) {
  console.log("ERROR");
  recognizing = false;
  recognition.stop();
  if(event.error == 'no-speech'){
    console.log("NO SPEECH");
  }
  if(event.error == 'audio-capture'){
    console.log("Capture Problem");
  }
  if(event.error == 'not-allowed') {
    if(event.timeStamp - start_timestamp < 100) {
      console.log("Block");
    }
    else{
      console.log("Deny");
    }
  }
}

recognition.start();