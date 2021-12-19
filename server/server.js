const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const bodyParser = require('body-parser');
const mysql = require('mysql');
const shortid = require('shortid');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.use('/peerjs', peerServer);
app.use(bodyParser.json());

function getToday() {
  var today = new Date();

  var year = today.getFullYear();
  var month = today.getMonth() + 1
  var day = today.getDate();

  var temp = year + "/" + month + "/" + day;
  return temp;
}

/******************************Video *********************************/

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../meetingnote/room_views'))
app.use('/meeting', express.static(path.join(__dirname, '../meetingnote/room_env')));

app.get('/meeting', (req, res) => { // 회의실 페이지는 res 렌더링으로 라우트
  res.render('room', { roomId: req.query.meet_id, userId: req.query.user_id, userName: req.query.user_name })
})

let rooms = {};

io.on('connection', socket => {
  let room, id, name;

  socket.on('joinRoom', (roomId, userId, userName) => {
    room = roomId
    id = userId
    name = userName

    if (rooms.hasOwnProperty(room) == false) {
      rooms[room] = {}
      rooms[room].members = []
      rooms[room].num = rooms[room].members.length
      rooms[room].chatArray = [] 
      rooms[room].contentArray = [] 
    }

    rooms[room].members.push(name)
    rooms[room].num = rooms[room].members.length
    
    socket.join(room)
    socket.to(room).broadcast.emit('userConnected', { id: id, name: name }) 
    io.to(room).emit('updateChat', { type: 'system', name: '[SYSTEM]', message: name + '님 입장' })
    io.to(room).emit('updateMembers', { num: rooms[room].num, members: rooms[room].members })
    console.log(name + ' 입장,' + ' 현재 멤버 : ' + rooms[room].members)
  })

  socket.on('message', (data) => {

    data.name = name
    if (data.type == 'mymessage') {
      socket.emit('updateChat', data)
    }
    else {
      chat = `${name}: ${data.message}`;
      rooms[room].contentArray.push(data.message);
      rooms[room].chatArray.push(chat);

      socket.to(room).broadcast.emit('updateChat', data)
    }
  })

  socket.on('disconnect', () => {
    rooms[room].members = rooms[room].members.filter((item) => item!=name)
    rooms[room].num = rooms[room].members.length
    console.log(rooms[room])
    if(rooms[room].num == 0){
      var contentInput = rooms[room].contentArray.toString();

      var sql = 'update meet set  meet_content=? where meet_id = ?';
      mysqlDB.query(sql, [contentInput,room], function (err, results) {
        if (err) console.log(err);
        else console.log('success input meetscript');
      });
      
      var msg = {'contents': contentInput,'room': room} // members는 말한 적 있는 사람만
      pub.publish('analysis_channel', JSON.stringify(msg));

      //scheduled meet 에서 삭제
      sql = 'UPDATE MEET SET ISFINISH = 1 WHERE MEET_ID=?';
      mysqlDB.query(sql, room, function (err, results) {
        if (err) console.log(err);
        else console.log('success delete scheduled meet');
      });

      delete rooms[room]
    }
    else{
      socket.to(room).broadcast.emit('userDisconnected', id)
      io.to(room).emit('updateChat', { type: 'system', name: '[SYSTEM]', message: name + '님 퇴장'})
      io.to(room).emit('updateMembers', { num: rooms[room].num, members: rooms[room].members})
    }
  })
})

/******************************redis *********************************/

const redis = require('redis');
const { Server } = require('http');
var pub,sub

if (process.env.NODE_ENV == 'production'){
  pub = redis.createClient(process.env.REDIS_URL);
  sub = redis.createClient(process.env.REDIS_URL);
  sub.subscribe('server');
  sub.on('subscribe',function(){
    console.log("=== Redis 연결 ===");
  }) 
}

else {
  pub = redis.createClient({
    host:'localhost',
    port: 6379,
    db: 0
  })
  sub = redis.createClient({
    host:'localhost',
    port: 6379,
    db: 0
  })
  
  sub.subscribe('server');
  sub.on('subscribe',function(){
    console.log("=== Redis 연결 ===");
  })
}

