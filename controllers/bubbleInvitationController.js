const User = require('../models/user');
const BubbleInvitation = require('../models/bubbleInvitation');
const Bubble = require('../models/bubble');
const  Mongoose  = require('mongoose');


exports.postInvitation = (req, res, next) => {
    const invitee_id = req.body.invitee_id;
    const bubble_id = req.body.bubble_id;
    const invited_by_id = req.body.invited_by_id;
    Promise.all([
        User.findById(invitee_id),
        User.findById(invited_by_id),
        Bubble.findById(bubble_id)
    ]).then(([invitee, invitedBy, bubble]) => {
        if(!invitee || !invitedBy || !bubble){
            let errorMsg;
            if(!invitee)errorMsg = "The invited user does not exist";
            else if(!invitedBy) errorMsg = "The inviting user does not exist";
            else if(!bubble)errorMsg = "The bubble does not exist";

            res.status(404).json({message:errorMsg});
            const error = new Error();
            error.statusCode = 404;
            throw error;
        }

        let bubbleInvitation = new BubbleInvitation({
            invitee_id: Mongoose.Types.ObjectId(invitee_id),
            bubble_id: bubble_id,
            invited_by_id: Mongoose.Types.ObjectId(invited_by_id)
        })

        bubbleInvitation.save()
        .then(result => {
            res.status(201).json({message:"A new bubble invitation record has been added", invitation_id: bubbleInvitation.id.toString()});
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

exports.acceptInvitation = (req, res, next) => {

    const invitation_id = req.params.id;

    BubbleInvitation.findById(invitation_id)
    .then(invitation => {
        if(!invitation){
            res.status(404).json({message:"An invitation with this id does not exist"});
            const error = new Error();
            error.statusCode = 404;
            throw error;
        }

        var bubble_id = invitation.bubble_id;
        var invitee_id = invitation.invitee_id;

        invitation.remove()
        .then(function(){
            Bubble.findById(bubble_id)
            .then(bubble => {
                if(bubble) {
                    Promise.all([
                        Bubble.findByIdAndUpdate(bubble_id, {
                            $push: {members: {userId: invitee_id}} 
                        }),
                        User.findByIdAndUpdate(invitee_id, {
                            $push: {bubbles: {bubbleId: bubble_id}}
                        }),
                    ])
                    .then(function(){
                        User.findById(invitee_id)
                        .then(user => {
                            if(!user.trophies.includes(28)){
                                User.findOneAndUpdate(
                                    {"_id": invitee_id},
                                    {$push: {trophies: 28}}
                                )
                                .then(function(){
                                    res.status(200).json({message:"User added to bubble", trophy:28});
                                })
                            }
                            else
                                res.status(200).json({message:"User added to bubble", trophy:-1});
                        })
                        
                    })
                    .catch(err=>{
                        if(!err.statusCode){
                            err.statusCode = 500;
                        }
                        next(err);
                    });
                }
                else {
                    res.status(404).json({message:"This bubble does no longer exist"});
                }
            })
            .catch(err=>{
                if(!err.statusCode){
                    err.statusCode = 500;
                }
                next(err);
            });
            })  
        })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
}

exports.denyInvitation = (req, res, next) => {
    const invitation_id = req.params.id;

    BubbleInvitation.findById(invitation_id)
        .then(invitation => {
            if(!invitation){
                res.status(404).json({message:"An invitation for this user to this bubble does not exist"});
                const error = new Error();
                error.statusCode = 404;
                throw error;
            }
            invitation.remove()
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

