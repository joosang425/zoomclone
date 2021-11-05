const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const bodyParser = require('body-parser');
const mysql = require('mysql');
const shortid = require('shortid');
const path = require('path');
const fs = require('fs');

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
      rooms[room].chatDict = {} 
    }

    rooms[room].members.push(name)
    rooms[room].num = rooms[room].members.length
    rooms[room].chatDict[id] = ''
    
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
      rooms[room].chatDict[id] += data.message

      socket.to(room).broadcast.emit('updateChat', data)
    }
  })

  socket.on('disconnect', () => {
    socket.to(room).broadcast.emit('userDisconnected', id)
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
  var meet_name = req.body.meet_name;
  var meet_id = shortid.generate();
  var meet_date = getToday(); 

  var sql = 'INSERT INTO MEET VALUE(?,?,?,"","","",0)';
  mysqlDB.query(sql, [meet_name, meet_id, meet_date], function (err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}`});
    else {
      return res.send({ code: 0, msg: "request success"});
    }
  });
});

app.post('/meet_valid', function (req, res) {
  var meet_name = req.body.meet_name;
  var sql = 'SELECT * FROM MEET WHERE meet_name=?';
  mysqlDB.query(sql, meet_name, function (err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}`});
    else if (!results[0]) return res.send({ code: 31, msg: "meet fail: meet_name not exist"});
    else  {
      sql = 'SELECT isfinish FROM MEET WHERE meet_name=?';
      mysqlDB.query(sql, meet_name, function (err, results) {
        if (err)  return res.send({ code: 11, msg: `${err}`});
        else {
          if (results[0].isfinish === 1) {
            return res.send({ code: 36, msg: "meet fail: invalid meet" });
          }
          else {
            return res.send({ code: 0, msg: "request success" });
          }
        }
      })
    }
  })
});

app.post('/meet_list', function (req, res) {
  var sql = 'SELECT meet_name, meet_date FROM MEET ORDER BY meet_date DESC';
  mysqlDB.query(sql, function (err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}`});
    else  return res.send({ code: 0, msg: "request success", lists: results});
  })
});

app.post('/meet_delete', function (req, res) {
  var meet_name = req.body.meet_name;
  var sql = 'DELETE FROM MEET WHERE MEET_NAME=?';
  mysqlDB.query(sql, meet_name, function (err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}`});
    else {
      res.send({ code: 0, msg: "request success"});
    }
  })
});

app.post('/meet_open', function (req, res) {
  var meet_name = req.body.meet_name;
  var sql = 'SELECT * FROM MEET WHERE MEET_NAME=?';
  mysqlDB.query(sql, meet_name, function (err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}`});
    else {
      if(!results[0]) return res.send({ code: 37, msg: "meet script not exists" });
      else {
        return res.send({ code: 0, msg: "request success"});
      }
    }
  })
});

app.post('/meet_chat', function (req, res) {
  var meet_name = req.body.meet_name;
  var sql = 'SELECT meet_content FROM MEET WHERE MEET_NAME=?';
  mysqlDB.query(sql, meet_name, function (err, results) {
    if (err)  return res.send({ code: 11, msg: `${err}`});
    else {
      if(!results[0]) return res.send({ code: 37, msg: "meet script not exists"});
      else return res.send({ code: 0, msg: "request success", chat: results[0].meet_content});
    }
  })
});

var PORT = process.env.PORT || 3002;
console.log(`running to ${PORT}`);
server.listen(PORT)