import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import http from 'http';
import path from 'path'; // Import the path module
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

// Set up middleware to serve static files (like chat.html)
app.use(express.static('public'));

// Handle GET request to render chat.html
app.get('/', (req, res) => {
  const absolutePath = path.resolve('chat.html'); // Construct the absolute path
  res.sendFile(absolutePath);
});

io.on('connection', (socket) => {
  console.log("Connection is established");

  // Rest of the socket.io event handling code...

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
