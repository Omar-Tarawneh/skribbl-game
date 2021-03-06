'use strict';

const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
// const words = require('./data/words.json');
const { formatMessage, guessPoints } = require('./utils/messages');

const { userJoin, getCurrentUser, userLeave } = require('./utils/users');

const queue = {
  staff: [],
  words: [],
};
let trn = 0;
let allPlayers = 0;
let players = [];
let current_turn = 0;
let timeOut;
let _turn = 0;
const MAX_WAITING = 20000;

const skribbleBot = 'Skribble Bot';
const PORT = 3000 || process.env.PORT;
// set Static folder
app.use(express.static(path.join(__dirname, 'public')));

function onConnection(socket, room) {
  socket.on('drawing', (data) => {
    socket.broadcast.to(room).emit('drawing', data);
  });
}

io.on('connection', (socket) => {
  // console.log("A player connected", socket.id);

  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    allPlayers++;
    const data = {
      name: username,
      room: user.room,
      id: socket.id,
      points: user.points,
    };
    queue.staff.push(data);
    players.push(socket);
    console.log(players[0].id, '============players========');

    // welcome current player
    socket.emit(
      'message',
      formatMessage(skribbleBot, 'Welcome to Skribble Game')
    );
    // broadcast to other playes that someone join
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(skribbleBot, `${user.username} has joined the game`)
      );
    // send players info
    socket.to(user.room).emit('roomPlayers', data);
    // socket.to(user.room).emit('room', data);

    socket.on('getall', () => {
      queue.staff.forEach((staff) => {
        socket.emit('roomPlayers', {
          name: staff.name,
          room: staff.room,
          id: staff.id,
          points: staff.points,
        });
      });
    });
    socket.on('pass_turn', function () {
      if (players[trn] == socket) {
        // players[trn].emit('showword', 'test');
        resetTimeOut();
        next_turn();
        io.emit('hide', true);
      }
    });
  });

  socket.on('drawing', (data) => {
    io.emit('drawing', data);
  });
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', guessPoints(user, msg, queue.words[0]));
    if (
      guessPoints(user, msg, queue.words[0]).text ==
      `${user.username} guess the word`
    ) {
      user.points++;
      console.log('condition work', user);
      io.emit('point', user);
    }
    queue.words.pop();
  });
  socket.on('word', (word) => {
    const user = getCurrentUser(socket.id);
    queue.words.push(word);
  });

  socket.on('disconnect', () => {
    socket.to('room1').emit('offlineStaff', { id: socket.id });

    const user = userLeave(socket.id);

    queue.staff = queue.staff.filter((s) => s.id !== socket.id);

    console.log('A player disconnected');
    players.splice(players.indexOf(socket), 1);
    allPlayers = queue.staff.length;
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(skribbleBot, `${user.username} has left the Game`)
      );
    }
  });
});

function next_turn() {
  players[trn].emit('start turn', 'A player connected');
  triggerTimeout();
  console.log(allPlayers, '=============', trn, players.length);
  trn++;
  console.log(allPlayers, '=============', trn);
  console.log(allPlayers, '=============', trn);
}

function triggerTimeout() {
  _turn = current_turn++ % players.length;

  timeOut = setTimeout(() => {
    console.log('=====trn====', trn);
    if (trn >= players.length || players[trn] == undefined) {
      console.log('=====trn==in==', trn);
      players[trn - 1].emit('end turn', 'A player connected');
      trn = 0;
      console.log('=====trn=out===', trn);
      console.log('==Next round==');
    } else {
      players[trn - 1].emit('end turn', 'A player connected');
    }
    next_turn();
  }, MAX_WAITING);
}

function resetTimeOut() {
  if (typeof timeOut === 'object') {
    console.log('timeout reset');
    clearTimeout(timeOut);
  }
}

server.listen(PORT, () => {
  console.log('server is running or PORT: ', PORT);
});
