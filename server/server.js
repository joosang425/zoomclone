const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const bodyParser = require('body-parser');
const mysql = require('mysql');
const shortid = require('shortid');
const path = require('path');

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.use('/peerjs', peerServer);
app.use(bodyParser.json());

/******************************Video *********************************/

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../meetingnote/meetingroom_views'))
app.use('/meeting', express.static(path.join(__dirname, '../meetingnote/meetingroom_public')));

app.get('/meeting', (req, res) => { // 회의실 페이지는 res 렌더링으로 라우트
  res.render('room', { roomId: req.query.meet_id, userId: req.query.user_id, userName: req.query.user_name })
})

let rooms = {};

io.on('connection', socket => {
  let room, user;

  socket.on('join-room', (roomId, userId) => {
    room = roomId
    user = userId
    
    socket.join(room)
    socket.to(room).broadcast.emit('user-connected', user) 
  })

  socket.on('disconnect', () => {
    socket.to(room).broadcast.emit('user-disconnected', user)
  })

  socket.on('message', data => {
    io.emit('message', data)
  })
})

/******************************DB 연결 *********************************/

var mysqlDB;

var db_config = {
  host: 'localhost',
  port: 3306,
  user: 'joosang',
  password: 'joosang25^',
  database: 'mydb'
};

mysqlDB = mysql.createConnection(db_config);

/******************************frontend *********************************/

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

app.post('/meet_create', function (req, res) {
  var meet_id = shortid.generate();
  var sql = 'INSERT INTO MEET VALUE(?,0)';
  mysqlDB.query(sql, meet_id, function (err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}`});
    else {
      return res.send({ code: 0, msg: "request success"});
    }
  });
});

app.post('/meet_valid', function (req, res) {
  var meet_id = req.body.meet_id;
  var sql = 'SELECT meet_id FROM MEET WHERE MEET_ID=?';
  mysqlDB.query(sql, meet_id, function (err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}`});
    else if (!results[0]) return res.send({ code: 31, msg: "meet fail: meet_id not exist"});
    else  return res.send({ code: 0, msg: "request success"});
  })
});

var PORT = process.env.PORT || 3002;
console.log(`running to ${PORT}`);
server.listen(PORT)