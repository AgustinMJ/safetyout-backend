const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assistanceSchema = new Schema(
    {
        user_id:{
            type: Schema.ObjectId 
        },
        place_id:String, 
        dateInterval:{
            startDate: Date,
            endDate: Date
        }       
    },
    {timestamps:true}
);

module.exports = mongoose.model("Assistance", assistanceSchema);