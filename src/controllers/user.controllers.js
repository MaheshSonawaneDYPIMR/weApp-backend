import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { redisClient } from "../../config/redis/index.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);


    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();


    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessAndRefereshTokens:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Check if email already exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new ApiError(409, "Email already exists");
  }

  // Check if username already exists
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new ApiError(408, "Username already exists");
  }


  const user = await User.create({
    email,
    username: username.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"));
});



const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({ $or: [{ email }, { username: username }] });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordcorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const tokens = await generateAccessAndRefereshTokens(user._id);

  const accessToken = await tokens.accessToken;
  const refreshToken = await tokens.refreshToken;

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );


  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

 
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or invalid");
    }

    const user = await User.findById(decodedRefreshToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is used or expired");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: user,
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Refresh token refreshed successfully"
        )
      );
  } catch (error) {
    console.error("Error in refreshAccessToken:", error);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Invalid refresh token",
    });
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
 
  const isPasswordCorrect = user.isPasswordcorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  let userData;
  let isCached = false;
  try {
    const userDataFromRedis = await redisClient.get('userData');
    if (userDataFromRedis) {
 
      isCached = true;
      userData = JSON.parse(userDataFromRedis);
    } else {

      userData = req.user;
      await redisClient.setex('userData', 3600, JSON.stringify(userData)); // Corrected setex method and added JSON.stringify
    }



  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json(
      new ApiResponse(500, null, "Error fetching user data")
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: userData,
      },
      `User fetched successfully ${isCached ? '(cached)' : '(not cached)'}`
    )
  );
});


const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email } = req.body;
// Log the updated details

  if (!email) {
    throw new ApiError(400, "Please fill all the fields");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

 // Log the updated user object

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
};
