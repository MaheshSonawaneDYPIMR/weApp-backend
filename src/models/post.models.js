import mongoose  from "mongoose";

const postSchema = new mongoose.Schema({
  postPic:
    {
      type:String
    }
  ,
  postMsg:{
    type:String,
    
  },
  tags:[
    {
      
      type:String
    }
  ],
 created_by:{
   type:mongoose.Schema.Types.ObjectId,
   ref:"User"
 }

},{timestamps:true})

export const Post = mongoose.model('Post',postSchema)