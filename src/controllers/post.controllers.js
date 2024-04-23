import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.models.js";

const publishPost = asyncHandler(async (req, res) => {
   
      const { postMsg } = req.body;
      const postPicFileLocalPath = req.files?.postPic[0].path;
      let postPicture = null;
      let postMessage = null;
  
      console.log("Received request body:", req.body);
      console.log("Received files:", req.files);
  
      if (!postPicFileLocalPath && !postMsg) {
        throw new ApiError(404, "Not Found nothing to post");
      }
  
      if (!(postPicFileLocalPath == undefined)) {
        try {
            const postPicData = await uploadOnCloudinary(postPicFileLocalPath);
            postPicture = postPicData.url;
            console.log("Post pic data:", postPicData.url);
        } catch (error) {
            console.log("Error uploading postpic:", error);
        }
      
      }
      if (postMsg) {
        postMessage = postMsg;
      }
  
  
      const post = await Post.create({
        postPic: postPicture,
        postMsg: postMessage,
      });
  
      console.log("Post created:", post);
      return res
        .status(200)
        .json(new ApiResponse(200, "Post published successfully", post));
   
  });
  
  export { publishPost };
  