import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.models.js";

const publishPost = asyncHandler(async (req, res) => {
  const { postMsg,postPic } = req.body;
  const postPicFileLocalPath = JSON.stringify(postPic); ;
  let postPicture = null;
  let postMessage = null;
 console.log("local path hhhhh",postPicFileLocalPath);
  if (!postPicFileLocalPath && !postMsg) {
    throw new ApiError(404, "Nothing to post");
  }

  if (postPicFileLocalPath) {
    try {
      const postPicData = await uploadOnCloudinary(postPicFileLocalPath);
      postPicture = postPicData.url;
      console.log("Post pic data:", postPicData.url);
    } catch (error) {
      console.log("Error uploading postpic:", error);
      throw new ApiError(500, "Error uploading post picture");
    }
  }

  if (postMsg) {
    postMessage = postMsg.trim(); // Example: Trim post message
  }

  const post = await Post.create({
    postPic: postPicture,
    postMsg: postMessage,
  });

  console.log("Post created:", post);
  return res.status(200).json(new ApiResponse(200, "Post published successfully", post));
});

export { publishPost };
