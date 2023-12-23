// server.js

import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import http from 'http';
import { chatModel } from './chat.schema.js';
import { connect } from './mongoose.js';
import { incrementUserCount, decrementUserCount, getUserCount } from './UserCount.js';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log("Connection is established");

  socket.on("join", (data) => {
    socket.username = data;
    incrementUserCount();
    io.emit('user_count', getUserCount());

    const joinNotification = {
      username: 'System',
      message: `${data} has joined the chat.`,
      timestamp: new Date()
  };
  socket.broadcast.emit('broadcast_message', joinNotification);


    chatModel.find().sort({ timestamp: 1 }).limit(50)
      .then(messages => {
        socket.emit('load_messages', messages);
      }).catch(err => {
        console.log(err);
      });
  });

  socket.on('new_message', (message) => {
    let userMessage = {
      username: socket.username,
      message: message
    }

    const newChat = new chatModel({
      username: socket.username,
      message: message,
      timestamp: new Date()
    });
    newChat.save();

    socket.broadcast.emit('broadcast_message', userMessage);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing_status', data);
});


  socket.on('disconnect', () => {
    decrementUserCount();
    io.emit('user_count', getUserCount());
    const disconnectNotification = {
      username: 'System',
      message: `${socket.username} has left the chat.`,
      timestamp: new Date()
  };

  io.emit('broadcast_message', disconnectNotification);
    console.log("Connection is disconnected");
  });
});

server.listen(3200, () => {
  console.log("App is listening on 3200");
  connect();
});
