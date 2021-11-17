const socket = io();

const peer = new Peer(USER_ID, { 
});

const peers = {};

let room_id, user_id, user_name;

// peer 서버와 정상적으로 통신이 되면 'open' event 발생
// 'open' event 발생하면 'joinRoom' event emit
peer.on('open', peerid => {
  room_id = ROOM_ID;
  user_id = USER_ID;
  user_name = USER_NAME;
  console.log('[PEER CONNECTED]' + room_id, user_id, user_name);
  socket.emit('joinRoom', room_id, user_id, user_name);
});

socket.on('connect', function() {
  room_id = ROOM_ID;
  user_id = USER_ID;
  user_name = USER_NAME;
  console.log('[SOCKET CONNECTED]' + room_id, user_id, user_name);
});

const videoGrid = document.getElementById('video-grid');

// 내 비디오 요소들
const myVideoBx = document.createElement('div');
const myNameTag = document.createElement('div');
const myVideo = document.createElement('video');
myVideo.muted = true;

let myVideoStream;
let currentPeer;

// 유저의 브라우저로부터 Media Device들을 받아오는 과정
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream
    user_name = USER_NAME
    // 내 stream을 브라우저에 추가
    addVideoStream(myVideoBx, myNameTag, myVideo, user_name, stream);

    // caller의 call에 대한 응답
    peer.on('call', call => {
      call.answer(stream);
      const callerVideoBx = document.createElement('div');
      const callerNameTag = document.createElement('div');
      const callervideo = document.createElement('video');
      var callerName = call.metadata.callerName;
      call.on('stream', (userVideoStream) => {
        addVideoStream(callerVideoBx, callerNameTag, callervideo, callerName, userVideoStream);
        currentPeer = call.peerConnection
      });
    });

    // 새로운 유저가 접속하면 서버로부터 그 유저의 userID를 받아온 후 연결
    socket.on('userConnected', data => {
      setTimeout(() => {connectToNewUser(data.id, data.name, stream)}, 2000)
    });
});

function connectToNewUser(userId, calleeName, stream) {
  const call = peer.call(userId, stream, {metadata: {callerName: USER_NAME}});
  const calleeVideoBx = document.createElement('div');
  const calleeNameTag = document.createElement('div');
  const calleevideo = document.createElement('video');

  // callee가 응답하면
  call.on('stream', (userVideoStream) => {
    addVideoStream(calleeVideoBx, calleeNameTag, calleevideo, calleeName, userVideoStream);
    currentPeer = call.peerConnection
  });

  call.on('close', () => {
    removeVideoStream(calleevideo, stream);
  });

  peers[userId] = call;
}

function addVideoStream(videoBx, nameTag, video, userName, stream) {
  videoBx.style.marginRight = '10px';

  let nameText = document.createTextNode(userName);
  nameTag.className = 'nameTag';
  if(!nameTag.hasChildNodes())  nameTag.appendChild(nameText);

  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });

  videoBx.append(nameTag);
  videoBx.append(video);
  videoGrid.append(videoBx);

  if(videoGrid.childElementCount > 4) {
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

socket.on('userDisconnected', userId => {
  if (peers[userId]) peers[userId].close();
});

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

    socket.emit('message', {type: 'mymessage', message: message, time: getTime()});
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
    var node = document.createTextNode(`${data.name} ${data.message}`)
    bold.appendChild(node)
    msg.appendChild(bold)
  }
  else {
    var part1 = document.createTextNode(`${data.name}`)
    var part2 = document.createTextNode(`${data.time}`)
    var part3 = document.createTextNode(`${data.message}`)
    var br = document.createElement('br')
  
    bold.appendChild(part1)
    msg.appendChild(bold)
    msg.appendChild(part2)
    msg.appendChild(br)
    msg.appendChild(part3)
  }

  switch(data.type) {
    case 'mymessage':
      className = 'me'
      break
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

/************************************ 사용자 목록 ************************************/

socket.on('updateMembers', (data) => {
  var members = document.getElementById('memberList');

  while(members.hasChildNodes()) {
    members.removeChild(members.firstChild)
  }

  for(var i = 0; i < data.num; i++) {
    var node = document.createTextNode(`${data.members[i]}`)
    var member = document.createElement('a')
    member.appendChild(node)
    members.appendChild(member)
  }
})

function memberList() {
  document.getElementById('memberList').classList.toggle("show")
}

window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown__content")
      var i
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i]
        if (openDropdown.classList.contains('show')) {
           openDropdown.classList.remove('show')
        }
     }
  }
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

const shareScreen = () => {
  navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: "always"
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true
    }
  }).then((stream) => {
    let videoTrack = stream.getVideoTracks()[0];
    videoTrack.onended = function() {
      stopScreenShare();
    }
    let sender = currentPeer.getSenders().find(function(s) {
      return s.track.kind == videoTrack.kind
    })
    sender.replaceTrack(videoTrack)
  }).catch((err) => {
    console.log("unable to get display media" + err)
  })
}

function copyToClipboard(val) {
  var t = document.createElement("textarea");
  document.body.appendChild(t);
  t.value = val;
  t.select();
  document.execCommand('copy');
  document.body.removeChild(t);
}

const linkShare = () => {
  copyToClipboard(room_id);
  alert("회의 방 ID가 복사되었습니다.");
}

const stopScreenShare = () => {
  let videoTrack = myVideoStream.getVideoTracks()[0];
  var sender = currentPeer.getSenders().find(function(s) {
    return s.track.kind == videoTrack.kind;
  })
  sender.replaceTrack(videoTrack)
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

$(window).on('beforeunload', function() {
  opener.location.reload()
});

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

  socket.emit('message', {type: 'mymessage', message: speechContent, time: getTime('mymessage')})
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
  if(myVideoStream.getAudioTracks()[0].enabled) {
    recognition.start()
  }
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