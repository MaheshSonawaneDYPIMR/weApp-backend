import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema({
    question:{
        type:String,
        required:true
    },
    options:[
       {
        type:String,
        required:true,
       } 
    ],
    userDBKey:{
        type:String,
        required:true
    }
});

export const Questions = mongoose.model("Questions", questionsSchema);