sub.on('message', function(channel, message){
  var msg = JSON.parse(message);
  switch(msg.type){
    case 'wordcloud':
      wordcloud = msg.data;
      break;
    case 'summary':
      summary = msg.data;
      break;
    case 'finish':
      inputDB(msg.room);
      break;
  }
})

var wordcloud = null, summary = null;

var inputDB = function(room){
  var sql = 'update meet set meet_wordcloud=?, meet_summary=? where meet_id=?';
  mysqlDB.query(sql, [wordcloud, summary,room], function(err, results){
    if(err) console.log(err);
    else {
      console.log('success input finishedmeet');
    }
  });
}

/******************************DB 연결 *********************************/

var mysqlDB;

if(process.env.NODE_ENV == 'production') {
  var db_config = {
    host: 'us-cdbr-east-04.cleardb.com',
    port: 3306,
    user: 'bbad6aa47dd3cf',
    password: 'b95a05e9',
    database: 'heroku_5ca53afc9e412f3'
  };

  mysqlDB = mysql.createPool(db_config);
}

else {
  var db_config = {
    host: 'localhost',
    port: 3306,
    user: 'joosang',
    password: 'joosang25^',
    database: 'mydb'
  };
  
  mysqlDB = mysql.createConnection(db_config);
}

/****************************** Frontend *********************************/

if (process.env.NODE_ENV == 'production') {

  app.use(express.static(path.join(__dirname, '../meetingnote/build')));

  // 일반 페이지는 react 빌드 파일로 라우트
  app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, '../meetingnote/build/index.html'));
  });
  app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../meetingnote/build/index.html'));
  });
  app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../meetingnote/build/index.html'));
  });
  app.get('/script', (req, res) => {
    res.sendFile(path.join(__dirname, '../meetingnote/build/index.html'));
  });
  app.get('/find_pw', (req, res) => {
    res.sendFile(path.join(__dirname, '../meetingnote/build/index.html'));
  });
  app.get('/pw_change', (req, res) => {
    res.sendFile(path.join(__dirname, '../meetingnote/build/index.html'));
  });

}

/****************************** Web server code *********************************/

app.post('/check_login', function (req, res) {
  var id = req.body.user_id;
  var pw = req.body.user_pw;
  var sql = 'SELECT * FROM USER WHERE user_id=? and user_pw = SHA2(?, 224)';
  mysqlDB.query(sql, [id,pw], function (err, results) {
    if (err) return res.send({ code: 11, msg: `${err}` });

    if (!results[0]) {
      return res.send({ code: 1, msg: "auth fail: id or pw wrong" });
    }
    else{
      var user = results[0];
      return res.send({ code: 0, msg: "request success", user_id: user.user_id, user_name: user.user_name });
    }
  });
}
);

//  회원 등록
app.post('/registration', function (req, res) {
  var id = req.body.user_id;
  var pw = req.body.user_pw;
  var name = req.body.user_name;
  var phone = req.body.user_phone;
  var sql = 'INSERT INTO USER(user_id, user_pw, user_name, user_phone) VALUE(?, SHA2(?,224), ?, ?)';
  mysqlDB.query(sql, [id, pw, name, phone], function (err, results) {
    if (err) {
      console.log(err);
      return res.send({ code: 3, msg: `${err}` });
    }
    else return res.send({ code: 0, msg: "request success" });
  });
});

//비밀번호 찾기
app.post('/find', function(req, res){
  var id = req.body.user_id;
  var phone = req.body.user_phone;
  var sql = 'SELECT user_pw FROM USER WHERE user_id = ? AND user_phone=?';
  mysqlDB.query(sql, [id, phone], function (err, results) {
    if (err) {
      console.log(err);
      return res.send({ code: 3, msg: `${err}` });
    }
    else return res.send({ code: 0, msg: "request success"});
  });
});

//비밀번호 바꾸기
app.post('/change', function(req, res){
  var pw = req.body.user_pw;
  var id = req.body.user_id;
  var sql = 'UPDATE USER SET user_pw = SHA2(?, 224) WHERE user_id = ?';
  mysqlDB.query(sql, [pw, id], function (err, results) {
    if (err) {
      console.log(err);
      return res.send({ code: 3, msg: `${err}` });
    }
    else return res.send({ code: 0, msg: "request success"});
  });
}); 

