'use strict';

const express = require('express');
const cors = require('cors');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');
io.listen(server);

// const link = require('../public/js/app.js')


app.set('view engine', 'ejs');
app.use(cors());
app.use(express.static('./public'));

let currentRoom;
const queue = {
  tickets: [],
  staff: [],
};


// app.get('/', (req, res) => {
//   res.render('index');
// });

// app.get('/:id', (req, res) => {
//   res.render('index');
// });

io.on('connection', (socket) => {
  console.log('a user Connected', socket.id);
  socket.on('join', (payload) => {
    currentRoom = payload.room;
    socket.join(currentRoom);
    console.log(currentRoom);
    const data = {id: socket.id };
    queue.staff.push(data);
  });

  socket.on('createTicket', (payload) => {
    const data = { id: uuidv4(), ...payload };
    queue.tickets.push(data);
    socket.in(currentRoom).emit('newTicket', { ...data, socketId: socket.id }); // 3s
  });

  socket.on('getall', () => {
    queue.staff.forEach((staff) => {
      socket.emit('', { name: staff.name });
    });
    queue.tickets.forEach((ticket) => {
      socket.emit('newTicket', ticket);
    });
  });
  socket.on('disconnect', () => {
    socket.to(currentRoom).emit('offlineStaff', { id: socket.id });
    queue.staff = queue.staff.filter((s) => s.id !== socket.id);
  });
});

// console.log(link);


module.exports = {
  server,
  app,
  io,
};
