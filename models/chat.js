const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema(
    {
        user1_id: Schema.ObjectId,
        user2_id: Schema.ObjectId,
        messages: [
            {user_id: Schema.ObjectId, username: String, message:String}
        ]
    },
    {timestamps:true}
);


module.exports = mongoose.model("Chat", chatSchema);