// 회의 만들기
app.post('/meet_create', function (req, res) {
  var meet_name = req.body.meet_name;
  var meet_id = shortid.generate();
  var meet_date = getToday(); 
  var meet_time = getTime();

  var sql = 'INSERT INTO MEET VALUE(?,?,?,"","","",?,0)';
  mysqlDB.query(sql, [meet_name, meet_id, meet_date, meet_time], function (err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}`});
    else {
      return res.send({ code: 0, msg: "request success", id: meet_id});
    }
  });
});

// 회의방 입장 전 유효한 회의방 인지 확인
app.post('/meet_valid', function (req, res) {
  var meet_id = req.body.meet_id;
  var sql = 'SELECT * FROM MEET WHERE meet_id=?';
  mysqlDB.query(sql, meet_id, function (err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}`});
    else if (!results[0]) return res.send({ code: 31, msg: "meet fail: meet_name not exist"});
    else  {
      sql = 'SELECT * FROM MEET WHERE meet_id=?';
      mysqlDB.query(sql, meet_id, function (err, results) {
        if (err)  return res.send({ code: 11, msg: `${err}`});
        else {
          if (results[0].isfinish === 1) {
            return res.send({ code: 36, msg: "meet fail: invalid meet" });
          }
          else {
            return res.send({ code: 0, msg: "request success", id: results[0].meet_id});
          }
        }
      })
    }
  })
});

//  끝난 회의 목록
app.post('/meet_list', function (req, res) {
  var sql = 'SELECT * FROM MEET ORDER BY meet_date DESC, meet_time DESC';
  mysqlDB.query(sql, function (err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}`});
    else  return res.send({ code: 0, msg: "request success", lists: results});
  })
});

//  끝난 회의 삭제
app.post('/meet_delete', function (req, res) {
  var meet_id = req.body.meet_id;
  var sql = 'SELECT * FROM MEET WHERE MEET_ID=?';
  mysqlDB.query(sql, meet_id, function(err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}`});
    else {
      var wc = results[0].wordcloud;
      if (wc != null || wc === "") {
        var filename = wc.substring(9, wc.length);
        fs.unlink(img_folder + filename, function(err) {
          if (err)  console.log('파일 삭제 에러:' + err);
        })
      }
      sql = 'DELETE FROM MEET WHERE MEET_ID=?';
      mysqlDB.query(sql, meet_id, function (err, results2) {
        if (err)  return res.send({ code: 11, msg: `${err}`});
        else {
          res.send({ code: 0, msg: "request success"})
        }
      })
    }
  })
});

//  끝난 회의 스크립트 확인
app.post('/meet_open', function (req, res) {
  var meet_id = req.body.meet_id;
  var sql = 'SELECT * FROM MEET WHERE MEET_ID=?';
  mysqlDB.query(sql, meet_id, function (err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}`});
    else {
      if(!results[0]) return res.send({ code: 37, msg: "meet script not exists" });
      else {
        return res.send({ code: 0, msg: "request success"});
      }
    }
  })
});

//  끝난 회의 채팅 출력
app.post('/meet_chat', function (req, res) {
  var meet_id = req.body.meet_id;
  var sql = 'SELECT meet_content FROM MEET WHERE MEET_ID=?';
  mysqlDB.query(sql, meet_id, function (err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}`});
    else {
      if(!results[0]) return res.send({ code: 37, msg: "meet script not exists"});
      else return res.send({ code: 0, msg: "request success", chat: results[0].meet_content});
    }
  })
});

//  끝난 회의 정보 출력
app.post('/meet_info', function (req, res) {
  var meet_id = req.body.meet_id;
  var sql = 'SELECT * FROM MEET WHERE MEET_ID=?';
  mysqlDB.query(sql, meet_id, function (err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}` });
    else {
      if(!results[0]) {
        return res.send({ code: 31, msg: "meet fail: meet_id not exist" });
      }
      else {
        return res.send({ code: 0, msg: "meet success", data: results[0] });
      }
    }
  })
});

var PORT = process.env.PORT || 3002;
console.log(`running to ${PORT}`);
server.listen(PORT)