const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  let room, user;

  socket.on('join-room', (roomId, userId) => {
    room = roomId
    user = userId

    socket.join(room)
    socket.to(room).broadcast.emit('user-connected', user)  // socket.io downgrade 필수
  })

  socket.on('disconnect', () => {
    socket.to(room).broadcast.emit('user-disconnected', user)
  })

  socket.on('message', data => {
    io.emit('message', data)
  })
})

server.listen(3000)