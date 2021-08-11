const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose').set('debug', true);
require('dotenv').config()
const path = require('path');


const app = express();
const server = require('http').Server(app);
global.io = require('socket.io')(server);
const chatController = require('./controllers/chatController');

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
  
  const userRoutes = require('./routes/userRoutes');
  const assistanceRoutes = require('./routes/assistanceRoutes');
  const placeRoutes = require('./routes/placeRoutes');
  const chatRoutes = require('./routes/chatRoutes');
  const bubbleInvitationRoutes = require('./routes/bubbleInvitationRoutes');
  const bubbleRoutes = require('./routes/bubbleRoutes');
  const friendRequestRoutes = require('./routes/friendRequestRoutes');

  app.use('/user', userRoutes);
  app.use('/assistance', assistanceRoutes);
  app.use('/place', placeRoutes);
  app.use('/chat', chatRoutes);
  app.use('/bubbleInvitation', bubbleInvitationRoutes);
  app.use('/bubble', bubbleRoutes)
  app.use('/friendRequest', friendRequestRoutes);



  mongoose
  .connect(
    'mongodb+srv://' + process.env.MONGO_DB_USER + ':' + process.env.MONGO_DB_PASSWORD + '@safetyout.pvtcw.mongodb.net/SafetyOut?retryWrites=true&w=majority',
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  .then(result => {
    server.listen(process.env.PORT || 8080);
  })
  .catch(err => console.log(err));

  io.on('connection', chatController.handleConnection);