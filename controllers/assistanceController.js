const User = require('../models/user');
const Assistance = require('../models/assistance');
const  Mongoose  = require('mongoose');




function parseDate(JSONdate) {
    var date = new Date(
        JSONdate.year,
        JSONdate.month,
        JSONdate.day,
        JSONdate.hour,
        JSONdate.minute,
        "0"
    );
    return date;
}



exports.postAssistance = (req, res, next) => {

    const user_id = req.body.user_id;
    const place_id = req.body.place_id;
    const startDateJSON = req.body.dateInterval.startDate;
    const endDateJSON = req.body.dateInterval.endDate;

    const startDate = parseDate(startDateJSON);

    User.findById(user_id)
    .then(user => {
        if(user){
            Assistance.findOne({
                $and: [
                    {"user_id": Mongoose.Types.ObjectId(user_id)}, 
                    {"place_id": place_id},
                    {"dateInterval.startDate": startDate}
                ]
            })
            .then(assistanceFound => {
              
                if(assistanceFound){
                    res.status(409).json({message:"An assistance in this place with this user at this time already exists"});
                    const error = new Error();
                    error.statusCode = 409;
                    throw error;
                }

                const assistance = new Assistance({
                    user_id: Mongoose.Types.ObjectId(user_id),
                    place_id: place_id,
                    dateInterval:{
                        startDate: new Date(startDateJSON.year, startDateJSON.month, startDateJSON.day, startDateJSON.hour, startDateJSON.minute, 0),
                        endDate: new Date(endDateJSON.year, endDateJSON.month, endDateJSON.day, endDateJSON.hour, endDateJSON.minute, 0)
                    }
                });

                assistance.save()
                .then(result =>{
                    let notified_assistances = user.notified_assistances;
                    let trophy = -1;

                    notified_assistances = notified_assistances + 1;
                    
                    switch(notified_assistances){
                        case 1:
                            trophy = 16
                            break;
                        case 5:
                            trophy = 17
                            break;
                        case 25:
                            trophy = 18
                            break;
                        case 50:
                            trophy = 19
                            break;
                        case 100:
                            trophy = 20
                            break;
                        case 500:
                            trophy = 21
                            break;
                        case 1000:
                            trophy = 22
                            break;
                    }
                    var update;
                    if(trophy != -1){
                        update = {
                            notified_assistances: notified_assistances,
                            $push: {trophies: trophy}
                        }
                    }
                    else{
                        update = {
                            notified_assistances: notified_assistances
                        }
                    }
                    User.findOneAndUpdate(
                        {"_id": user_id},
                        update
                    )
                    .then(function(){
                        res.status(201).json({message:"A new assistance has been added", trophy: trophy});
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
        else
            res.status(409).json({message:"The user_id is not correct"});
    })
};

exports.consultFutureAssistance = (req, res, next) => {

    const user_id = req.query.user_id;
    const startDate = new Date();
    console.log(startDate);
    User.findById(user_id)
    .then(user => {
        if(user){
            Assistance.find({
                $and: [
                    {user_id: Mongoose.Types.ObjectId(user_id)},
                    {"dateInterval.startDate": {$gte : startDate}}
                ]
            })
            .then(currentAssistances => {
                res.status(200).json({message:currentAssistances});
            })
            .catch(err=>{
                if(!err.statusCode){
                  err.statusCode = 500;
             }
                next(err);
            });
        }
        else
            res.status(409).json({message:"The user_id is not correct"});
    })
};

exports.consultAssistanceOnDate = (req,res,next) => {
    
    const user_id = req.query.user_id;
    const year = req.query.year;
    const day = req.query.day;
    const month = req.query.month;

    const startDate = new Date(year, month, day)
    const endDate = new Date(year, month, day);
    endDate.setDate(endDate.getDate() + 1);

    User.findById(user_id)
    .then(user => {
        if(user){
            Assistance.find({
                $and:[
                    {user_id: Mongoose.Types.ObjectId(user_id)},
                    {"dateInterval.startDate": {$gte:startDate}},
                    {"dateInterval.startDate": {$lte:endDate}}
                ]
            })
            .then(currentAssistances => {
                res.status(200).json({message:currentAssistances});
            })
            .catch(err=>{
                if(!err.statusCode){
                  err.statusCode = 500;
             }
                next(err);
            });
        }
        else
            res.status(409).json({message:"The user_id is not correct"});
    })
}

exports.modifyAssistance = (req,res,next) => {
    const userId = req.body.user_id;
    const place_id = req.body.place_id;
    const startDateJSON = req.body.dateInterval.startDate;

    const newStartDateJSON = req.body.newStartDate;
    const newEndDateJSON = req.body.newEndDate;

    const startDate = parseDate(startDateJSON);

    const filter = {
        $and:[
            {user_id: Mongoose.Types.ObjectId(userId)},
            {place_id: place_id},
            {"dateInterval.startDate": startDate}
        ]
    };
    const update = { 
        "dateInterval.startDate": parseDate(newStartDateJSON),
        "dateInterval.endDate": parseDate(newEndDateJSON)
    };
    Assistance.findOneAndUpdate(filter,update)
    .then(assistance => {
        if(!assistance){
            res.status(404).json({message:"An assistance in this place with this user could not be found"});
            const error = new Error();
            error.statusCode = 404;
            throw error;
        }

        User.findById(userId)
        .then(user => {
            if(!user.trophies.includes(4)){
                User.findOneAndUpdate(
                    {"_id": userId},
                    {$push: {trophies: 4}}
                )
                .then(function(){
                    res.status(200).json({message:"Assistance modified", trophy: 4})
                })
                .catch(err=>{
                    if(!err.statusCode){
                      err.statusCode = 500;
                 }
                    next(err);
                });
            }
            else
                res.status(200).json({message:"Assistance modified", trophy: -1})

        })
    })
    .catch(err=>{
        if(!err.statusCode){
          err.statusCode = 500;
     }
        next(err);
    });
}

exports.deleteAssistance = (req, res, next) => {

    const userId = req.body.user_id;
    const place_id = req.body.place_id;
    const startDateJSON = req.body.dateInterval.startDate;

    const startDate = parseDate(startDateJSON);
    
    Assistance.findOne({
        $and:[
            {user_id: Mongoose.Types.ObjectId(userId)},
            {place_id: place_id},
            {"dateInterval.startDate": startDate}
        ]
        })
        .then(assistance => {
            if(!assistance){
                res.status(404).json({message:"An assistance in this place at this time with this user could not be found"});
                const error = new Error();
                error.statusCode = 404;
                throw error;
            }

            assistance.remove()
                .then(result => {
                    User.findById(userId)
                    .then(user => {
                        if(!user.trophies.includes(5)){
                            User.findOneAndUpdate(
                                {"_id": userId},
                                {$push: {trophies: 5}}
                            )
                            .then(function(){
                                res.status(200).json({message:"Assistance deleted", trophy: 5})
                            })
                            .catch(err=>{
                                if(!err.statusCode){
                                err.statusCode = 500;
                            }
                                next(err);
                            });
                        }
                        else
                            res.status(200).json({message:"Assistance deleted", trophy: -1})

                    })
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




