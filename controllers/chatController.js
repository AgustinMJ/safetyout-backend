const User = require('../models/user');
const Chat = require('../models/chat');
const BubbleChat = require('../models/bubbleChat');
const  Mongoose  = require('mongoose');


exports.handleConnection = (socket) => {
  
    console.log("A user has connected");

    io.sockets.on('connect', function(){
        console.log("A socket with id " + socket.id + " has connected");
    })

    socket.on('join', (data) => {
        console.log("This is user1_id: " + data.user1_id);
        console.log("This is user2_id: " + data.user2_id);

        Chat.findOne({
            $or:[
                {$and:[
                    {user1_id: data.user1_id},
                    {user2_id: data.user2_id}
                ]},
                {$and:[
                    {user1_id: data.user2_id},
                    {user2_id: data.user1_id}
                ]}
            ]
        })
        .then(chatRoom => {
            if(!chatRoom){
                var room = new Chat({
                    user1_id: data.user1_id,
                    user2_id: data.user2_id
                })
                room.save()
                .then(res => {
                    User.findById(data.user1_id)
                    .then(user => {
                        let chats_begun = user.chats_begun;
                        let trophy = -1;
                        chats_begun = chats_begun + 1;
                        
                        switch(chats_begun){
                            case 1:
                                trophy = 11
                                break;
                            case 5:
                                trophy = 12
                                break;
                            case 25:
                                trophy = 13
                                break;
                            case 50:
                                trophy = 14
                                break;
                            case 100:
                                trophy = 15
                                break;
                        }
                        var update;
                        if(trophy != -1){
                            update = {
                                chats_begun: chats_begun,
                                $push: {trophies: trophy}
                            }
                        }
                        else{
                            update = {
                                chats_begun: chats_begun 
                            }
                        }

                        User.findOneAndUpdate(
                            {"_id": data.user1_id},
                            update
                        )
                        .then(function(){
                            socket.activeRoom = room._id.toString();
                            socket.join(room._id.toString());
                            socket.emit('joined', {roomId: room._id.toString(), trophy: trophy});
                        })
                    })
                })
            }
            else{
                socket.activeRoom = chatRoom._id.toString();
                socket.join(chatRoom._id.toString())
                socket.emit('joined',{roomId: chatRoom._id.toString(), trophy: -1});
            }
        })
    })

    socket.on('joinBubbleChat', (data) => {
        console.log("Se ha entrado en joinBubbleChat")
        BubbleChat.findOne({bubble_id: data.bubble_id})
        .then(chatRoom => {
            console.log("Se ha encontrado una bubble chat para unirse")
            socket.activeRoom = chatRoom._id.toString();
            socket.join(chatRoom._id.toString());
            socket.emit('joined', {roomId: chatRoom._id.toString(), trophy: -1});              
        })
    })
    
    socket.on('message', (data) => {
        console.log("Un usuario ha enviado un mensaje")
        console.log(data.chatRoom)
        console.log(socket.rooms)
        
        Chat.findById(data.chatRoom)
        .then(chatRoom => {
            if(!chatRoom){
                BubbleChat.findById(data.chatRoom)
                .then(bubbleChatRoom => {
                    if(bubbleChatRoom)console.log("Se ha encontrado una bubble chat para enviar mensaje")
                    User.findById(data.author)
                    .then(user => {
                        bubbleChatRoom.messages.push({user_id: data.author, username: user.name, message: data.message});
                        bubbleChatRoom.save()
                        .then(function(){
                            io.in(data.chatRoom).emit('message', data.chatRoom, data.author, data.message, user.name);
                        })
                    })               
                })
            }
            else{
                User.findById(data.author)
                .then(user => {
                    chatRoom.messages.push({user_id: data.author, username: user.name, message: data.message});
                    chatRoom.save()
                    .then(function(){
                        io.in(data.chatRoom).emit('message', data.chatRoom, data.author, data.message, user.name);
                    })
                })     
            }          
        })
    })
}

exports.getMessages = (req, res, next) => {
    var chat_id = req.params.id;
    Chat.findById(chat_id)
    .then(chat => {
        if(!chat){
            BubbleChat.findById(chat_id)
            .then(bubbleChat => {
                if(!bubbleChat){
                    console.log("IT IS ENTERING HERE")
                    res.status(404).json({message:"A chat with this id could not be found"});
                    const error = new Error("A chat with this id could not be found");
                    error.statusCode = 404;
                    throw error;   
                }
                else{
                    res.status(200).json({messages: bubbleChat.messages});
                }
            })       
        }
        else 
            res.status(200).json({messages: chat.messages});
    })
    .catch(err => {
        if(!err.statusCode)err.statusCode=500;
        next(err);
    }); 
}

exports.deleteChat = (req, res, next) => {
    var chat_id = req.params.id;
    Chat.findOneAndDelete(chat_id)
    .then(chat => {
        if(!chat){
            res.status(404).json({message:"A chat with this id could not be found"});
            const error = new Error("A chat with this id could not be found");
            error.statusCode = 404;
            throw error;               
        }

        res.status(200).json({message: "The chat has been deleted"});
    })
    .catch(err => {
        if(!err.statusCode)err.statusCode=500;
        next(err);
    }); 
}

exports.createChat = (req, res, next) => {

    Chat.findOne({
        $or:[
            {$and:[
                {user1_id: req.body.user1_id},
                {user2_id: req.body.user2_id}
            ]},
            {$and:[
                {user1_id: req.body.user2_id},
                {user2_id: req.body.user1_id}
            ]}
        ]
    })
    .then(chatRoom => {
        if(!chatRoom){
            var room = new Chat({
                user1_id: req.body.user1_id,
                user2_id: req.body.user2_id
            })
            room.save()
            .then(function(){

                res.status(201).json({message:"Chat created successfully", chat_id: room._id.toString()});
            })
        }
        else{
            res.status(409).json({message:"Chat already exists", chat_id: chatRoom._id.toString()});
        }
    })
}
