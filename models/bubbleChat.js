const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bubbleChatSchema = new Schema(
    {   
        bubble_id: Schema.ObjectId,
        messages: [
            {user_id: Schema.ObjectId, username: String, message:String}
        ]
    },
    {timestamps:true}
);


module.exports = mongoose.model("BubbleChat", bubbleChatSchema);