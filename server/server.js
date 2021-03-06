const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const { generateMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const users = new Users();
const emoji = require('node-emoji')

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('join', (params, callback) => {
    if (!isRealString(params.username) || !isRealString(params.room)) {
      return callback('Username and room name are required');
    }else{
    users.getUserList(params.room).forEach(function (user) {
        if(user === params.username){
            return callback('This username is already exist');
        }
    });
}
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.username, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', emoji.emojify(`Welcome  ${params.username} in the ${params.room} room! :smiley:`)));

    callback();
  });

  socket.on('createMessage', (message, callback) => {
    const user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.username, emoji.emojify(''+message.text)));
    }

    callback('');
  });

  socket.on('disconnect', () => {
    const user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
        console.log(user.username+" disconnected")
    }
  }
  );
});

server.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
