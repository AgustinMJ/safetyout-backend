const User = require('../models/user');
const Bubble = require('../models/bubble');
const FriendRequest = require('../models/friendRequest');
const BubbleInvitation = require('../models/bubbleInvitation');
const Chat = require('../models/chat');
const jwt = require("jsonwebtoken");
const async = require('async');
const Assistance = require('../models/assistance');
ObjectId = require('mongodb').ObjectID;



exports.checkEmail = (req,res,next) => {

    User.findOne({email: req.params.email})
    .then(user => {
            if(user){

                res.status(409).json({message:'The email is already being used'});

                const error = new Error("The email is already being used");
                error.statusCode = 409;
                throw error;
            }
            else{
                res.status(200).json({message: 'The email has not been used yet'});
            }
        }
    )
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }); 
}


exports.signUp = (req, res, next) => {

    User.findOne({email: req.body.email})
        .then(user => {
            if(user){

                res.status(409).json({message:'The email is already being used'});

                const error = new Error("The email is already being used");
                error.statusCode = 409;
                throw error;
            }
            else{
                const birthdayArray = req.body.birthday.slice("-");
                const day = birthdayArray[2];
                const month = birthdayArray[1];
                const year = birthdayArray[0];

                const user = new User({
                    name: req.body.name,
                    surnames: req.body.surnames,
                    email: req.body.email,
                    password: req.body.password,
                    birthday: new Date(year, month, day),
                    gender: req.body.gender,
                    profileImage: "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg",
                    friends_added: 0,
                    chats_begun: 0,
                    notified_assistances:0
                });

                user.trophies.push(3);
            
                user.save()
                    .then(result =>{
                        const token = jwt.sign({email: result.email, userId: result._id.toString()}, process.env.JWT_SECRET);
                        res.status(201).json({token: token, message: 'User created!', userId: result._id.toString()});
                    })
                    .catch(err => {
                        if(!err.statusCode){
                            err.statusCode = 500;
                        }
                        next(err);
                    }); 
            }
        })

};

