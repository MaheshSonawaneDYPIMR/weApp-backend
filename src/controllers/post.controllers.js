import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.models.js";

const publishPost = asyncHandler(async (req, res) => {
  const { postMsg } = req.body;
  console.log(req.file)

  let postPicture = null;
  let postMessage = null;
  if ((req.file === undefined) && !postMsg) {
    throw new ApiError(404, "Nothing to post");
  }

  if (!(req.file === undefined)) {
    try {
      const postPicData = await uploadOnCloudinary(req.file.path);
      postPicture = postPicData.url;
    } catch (error) {
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

  return res.status(200).json(new ApiResponse(200, "Post published successfully", post));
});

export { publishPost };
