const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendRequestSchema = new Schema(
    {
        user_id_request: Schema.ObjectId,
        user_id_requested: Schema.ObjectId
    },
    {timestamps:true}
);


module.exports = mongoose.model("FriendRequest", friendRequestSchema);