exports.getTrophies = (req, res, next) => {
    var user_id = req.params.id;
    User.findById(user_id)
    .then(user => {
        if(!user){
            res.status(404).json({message:'User not found'});

            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        else{

            var created_at = user.createdAt;
            var today = new Date()

            var Difference_In_Time = today.getTime() - created_at.getTime();
            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            var trophy = -1;

            if(Difference_In_Days >= 30 && Difference_In_Days < 90){
                if(!user.trophies.includes(23)){
                    trophy = 23;
                }
            }
            else if(Difference_In_Days >= 90 && Difference_In_Days < 180){
                if(!user.trophies.includes(24)){
                    trophy = 24;
                }
            }
            else if(Difference_In_Days >= 180 && Difference_In_Days < 270){
                if(!user.trophies.includes(25)){
                    trophy = 25;
                }
            }
            else if(Difference_In_Days >= 270 && Difference_In_Days < 365){
                if(!user.trophies.includes(26)){
                    trophy = 26;
                }
            }
            else if(Difference_In_Days >= 365){
                if(!user.trophies.includes(27)){
                    trophy = 27;
                }
            }

            if(trophy != -1){
                User.findOneAndUpdate(
                    {"_id": user_id},
                    {$push: {trophies: trophy}},
                    {new:true}
                )
                .then(updatedUser => {
                    res.status(200).json({trophies: updatedUser.trophies})
                })
            }
            else
                res.status(200).json({trophies: user.trophies}) 
        }
    })
}


exports.logIn = (req, res, next) => {

    let loadedUser;

    User.findOne({email:req.body.email})
        .then(user => {
            if(!user){
                res.status(404).json({message: "A user with this email could not be found"});
                const error = new Error("A user with this email could not be found");
                error.statusCode = 404;
                throw error;
            }
            else{
                loadedUser = user;
                return loadedUser.validPassword(req.body.password);
            }
        })
        .then(isEqual => {
            if(!isEqual){
                res.status(401).json({message: "Password is not correct!"});
                const error = new Error("Wrong password");
                error.statusCode = 401;
                throw error;
            }
            else{
                const token = jwt.sign({email: loadedUser.email, userId: loadedUser._id.toString()}, process.env.JWT_SECRET);
                res.status(200).json({token: token, message: "Logged In correctly!", userId: loadedUser._id.toString()});
            }
        })
        .catch(err => {
            if(!err.statusCode)err.statusCode=500;
            next(err);
        });
}

exports.getUserId = (req, res, next) => {

    var user_email = req.query.email;
    User.findOne({email: user_email})
    .then(user => {
        res.status(200).json({id: user.id});
    })
}


exports.getUserInfo = (req, res, next) => {

    let loadedUser;

    User.findById(req.params.id) 
        .then(user => {
            if(!user){
                res.status(404).json({message: "A user with this id could not be found"});
                const error = new Error("A user with this id could not be found");
                error.statusCode = 404;
                throw error;
            }
            else{
                loadedUser = user;
                console.log(loadedUser);
                res.status(200).json({user:loadedUser});
            }
        })
        .catch(err => {
            if(!err.statusCode)err.statusCode=500;
            next(err);
        });       
}


exports.getUserFriends = (req,res, next) => {
    let loadedUser;
    User.findById(req.params.id) 
        .then(user => {
            if(!user){
                res.status(404).json({message: "A user with this id could not be found"});
                const error = new Error("A user with this id could not be found");
                error.statusCode = 404;
                throw error;
            }
            else{
                loadedUser = user;
                res.status(200).json({friends:loadedUser.friends});
            }
        })
        .catch(err => {
            if(!err.statusCode)err.statusCode=500;
            next(err);
        });       
}

exports.getUserBubbles = (req, res, next) => {

    var user_id = req.params.id;
    Bubble.find({"members.userId": user_id})
    .then(bubbles => {
        res.status(200).json({bubbles: bubbles});
    })
    .catch(err=>{
        if(!err.statusCode){
          err.statusCode = 500;
     }
        next(err);
    });
}

exports.getUserFriendRequests = (req, res, next) => {

    var user_id = req.params.id;
    FriendRequest.find({user_id_requested: user_id})
    .then(friendRequests => {
        res.status(200).json({friendRequests: friendRequests});
    })
    .catch(err=>{
        if(!err.statusCode){
          err.statusCode = 500;
     }
        next(err);
    });
}

exports.getUserBubbleInvitations = (req, res, next) => {

    var user_id = req.params.id;
    BubbleInvitation.find({invitee_id: user_id})
    .then(bubbleInvitations => {
        res.status(200).json({bubbleInvitations: bubbleInvitations});
    })
    .catch(err=>{
        if(!err.statusCode){
          err.statusCode = 500;
     }
        next(err);
    });
}

exports.getUserChats = (req, res, next) => {

    var user_id = req.params.id;
    Chat.find({
        $or:[
            {user1_id: user_id},
            {user2_id: user_id}
        ]
    })
    .then(chats => {
        res.status(200).json({chats: chats});
    })
    .catch(err=>{
        if(!err.statusCode){
          err.statusCode = 500;
     }
        next(err);
    });
}

exports.logInTerceros = (req, res, next) => {

    let loadedUser;

    User.findOne({email:req.body.email})
        .then(user => {
            if(!user){

                const user = new User({
                    name: req.body.name,
                    surnames: req.body.surnames,
                    email: req.body.email,
                    password: req.body.password,
                    birthday: new Date(1999, 10, 13),
                    gender: req.body.gender,
                    profileImage: req.body.profileImage
                });
            
                user.save()
                    .then(result =>{
                        const token = jwt.sign({email: result.email, userId: result._id.toString()}, process.env.JWT_SECRET);
                        res.status(201).json({token: token, message: 'User created!', userId: result._id.toString()});
                    })
                    .catch(err => {
                        if(!err.statusCode){
                            err.statusCode = 500;
                        }
                        next(err);
                    }); 
            }
            else{
                loadedUser = user;
                const token = jwt.sign({email: loadedUser.email, userId: loadedUser._id.toString()}, process.env.JWT_SECRET);
                res.status(200).json({token: token, message: "Logged In correctly!", userId: loadedUser._id.toString()});
            }
        })
}

exports.changeUserInfo = (req, res, next) => {

    let user_id = req.params.id;
    console.log(req.file);
    User.findById(user_id)
    .then(user => {
        let update;
        let trophy = -1;
        if(typeof req.file !== 'undefined'){
            if(!user.trophies.includes(1)){
                trophy = 1;
                update = { 
                    "name": req.body.new_name,
                    "surnames": req.body.new_surnames,
                    "profileImage": req.file.location,
                    $push: {trophies: 1}
                }
            }
            else{
                update = { 
                    "name": req.body.new_name,
                    "surnames": req.body.new_surnames,
                    "profileImage": req.file.location
                }
            }
        }
        else{
            update = { 
                "name": req.body.new_name,
                "surnames": req.body.new_surnames,
            }
        }

        User.findByIdAndUpdate(user_id,update)
        .then(user => {
            if(!user) {
                res.status(404).json({message: 'This user does not exist'});
            }
            else {
                res.status(201).json({message: 'User information modified!', trophy: trophy});
            }
        })
        .catch(err => {
            if(!err.statusCode){
                    err.statusCode = 500;
            }
            next(err);
        });
    })
}

exports.deleteFriend = (req,res,next) => {
    var user_id = req.params.id;
    var friend_id = req.params.friendId;

    Promise.all([
        User.findById(user_id),
        User.findById(friend_id),
    ]).then(([user, friend]) => {

        if(!user || !friend){
            res.status(404).json({message: 'This user does not exist'});
        }
        else{
            if(containsObject(friend_id, user.friends) && containsObject(user_id, friend.friends)){
                Promise.all([
                    User.findOneAndUpdate(
                        {"_id": friend_id},
                        {$pull: {friends: {userId: user_id}}}
                    ),
                    User.findOneAndUpdate(
                        {"_id": user_id},
                        {$pull: {friends: {userId: friend_id}}}
                    )
                ]).then(function(){
                    res.status(200).json({message:"Friend deleted"});
                })
                .catch(err => {
                    if(!err.statusCode){
                        err.statusCode = 500;
                    }
                    next(err);
                });
            }
            else res.status(404).json({message: 'The users are not friends'});
        }   
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].userId == obj) {
            return true;
        }
    }
    return false;
}

