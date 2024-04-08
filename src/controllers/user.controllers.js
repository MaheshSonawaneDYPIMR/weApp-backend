import { ApiError } from "../utils/commanUsed/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/commanUsed/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/commanUsed/asyncHandler.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    console.log("User found:", user); // Log the user object

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    console.log("Generated Access Token:", accessToken);
    console.log("Generated Refresh Token:", refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    console.log("User after saving refresh token:", user); // Log the user object after saving refresh token

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

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  // Validate username format (minimum length, alphanumeric characters)
  const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
  if (!usernameRegex.test(username)) {
    throw new ApiError(400, "Invalid username format. It should contain at least 3 alphanumeric characters");
  }

  // Validate password format (minimum length, at least one uppercase letter, one lowercase letter, and one digit)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new ApiError(400, "Invalid password format. It should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit");
  }

  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Please fill all the fields");
  }

  console.log("Request body", req.body);

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log("Existed user", existedUser)  
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    email,
    username: username.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  console.log("Created user:", createdUser); // Log the created user object

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  console.log("Login credentials:", email, username, password);

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({ $or: [{ email }, { username: username }] });

  console.log("Found user:", user); // Log the found user object

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordcorrect(password);

  console.log("Is password valid:", isPasswordValid); // Log if the password is valid

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const tokens = await generateAccessAndRefereshTokens(user._id);

  console.log("Generated tokens:", tokens); // Log the generated tokens

  const accessToken = await tokens.accessToken;
  const refreshToken = await tokens.refreshToken;

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  console.log("Logged in user:", loggedInUser); // Log the logged in user object

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
  console.log("User ID to logout:", req.user._id); // Log the user ID to logout

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

  console.log("Refresh token cleared for user:", req.user._id); // Log that the refresh token is cleared for the user

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

    console.log("Incoming refresh token:", incomingRefreshToken); // Log the incoming refresh token

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    console.log("Decoded refresh token:", decodedRefreshToken);

    if (!decodedRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or invalid");
    }

    const user = await User.findById(decodedRefreshToken?._id);

    console.log("User found:", user); // Log the found user object

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is used or expired");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    console.log("New access token:", accessToken);
    console.log("New refresh token:", newRefreshToken);

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
  console.log("Old password:", oldPassword);
  console.log("New password:", newPassword);
  console.log("body", req.body);

  const user = await User.findById(req.user?._id);
  console.log("Found user:", user); // Log the found user object

  const isPasswordCorrect = user.isPasswordcorrect(oldPassword);
  console.log("Is password correct:", isPasswordCorrect); // Log if the old password is correct

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  console.log("Password changed successfully");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  console.log("Current user:", req.user); // Log the current user object
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req.user,
      },
      "User fetched successfully"
    )
  );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email } = req.body;

  console.log("Updated details:", { email }); // Log the updated details

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

  console.log("Updated user:", user); // Log the updated user object

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
