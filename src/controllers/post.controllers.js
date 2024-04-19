import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.models.js";

const publishPost = asyncHandler(async(req,res)=>{
    const {postMsg,tags} = req.body;
    console.log("message is here ",postMsg);
    console.log(req.files)
    
    const postPicFileLocalPath = req.files?.videoFile[0];
    console.log("post local path",postPicFileLocalPath)

    if(!postPicFileLocalPath && !postMsg){
        throw new ApiError(404,"Not Found nothing to post")
    }

    const postPicData = await uploadOnCloudinary(postPicFileLocalPath)
    console.log("post pic data",postPicData)

    if(!postPicData){
        throw new ApiError(404,"error uploading on clodinary")
    }

    const post = await Post.create({
        postPic:postPicData.url,
        postMsg:postMsg,
        tags:tags
    })

})