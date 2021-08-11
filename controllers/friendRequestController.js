const User = require('../models/user');
const FriendRequest = require('../models/friendRequest');
const  Mongoose  = require('mongoose');


exports.postFriendRequest = (req, res, next) => {
    const user_id_request = req.body.user_id_request;
    const user_id_requested = req.body.user_id_requested;

    Promise.all([
        User.findById(user_id_request),
        User.findById(user_id_requested),
    ]).then(([request, requested]) => {
        if(!request || !requested){
            let errorMsg;
            if(!request)errorMsg = "The user that sends the friend request does not exist";
            else if(!requested) errorMsg = "The user that receives a request does not exist";
 

            res.status(404).json({message:errorMsg});
            const error = new Error();
            error.statusCode = 404;
            throw error;
        }

        let friendRequest = new FriendRequest({
            user_id_request: Mongoose.Types.ObjectId(user_id_request),
            user_id_requested: Mongoose.Types.ObjectId(user_id_requested),
            
        })

        friendRequest.save()
        .then(result => {
            let friends_added = request.friends_added;
            let trophy = -1;

            friends_added = friends_added + 1;
            
            switch(friends_added){
                case 1:
                    trophy = 6
                    break;
                case 5:
                    trophy = 7
                    break;
                case 25:
                    trophy = 8
                    break;
                case 50:
                    trophy = 9
                    break;
                case 100:
                    trophy = 10
                    break;
            }
            var update;
            if(trophy != -1){
                update = {
                    friends_added: friends_added,
                    $push: {trophies: trophy}
                }
            }
            else{
                update = {
                    friends_added: friends_added 
                }
            }

            User.findOneAndUpdate(
                {"_id": user_id_request},
                update
            )
            .then(function(){
                res.status(201).json({message:"A new friend request has been added", request_id: friendRequest.id, trophy: trophy});
            })
            .catch(err=>{
                if(!err.statusCode){
                  err.statusCode = 500;
             }
                next(err);
            });
        })
        .catch(err=>{
            if(!err.statusCode){
              err.statusCode = 500;
         }
            next(err);
        });

    })
    .catch(err=>{
        if(!err.statusCode){
          err.statusCode = 500;
     }
        next(err);
    });

}

exports.acceptFriendRequest = (req, res, next) => {

    var request_id = req.params.id;

    FriendRequest.findById(request_id)
    .then(request => {
        if (!request) {
                res.status(404).json({message:"A friend request between this two users does not exist"});
                const error = new Error();
                error.statusCode = 404;
                throw error;
        }

        var user_id_request = request.user_id_request;
        var user_id_requested = request.user_id_requested;

        request.remove()
            .then(result => {
                Promise.all([
                    User.findOneAndUpdate(
                        {"_id": user_id_request},
                        {$push: {friends: {userId: user_id_requested}}}
                    ),
                    User.findOneAndUpdate(
                        {"_id": user_id_requested},
                        {$push: {friends: {userId: user_id_request}}}
                    )
                ]).then(function(){
                    res.status(200).json({message:"User added to friends"});
                })
            })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
  })
    
}

exports.denyFriendRequest = (req, res, next) => {
    
    var request_id = req.params.id;

    FriendRequest.findById(request_id)
    .then(request => {
        if (!request) {
                res.status(404).json({message:"A friend request between this two users does not exist"});
                const error = new Error();
                error.statusCode = 404;
                throw error;
        }
        request.remove()
        .then(result => {
            res.status(200).json({message:"Invitacion declined"});
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
}
