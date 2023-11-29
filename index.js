const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const chatRooms = new Map()

app.get('/:chatid?', (_, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.join(socket.handshake.query.chatid)
  console.log(socket.handshake.query.name, 'connected to:', socket.handshake.query.chatid)
  socket.broadcast.to(socket.handshake.query.chatid).emit('message', `${socket.handshake.query.name} joined the chat room`)

  socket.emit('welcome', chatRooms.get(socket.handshake.query.chatid))

  socket.on('disconnect', () => {
    console.log(socket.handshake.query.name, 'disconnected')
  })

  socket.on('message', (msg) => {
    chatRooms.set(socket.handshake.query.chatid, [...(chatRooms.get(socket.handshake.query.chatid) ?? []), msg])
    socket.broadcast.to(socket.handshake.query.chatid).emit('message', msg)
  })
})

server.listen(3000, () => {
  console.log('listening on http://localhost:3000');
})