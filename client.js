const http = require('http');
const express = require('express');
const hostname = '127.0.0.1';
const port = 3000;

const io = require('socket.io-client');

var currentChatRoom;
const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hola Mundo');
  });

server.listen(port, hostname, () => {
    console.log(`El servidor se está ejecutando en http://${hostname}:${port}/`);
  });

var localhost_url = "ws://localhost:8080"
var heroku_url = "https://safetyout.herokuapp.com/"

var url = localhost_url;

var socket = io.connect(url)
socket.connect();
socket.emit('join', {user1_id: '604cb1aa228a8c10a42ce241', user2_id: '604d1f6fd6bf493ec83523ee'});
socket.on('joined', function(chat_id) {
   console.log("You have joined the chat room " + chat_id);
   currentChatRoom = chat_id;
   socket.emit('message', {chatRoom: currentChatRoom, author: '604cb1aa228a8c10a42ce241', message: 'Hello!'});
});

socket.on('message', function(chatRoom, author, message){
  console.log(author + " says: " + message + " on room " + chatRoom);
})
