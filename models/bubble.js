const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bubbleSchema = new Schema(
    {
        name:{
            type: String,
            required:true
        },
        admin:{
            type: Schema.ObjectId,
            required:true
        },
        members:[
            {userId: Schema.ObjectId}
        ]
    },
    {timestamps:true}
);


module.exports = mongoose.model("Bubble", bubbleSchema);