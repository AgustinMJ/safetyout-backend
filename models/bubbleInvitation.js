const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bubbleInvitationSchema = new Schema(
    {
        invitee_id: Schema.ObjectId,
        bubble_id: Schema.ObjectId,
        invited_by_id: Schema.ObjectId
    },
    {timestamps:true}
);


module.exports = mongoose.model("BubbleInvitation", bubbleInvitationSchema);