exports.deleteAccount = (req, res, next) => {
    var user_id = req.params.id;

    User.findById(user_id)
    .then(user => {
        if(!user){
            res.status(404).json({message: 'This user does not exist'});
        }
        else{
            async.filter(user.friends, function(elem, callback){
                User.findOneAndUpdate({_id : elem.userId}, {$pull: {friends: {userId: user._id}}}, function(err, doc) {
                    callback(err == null && doc != null);
                });
            });
            async.filter(user.bubbles, function(elem, callback){
                Bubble.findOneAndUpdate({_id : elem.bubbleId}, {$pull: {members: {userId: user._id}}}, function(err, doc) {
                    callback(err == null && doc != null);
                });
            });

            Promise.all([
                Chat.deleteMany({
                    $or:[
                        {user1_id: user_id},
                        {user2_id: user_id}
                    ]
                }),
                FriendRequest.deleteMany({
                    $or:[
                        {user_id_request: user_id},
                        {user_id_requested: user_id}
                    ] 
                }),
                BubbleInvitation.deleteMany({
                    $or:[
                        {invitee: user_id},
                        {invited_by: user_id}
                    ] 
                }),
                Assistance.deleteMany({
                    user_id: user_id
                })  
            ])
            .then(function(){
                User.findOneAndDelete({_id: user_id})
                .then(function(){
                    res.status(200).json({message: 'Completed!'});
                })
                .catch(err => {
                    if(!err.statusCode){
                        err.statusCode = 500;
                    }
                    next(err);
                });
            })
        }
    })
}

